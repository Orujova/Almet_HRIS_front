// src/auth/AuthContext.jsx - COMPLETELY FIXED VERSION
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
  InteractionRequiredAuthError,
} from "@azure/msal-browser";
import axios from "axios";
import { useRouter } from "next/navigation";
import { msalConfig, loginRequest, graphRequest } from "./authConfig";

const AuthContext = createContext();
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }) {
  const [msalInstance, setMsalInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  
  // ⭐ Track if we're currently processing authentication
  const isProcessingAuth = useRef(false);

  // ⭐ ENHANCED: Synchronous storage operations with retry
  const setStorageItem = useCallback((key, value) => {
    try {
      localStorage.setItem(key, value);
      
      // ⭐ Verify it was written
      const verification = localStorage.getItem(key);
      if (verification !== value) {
        console.error(`❌ Storage verification failed for ${key}`);
        // Retry once
        localStorage.setItem(key, value);
      }
      
      console.log(`✅ Stored ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Storage error for ${key}:`, error);
      return false;
    }
  }, []);

  const getStorageItem = useCallback((key) => {
    try {
      const value = localStorage.getItem(key);
      console.log(`📖 Read ${key}:`, value ? 'EXISTS' : 'MISSING');
      return value;
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

  // ⭐ ENHANCED: Backend validation with retry
  const validateTokenWithBackend = async (token, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Validating token (attempt ${attempt + 1}/${retries + 1})...`);
        
        const response = await axios.get(`${BACKEND_URL}/me/`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });
        
        console.log("✅ Token valid");
        return response.data;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        console.warn(`⚠️ Validation attempt ${attempt + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  // ⭐ ENHANCED: Clear authentication
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

  // ⭐ ENHANCED: Send tokens to backend with verification
  const authenticateWithBackend = async (idToken, graphToken, msalAccount) => {
    try {
      console.log("📤 Sending tokens to backend...");
      console.log("  - ID Token length:", idToken.length);
      console.log("  - Graph Token:", graphToken ? "✓" : "✗");
      
      const backendResponse = await axios.post(
        `${BACKEND_URL}/auth/microsoft/`,
        {
          id_token: idToken,
          graph_access_token: graphToken,
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log("📥 Backend response:", backendResponse.data);

      if (backendResponse.data.success) {
        const accessToken = backendResponse.data.access;
        const refreshToken = backendResponse.data.refresh;
        
        // ⭐ CRITICAL: Store tokens synchronously and verify
        const accessStored = setStorageItem("accessToken", accessToken);
        const refreshStored = setStorageItem("refreshToken", refreshToken);
        
        if (!accessStored || !refreshStored) {
          throw new Error("Failed to store authentication tokens");
        }
        
        if (graphToken) {
          setStorageItem("graphAccessToken", graphToken);
          const expiryTime = new Date(Date.now() + 3600 * 1000).toISOString();
          setStorageItem("graphTokenExpiry", expiryTime);
        }
        
        // ⭐ CRITICAL: Verify tokens were actually stored
        const verifyAccess = getStorageItem("accessToken");
        const verifyRefresh = getStorageItem("refreshToken");
        
        if (!verifyAccess || !verifyRefresh) {
          throw new Error("Token storage verification failed");
        }
        
        console.log("✅ All tokens stored and verified");
        
        setAccount({
          ...msalAccount,
          ...backendResponse.data.user,
        });

        return true;
      }

      throw new Error(backendResponse.data.error || "Backend authentication failed");
      
    } catch (error) {
      console.error("❌ Backend authentication error:", error);
      
      if (error.response) {
        console.error("  - Status:", error.response.status);
        console.error("  - Data:", error.response.data);
      }
      
      throw error;
    }
  };

  // ⭐ ENHANCED: MSAL initialization with proper handling
  useEffect(() => {
    const initializeMsal = async () => {
      // ⭐ Prevent multiple initializations
      if (isProcessingAuth.current) {
        console.log("⏳ Authentication already in progress");
        return;
      }
      
      isProcessingAuth.current = true;
      
      try {
        console.log("🚀 Starting MSAL initialization...");
        
        const msalApp = new PublicClientApplication(msalConfig);
        await msalApp.initialize();
        
        console.log("✅ MSAL initialized");

        // ⭐ Handle redirect response FIRST
        const redirectResponse = await msalApp.handleRedirectPromise();
        
        if (redirectResponse && redirectResponse.account) {
          console.log("🔄 Processing redirect response:", redirectResponse.account.username);
          
          try {
            // Get ID Token
            const tokenResponse = await msalApp.acquireTokenSilent({
              ...loginRequest,
              account: redirectResponse.account,
            });

            // Get Graph Token
            const graphTokenResponse = await msalApp.acquireTokenSilent({
              ...graphRequest,
              account: redirectResponse.account,
            });

            console.log("📧 Tokens acquired after redirect");

            // Authenticate with backend
            await authenticateWithBackend(
              tokenResponse.idToken,
              graphTokenResponse.accessToken,
              redirectResponse.account
            );

            console.log("✅ Redirect authentication successful");
            
            setMsalInstance(msalApp);
            setInitialized(true);
            setLoading(false);
            isProcessingAuth.current = false;
            
            router.push("/home");
            return;
            
          } catch (error) {
            console.error("❌ Redirect token error:", error);
            await clearAuth();
          }
        }

        // ⭐ No redirect response - check existing session
        setMsalInstance(msalApp);
        setInitialized(true);
        
        const accounts = msalApp.getAllAccounts();
        
        if (accounts.length > 0) {
          console.log("👤 Found existing account:", accounts[0].username);
          
          const token = getStorageItem("accessToken");
          
          if (token) {
            console.log("🔑 Found stored token");
            try {
              await validateTokenWithBackend(token);
              setAccount(accounts[0]);
              console.log("✅ Session restored successfully");
            } catch (error) {
              console.warn("⚠️ Token validation failed:", error.message);
              console.log("🔄 Attempting to acquire new token...");
              
              // ⭐ Try to get fresh tokens
              try {
                const tokenResponse = await msalApp.acquireTokenSilent({
                  ...loginRequest,
                  account: accounts[0],
                });

                const graphTokenResponse = await msalApp.acquireTokenSilent({
                  ...graphRequest,
                  account: accounts[0],
                });

                await authenticateWithBackend(
                  tokenResponse.idToken,
                  graphTokenResponse.accessToken,
                  accounts[0]
                );

                console.log("✅ Acquired fresh tokens successfully");
              } catch (freshTokenError) {
                console.error("❌ Could not acquire fresh tokens:", freshTokenError);
                await clearAuth();
              }
            }
          } else {
            console.log("⚠️ No stored token found, clearing MSAL account");
            await clearAuth();
          }
        } else {
          console.log("👋 No existing accounts found");
          const token = getStorageItem("accessToken");
          if (token) {
            console.log("⚠️ Inconsistent state: token exists but no MSAL account");
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
  }, []); // ⭐ Empty dependency array - only run once

  // ⭐ ENHANCED: Login function
  const login = useCallback(async () => {
    if (isLoggingIn || isProcessingAuth.current) {
      console.log("⏳ Login already in progress");
      return;
    }

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
        console.log("👤 Found existing account, attempting silent login...");
        
        try {
          const tokenResponse = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: existingAccounts[0],
          });

          const graphTokenResponse = await msalInstance.acquireTokenSilent({
            ...graphRequest,
            account: existingAccounts[0],
          });

          console.log("🔑 Silent tokens acquired");

          await authenticateWithBackend(
            tokenResponse.idToken,
            graphTokenResponse.accessToken,
            existingAccounts[0]
          );

          console.log("✅ Silent login successful");
          router.push("/home");
          return;
          
        } catch (silentError) {
          console.log("⚠️ Silent token acquisition failed:", silentError.message);
          
          if (
            silentError instanceof InteractionRequiredAuthError ||
            silentError.errorCode === 'consent_required' ||
            silentError.errorCode === 'interaction_required' ||
            silentError.errorCode === 'login_required'
          ) {
            console.log("🔄 Interactive login required");
          } else {
            throw silentError;
          }
        }
      }

      // ⭐ Redirect login
      console.log("🔄 Starting redirect login...");
      
      await msalInstance.loginRedirect({
        ...loginRequest,
        redirectUri: window.location.origin,
        prompt: "select_account",
      });

    } catch (error) {
      console.error("❌ Login error:", error);
      
      let errorMessage = "Login failed";
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
      isProcessingAuth.current = false;
    }
  }, [msalInstance, initialized, router, isLoggingIn, authenticateWithBackend, setStorageItem, getStorageItem]);

  // ⭐ ENHANCED: Logout function
  const logout = useCallback(async () => {
    if (!msalInstance || !initialized) return;

    try {
      console.log("🚪 Logging out...");
      
      // Backend logout
      try {
        const token = getStorageItem("accessToken");
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
      await clearAuth();

      // MSAL redirect logout
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
      setAuthError("Logout failed");
      
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