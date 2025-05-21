// src/app/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, router]);

  // Yükləmə zamanı göstəriləcək ekran
  return (
    <div className="flex h-screen items-center justify-center bg-almet-mystic dark:bg-gray-900">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-almet-sapphire"></div>
    </div>
  );
}