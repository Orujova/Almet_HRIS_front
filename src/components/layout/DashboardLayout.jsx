"use client";
import React from "react";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";
import { useTheme } from "../common/ThemeProvider";

const DashboardLayout = ({ children }) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const bgMain = darkMode ? "bg-gray-900" : "bg-gray-100";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";

  return (
    <div
      className={`flex h-screen ${bgMain} ${textPrimary} transition-colors duration-200`}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <Header />

        {/* Content Area */}
        <main className={`flex-1 overflow-y-auto p-6 ${bgMain}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
