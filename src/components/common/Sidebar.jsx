"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  FileText,
  BarChart,
  List,
  Star,
  LineChart,
  Calendar,
  Plane,
  Newspaper,
  Gift,
  Settings,
  Lock,
  UserCog,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Logo from "./Logo";

const Sidebar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const pathname = usePathname();
  const { darkMode } = useTheme();

  // Auto-expand the active category
  useEffect(() => {
    const activeCategoryId = sidebarCategories.find(
      (category) =>
        category.type === "category" &&
        category.items &&
        category.items.some((item) => pathname === item.path)
    )?.id;

    if (activeCategoryId && !expandedItems[activeCategoryId]) {
      setExpandedItems((prev) => ({
        ...prev,
        [activeCategoryId]: true,
      }));
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
    if (!isSidebarOpen) {
      setExpandedItems({});
    }
  };

  const toggleExpand = (categoryId) => {
    // When opening a category, close all others
    if (!expandedItems[categoryId]) {
      const newExpandedItems = {};
      newExpandedItems[categoryId] = true;
      setExpandedItems(newExpandedItems);
    } else {
      // Just close this category
      setExpandedItems((prev) => ({
        ...prev,
        [categoryId]: false,
      }));
    }
  };

  // Theme-dependent classes
  const bgSidebar = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const activeMenuBg = darkMode ? "bg-gray-700" : "bg-gray-100";
  const hoverMenuBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const categoryHeading = darkMode ? "text-gray-500" : "text-gray-500";

  // Sidebar categories with their items
  const sidebarCategories = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <Home size={20} />,
      path: "/dashboard",
      type: "item", // single item without submenu
    },
    {
      id: "structure",
      name: "STRUCTURE",
      icon: <Users size={20} />,
      type: "category",
      items: [
        {
          name: "Headcount table",
          icon: <Users size={20} />,
          path: "/structure/headcount-table",
        },
        {
          name: "Org Structure",
          icon: <Users size={20} />,
          path: "/structure/org-structure",
        },
        {
          name: "Job Descriptions",
          icon: <FileText size={20} />,
          path: "/structure/job-descriptions",
        },
        {
          name: "Comp Matrix",
          icon: <BarChart size={20} />,
          path: "/structure/comp-matrix",
        },
        {
          name: "Job Catalog",
          icon: <List size={20} />,
          path: "/structure/job-catalog",
        },
        {
          name: "Grading",
          icon: <Star size={20} />,
          path: "/structure/grading",
        },
      ],
    },
    {
      id: "efficiency",
      name: "EFFICIENCY",
      icon: <LineChart size={20} />,
      type: "category",
      items: [
        {
          name: "Performance mng",
          icon: <LineChart size={20} />,
          path: "/efficiency/performance-mng",
        },
      ],
    },
    {
      id: "requests",
      name: "E-REQUESTS",
      icon: <Calendar size={20} />,
      type: "category",
      items: [
        {
          name: "Vacation",
          icon: <Calendar size={20} />,
          path: "/requests/vacation",
        },
        {
          name: "Business Trip",
          icon: <Plane size={20} />,
          path: "/requests/business-trip",
        },
      ],
    },
    {
      id: "communication",
      name: "COMMUNICATION",
      icon: <Newspaper size={20} />,
      type: "category",
      items: [
        {
          name: "Company News",
          icon: <Newspaper size={20} />,
          path: "/communication/company-news",
        },
        {
          name: "Celebrations",
          icon: <Gift size={20} />,
          path: "/communication/celebrations",
        },
      ],
    },
    {
      id: "settings",
      name: "SETTINGS",
      icon: <Settings size={20} />,
      type: "category",
      items: [
        {
          name: "Access Mng",
          icon: <Lock size={20} />,
          path: "/settings/access-mng",
        },
        {
          name: "Role Mng",
          icon: <UserCog size={20} />,
          path: "/settings/role-mng",
        },
      ],
    },
  ];

  const isActive = (path) => pathname === path;
  const isCategoryActive = (category) => {
    if (!category.items) return false;
    return category.items.some(
      (item) => pathname === item.path || pathname.startsWith(item.path + "/")
    );
  };

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
          <Logo collapsed={!isSidebarOpen} />
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
          {sidebarCategories.map((category) => (
            <div key={category.id} className="mb-2">
              {category.type === "item" ? (
                /* Single item without dropdown */
                <Link
                  href={category.path}
                  className={`flex items-center ${
                    !isSidebarOpen ? "justify-center" : "justify-between"
                  } px-3 py-2.5 rounded-md cursor-pointer ${
                    isActive(category.path) ? activeMenuBg : hoverMenuBg
                  } ${
                    isActive(category.path) ? textPrimary : textSecondary
                  } transition-colors duration-200 my-1`}
                >
                  <div className="flex items-center">
                    <span
                      className={
                        isActive(category.path) ? textPrimary : textMuted
                      }
                    >
                      {category.icon}
                    </span>
                    {isSidebarOpen && (
                      <span className="ml-3 font-medium">{category.name}</span>
                    )}
                  </div>
                </Link>
              ) : (
                /* Category with dropdown */
                <div className="mt-6">
                  {/* Category Header with Toggle */}
                  <div
                    className={`flex items-center justify-between cursor-pointer px-3 py-2 ${
                      isCategoryActive(category) ? textPrimary : categoryHeading
                    }`}
                    onClick={() => isSidebarOpen && toggleExpand(category.id)}
                  >
                    {isSidebarOpen ? (
                      <>
                        <h3 className="text-xs font-semibold uppercase tracking-wider">
                          {category.name}
                        </h3>
                        {expandedItems[category.id] ? (
                          <ChevronDown size={16} className={textMuted} />
                        ) : (
                          <ChevronRight size={16} className={textMuted} />
                        )}
                      </>
                    ) : (
                      <div className="w-full border-t border-gray-700 dark:border-gray-600"></div>
                    )}
                  </div>

                  {/* Category Items */}
                  {isSidebarOpen && expandedItems[category.id] && (
                    <div className="mt-1">
                      {category.items.map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive(item.path) ? activeMenuBg : hoverMenuBg
                          } ${
                            isActive(item.path) ? textPrimary : textSecondary
                          } transition-colors duration-150 my-0.5`}
                        >
                          <span
                            className={`${
                              isActive(item.path) ? textPrimary : textMuted
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="ml-3 text-sm">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
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
