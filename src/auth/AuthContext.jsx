// src/auth/AuthContext.jsx - FIXED STORAGE VERSION
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

// ⭐ STORAGE KEYS - Centralized
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'almet_access_token',
  REFRESH_TOKEN: 'almet_refresh_token',
  GRAPH_TOKEN: 'almet_graph_token',
  GRAPH_EXPIRY: 'almet_graph_expiry',
  USER_DATA: 'almet_user_data',
  AUTH_TIMESTAMP: 'almet_auth_time',
};

export function AuthProvider({ children }) {
  const [msalInstance, setMsalInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  
  const isProcessingAuth = useRef(false);
  const tokenCache = useRef({}); // ⭐ In-memory cache as backup

  // ⭐ ENHANCED: Multi-layer storage with cache
  const setStorageItem = useCallback((key, value) => {
    try {
      // 1. Store in memory cache
      tokenCache.current[key] = value;
      
      // 2. Store in localStorage
      localStorage.setItem(key, value);
      
      // 3. Store timestamp for debugging
      localStorage.setItem(`${key}_time`, Date.now().toString());
      
      // 4. Verify immediately
      const verification = localStorage.getItem(key);
      
      if (verification !== value) {
        console.error(`❌ Storage verification FAILED for ${key}`);
        // Retry once more
        localStorage.setItem(key, value);
        const secondCheck = localStorage.getItem(key);
        
        if (secondCheck !== value) {
          console.error(`❌ Second verification FAILED for ${key}`);
          return false;
        }
      }
      
      console.log(`✅ Stored ${key} (length: ${value?.length || 0})`);
      return true;
    } catch (error) {
      console.error(`❌ Storage error for ${key}:`, error);
      return false;
    }
  }, []);

  // ⭐ ENHANCED: Multi-layer read with fallback
  const getStorageItem = useCallback((key) => {
    try {
      // 1. Try memory cache first (fastest)
      if (tokenCache.current[key]) {
        console.log(`📖 Read ${key} from CACHE`);
        return tokenCache.current[key];
      }
      
      // 2. Try localStorage
      const value = localStorage.getItem(key);
      
      if (value) {
        // Cache it for next time
        tokenCache.current[key] = value;
        
        const timestamp = localStorage.getItem(`${key}_time`);
        const age = timestamp ? (Date.now() - parseInt(timestamp)) / 1000 : 'unknown';
        console.log(`📖 Read ${key} from localStorage (age: ${age}s)`);
        return value;
      }
      
      console.log(`📖 Read ${key}: MISSING`);
      return null;
    } catch (error) {
      console.error(`❌ Read error for ${key}:`, error);
      return null;
    }
  }, []);

  // ⭐ ENHANCED: Clear with cache
  const removeStorageItem = useCallback((key) => {
    try {
      // Clear from cache
      delete tokenCache.current[key];
      
      // Clear from localStorage
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_time`);
      
      console.log(`🗑️ Removed ${key}`);
    } catch (error) {
      console.error(`❌ Remove error for ${key}:`, error);
    }
  }, []);

  // ⭐ Clear all auth data
  const clearAuth = useCallback(async () => {
    console.log("🧹 Clearing all authentication data...");
    
    // Clear cache
    tokenCache.current = {};
    
    // Clear storage
    Object.values(STORAGE_KEYS).forEach(key => {
      removeStorageItem(key);
    });
    
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

  // ⭐ Backend validation
  const validateTokenWithBackend = async (token, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Validating token (attempt ${attempt + 1}/${retries + 1})...`);
        
        const response = await axios.get(`${BACKEND_URL}/me/`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });
        
        console.log("✅ Token VALID");
        return response.data;
      } catch (error) {
        console.error(`❌ Validation attempt ${attempt + 1} failed:`, error.response?.status);
        
        if (attempt === retries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  // ⭐ CRITICAL: Store tokens with MULTIPLE verifications
  const authenticateWithBackend = async (idToken, graphToken, msalAccount) => {
    try {
      console.log("📤 Sending tokens to backend...");
      
      const backendResponse = await axios.post(
        `${BACKEND_URL}/auth/microsoft/`,
        {
          id_token: idToken,
          graph_access_token: graphToken,
        },
        {
          headers: { 
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log("📥 Backend response received");

      if (backendResponse.data.success) {
        const accessToken = backendResponse.data.access;
        const refreshToken = backendResponse.data.refresh;
        
        console.log("💾 Storing tokens with verification...");
        
        // ⭐ Store with custom keys
        const accessStored = setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        const refreshStored = setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        
        if (!accessStored || !refreshStored) {
          throw new Error("Failed to store tokens in localStorage");
        }
        
        if (graphToken) {
          setStorageItem(STORAGE_KEYS.GRAPH_TOKEN, graphToken);
          const expiryTime = new Date(Date.now() + 3600 * 1000).toISOString();
          setStorageItem(STORAGE_KEYS.GRAPH_EXPIRY, expiryTime);
        }
        
        // Store user data
        setStorageItem(STORAGE_KEYS.USER_DATA, JSON.stringify(backendResponse.data.user));
        setStorageItem(STORAGE_KEYS.AUTH_TIMESTAMP, Date.now().toString());
        
        // ⭐ IMMEDIATE VERIFICATION (3 attempts)
        let verified = false;
        for (let i = 0; i < 3; i++) {
          const verifyAccess = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
          const verifyRefresh = getStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
          
          if (verifyAccess && verifyRefresh) {
            console.log(`✅ Verification PASSED (attempt ${i + 1})`);
            verified = true;
            break;
          }
          
          console.warn(`⚠️ Verification FAILED (attempt ${i + 1}), retrying...`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!verified) {
          throw new Error("Token storage verification failed after 3 attempts");
        }
        
        console.log("✅ All tokens stored and VERIFIED");
        
        setAccount({
          ...msalAccount,
          ...backendResponse.data.user,
        });

        return true;
      }

      throw new Error(backendResponse.data.error || "Backend authentication failed");
      
    } catch (error) {
      console.error("❌ Backend authentication error:", error);
      throw error;
    }
  };

  // ⭐ MSAL initialization with IMMEDIATE token check
  useEffect(() => {
    const initializeMsal = async () => {
      if (isProcessingAuth.current) {
        console.log("⏳ Auth already in progress");
        return;
      }
      
      isProcessingAuth.current = true;
      
      try {
        console.log("🚀 Starting MSAL initialization...");
        
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

            await authenticateWithBackend(
              tokenResponse.idToken,
              graphTokenResponse.accessToken,
              redirectResponse.account
            );

            console.log("✅ Redirect auth successful");
            
            setMsalInstance(msalApp);
            setInitialized(true);
            setLoading(false);
            isProcessingAuth.current = false;
            
            // ⭐ Small delay before redirect
            setTimeout(() => router.push("/home"), 100);
            return;
            
          } catch (error) {
            console.error("❌ Redirect token error:", error);
            await clearAuth();
          }
        }

        // No redirect - check existing session
        setMsalInstance(msalApp);
        setInitialized(true);
        
        const accounts = msalApp.getAllAccounts();
        
        if (accounts.length > 0) {
          console.log("👤 Found existing account:", accounts[0].username);
          
          // ⭐ Check BOTH old and new storage keys
          const token = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN) || 
                       getStorageItem('accessToken'); // Fallback to old key
          
          if (token) {
            console.log("🔑 Found stored token, validating...");
            
            try {
              await validateTokenWithBackend(token);
              setAccount(accounts[0]);
              console.log("✅ Session restored successfully");
            } catch (error) {
              console.warn("⚠️ Token validation failed, getting fresh tokens...");
              
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

                console.log("✅ Fresh tokens acquired");
              } catch (freshTokenError) {
                console.error("❌ Could not acquire fresh tokens");
                await clearAuth();
              }
            }
          } else {
            console.log("⚠️ No token found, acquiring new tokens...");
            
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

              console.log("✅ New tokens acquired successfully");
            } catch (newTokenError) {
              console.error("❌ Could not acquire tokens:", newTokenError);
              await clearAuth();
            }
          }
        } else {
          console.log("👋 No existing accounts");
          
          // Check for orphaned tokens
          const token = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (token) {
            console.log("⚠️ Found orphaned token, clearing...");
            await clearAuth();
          }
        }
        
      } catch (error) {
        console.error("❌ MSAL initialization error:", error);
        setAuthError("Authentication system failed");
      } finally {
        setLoading(false);
        isProcessingAuth.current = false;
      }
    };

    initializeMsal();
  }, []);

  // ⭐ Login function
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

      console.log("🔐 Starting login...");

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
          
          // ⭐ Small delay before navigation
          setTimeout(() => router.push("/home"), 100);
          return;
          
        } catch (silentError) {
          console.log("⚠️ Silent login failed, redirecting...");
        }
      }

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

  // ⭐ Logout
  const logout = useCallback(async () => {
    try {
      console.log("🚪 Logging out...");
      
      const token = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        try {
          await axios.post(`${BACKEND_URL}/auth/logout/`, {}, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 3000,
          });
        } catch (e) {
          console.warn("Backend logout failed:", e);
        }
      }

      await clearAuth();

      const accounts = msalInstance?.getAllAccounts() || [];
      if (accounts.length > 0) {
        await msalInstance.logoutRedirect({
          account: accounts[0],
          postLogoutRedirectUri: `${window.location.origin}/login`,
        });
      } else {
        router.push("/login");
      }
      
    } catch (error) {
      console.error("❌ Logout error:", error);
      await clearAuth();
      router.push("/login");
    }
  }, [msalInstance, router, clearAuth, getStorageItem]);

  const contextValue = {
    account,
    isAuthenticated: !!account && !!getStorageItem(STORAGE_KEYS.ACCESS_TOKEN),
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}