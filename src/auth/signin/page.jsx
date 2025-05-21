// src/app/auth/signin/page.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';

export default function SignIn() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Almet HRIS</h1>
          <p className="text-gray-400 mt-2">İnsan Resursları İdarəetmə Sistemi</p>
        </div>
        
        <button
          onClick={login}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md flex items-center justify-center transition duration-300"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 3v8.5H3V3h8.5zm9 0v8.5h-8.5V3H20.5zM11.5 12.5v8.5H3v-8.5h8.5zm9 0v8.5h-8.5v-8.5H20.5z" fill="currentColor"/>
          </svg>
          Microsoft ilə giriş
        </button>
      </div>
    </div>
  );
}