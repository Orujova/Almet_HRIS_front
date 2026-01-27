// src/components/common/Header.jsx
"use client";
import { 
  Moon, 
  Sun, 
  Menu, 
  ChevronsLeft, 
  ChevronsRight, 
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  Home,
  Briefcase,
  BookOpen,
  Clock,
  Globe,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { useAuth } from "@/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import NotificationDropdown from "./NotificationDropdown";
import handoverService from "@/services/handoverService";

const Header = ({ toggleSidebar, isMobile, isSidebarCollapsed }) => {
  const { darkMode, toggleTheme } = useTheme();
  const { account, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentTimes, setCurrentTimes] = useState({
    baku: "",
    london: ""
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showTimeCard, setShowTimeCard] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [primaryTimezone, setPrimaryTimezone] = useState('baku'); // 'baku' or 'london'
  const userMenuRef = useRef(null);
  const timeCardRef = useRef(null);

  // Tab definitions
  const tabs = [
    { 
      id: 'personal', 
      label: 'Personal Area', 
      icon: Home, 
      path: '/'
    },
    { 
      id: 'general', 
      label: 'General Workspace', 
      icon: Briefcase, 
      path: '/workspace/general'
    },
    { 
      id: 'library', 
      label: 'Documentation Library', 
      icon: BookOpen, 
      path: '/workspace/library'
    }
  ];

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname === '/') return 'personal';
    if (pathname.startsWith('/workspace/general')) return 'general';
    if (pathname.startsWith('/workspace/library')) return 'library';
    return 'personal';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [pathname]);

  // Load user details to determine business function
  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const userData = await handoverService.getUser();
        setUserDetails(userData);
        
        // Determine primary timezone based on business function
        const businessFunction = userData?.employee?.business_function_detail?.name || 
                                userData?.employee?.business_function_detail?.code || '';
        
        if (businessFunction.toUpperCase() === 'UK') {
          setPrimaryTimezone('london');
        } else {
          setPrimaryTimezone('baku');
        }
      } catch (error) {
        console.error('Failed to load user details:', error);
        setPrimaryTimezone('baku'); // Default to Baku
      }
    };

    loadUserDetails();
  }, []);

  // Function to update times
  const updateTimes = () => {
    const now = new Date();
    
    // Baku time (UTC+4)
    const bakuTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Baku' }));
    let bakuHours = bakuTime.getHours();
    const bakuMinutes = bakuTime.getMinutes().toString().padStart(2, '0');
    const bakuAmpm = bakuHours >= 12 ? 'PM' : 'AM';
    bakuHours = bakuHours % 12;
    bakuHours = bakuHours ? bakuHours : 12;
    
    // London time (UTC+0/+1 depending on DST)
    const londonTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
    let londonHours = londonTime.getHours();
    const londonMinutes = londonTime.getMinutes().toString().padStart(2, '0');
    const londonAmpm = londonHours >= 12 ? 'PM' : 'AM';
    londonHours = londonHours % 12;
    londonHours = londonHours ? londonHours : 12;
    
    setCurrentTimes({
      baku: `${bakuHours}:${bakuMinutes} ${bakuAmpm}`,
      london: `${londonHours}:${londonMinutes} ${londonAmpm}`
    });
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (timeCardRef.current && !timeCardRef.current.contains(event.target)) {
        setShowTimeCard(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize clock
  useEffect(() => {
    updateTimes();
    const timerID = setInterval(updateTimes, 60000); // Update every minute
    return () => clearInterval(timerID);
  }, []);

  // User initials for avatar
  const getUserInitials = () => {
    if (account?.first_name && account?.last_name) {
      return `${account.first_name.charAt(0)}${account.last_name.charAt(0)}`.toUpperCase();
    }
    if (account?.name) {
      const names = account.name.split(' ');
      return names.length > 1 
        ? `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
        : names[0].charAt(0).toUpperCase();
    }
    if (account?.username) {
      return account.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Store user email in localStorage
  if (account?.username && typeof window !== 'undefined') {
    localStorage.setItem("user_email", account.username);
  }

  // User display name
  const getUserDisplayName = () => {
    if (account?.name) return account.name;
    if (account?.first_name && account?.last_name) {
      return `${account.first_name} ${account.last_name}`;
    }
    if (account?.username) return account.username;
    return 'User';
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    router.push(tab.path);
  };

  // Get primary time info based on business function
  const getPrimaryTimeInfo = () => {
    if (primaryTimezone === 'london') {
      return {
        code: 'UK',
        time: currentTimes.london,
        label: 'London',
        gradient: 'from-gray-600 to-gray-800'
      };
    }
    return {
      code: 'AZ',
      time: currentTimes.baku,
      label: 'Baku',
      gradient: 'from-almet-sapphire to-almet-astral'
    };
  };

  const primaryTime = getPrimaryTimeInfo();

  return (
    <header className="bg-white dark:bg-almet-cloud-burst border-b border-gray-200 dark:border-almet-comet shadow-sm">
      {/* Single Row - Combined Header with Tabs */}
      <div className="h-11 px-4 flex items-center justify-between">
        {/* Left side - Menu button + Tabs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors"
            aria-label="Toggle sidebar"
          >
            {isMobile ? (
              <Menu size={18} />
            ) : (
              isSidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />
            )}
          </button>

          {/* Tab Navigation */}
          <nav className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`
                    relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300
                    flex items-center gap-2
                    ${isActive 
                      ? 'text-almet-sapphire dark:text-almet-steel-blue bg-almet-sapphire/10 dark:bg-almet-steel-blue/10' 
                      : 'text-gray-600 dark:text-almet-bali-hai hover:text-almet-sapphire dark:hover:text-almet-steel-blue hover:bg-gray-100 dark:hover:bg-almet-comet'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="hidden lg:inline">{tab.label}</span>
                  
                  {/* Active indicator - bottom border */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-almet-sapphire to-almet-astral dark:from-almet-steel-blue dark:to-almet-astral"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side Elements */}
        <div className="flex items-center space-x-3">
          {/* World Time Display */}
          <div className="relative" ref={timeCardRef}>
            <button
              onClick={() => setShowTimeCard(!showTimeCard)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors group"
            >
              <Clock size={14} className={primaryTimezone === 'london' ? 'text-gray-600 dark:text-gray-400' : 'text-almet-sapphire dark:text-almet-steel-blue'} />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-medium text-gray-500 dark:text-almet-bali-hai">
                  {primaryTime.code}
                </span>
                <span className="text-xs font-bold text-gray-700 dark:text-white">
                  {primaryTime.time}
                </span>
              </div>
            </button>

            {/* Time Card Dropdown */}
            {showTimeCard && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-almet-cloud-burst rounded-xl shadow-xl border border-gray-200 dark:border-almet-comet py-3 px-4 z-50">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-almet-comet">
                  <Globe size={16} className="text-almet-sapphire dark:text-almet-steel-blue" />
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    Global Time
                  </h3>
                </div>
                
                {/* Primary timezone first */}
                {primaryTimezone === 'baku' ? (
                  <>
                    {/* Baku Time - Primary */}
                    <div className="mb-3 p-3 rounded-lg bg-gradient-to-br from-almet-sapphire/5 to-almet-astral/5 dark:from-almet-steel-blue/10 dark:to-almet-astral/10 border border-almet-sapphire/20 dark:border-almet-steel-blue/20">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${primaryTime.gradient} flex items-center justify-center`}>
                            <span className="text-white text-[10px] font-bold">AZ</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            Baku
                          </span>
                        </div>
                        <span className="text-sm font-bold text-almet-sapphire dark:text-almet-steel-blue">
                          {currentTimes.baku}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-almet-bali-hai ml-8">
                        Azerbaijan (UTC+4)
                      </p>
                    </div>

                    {/* London Time - Secondary */}
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-almet-san-juan/30">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">UK</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            London
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-white">
                          {currentTimes.london}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-almet-bali-hai ml-8">
                        United Kingdom (GMT/BST)
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* London Time - Primary */}
                    <div className="mb-3 p-3 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/20 dark:to-gray-800/20 border border-gray-300 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${primaryTime.gradient} flex items-center justify-center`}>
                            <span className="text-white text-[10px] font-bold">UK</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            London
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-white">
                          {currentTimes.london}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-almet-bali-hai ml-8">
                        United Kingdom (GMT/BST)
                      </p>
                    </div>

                    {/* Baku Time - Secondary */}
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-almet-san-juan/30">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">AZ</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            Baku
                          </span>
                        </div>
                        <span className="text-sm font-bold text-almet-sapphire dark:text-almet-steel-blue">
                          {currentTimes.baku}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-almet-bali-hai ml-8">
                        Azerbaijan (UTC+4)
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors max-w-48"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center font-semibold text-xs shadow-md flex-shrink-0">
                {getUserInitials()}
              </div>
              <div className="hidden md:block text-left min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-700 dark:text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-[8px] text-gray-500 dark:text-almet-bali-hai truncate">
                  {account?.username || 'user@company.com'}
                </p>
              </div>
              <ChevronDown 
                size={14} 
                className={`text-gray-500 dark:text-almet-bali-hai transition-transform flex-shrink-0 ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg border border-gray-200 dark:border-almet-comet py-1.5 z-50">
                {/* User Info Header */}
                <div className="px-3 py-1.5 border-b border-gray-100 dark:border-almet-comet">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center font-semibold text-xs shadow-md flex-shrink-0">
                      {getUserInitials()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={getUserDisplayName()}>
                        {getUserDisplayName()}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-almet-bali-hai truncate" title={account?.username || 'user@company.com'}>
                        {account?.username || 'user@company.com'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button className="flex items-center w-full px-3 py-1.5 text-xs text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors">
                    <User size={12} className="mr-2 text-gray-500 dark:text-almet-bali-hai flex-shrink-0" />
                    <span className="truncate">Profile Settings</span>
                  </button>
                  
                  <button className="flex items-center w-full px-3 py-1.5 text-xs text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors">
                    <Settings size={12} className="mr-2 text-gray-500 dark:text-almet-bali-hai flex-shrink-0" />
                    <span className="truncate">Account Settings</span>
                  </button>
                  
                  <button className="flex items-center w-full px-3 py-1.5 text-xs text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors">
                    <HelpCircle size={12} className="mr-2 text-gray-500 dark:text-almet-bali-hai flex-shrink-0" />
                    <span className="truncate">Help & Support</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 dark:border-almet-comet pt-1">
                  <button 
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center w-full px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={12} className="mr-2 flex-shrink-0" />
                    <span className="truncate">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;