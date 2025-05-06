// src/components/headcount/EmployeeRow.jsx
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../common/ThemeProvider";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import HeadcountActions from "./HeadcountActions";

const EmployeeRow = ({ employee, isSelected, onSelect, onAction }) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const selectedBg = darkMode ? "bg-gray-700" : "bg-blue-50";

  const handleActionClick = (employeeId, action) => {
    onAction(employeeId, action);
  };

  return (
    <tr
      className={`${
        isSelected ? selectedBg : ""
      } ${hoverBg} transition-colors duration-150`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 rounded"
            checked={isSelected}
            onChange={() => onSelect(employee.id)}
          />
          <div className="ml-3 flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {employee.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="ml-2">
              <Link href={`/structure/employee/${employee.id}`}>
                <div
                  className={`text-sm font-medium ${textPrimary} hover:underline`}
                >
                  {employee.name}
                </div>
              </Link>
              <div className={`text-xs ${textMuted}`}>
                {employee.empNo.toLowerCase()}@unpixel.com
              </div>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${textPrimary}`}>
          {employee.jobTitle.split(" ").slice(0, 3).join(" ")}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className={`text-sm ${textPrimary}`}>
            @{employee.lineManager.toLowerCase().split(" ")[0]}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${textPrimary}`}>Team Product</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${textPrimary}`}>Unpixel Office</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <EmployeeStatusBadge status={employee.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className={`${textPrimary}`}>{employee.status}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <HeadcountActions
          employeeId={employee.id}
          onAction={handleActionClick}
        />
      </td>
    </tr>
  );
};

export default EmployeeRow;
