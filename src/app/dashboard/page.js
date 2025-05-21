"use client";
import {
  UsersRound,
  BarChart2,
  FileText,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const StatsCard = ({ title, value, icon, change, comparison }) => {
  const isPositive = !change.includes("-");

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-3 shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] text-gray-500 dark:text-almet-bali-hai mb-1">{title}</p>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">{value}</h3>
        </div>
        <div className="bg-blue-50 dark:bg-almet-comet p-1.5 rounded-lg text-almet-sapphire dark:text-almet-steel-blue">
          {icon}
        </div>
      </div>
      <div className="flex items-center mt-2">
        <span
          className={`text-[10px] flex items-center ${
            isPositive ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
          }`}
        >
          <ArrowUpRight
            size={10}
            className={`mr-0.5 ${!isPositive ? "transform rotate-90" : ""}`}
          />
          {change}
        </span>
        <span className="text-gray-500 dark:text-almet-bali-hai text-[10px] ml-1">{comparison}</span>
      </div>
    </div>
  );
};

export default function Reports() {
  return (
    <DashboardLayout>
      {/* Title Section */}
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 mb-4 shadow">
        <h1 className="text-base font-bold text-gray-800 dark:text-white mb-1">
          Reports
        </h1>
        <p className="text-gray-500 dark:text-almet-bali-hai text-xs">
          Overview of key metrics and performance indicators
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatsCard
          title="Total Employees"
          value="3,540"
          icon={<UsersRound size={16} />}
          change="+2.45%"
          comparison="vs last month"
        />
        <StatsCard
          title="Team Performance"
          value="1,180"
          icon={<BarChart2 size={16} />}
          change="+1.2%"
          comparison="vs last month"
        />
        <StatsCard
          title="Job Applications"
          value="500"
          icon={<FileText size={16} />}
          change="-0.5%"
          comparison="vs last month"
        />
        <StatsCard
          title="Time Off Requests"
          value="93"
          icon={<CalendarDays size={16} />}
          change="+10.6%"
          comparison="vs last month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow min-h-32">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Performance Trends</h2>
          <div className="h-32 flex items-center justify-center">
            {/* Performance Chart Mock */}
            <svg className="w-full h-full" viewBox="0 0 400 150">
              <path
                d="M0,100 C50,80 100,120 150,60 C200,20 250,50 300,40 C350,30 400,60 400,50"
                fill="none"
                stroke="#2346A8"
                strokeWidth="2"
                className="dark:stroke-almet-steel-blue"
              />
              <path
                d="M0,100 C50,80 100,120 150,60 C200,20 250,50 300,40 C350,30 400,60 400,50"
                fill="url(#performance-gradient)"
                fillOpacity="0.2"
                stroke="none"
              />
              <defs>
                <linearGradient id="performance-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2346A8" stopOpacity="0.5" className="dark:stop-color-almet-steel-blue" />
                  <stop offset="100%" stopColor="#2346A8" stopOpacity="0" className="dark:stop-color-almet-steel-blue" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow min-h-32">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Application Status</h2>
          <div className="h-32 flex items-center justify-center">
            {/* Donut Chart Mock */}
            <svg className="w-28 h-28" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="#f3f4f6" className="dark:fill-almet-comet" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#2346A8"
                strokeWidth="20"
                strokeDasharray="251.2"
                strokeDashoffset="188.4"
                transform="rotate(-90 50 50)"
                className="dark:stroke-almet-steel-blue"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="20"
                strokeDasharray="251.2"
                strokeDashoffset="188.4"
                transform="rotate(30 50 50)"
                className="dark:stroke-purple-600"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray="251.2"
                strokeDashoffset="188.4"
                transform="rotate(150 50 50)"
                className="dark:stroke-green-600"
              />
              <circle cx="50" cy="50" r="30" fill="#ffffff" className="dark:fill-almet-cloud-burst" />
            </svg>
            <div className="ml-4 space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-almet-sapphire dark:bg-almet-steel-blue mr-1"></div>
                <span className="text-xs text-gray-700 dark:text-almet-bali-hai">Qualified (25%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-600 mr-1"></div>
                <span className="text-xs text-gray-700 dark:text-almet-bali-hai">Interview (25%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-600 mr-1"></div>
                <span className="text-xs text-gray-700 dark:text-almet-bali-hai">Hired (25%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">
            Employee Progress
          </h2>
          <button className="text-almet-sapphire dark:text-almet-steel-blue hover:text-almet-astral dark:hover:text-white text-xs">
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] font-medium text-gray-500 dark:text-almet-bali-hai uppercase tracking-wider">
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-almet-comet">
              {[
                {
                  name: "John Doe",
                  email: "john@example.com",
                  department: "Marketing",
                  status: "Active",
                  progress: 85,
                  avatar: "JD",
                },
                {
                  name: "Alice Smith",
                  email: "alice@example.com",
                  department: "Development",
                  status: "On Leave",
                  progress: 62,
                  avatar: "AS",
                },
                {
                  name: "Robert Johnson",
                  email: "robert@example.com",
                  department: "Finance",
                  status: "Active",
                  progress: 78,
                  avatar: "RJ",
                },
              ].map((employee, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-almet-comet/30">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-almet-sapphire text-white flex items-center justify-center text-[10px]">
                        {employee.avatar}
                      </div>
                      <div className="ml-2">
                        <p className="text-xs font-medium text-gray-800 dark:text-white">{employee.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-almet-bali-hai">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs text-gray-700 dark:text-almet-bali-hai">{employee.department}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                      employee.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400"
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end">
                      <span className="text-xs text-gray-700 dark:text-almet-bali-hai mr-2">{employee.progress}%</span>
                      <div className="w-16 md:w-20 h-1.5 bg-gray-200 dark:bg-almet-comet rounded-full">
                        <div
                          className="h-full bg-almet-sapphire dark:bg-almet-steel-blue rounded-full"
                          style={{ width: `${employee.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}