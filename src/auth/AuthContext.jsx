// 3. Update the AuthContext.jsx to improve error handling and authentication flow

// src/auth/AuthContext.jsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import axios from "axios";
import { useRouter } from "next/navigation";
import { msalConfig, loginRequest, graphRequest } from "./authConfig";

// Create context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [msalInstance, setMsalInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const router = useRouter();

  // Initialize MSAL when component mounts
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        console.log("Initializing MSAL...");
        const msalApp = new PublicClientApplication(msalConfig);
        await msalApp.initialize();
        setMsalInstance(msalApp);
        setInitialized(true);
        console.log("MSAL initialized successfully");

        // Check for existing accounts
        const accounts = msalApp.getAllAccounts();
        console.log("Found accounts:", accounts.length);
        
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          console.log("Set active account:", currentAccount.username);
          
          // Validate the token with backend
          const token = localStorage.getItem('accessToken');
          if (token) {
            try {
              console.log("Validating existing token with backend");
              await axios.get('http://localhost:8000/api/me/', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              console.log("Token validated successfully");
            } catch (error) {
              console.error('Token validation error:', error);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setAccount(null);
            }
          } else {
            console.log("No token found in storage");
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('MSAL initialization error:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    };
    
    initializeMsal();
  }, []);

  const login = useCallback(async () => {
  if (!msalInstance || !initialized) {
    console.error('MSAL instance is not initialized yet');
    setAuthError('Authentication service not initialized');
    return;
  }
  
  try {
    console.log("Starting login process...");
    setAuthError(null);
    
    // Redirect URI-ı açıq şəkildə qeyd edin
    const loginOptions = {
      ...loginRequest,
      redirectUri: "http://localhost:3000" // Azure Portal-da olan URI
    };
    
    const response = await msalInstance.loginPopup(loginOptions);
    console.log("Login successful, received token");
    
    // Digər kod...
  } catch (error) {
    console.error('Login error:', error);
    setAuthError(error.message || 'Authentication failed');
  }
}, [msalInstance, initialized, router]);

  // Logout function
  const logout = useCallback(async () => {
    if (!msalInstance || !initialized) {
      console.error('MSAL instance is not initialized yet');
      return;
    }
    
    try {
      console.log("Starting logout process...");
      
      // MSAL logout
      await msalInstance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
        mainWindowRedirectUri: window.location.origin
      });
      
      // Clear tokens and account
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAccount(null);
      
      // Redirect to login page
      router.push('/login');
      console.log("Logout complete");
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [msalInstance, initialized, router]);

  // Acquire Graph token for MS Graph API calls
  const acquireGraphToken = useCallback(async () => {
    if (!msalInstance || !initialized || !account) return null;
    
    try {
      console.log("Acquiring token silently...");
      const response = await msalInstance.acquireTokenSilent({
        ...graphRequest,
        account: account
      });
      
      console.log("Token acquired successfully");
      return response.accessToken;
    } catch (error) {
      console.error('Token acquisition error:', error);
      
      // If interaction required, open popup
      if (error instanceof InteractionRequiredAuthError) {
        try {
          console.log("Interaction required, opening popup...");
          const response = await msalInstance.acquireTokenPopup(graphRequest);
          console.log("Token acquired via popup");
          return response.accessToken;
        } catch (interactiveError) {
          console.error('Interactive token acquisition error:', interactiveError);
          return null;
        }
      }
      return null;
    }
  }, [msalInstance, initialized, account]);

  // Context values to share
  const contextValue = {
    account,
    isAuthenticated: !!account && !!localStorage.getItem('accessToken'),
    login,
    logout,
    loading,
    initialized,
    acquireGraphToken,
    authError
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the Auth context
export function useAuth() {
  return useContext(AuthContext);
}