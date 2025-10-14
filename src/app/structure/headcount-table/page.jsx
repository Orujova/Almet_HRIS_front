// // src/app/structure/headcount-table/page.jsx - Enhanced Main Headcount Page
// "use client";
// import { useEffect } from "react";
// import HeadcountTable from "../../../components/headcount/HeadcountTable";
// import DashboardLayout from "../../../components/layout/DashboardLayout";


// const HeadcountTablePage = () => {
//   useEffect(() => {
//     document.title = "Employee Directory - Almet Holding HRIS";
//   }, []);

//   return (
//     <DashboardLayout>
//       <div className="p-4">
//         <HeadcountTable />
//       </div>
//     </DashboardLayout>
//   );
// };

// export default HeadcountTablePage;

"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HeadcountWrapper from "@/components/headcount/HeadcountWrapper";

export default function HeadcountPage() {
  return (
    <DashboardLayout>
      <HeadcountWrapper />
    </DashboardLayout>
  );
}