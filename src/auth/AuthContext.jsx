// src/auth/AuthContext.jsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  PublicClientApplication,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";
import axios from "axios";
import { useRouter } from "next/navigation";
import { msalConfig, loginRequest } from "./authConfig";

const AuthContext = createContext();

// Backend URL
const BACKEND_URL = "http://localhost:8000/api";

export function AuthProvider({ children }) {
  const [msalInstance, setMsalInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Login prosesi state-i
  const router = useRouter();

  // Cross-tab session sync
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'msalAccountChanged') {
        // Başqa tabda login/logout oldu
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Storage helper functions
  const setStorageItem = (key, value) => {
    try {
      localStorage.setItem(key, value);
      // Cross-tab notification
      localStorage.setItem('msalAccountChanged', Date.now().toString());
      localStorage.removeItem('msalAccountChanged'); // Clean up
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  const removeStorageItem = (key) => {
    try {
      localStorage.removeItem(key);
      // Cross-tab notification
      localStorage.setItem('msalAccountChanged', Date.now().toString());
      localStorage.removeItem('msalAccountChanged'); // Clean up
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  // MSAL-ı başlat
  useEffect(() => {
    const initializeMsal = async () => {
      try {
       
        
        const msalApp = new PublicClientApplication(msalConfig);
        await msalApp.initialize();
        
        setMsalInstance(msalApp);
        setInitialized(true);
        
        console.log("✅ MSAL başladıldı");

        // Əgər artıq login olubsa yoxla
        const accounts = msalApp.getAllAccounts();
        if (accounts.length > 0) {
          console.log("👤 Mövcud account tapıldı:", accounts[0].username);
          
          // Token-i yoxla
          const token = localStorage.getItem("accessToken");
          if (token) {
            console.log("🔑 Token localStorage-da tapıldı");
            try {
              // Backend ilə token-i yoxla
              await validateTokenWithBackend(token);
              setAccount(accounts[0]);
              console.log("✅ Token təsdiqləndi");
            } catch (error) {
         
              await clearAuth();
            }
          } else {
            // Token yoxdur, amma MSAL account var - sessiyonu təmizlə
            console.log("⚠️ Token yoxdur, MSAL account təmizlənir");
            await clearAuth();
          }
        } else {
          // MSAL account yoxdur, amma token var - inconsistent state
          const token = localStorage.getItem("accessToken");
          if (token) {
            console.log("⚠️ Inconsistent state: token var amma MSAL account yox");
            await clearAuth();
          }
        }
        
      } catch (error) {
        console.error("❌ MSAL başlatma xətası:", error);
        setAuthError("Autentifikasiya sistemi başlatılmadı");
      } finally {
        setLoading(false);
      }
    };

    initializeMsal();
  }, []);

  // Backend ilə token yoxla
  const validateTokenWithBackend = async (token) => {
    const response = await axios.get(`${BACKEND_URL}/me/`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    return response.data;
  };

  // Auth məlumatlarını təmizlə
  const clearAuth = async () => {
    removeStorageItem("accessToken");
    removeStorageItem("refreshToken");
    setAccount(null);
    setAuthError(null);

    // MSAL cache-ni də təmizlə
    if (msalInstance) {
      try {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          await msalInstance.logoutRedirect({
            account: accounts[0],
            postLogoutRedirectUri: window.location.origin,
          });
        }
      } catch (error) {
        console.error("MSAL logout error:", error);
      }
    }
  };

  // Login funksiyası
  const login = useCallback(async () => {
    // Əgər artıq login prosesi davam edirsa, yeni login başlatma
    if (isLoggingIn) {
      console.log("⚠️ Login prosesi artıq davam edir, yeni login başladılmır");
      return;
    }

    if (!msalInstance || !initialized) {
      setAuthError("Sistem hələ hazır deyil, bir az gözləyin");
      return;
    }

    try {
      setAuthError(null);
      setIsLoggingIn(true); // Login prosesi başladı
      setLoading(true);

      console.log("🔐 Microsoft login başladılır...");

      // MSAL interaction state-ni yoxla
      const inProgress = msalInstance.getActiveAccount() || msalInstance.getAllAccounts().length > 0;
      
      // Əvvəlcə mövcud accounts yoxla
      const existingAccounts = msalInstance.getAllAccounts();
      if (existingAccounts.length > 0) {
        console.log("👤 Mövcud account tapıldı, silent token alınır...");
        
        try {
          // Silent token acquisition
          const tokenResponse = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: existingAccounts[0],
          });

          console.log("🔑 Silent token alındı, backend-ə göndərilir...");

          // Backend-ə göndər
          const backendResponse = await axios.post(
            `${BACKEND_URL}/auth/microsoft/`,
            {
              id_token: tokenResponse.idToken,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            }
          );

          if (backendResponse.data.success) {
            // Token-ləri saxla
            setStorageItem("accessToken", backendResponse.data.access);
            setStorageItem("refreshToken", backendResponse.data.refresh);
            
            // Account məlumatlarını yenilə
            setAccount({
              ...existingAccounts[0],
              ...backendResponse.data.user,
            });

            console.log("✅ Silent login uğurlu");
            router.push("/home");
            return;
          }
        } catch (silentError) {
          console.log("⚠️ Silent token alınmadı, popup açılır...", silentError.message);
          
          // Əgər interaction_in_progress xətası varsa, bir az gözlə
          if (silentError.errorCode === 'interaction_in_progress') {
            console.log("🔄 Interaction in progress, 2 saniyə gözlənilir...");
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Yenidən cəhd et
            try {
              const retryTokenResponse = await msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: existingAccounts[0],
              });

              console.log("🔑 Retry silent token alındı");
              
              const backendResponse = await axios.post(
                `${BACKEND_URL}/auth/microsoft/`,
                { id_token: retryTokenResponse.idToken },
                {
                  headers: { 'Content-Type': 'application/json' },
                  timeout: 10000,
                }
              );

              if (backendResponse.data.success) {
                setStorageItem("accessToken", backendResponse.data.access);
                setStorageItem("refreshToken", backendResponse.data.refresh);
                setAccount({
                  ...existingAccounts[0],
                  ...backendResponse.data.user,
                });
                console.log("✅ Retry silent login uğurlu");
                router.push("/home");
                return;
              }
            } catch (retryError) {
              console.log("❌ Retry də uğursuz oldu:", retryError.message);
            }
          }
        }
      }

      // İnteraktiv login lazımdır - əvvəlcə bütün interaction-ları təmizlə
      try {
        // Bütün pending interaction-ları handle et
        await msalInstance.handleRedirectPromise();
        
        // Bir az gözlə ki, MSAL state təmizlənsin
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("🔄 Interactive login başladılır...");
        
        // Microsoft popup login
        const loginResponse = await msalInstance.loginPopup({
          ...loginRequest,
          redirectUri: window.location.origin,
          prompt: "select_account", // Hər dəfə account selection göstər
        });

        console.log("✅ Microsoft popup login uğurlu:", loginResponse.account.username);

        // ID Token al
        const tokenResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: loginResponse.account,
        });

   

        // Backend-ə göndər
        const backendResponse = await axios.post(
          `${BACKEND_URL}/auth/microsoft/`,
          {
            id_token: tokenResponse.idToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );

        console.log("🎉 Backend autentifikasiyası uğurlu");

        if (backendResponse.data.success) {
          // Token-ləri saxla
          setStorageItem("accessToken", backendResponse.data.access);
          setStorageItem("refreshToken", backendResponse.data.refresh);
          
          // Account məlumatlarını yenilə
          setAccount({
            ...loginResponse.account,
            ...backendResponse.data.user,
          });

          console.log("👤 İstifadəçi məlumatları yeniləndi");

          // Dashboard-a yönləndir
          router.push("/home");
        } else {
          throw new Error(backendResponse.data.error || "Backend autentifikasiyası uğursuz");
        }
      } catch (interactiveError) {
        console.error("❌ Interactive login xətası:", interactiveError);
        
        // Interaction in progress xətası üçün xüsusi handling
        if (interactiveError.errorCode === 'interaction_in_progress') {
          throw new Error("Başqa bir giriş prosesi davam edir. Səhifəni yeniləyib yenidən cəhd edin.");
        }
        
        throw interactiveError;
      }

    } catch (error) {
      console.error("❌ Login xətası:", error);
      
      let errorMessage = "Giriş edilə bilmədi";
      
      if (error.response?.status === 401) {
        errorMessage = "Autentifikasiya uğursuz - məlumatlar yanlışdır";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof InteractionRequiredAuthError) {
        errorMessage = "Yenidən cəhd edin";
      } else if (error.errorCode === 'interaction_in_progress') {
        errorMessage = "Başqa bir giriş prosesi davam edir. Səhifəni yeniləyib yenidən cəhd edin.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Bağlantı vaxtı bitdi - backend işləyirmi?";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
      await clearAuth();
    } finally {
      setIsLoggingIn(false); // Login prosesi bitdi
      setLoading(false);
    }
  }, [msalInstance, initialized, router, isLoggingIn]);

  // Logout funksiyası
  const logout = useCallback(async () => {
    if (!msalInstance || !initialized) return;

    try {
      console.log("🚪 Çıxış edilir...");
      
      // Backend-ə logout bildirişi göndər (optional)
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          await axios.post(`${BACKEND_URL}/auth/logout/`, {}, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 3000,
          });
        }
      } catch (logoutError) {
        console.warn("Backend logout failed:", logoutError);
      }

      // MSAL logout
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutPopup({
          account: accounts[0],
          postLogoutRedirectUri: window.location.origin,
          mainWindowRedirectUri: window.location.origin,
        });
      }
      
      // Local storage təmizlə
      removeStorageItem("accessToken");
      removeStorageItem("refreshToken");
      setAccount(null);
      
      console.log("✅ Çıxış uğurlu");
      router.push("/login");
      
    } catch (error) {
      console.error("❌ Çıxış xətası:", error);
      setAuthError("Çıxış edilə bilmədi");
      
      // Məcburi çıxış
      removeStorageItem("accessToken");
      removeStorageItem("refreshToken");
      setAccount(null);
      router.push("/login");
    }
  }, [msalInstance, initialized, router]);

  // Periodic token refresh
  useEffect(() => {
    if (!account || !msalInstance) return;

    const refreshInterval = setInterval(async () => {
      try {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const tokenResponse = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
          
          // Update backend token if needed
          const currentToken = localStorage.getItem("accessToken");
          if (currentToken) {
            // Optional: refresh backend token too
            console.log("🔄 Token yeniləndi (periodic)");
          }
        }
      } catch (error) {
        console.warn("Periodic token refresh failed:", error);
      }
    }, 15 * 60 * 1000); // 15 dəqiqədə bir

    return () => clearInterval(refreshInterval);
  }, [account, msalInstance]);

  // Context dəyəri
  const contextValue = {
    account,
    isAuthenticated: !!account && !!localStorage.getItem("accessToken"),
    login,
    logout,
    loading,
    initialized,
    authError,
    isLoggingIn, // Login prosesi state-i əlavə edildi
    clearError: () => setAuthError(null),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() hook yalnız AuthProvider daxilində istifadə edilə bilər');
  }
  return context;
}