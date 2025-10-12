// src/auth/AuthContext.jsx - FIXED Network Error Handling
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  PublicClientApplication,
} from "@azure/msal-browser";
import { useRouter } from "next/navigation";
import { msalConfig, loginRequest, graphRequest } from "./authConfig";

const AuthContext = createContext();

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function AuthProvider({ children }) {
  const [msalInstance, setMsalInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  
  const isProcessingAuth = useRef(false);

  // ✅ Storage operations
  const setStorageItem = useCallback((key, value) => {
    try {
      localStorage.setItem(key, value);
      console.log(`✅ Stored ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Storage error for ${key}:`, error);
      return false;
    }
  }, []);

  const getStorageItem = useCallback((key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`❌ Read error for ${key}:`, error);
      return null;
    }
  }, []);

  const removeStorageItem = useCallback((key) => {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed ${key}`);
    } catch (error) {
      console.error(`❌ Remove error for ${key}:`, error);
    }
  }, []);

  // ✅ Backend validation
  const validateTokenWithBackend = async (token, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Validating token (attempt ${attempt + 1}/${retries + 1})...`);
        console.log(`📡 Backend URL: ${BACKEND_URL}`);
        
        const response = await fetch(`${BACKEND_URL}/me/`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("✅ Token valid, user data:", data);
        return data;
      } catch (error) {
        console.error(`❌ Validation attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt === retries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  // ✅ Clear authentication
  const clearAuth = useCallback(async () => {
    console.log("🧹 Clearing authentication...");
    
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
          await msalInstance.clearCache();
          console.log("✅ MSAL cache cleared");
        }
      } catch (error) {
        console.error("❌ MSAL cache clear error:", error);
      }
    }
  }, [msalInstance, removeStorageItem]);

  // ✅ CRITICAL: Authenticate with backend using fetch
  const authenticateWithBackend = async (idToken, graphToken, msalAccount) => {
    try {
      console.log("📤 Sending tokens to backend...");
      console.log("📡 Backend URL:", BACKEND_URL);
      console.log("  - ID Token length:", idToken?.length || 0);
      console.log("  - Graph Token:", graphToken ? "✓" : "✗");
      
      if (!idToken) {
        throw new Error("No ID token available");
      }

      // ✅ FIXED: Use fetch instead of axios
      const response = await fetch(`${BACKEND_URL}/auth/microsoft/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id_token: idToken,
          graph_access_token: graphToken || null,
        }),
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Backend error response:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `Backend returned ${response.status}`);
      }

      const backendData = await response.json();
      console.log("📥 Backend response:", backendData);

      if (backendData.success) {
        const accessToken = backendData.access;
        const refreshToken = backendData.refresh;
        
        if (!accessToken || !refreshToken) {
          throw new Error("Backend didn't return tokens");
        }
        
        console.log("✅ Received JWT tokens from backend:");
        console.log("  - Access token length:", accessToken.length);
        console.log("  - Refresh token length:", refreshToken.length);
        
        // Store JWT tokens
        const accessStored = setStorageItem("accessToken", accessToken);
        const refreshStored = setStorageItem("refreshToken", refreshToken);
        
        if (!accessStored || !refreshStored) {
          throw new Error("Failed to store JWT tokens");
        }
        
        // Store Graph token separately
        if (graphToken) {
          setStorageItem("graphAccessToken", graphToken);
          const expiryTime = new Date(Date.now() + 3600 * 1000).toISOString();
          setStorageItem("graphTokenExpiry", expiryTime);
          console.log("✅ Microsoft Graph token stored");
        }
        
        // Verify storage
        const verifyAccess = getStorageItem("accessToken");
        const verifyRefresh = getStorageItem("refreshToken");
        
        if (!verifyAccess || !verifyRefresh) {
          throw new Error("JWT token storage verification failed");
        }
        
        console.log("✅ All tokens stored and verified");
        
        setAccount({
          ...msalAccount,
          ...backendData.user,
        });

        return true;
      }

      throw new Error(backendData.error || "Backend authentication failed");
      
    } catch (error) {
      console.error("❌ Backend authentication error:", error);
      
      // Detailed error logging
      if (error.name === 'AbortError') {
        console.error("  - Request timeout");
      } else if (error.message.includes('fetch')) {
        console.error("  - Network error - cannot reach backend");
        console.error(`  - Check if backend is running at: ${BACKEND_URL}`);
      }
      
      throw error;
    }
  };

  // ✅ MSAL initialization
  useEffect(() => {
    const initializeMsal = async () => {
      if (isProcessingAuth.current) return;
      isProcessingAuth.current = true;
      
      try {
        console.log("🚀 Starting MSAL initialization...");
        console.log("📡 Backend URL:", BACKEND_URL);
        
        const msalApp = new PublicClientApplication(msalConfig);
        await msalApp.initialize();
        console.log("✅ MSAL initialized");

        // Handle redirect response
        const redirectResponse = await msalApp.handleRedirectPromise();
        
        if (redirectResponse && redirectResponse.account) {
          console.log("🔄 Processing redirect response");
          
          try {
            const tokenResponse = await msalApp.acquireTokenSilent({
              ...loginRequest,
              account: redirectResponse.account,
            });

            const graphTokenResponse = await msalApp.acquireTokenSilent({
              ...graphRequest,
              account: redirectResponse.account,
            });

            console.log("🔑 Microsoft tokens acquired");

            await authenticateWithBackend(
              tokenResponse.idToken,
              graphTokenResponse.accessToken,
              redirectResponse.account
            );

            console.log("✅ Authentication successful");
            
            setMsalInstance(msalApp);
            setInitialized(true);
            setLoading(false);
            isProcessingAuth.current = false;
            
            router.push("/home");
            return;
            
          } catch (error) {
            console.error("❌ Redirect authentication error:", error);
            setAuthError(error.message);
            await clearAuth();
          }
        }

        // Check existing session
        setMsalInstance(msalApp);
        setInitialized(true);
        
        const accounts = msalApp.getAllAccounts();
        
        if (accounts.length > 0) {
          console.log("👤 Found existing account");
          
          const token = getStorageItem("accessToken");
          
          if (token) {
            console.log("🔑 Found stored JWT token");
            try {
              await validateTokenWithBackend(token);
              setAccount(accounts[0]);
              console.log("✅ Session restored");
            } catch (error) {
              console.warn("⚠️ Token validation failed");
              await clearAuth();
            }
          } else {
            console.log("⚠️ No stored token");
            await clearAuth();
          }
        }
        
      } catch (error) {
        console.error("❌ MSAL initialization error:", error);
        setAuthError("Authentication system failed to initialize");
      } finally {
        setLoading(false);
        isProcessingAuth.current = false;
      }
    };

    initializeMsal();
  }, []);

  // ✅ Login function
  const login = useCallback(async () => {
    if (isLoggingIn || isProcessingAuth.current) return;
    if (!msalInstance || !initialized) {
      setAuthError("System not ready");
      return;
    }

    try {
      setAuthError(null);
      setIsLoggingIn(true);
      setLoading(true);
      isProcessingAuth.current = true;

      console.log("🔐 Starting Microsoft login...");

      const existingAccounts = msalInstance.getAllAccounts();
      
      if (existingAccounts.length > 0) {
        console.log("👤 Attempting silent login...");
        
        try {
          const tokenResponse = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: existingAccounts[0],
          });

          const graphTokenResponse = await msalInstance.acquireTokenSilent({
            ...graphRequest,
            account: existingAccounts[0],
          });

          await authenticateWithBackend(
            tokenResponse.idToken,
            graphTokenResponse.accessToken,
            existingAccounts[0]
          );

          console.log("✅ Silent login successful");
          router.push("/home");
          return;
          
        } catch (silentError) {
          console.log("⚠️ Silent login failed");
        }
      }

      // Redirect login
      console.log("🔄 Starting redirect login...");
      
      await msalInstance.loginRedirect({
        ...loginRequest,
        redirectUri: window.location.origin,
        prompt: "select_account",
      });

    } catch (error) {
      console.error("❌ Login error:", error);
      setAuthError(error.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
      isProcessingAuth.current = false;
    }
  }, [msalInstance, initialized, router, isLoggingIn]);

  // ✅ Logout function
  const logout = useCallback(async () => {
    if (!msalInstance || !initialized) return;

    try {
      console.log("🚪 Logging out...");
      
      try {
        const token = getStorageItem("accessToken");
        if (token) {
          await fetch(`${BACKEND_URL}/auth/logout/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(3000),
          });
        }
      } catch (logoutError) {
        console.warn("Backend logout failed:", logoutError);
      }

      await clearAuth();

      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutRedirect({
          account: accounts[0],
          postLogoutRedirectUri: `${window.location.origin}/login`,
        });
      } else {
        router.push("/login");
      }
      
      console.log("✅ Logout successful");
      
    } catch (error) {
      console.error("❌ Logout error:", error);
      await clearAuth();
      router.push("/login");
    }
  }, [msalInstance, initialized, router, clearAuth, getStorageItem]);

  const contextValue = {
    account,
    isAuthenticated: !!account && !!getStorageItem("accessToken"),
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
    throw new Error('useAuth() must be used within AuthProvider');
  }
  return context;
}