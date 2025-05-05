"use client";
import { Users, BarChart, FileText, Calendar } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import ApplicationsChart from "@/components/dashboard/ApplicationsChart";
import EmployeeTable from "@/components/dashboard/EmployeeTable";

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* KPI Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Employees"
          value="3,540"
          icon={<Users size={20} className="text-blue-400" />}
          change="+2.45%"
          comparison="vs last month"
        />

        <StatsCard
          title="Team Performance"
          value="1,180"
          icon={<BarChart size={20} className="text-purple-400" />}
          change="+1.2%"
          comparison="vs last month"
        />

        <StatsCard
          title="Job Applications"
          value="500"
          icon={<FileText size={20} className="text-green-400" />}
          change="-0.5%"
          comparison="vs last month"
        />

        <StatsCard
          title="Time Off Requests"
          value="93"
          icon={<Calendar size={20} className="text-orange-400" />}
          change="+10.6%"
          comparison="vs last month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PerformanceChart />
        <ApplicationsChart />
      </div>

      {/* Employees Progress */}
      <EmployeeTable />
    </DashboardLayout>
  );
}
