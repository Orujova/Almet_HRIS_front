"use client";
import { createContext, useState, useEffect, useContext } from "react";

// Create context
const ThemeContext = createContext({
  darkMode: true,
  toggleTheme: () => {},
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", !darkMode ? "true" : "false");
    }
  };

  // Initialize theme from local storage on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("darkMode");
      if (savedTheme) {
        setDarkMode(savedTheme === "true");
      }
    }
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);
