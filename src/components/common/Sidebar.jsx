"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Building2,
  TrendingUp,
  FileText,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

const Sidebar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);
  const pathname = usePathname();
  const { darkMode } = useTheme();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
    if (!isSidebarOpen) {
      setExpandedItem(null);
    }
  };

  const toggleExpand = (index) => {
    if (expandedItem === index) {
      setExpandedItem(null);
    } else {
      setExpandedItem(index);
    }
  };

  // Theme-dependent classes
  const bgSidebar = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const activeMenuBg = darkMode ? "bg-gray-700" : "bg-gray-200";
  const hoverMenuBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200";

  // Sidebar items with sub-items
  const sidebarItems = [
    {
      name: "Dashboard",
      icon: <Home size={20} />,
      path: "/dashboard",
    },
    {
      name: "Structure",
      icon: <Building2 size={20} />,
      path: "/structure",
      subItems: [
        { name: "Headcount table", path: "/structure/headcount-table" },
        { name: "Org Structure", path: "/structure/org-structure" },
        { name: "Job Descriptions", path: "/structure/job-descriptions" },
        { name: "Comp Matrix", path: "/structure/comp-matrix" },
        { name: "Job Catalog", path: "/structure/job-catalog" },
        { name: "Grading", path: "/structure/grading" },
      ],
    },
    {
      name: "Efficiency",
      icon: <TrendingUp size={20} />,
      path: "/efficiency",
      subItems: [
        { name: "Performance mng", path: "/efficiency/performance-mng" },
      ],
    },
    {
      name: "E-Requests",
      icon: <FileText size={20} />,
      path: "/requests",
      subItems: [
        { name: "Vacation", path: "/requests/vacation" },
        { name: "Business Trip", path: "/requests/business-trip" },
      ],
    },
    {
      name: "Communication",
      icon: <MessageSquare size={20} />,
      path: "/communication",
      subItems: [
        { name: "Company News", path: "/communication/company-news" },
        { name: "Celebrations", path: "/communication/celebrations" },
      ],
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
      subItems: [
        { name: "Access Mng", path: "/settings/access-mng" },
        { name: "Role Mng", path: "/settings/role-mng" },
      ],
    },
  ];

  const isActive = (path) => pathname === path;

  return (
    <div
      className={`${bgSidebar} transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-20"
      } flex flex-col h-screen border-r ${borderColor}`}
    >
      {/* Logo Area */}
      <div
        className={`flex items-center justify-between p-4 border-b ${borderColor}`}
      >
        <div className="flex items-center">
          <svg
            width={isSidebarOpen ? "120" : "30"}
            height="30"
            viewBox="0 0 120 40"
            className="text-blue-500"
          >
            <path
              d="M20,0.2C13.7,0.2,6.7,3.9,0,10.6l20,29.3L30,30.1L16.7,10.6c9.3-6.7,22.7-6.7,32,0L35.4,29.9L39.9,36l20-29.3C53.3,3.9,46.3,0.2,39.9,0.2H20z"
              fill="currentColor"
            />
            {isSidebarOpen && (
              <>
                <text
                  x="55"
                  y="27"
                  fontFamily="Arial Black"
                  fontWeight="bold"
                  fontSize="24"
                  fill="currentColor"
                >
                  ALMET
                </text>
                <text
                  x="55"
                  y="38"
                  fontFamily="Arial"
                  fontSize="12"
                  fill="currentColor"
                >
                  HOLDING
                </text>
              </>
            )}
          </svg>
        </div>
        <button
          onClick={toggleSidebar}
          className={`${textMuted} hover:${textPrimary}`}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="px-2">
          {sidebarItems.map((item, index) => (
            <div key={item.name} className="mb-1">
              {/* Main menu item */}
              <div
                className={`flex items-center ${
                  !isSidebarOpen ? "justify-center" : "justify-between"
                } px-3 py-2 rounded-md cursor-pointer ${
                  isActive(item.path) ? activeMenuBg : hoverMenuBg
                } ${
                  isActive(item.path) ? textPrimary : textSecondary
                } transition-colors duration-200`}
                onClick={() => {
                  if (item.subItems && isSidebarOpen) {
                    toggleExpand(index);
                  } else if (!item.subItems) {
                    // Handle navigation in parent component
                  }
                }}
              >
                <Link href={item.path} className="flex items-center w-full">
                  <span
                    className={`${
                      isActive(item.path) ? textPrimary : textMuted
                    }`}
                  >
                    {item.icon}
                  </span>
                  {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                </Link>

                {isSidebarOpen && item.subItems && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpand(index);
                    }}
                  >
                    {expandedItem === index ? (
                      <ChevronDown size={16} className={textMuted} />
                    ) : (
                      <ChevronRight size={16} className={textMuted} />
                    )}
                  </div>
                )}
              </div>

              {/* Sub-items */}
              {isSidebarOpen && item.subItems && expandedItem === index && (
                <div
                  className={`ml-7 mt-1 space-y-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.path}
                      href={subItem.path}
                      className={`block py-1 px-3 text-sm rounded-md cursor-pointer ${
                        isActive(subItem.path)
                          ? darkMode
                            ? "bg-gray-700 text-gray-200"
                            : "bg-gray-200 text-gray-800"
                          : `${hoverMenuBg} hover:${textPrimary}`
                      } transition-colors duration-200`}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className={`p-4 border-t ${borderColor}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <span>JP</span>
            </div>
          </div>
          {isSidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium">John Pristia</p>
              <p className={`text-xs ${textMuted}`}>Administrator</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
