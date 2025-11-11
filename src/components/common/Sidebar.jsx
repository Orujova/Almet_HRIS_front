"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  PieChart,
  UsersRound,
  FileText, 
  BarChart2,
  GraduationCap,
  Activity,
  CalendarDays,
  Plane,
  Newspaper,
  Gift,
  Package,

  UserCog,
  Building2,
  TicketsPlane,
  ScrollText
} from "lucide-react";


const Sidebar = ({ collapsed = false }) => {
  const pathname = usePathname();

  // Sidebar menu structure
  const menuItems = [
    // Reports section added as a top-level item
    // { 
    //   type: "section", 
    //   label: "ANALYTICS" 
    // },
    // {
    //   label: "Reports",
    //   icon: <PieChart className="w-4 h-4" />,
    //   path: "/dashboard",
    //   id: "dashboard",
    // },
    { 
      type: "section", 
      label: "STRUCTURE" 
    },
    {
      label: "Headcount table",
      icon: <UsersRound className="w-4 h-4" />,
      path: "/structure/headcount-table",
      id: "headcount-table",
    },
    {
      label: "Org Structure",
      icon: <Building2 className="w-4 h-4" />,
      path: "/structure/org-structure",
      id: "org-structure",
    },
    {
      label: "Job Descriptions",
      icon: <FileText className="w-4 h-4" />,
      path: "/structure/job-descriptions",
      id: "job-descriptions",
    },
    {
      label: "Comp Matrix",
      icon: <BarChart2 className="w-4 h-4" />,
      path: "/structure/comp-matrix",
      id: "comp-matrix",
    },
    {
      label: "Job Catalog",
      icon: <FileText className="w-4 h-4" />,
      path: "/structure/job-catalog",
      id: "job-catalog",
    },
    {
      label: "Grading",
      icon: <GraduationCap className="w-4 h-4" />,
      path: "/structure/grading",
      id: "grading",
    },
    { 
      type: "section", 
      label: "EFFICIENCY" 
    },
    {
      label: "Performance mng",
      icon: <Activity className="w-4 h-4" />,
      path: "/efficiency/performance-mng",
      id: "performance-mng",
    },
    { 
      type: "section", 
      label: "E-REQUESTS" 
    },
    {
      label: "Vacation",
      icon: <CalendarDays className="w-4 h-4" />,
      path: "/requests/vacation",
      id: "vacation",
    },
    {
      label: "Business Trip",
      icon: <Plane className="w-4 h-4" />,
      path: "/requests/business-trip",
      id: "business-trip",
    },
      {
      label: "Time Off",
      icon: <TicketsPlane className="w-4 h-4" />,
      path: "/requests/time-off",
      id: "time-off",
    },
    { 
      type: "section", 
      label: "COMMUNICATION" 
    },
    {
      label: "Company News",
      icon: <Newspaper className="w-4 h-4" />,
      path: "/communication/company-news",
      id: "company-news",
    },
    {
      label: "Celebrations",
      icon: <Gift className="w-4 h-4" />,
      path: "/communication/celebrations",
      id: "celebrations",
    }, { 
      type: "section", 
      label: "COMPANY POLICIES" 
    },
     {
      label: "Policies",
      icon: <ScrollText className="w-4 h-4" />,
      path: "/company-policies",
      id: "policies",
    }, 
    { 
      type: "section", 
      label: "SETTINGS" 
    },
   
    // {
    //   label: "Access Mng",
    //   icon: <KeyRound className="w-4 h-4" />,
    //   path: "/settings/access-mng",
    //   id: "access-mng",
    // },
   
    {
      label: "Role Mng",
      icon: <UserCog className="w-4 h-4" />,
      path: "/settings/role-mng",
      id: "role-mng",
    }, {
      label: "Asset Management",
      icon: <Package className="w-4 h-4" />,
      path: "/settings/asset-mng",
      id: "asset-mng",
    }
  ];

  return (
    <div className="h-full bg-white dark:bg-almet-cloud-burst border-r border-gray-200 dark:border-almet-comet flex flex-col w-full">
      {/* Logo Section - clicking takes you to home page */}
      <Link 
        href="/" 
        className={`flex items-center ${collapsed ? 'justify-center' : 'px-3'} py-2 border-b border-gray-200 dark:border-almet-comet`}
      >
        {collapsed ? (
          <div className="bg-almet-sapphire text-white h-7 w-7 rounded flex items-center justify-center font-bold">
            A
          </div>
        ) : (
          <div className="flex items-center">
            <div className="bg-almet-sapphire text-white h-7 w-7 rounded flex items-center justify-center font-bold mr-2">
              A
            </div>
            <span className="text-almet-cloud-burst dark:text-white text-sm font-medium">
               MY ALMET
            </span>
          </div>
        )}
      </Link>
      
      {/* Main Navigation */}
      <div className="overflow-y-auto flex-1 py-0 scrollbar-thin scrollbar-track-transparent">
        <nav className="px-2">
          {menuItems.map((item, index) => 
            item.type === "section" ? (
              // Only show section titles when not collapsed
              !collapsed && (
                <div key={index} className="pt-3 pb-1">
                  <p className="px-3 text-[10px] font-medium text-gray-500 dark:text-almet-santas-gray uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              )
            ) : (
             <Link 
  key={index}
  href={item.path}
  className={`flex items-center ${collapsed ? 'justify-center' : 'px-3'} py-1.5 text-xs font-medium rounded-md my-0.5 transition-colors duration-300 ${
    pathname.startsWith(item.path) 
      ? "bg-[#5975af] text-white shadow-md" 
      : "text-gray-600 dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-comet"
  }`}
  title={collapsed ? item.label : ''}
>
  <span className={`${collapsed ? '' : 'mr-2'} transition-colors duration-300 ${
    pathname.startsWith(item.path) 
      ? "text-white" 
      : "text-gray-500 dark:text-gray-400"
  }`}>
    {item.icon}
  </span>
  {!collapsed && item.label}
</Link>

            )
          )}
        </nav>
      </div>

    </div>
  );
};

export default Sidebar;