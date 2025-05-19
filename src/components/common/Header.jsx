"use client";
import { Bell, Search, Moon, Sun, Menu, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../common/ThemeProvider";

const Header = ({ toggleSidebar, isMobile, isSidebarCollapsed }) => {
  const { darkMode, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState("");

  // Function to update time
  const updateTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    setCurrentTime(`${hours}:${minutes} ${ampm}`);
  };

  // Initialize clock
  useEffect(() => {
    // Initialize clock
    updateTime();
    
    // Update clock every minute
    const timerID = setInterval(updateTime, 60000);
    
    // Cleanup
    return () => {
      clearInterval(timerID);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-almet-cloud-burst border-b border-gray-200 dark:border-almet-comet h-12 px-3 flex items-center justify-between">
      {/* Left side with menu button */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-1.5 mr-3 rounded-md text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet"
          aria-label="Toggle sidebar"
        >
          {isMobile ? (
            <Menu size={18} />
          ) : (
            isSidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />
          )}
        </button>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <Search size={14} className="text-gray-400 dark:text-almet-bali-hai" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-7 pr-2 py-1 text-xs border border-gray-200 dark:border-almet-comet rounded-md bg-gray-100 dark:bg-almet-comet text-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-almet-bali-hai focus:outline-none focus:ring-1 focus:ring-almet-sapphire"
          />
        </div>
      </div>

      {/* Right Side Elements */}
      <div className="flex items-center space-x-3">
        {/* Current Time */}
        <div className="text-xs text-gray-700 dark:text-white">
          {currentTime}
        </div>

        {/* Notifications */}
        <button className="p-1 rounded-full text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet relative">
          <Bell size={16} />
          <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-red-500"></span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-1 rounded-full text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-1">
          <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-almet-comet flex items-center justify-center overflow-hidden">
            <img src="/api/placeholder/24/24" alt="User avatar" className="h-full w-full object-cover" />
          </div>
          <span className="text-xs text-gray-700 dark:text-white">Nizami T</span>
          <svg className="h-3 w-3 text-gray-500 dark:text-almet-bali-hai" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;