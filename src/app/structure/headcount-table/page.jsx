// src/app/structure/headcount-table/page.jsx
"use client";
import { useEffect } from "react";
import HeadcountTable from "../../../components/headcount/HeadcountTable";
import DashboardLayout from "../../../components/layout/DashboardLayout";

/**
 * Əməkdaşlar cədvəli səhifəsi
 * @returns {JSX.Element} - Əməkdaşlar cədvəli səhifəsi
 */
const HeadcountTablePage = () => {
  // Səhifə başlığını təyin et
  useEffect(() => {
    document.title = "Employee Headcount - Almet Holding";
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