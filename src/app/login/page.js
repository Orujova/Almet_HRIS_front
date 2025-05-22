// src/app/login/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthContext";
import Logo from "@/components/common/Logo";

export default function Login() {
  const { login, isAuthenticated, loading, authError } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error) {
      console.error("Login attempt failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-almet-mystic dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-almet-cloud-burst">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-almet-cloud-burst dark:text-white">
          Xoş gəlmisiniz
        </h1>
        <p className="mb-6 text-center text-gray-600 dark:text-almet-bali-hai">
          İnsan Resursları İdarəetmə Sistemimizə daxil olun
        </p>

        {authError && (
          <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">
              Xəta: {authError}
            </p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoggingIn || loading}
          className="flex w-full items-center justify-center rounded-md bg-almet-sapphire py-3 px-4 text-white transition duration-300 hover:bg-blue-700 disabled:opacity-70"
        >
          {isLoggingIn || loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              Giriş edilir...
            </>
          ) : (
            <>
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5 3v8.5H3V3h8.5zm9 0v8.5h-8.5V3H20.5zM11.5 12.5v8.5H3v-8.5h8.5zm9 0v8.5h-8.5v-8.5H20.5z"
                  fill="currentColor"
                />
              </svg>
              Microsoft ilə giriş
            </>
          )}
        </button>
      </div>
    </div>
  );
}
