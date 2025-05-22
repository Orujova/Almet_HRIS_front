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
      router.push("/home");
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
    <div className="h-screen bg-almet-mystic dark:bg-gray-900 overflow-hidden">
      <div className="flex h-full">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-almet-mystic to-gray-50 dark:from-gray-900 dark:to-almet-cloud-burst">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-16 h-16 bg-almet-sapphire rounded-full"></div>
            <div className="absolute top-32 right-24 w-12 h-12 bg-almet-sapphire rounded-lg rotate-45"></div>
            <div className="absolute bottom-32 left-24 w-20 h-20 bg-almet-sapphire rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-14 h-14 bg-almet-sapphire rounded-lg -rotate-12"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
            <div className="text-center max-w-lg">
              {/* Hero Image */}
              <div className="mb-8">
                <img 
                  src="https://paybooks.in/wp-content/uploads/2023/12/Demystifying-HRIS-The-Essential-Guide-to-Maximizing-Efficiency-and-Streamlining-HR-Operations.png" 
                  alt="HR Management System" 
                  className="w-full h-56 object-cover rounded-2xl shadow-2xl mx-auto"
                />
              </div>
              
              {/* Title */}
              <h1 className="text-3xl font-bold text-almet-cloud-burst dark:text-white mb-4 leading-tight">
                Human Resources
                <br />
                <span className="text-almet-sapphire">Management System</span>
              </h1>
              
              {/* Description */}
              <p className="text-lg text-gray-600 dark:text-almet-bali-hai mb-6 leading-relaxed">
                Effectively manage your team and optimize HR processes
              </p>
              
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center justify-center text-gray-700 dark:text-almet-bali-hai">
                  <div className="w-2 h-2 bg-almet-sapphire rounded-full mr-3"></div>
                  <span className="font-medium">Employee Management</span>
                </div>
                <div className="flex items-center justify-center text-gray-700 dark:text-almet-bali-hai">
                  <div className="w-2 h-2 bg-almet-sapphire rounded-full mr-3"></div>
                  <span className="font-medium">Performance Analytics</span>
                </div>
                <div className="flex items-center justify-center text-gray-700 dark:text-almet-bali-hai">
                  <div className="w-2 h-2 bg-almet-sapphire rounded-full mr-3"></div>
                  <span className="font-medium">Secure Platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-almet-cloud-burst">
          <div className="w-full max-w-md px-8">
            {/* Mobile Image */}
            <div className="lg:hidden mb-6 text-center">
              <img 
                src="https://paybooks.in/wp-content/uploads/2023/12/Demystifying-HRIS-The-Essential-Guide-to-Maximizing-Efficiency-and-Streamlining-HR-Operations.png" 
                alt="HR System" 
                className="w-full h-32 object-cover rounded-xl mb-4 shadow-lg"
              />
            </div>
            
            {/* Logo */}
            <div className="text-center mb-8">
              {/* <div className="mb-4 flex justify-center">
                <Logo />
              </div> */}
              <h2 className="text-3xl font-bold text-almet-cloud-burst dark:text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-almet-bali-hai text-lg">
                Sign in to your HR Management System
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center text-red-800 dark:text-red-200">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Error: {authError}</span>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoggingIn || loading}
              className="w-full flex items-center justify-center px-6 py-4 text-white bg-almet-sapphire hover:bg-blue-700 disabled:bg-blue-400 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:ring-offset-2"
            >
              {isLoggingIn || loading ? (
                <>
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.5 3v8.5H3V3h8.5zm9 0v8.5h-8.5V3H20.5zM11.5 12.5v8.5H3v-8.5h8.5zm9 0v8.5h-8.5v-8.5H20.5z"/>
                  </svg>
                  <span>Sign in with Microsoft</span>
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-almet-bali-hai">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Trusted</span>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">
                Need help? Contact your system administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}