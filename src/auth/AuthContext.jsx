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
  const router = useRouter();

  // MSAL-ı başlat
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        console.log("🔄 MSAL başladılır...");
        
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
              console.log("❌ Token etibarsızdır, silindi");
              clearAuth();
            }
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
  const clearAuth = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccount(null);
    setAuthError(null);
  };

  // Login funksiyası
  const login = useCallback(async () => {
    if (!msalInstance || !initialized) {
      setAuthError("Sistem hələ hazır deyil, bir az gözləyin");
      return;
    }

    try {
      setAuthError(null);
      setLoading(true);

      console.log("🔐 Microsoft login başladılır...");

      // Microsoft popup login
      const loginResponse = await msalInstance.loginPopup({
        ...loginRequest,
        redirectUri: window.location.origin,
      });

      console.log("✅ Microsoft login uğurlu:", loginResponse.account.username);

      // ID Token al
      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: loginResponse.account,
      });

      console.log(" ID Token alındı, backend-ə göndərilir... " , tokenResponse);

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
        localStorage.setItem("accessToken", backendResponse.data.access);
        localStorage.setItem("refreshToken", backendResponse.data.refresh);
        
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

    } catch (error) {
      console.error("❌ Login xətası:", error);
      
      let errorMessage = "Giriş edilə bilmədi";
      
      if (error.response?.status === 401) {
        errorMessage = "Autentifikasiya uğursuz - məlumatlar yanlışdır";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof InteractionRequiredAuthError) {
        errorMessage = "Yenidən cəhd edin";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Bağlantı vaxtı bitdi - backend işləyirmi?";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [msalInstance, initialized, router]);

  // Logout funksiyası
  const logout = useCallback(async () => {
    if (!msalInstance || !initialized) return;

    try {
      console.log("🚪 Çıxış edilir...");
      
      await msalInstance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
        mainWindowRedirectUri: window.location.origin,
      });
      
      clearAuth();
      console.log("✅ Çıxış uğurlu");
      router.push("/login");
      
    } catch (error) {
      console.error("❌ Çıxış xətası:", error);
      setAuthError("Çıxış edilə bilmədi");
      
      // Məcburi çıxış
      clearAuth();
      router.push("/login");
    }
  }, [msalInstance, initialized, router]);

  // Context dəyəri
  const contextValue = {
    account,
    isAuthenticated: !!account && !!localStorage.getItem("accessToken"),
    login,
    logout,
    loading,
    initialized,
    authError,
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