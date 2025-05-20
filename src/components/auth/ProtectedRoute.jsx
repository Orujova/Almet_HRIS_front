// src/components/auth/ProtectedRoute.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-almet-mystic dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-almet-sapphire"></div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}