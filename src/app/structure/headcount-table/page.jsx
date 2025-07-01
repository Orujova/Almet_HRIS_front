// src/app/structure/headcount-table/page.jsx - Enhanced Main Headcount Page
"use client";
import { useEffect } from "react";
import HeadcountTable from "../../../components/headcount/HeadcountTable";
import DashboardLayout from "../../../components/layout/DashboardLayout";

/**
 * Employee Headcount Table Page - Main employee directory
 * Features:
 * - Complete API integration
 * - Multi-column sorting (Excel-style)
 * - Advanced filtering with multi-selection
 * - Bulk operations (export, update, delete)
 * - Tags management
 * - Status management
 * - Real-time statistics
 * @returns {JSX.Element} - Enhanced headcount table page
 */
const HeadcountTablePage = () => {
  useEffect(() => {
    document.title = "Employee Directory - Almet Holding HRIS";
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4">
        <HeadcountTable />
      </div>
    </DashboardLayout>
  );
};

export default HeadcountTablePage;