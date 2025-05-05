"use client";
import { useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Palette,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "../common/ThemeProvider";

const EmployeeRow = ({
  employee,
  statusColorMap,
  isSelected,
  onSelect,
  onViewProfile,
  onChangeColor,
  onDelete,
}) => {
  const { darkMode } = useTheme();
  const [showActions, setShowActions] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Theme-based styling
  const theme = {
    text: darkMode ? "text-white" : "text-gray-900",
    secondaryText: darkMode ? "text-gray-300" : "text-gray-700",
    mutedText: darkMode ? "text-gray-400" : "text-gray-500",
    border: darkMode ? "border-gray-700" : "border-gray-200",
    tableRow: darkMode
      ? "border-gray-700 hover:bg-gray-700"
      : "border-gray-200 hover:bg-gray-50",
    dropdown: darkMode ? "bg-gray-700" : "bg-white",
    dropdownHover: darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100",
    button: darkMode
      ? "bg-gray-700 hover:bg-gray-600"
      : "bg-gray-100 hover:bg-gray-200",
  };

  // Toggle action menu
  const toggleActions = (e) => {
    e.stopPropagation();
    setShowActions(!showActions);
    if (showColorPicker) setShowColorPicker(false);
  };

  // Toggle color picker
  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    onChangeColor(employee.id, color);
    setShowColorPicker(false);
    setShowActions(false);
  };

  // Get status badge classes
  const getStatusBadgeClasses = () => {
    const statusKey = employee.status;
    if (!statusColorMap[statusKey]) return "";
    return darkMode
      ? statusColorMap[statusKey].dark
      : statusColorMap[statusKey].light;
  };

  // Get status label
  const getStatusLabel = () => {
    const statusKey = employee.status;
    return statusColorMap[statusKey]?.label || "Unknown";
  };

  // Row background color
  const rowBackgroundColor = employee.rowColor || "";

  // Available row colors
  const availableColors = [
    { name: "None", value: "" },
    { name: "Blue", value: darkMode ? "bg-blue-900/20" : "bg-blue-50" },
    { name: "Green", value: darkMode ? "bg-green-900/20" : "bg-green-50" },
    { name: "Yellow", value: darkMode ? "bg-yellow-900/20" : "bg-yellow-50" },
    { name: "Red", value: darkMode ? "bg-red-900/20" : "bg-red-50" },
    { name: "Purple", value: darkMode ? "bg-purple-900/20" : "bg-purple-50" },
  ];

  return (
    <tr
      className={`border-b ${theme.tableRow} ${rowBackgroundColor} transition-colors duration-200`}
    >
      {/* Checkbox */}
      <td className="p-3">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600"
          checked={isSelected}
          onChange={() => onSelect(employee.id)}
        />
      </td>

      {/* Employee Name and Email */}
      <td className="p-3">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {employee.empName.charAt(0)}
            </div>
          </div>
          <div className="ml-4">
            <div
              className={`text-sm font-medium cursor-pointer hover:text-blue-500`}
              onClick={() => onViewProfile(employee.id)}
            >
              {employee.empName}
            </div>
            <div className={`text-xs ${theme.mutedText}`}>{employee.email}</div>
          </div>
        </div>
      </td>

      {/* Job Title */}
      <td className="p-3 text-sm">{employee.jobTitle}</td>

      {/* Line Manager */}
      <td className="p-3 text-sm">{employee.lineManager}</td>

      {/* Department */}
      <td className="p-3 text-sm">{employee.department}</td>

      {/* Office */}
      <td className="p-3 text-sm">{employee.office}</td>

      {/* Status */}
      <td className="p-3">
        <span
          className={`px-3 py-1 text-xs rounded-full ${getStatusBadgeClasses()}`}
        >
          {getStatusLabel()}
        </span>
      </td>

      {/* Actions */}
      <td className="p-3 relative">
        <button
          onClick={toggleActions}
          className={`p-1 rounded-full ${theme.button}`}
        >
          <MoreHorizontal size={16} />
        </button>

        {/* Action Menu Dropdown */}
        {showActions && (
          <div
            className={`absolute right-0 z-10 mt-2 w-48 ${theme.dropdown} rounded-md shadow-lg border ${theme.border}`}
          >
            <div className="py-1">
              <Link
                href={`/employees/${employee.id}`}
                className={`flex items-center px-4 py-2 text-sm ${theme.dropdownHover}`}
              >
                <Edit size={16} className="mr-2" />
                View Profile
              </Link>

              <div
                className={`flex items-center px-4 py-2 text-sm ${theme.dropdownHover} cursor-pointer`}
                onClick={toggleColorPicker}
              >
                <Palette size={16} className="mr-2" />
                Change Row Color
              </div>

              <div
                className={`flex items-center px-4 py-2 text-sm ${theme.dropdownHover} cursor-pointer text-red-500`}
                onClick={() => onDelete(employee.id)}
              >
                <Trash size={16} className="mr-2" />
                Delete
              </div>
            </div>
          </div>
        )}

        {/* Color Picker Dropdown */}
        {showColorPicker && (
          <div
            className={`absolute right-0 z-20 mt-2 w-48 ${theme.dropdown} rounded-md shadow-lg border ${theme.border}`}
          >
            <div className="py-1">
              {availableColors.map((color, index) => (
                <div
                  key={index}
                  className={`flex items-center px-4 py-2 text-sm ${theme.dropdownHover} cursor-pointer ${color.value}`}
                  onClick={() => handleColorSelect(color.value)}
                >
                  <div className="flex-1">{color.name}</div>
                  {employee.rowColor === color.value && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};

export default EmployeeRow;
