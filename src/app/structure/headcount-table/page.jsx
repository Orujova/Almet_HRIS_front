// src/app/structure/headcount-table/page.jsx
"use client";
import { useEffect } from "react";
import HeadcountTable from "../../../components/headcount/HeadcountTable";
import DashboardLayout from "../../../components/layout/DashboardLayout";

/**
 * Employee Headcount Table Page - Main employee directory
 * @returns {JSX.Element} - Headcount table page
 */
const HeadcountTablePage = () => {
  // useEffect(() => {
  //   document.title = "Employee Directory - Almet Holding HRIS";
  // }, []);

  return (
    <DashboardLayout>
      <div className="p-4">
        <HeadcountTable />
      </div>
    </DashboardLayout>
  );
};

export default HeadcountTablePage;