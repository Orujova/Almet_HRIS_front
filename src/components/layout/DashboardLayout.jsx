"use client";
import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";
import { useTheme } from "../common/ThemeProvider";

const DashboardLayout = ({ children }) => {
  const { darkMode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if the screen is mobile on initial render and when resizing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "w-0 md:w-20" : "w-64"
        }`}
      >
        {(!isMobile || !isSidebarCollapsed) && (
          <Sidebar
            collapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
          />
        )}
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
