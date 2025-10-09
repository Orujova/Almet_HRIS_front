// src/auth/AuthContext.jsx - REDIRECT FLOW VERSION
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
import { msalConfig, loginRequest, graphRequest } from "./authConfig";

const AuthContext = createContext();

// Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }) {
  const [msalInstance, setMsalInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  // Cross-tab session sync
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'msalAccountChanged') {
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
      localStorage.setItem('msalAccountChanged', Date.now().toString());
      localStorage.removeItem('msalAccountChanged');
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  const removeStorageItem = (key) => {
    try {
      localStorage.removeItem(key);
      localStorage.setItem('msalAccountChanged', Date.now().toString());
      localStorage.removeItem('msalAccountChanged');
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  // Backend validation helper
  const validateTokenWithBackend = async (token) => {
    const response = await axios.get(`${BACKEND_URL}/me/`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    return response.data;
  };

  // Clear authentication helper
  const clearAuth = async () => {
    removeStorageItem("accessToken");
    removeStorageItem("refreshToken");
    removeStorageItem("graphAccessToken");
    removeStorageItem("graphTokenExpiry");
    setAccount(null);
    setAuthError(null);

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

  // Send tokens to backend
  const authenticateWithBackend = async (idToken, graphToken, msalAccount) => {
    const backendResponse = await axios.post(
      `${BACKEND_URL}/auth/microsoft/`,
      {
        id_token: idToken,
        graph_access_token: graphToken,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );

    if (backendResponse.data.success) {
      setStorageItem("accessToken", backendResponse.data.access);
      setStorageItem("refreshToken", backendResponse.data.refresh);
      setStorageItem("graphAccessToken", graphToken);
      
      setAccount({
        ...msalAccount,
        ...backendResponse.data.user,
      });

      return true;
    }

    throw new Error(backendResponse.data.error || "Backend autentifikasiyası uğursuz");
  };

  // ⭐ MSAL-ı başlat və redirect cavabını işlə
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        const msalApp = new PublicClientApplication(msalConfig);
        await msalApp.initialize();
        
        console.log("✅ MSAL başladıldı");

        // ⭐ ÖNCƏLİKLƏ redirect cavabını yoxla
        const redirectResponse = await msalApp.handleRedirectPromise();
        
        if (redirectResponse && redirectResponse.account) {
          console.log("🔄 Redirect cavabı alındı:", redirectResponse.account.username);
          
          try {
            // ID Token al
            const tokenResponse = await msalApp.acquireTokenSilent({
              ...loginRequest,
              account: redirectResponse.account,
            });

            // Graph Token al
            const graphTokenResponse = await msalApp.acquireTokenSilent({
              ...graphRequest,
              account: redirectResponse.account,
            });

            console.log("📧 Graph token alındı");

            // Backend-ə göndər
            await authenticateWithBackend(
              tokenResponse.idToken,
              graphTokenResponse.accessToken,
              redirectResponse.account
            );

            console.log("✅ Redirect login uğurlu");
            
            setMsalInstance(msalApp);
            setInitialized(true);
            setLoading(false);
            
            router.push("/home");
            return;
            
          } catch (error) {
            console.error("❌ Redirect sonrası token xətası:", error);
            await clearAuth();
          }
        }

        // Redirect cavabı yoxdursa, mövcud sessiyaları yoxla
        setMsalInstance(msalApp);
        setInitialized(true);
        
        const accounts = msalApp.getAllAccounts();
        if (accounts.length > 0) {
          console.log("👤 Mövcud account tapıldı:", accounts[0].username);
          
          const token = localStorage.getItem("accessToken");
          
          if (token) {
            console.log("🔑 Token localStorage-da tapıldı");
            try {
              await validateTokenWithBackend(token);
              setAccount(accounts[0]);
              console.log("✅ Token təsdiqləndi");
            } catch (error) {
              console.warn("⚠️ Token validation uğursuz:", error);
              await clearAuth();
            }
          } else {
            console.log("⚠️ Token yoxdur, MSAL account təmizlənir");
            await clearAuth();
          }
        } else {
          const token = localStorage.getItem("accessToken");
          if (token) {
            console.log("⚠️ Inconsistent state: token var amma MSAL account yox");
            await clearAuth();
          }
        }
        
      } catch (error) {
        console.error("❌ MSAL başlatma xətası:", error);
        setAuthError("Autentifikasiya sistemi başladılmadı");
      } finally {
        setLoading(false);
      }
    };

    initializeMsal();
  }, [router]);

  // ⭐ LOGIN FUNCTION - REDIRECT FLOW
  const login = useCallback(async () => {
    if (isLoggingIn) {
      console.log("⚠️ Login prosesi artıq davam edir");
      return;
    }

    if (!msalInstance || !initialized) {
      setAuthError("Sistem hələ hazır deyil");
      return;
    }

    try {
      setAuthError(null);
      setIsLoggingIn(true);
      setLoading(true);

      console.log("🔐 Microsoft login başladılır...");

      const existingAccounts = msalInstance.getAllAccounts();
      
      if (existingAccounts.length > 0) {
        console.log("👤 Mövcud account tapıldı, silent token alınır...");
        
        try {
          // Get ID token for backend authentication
          const tokenResponse = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: existingAccounts[0],
          });

          // Get Graph token for email sending
          const graphTokenResponse = await msalInstance.acquireTokenSilent({
            ...graphRequest,
            account: existingAccounts[0],
          });

          console.log("🔑 Silent token alındı, backend-ə göndərilir...");
          console.log("📧 Graph token alındı");

          // Send to backend
          await authenticateWithBackend(
            tokenResponse.idToken,
            graphTokenResponse.accessToken,
            existingAccounts[0]
          );

          console.log("✅ Silent login uğurlu");
          router.push("/home");
          return;
          
        } catch (silentError) {
          console.log("⚠️ Silent token alınmadı:", silentError.message);
          
          // Silent token alınmadısa, redirect-ə keç
          if (
            silentError instanceof InteractionRequiredAuthError ||
            silentError.errorCode === 'consent_required' ||
            silentError.errorCode === 'interaction_required' ||
            silentError.errorCode === 'login_required'
          ) {
            console.log("🔄 Interactive login tələb olunur");
            // Aşağıda redirect ediləcək
          } else {
            throw silentError;
          }
        }
      }

      // ⭐ REDIRECT LOGIN
      console.log("🔄 Redirect login başladılır...");
      
      await msalInstance.loginRedirect({
        ...loginRequest,
        redirectUri: window.location.origin,
        prompt: "select_account",
      });

      // Redirect başladıqdan sonra bu kod çalışmayacaq
      // Çünki səhifə yenidən yüklənəcək və redirect cavabı yuxarıda işlənəcək

    } catch (error) {
      console.error("❌ Login xətası:", error);
      
      let errorMessage = "Giriş edilə bilmədi";
      
      if (error.response?.status === 401) {
        errorMessage = "Autentifikasiya uğursuz";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
      setIsLoggingIn(false);
      setLoading(false);
    }
  }, [msalInstance, initialized, router, isLoggingIn]);

  // ⭐ LOGOUT - REDIRECT FLOW
  const logout = useCallback(async () => {
    if (!msalInstance || !initialized) return;

    try {
      console.log("🚪 Çıxış edilir...");
      
      // Backend logout
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

      // Clear storage
      removeStorageItem("accessToken");
      removeStorageItem("refreshToken");
      removeStorageItem("graphAccessToken");
      removeStorageItem("graphTokenExpiry");
      setAccount(null);

      // MSAL redirect logout
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutRedirect({
          account: accounts[0],
          postLogoutRedirectUri: `${window.location.origin}/login`,
        });
      } else {
        // Account yoxdursa, birbaşa login-ə yönləndir
        router.push("/login");
      }
      
      console.log("✅ Çıxış uğurlu");
      
    } catch (error) {
      console.error("❌ Çıxış xətası:", error);
      setAuthError("Çıxış edilə bilmədi");
      
      // Hər halda storage-ı təmizlə və login-ə yönləndir
      removeStorageItem("accessToken");
      removeStorageItem("refreshToken");
      removeStorageItem("graphAccessToken");
      removeStorageItem("graphTokenExpiry");
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
          // Refresh Graph token
          const graphTokenResponse = await msalInstance.acquireTokenSilent({
            ...graphRequest,
            account: accounts[0],
          });
          
          setStorageItem("graphAccessToken", graphTokenResponse.accessToken);
          setStorageItem("graphTokenExpiry", graphTokenResponse.expiresOn.toString());
          
          console.log("🔄 Graph token yeniləndi (periodic)");
        }
      } catch (error) {
        console.warn("Periodic token refresh failed:", error);
      }
    }, 15 * 60 * 1000); // 15 dəqiqədə bir

    return () => clearInterval(refreshInterval);
  }, [account, msalInstance]);

  const contextValue = {
    account,
    isAuthenticated: !!account && !!localStorage.getItem("accessToken"),
    login,
    logout,
    loading,
    initialized,
    authError,
    isLoggingIn,
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