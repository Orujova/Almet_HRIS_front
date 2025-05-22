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
import { msalConfig, loginRequest, graphRequest } from "./authConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [msalInstance, setMsalInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        console.log("Initializing MSAL...");
        const msalApp = new PublicClientApplication(msalConfig);
        await msalApp.initialize();
        setMsalInstance(msalApp);
        setInitialized(true);

        const accounts = msalApp.getAllAccounts();
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);

          const token = localStorage.getItem("accessToken");
          if (token) {
            try {
              const response = await axios.get(
                "http://localhost:8000/api/me/",
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              console.log("Token validated successfully");
            } catch (error) {
              console.error("Token validation failed:", error);
              handleTokenError(error);
            }
          } else {
            console.log("No token found, initiating login");
            await login();
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("MSAL initialization error:", error);
        setAuthError(error.message || "Authentication initialization failed");
        setLoading(false);
      }
    };

    initializeMsal();
  }, []);

  const handleTokenError = (error) => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccount(null);
    setAuthError("Session expired. Please log in again.");
    router.push("/login");
  };

  const login = useCallback(async () => {
    if (!msalInstance || !initialized) {
      setAuthError("Authentication service not initialized");
      return;
    }

    try {
      setAuthError(null);
      setLoading(true);

      const loginResponse = await msalInstance.loginPopup({
        ...loginRequest,
        redirectUri: window.location.origin,
      });

      setAccount(loginResponse.account);

      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: loginResponse.account,
      });

      // Backend ilə autentifikasiya
      const backendResponse = await axios.post(
        "http://localhost:8000/api/auth/microsoft/",
        {
          id_token: tokenResponse.idToken,
        }
      );

      localStorage.setItem("accessToken", backendResponse.data.access);
      localStorage.setItem("refreshToken", backendResponse.data.refresh);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(
        error instanceof InteractionRequiredAuthError
          ? "Interaction required. Please try again."
          : error.message || "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  }, [msalInstance, initialized, router]);

  const logout = useCallback(async () => {
    if (!msalInstance || !initialized) return;

    try {
      await msalInstance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
        mainWindowRedirectUri: window.location.origin,
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAccount(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setAuthError("Logout failed. Please try again.");
    }
  }, [msalInstance, initialized, router]);

  const acquireGraphToken = useCallback(async () => {
    if (!msalInstance || !initialized || !account) return null;

    try {
      const response = await msalInstance.acquireTokenSilent({
        ...graphRequest,
        account,
      });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          const response = await msalInstance.acquireTokenPopup(graphRequest);
          return response.accessToken;
        } catch (interactiveError) {
          console.error(
            "Interactive token acquisition error:",
            interactiveError
          );
          setAuthError("Failed to acquire token.");
          return null;
        }
      }
      console.error("Token acquisition error:", error);
      return null;
    }
  }, [msalInstance, initialized, account]);

  const contextValue = {
    account,
    isAuthenticated: !!account && !!localStorage.getItem("accessToken"),
    login,
    logout,
    loading,
    initialized,
    acquireGraphToken,
    authError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
