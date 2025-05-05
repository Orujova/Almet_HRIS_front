"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Plus,
  Filter,
  ChevronDown,
  X,
  MoreHorizontal,
  Check,
  Edit,
  Trash,
  Palette,
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import Link from "next/link";

const HeadcountTable = () => {
  const { darkMode } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [actionForRow, setActionForRow] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);

  // Column definitions for the headcount table
  const columns = [
    { id: "select", header: "", width: "40px" },
    { id: "empName", header: "Employee Name", width: "200px" },
    { id: "jobTitle", header: "Job Title", width: "180px" },
    { id: "lineManager", header: "Line Manager", width: "180px" },
    { id: "department", header: "Department", width: "180px" },
    { id: "office", header: "Office", width: "150px" },
    { id: "status", header: "Employee Status", width: "150px" },
  ];

  // Filter categories
  const filterCategories = [
    {
      id: "businessFunctions",
      label: "Business Functions",
      options: ["Holding", "Trading"],
    },
    {
      id: "units",
      label: "Units",
      options: ["Business Development", "Business Support"],
    },
    {
      id: "positions",
      label: "Positions",
      options: ["Designer", "Developer", "Manager"],
    },
    { id: "grade", label: "Grade", options: ["1", "2", "3", "4", "5"] },
    {
      id: "departments",
      label: "Departments",
      options: ["Admin", "Finance", "HR", "IT"],
    },
    {
      id: "jobFunctions",
      label: "Job Functions",
      options: ["Executive", "Specialist", "Support"],
    },
    {
      id: "positionGroups",
      label: "Position Groups",
      options: ["Junior Specialist", "Senior Specialist"],
    },
    {
      id: "lineManager",
      label: "Line Manager",
      options: ["Elkhan Kamalli", "Skylar Calzoni"],
    },
    {
      id: "status",
      label: "Status",
      options: ["Active", "On Boarding", "Probation", "On Leave"],
    },
  ];

  // Sample employee statuses with colors
  const employeeStatuses = [
    {
      value: "active",
      label: "Active",
      color:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    },
    {
      value: "onboarding",
      label: "On Boarding",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    {
      value: "probation",
      label: "Probation",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    },
    {
      value: "onLeave",
      label: "On Leave",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      value: "needInvitation",
      label: "Need Invitation",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
    {
      value: "activated",
      label: "Activated",
      color:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    },
  ];

  // Sample employee data
  useEffect(() => {
    // This would normally be fetched from an API
    const data = [
      {
        id: 1,
        empNo: "AC225",
        empName: "Lincoln Torff",
        email: "lincoln@unpixel.com",
        jobTitle: "UI UX Designer",
        lineManager: "@Pristiacandra",
        department: "Team Product",
        office: "Unpixel Office",
        status: "active",
      },
      {
        id: 2,
        empNo: "AC215",
        empName: "Hanna Baptista",
        email: "hanna@unpixel.com",
        jobTitle: "Graphic Designer",
        lineManager: "@Pristiacandra",
        department: "Team Product",
        office: "Unpixel Office",
        status: "onboarding",
      },
      {
        id: 3,
        empNo: "AC105",
        empName: "Miracle Geidt",
        email: "miracle@unpixel.com",
        jobTitle: "Finance",
        lineManager: "@Pristiacandra",
        department: "Team Product",
        office: "Unpixel Office",
        status: "probation",
      },
      {
        id: 4,
        empNo: "AC107",
        empName: "Rayna Torff",
        email: "rayna@unpixel.com",
        jobTitle: "Project Manager",
        lineManager: "@Pristiacandra",
        department: "Team Product",
        office: "Unpixel Office",
        status: "onLeave",
      },
      {
        id: 5,
        empNo: "AC207",
        empName: "Giana Lipshutz",
        email: "giana@unpixel.com",
        jobTitle: "Creative Director",
        lineManager: "@Pristiacandra",
        department: "Team Product",
        office: "Unpixel Office",
        status: "needInvitation",
      },
      {
        id: 6,
        empNo: "AC208",
        empName: "James George",
        email: "james@unpixel.com",
        jobTitle: "Lead Designer",
        lineManager: "@Pristiacandra",
        department: "Team Product",
        office: "Unpixel Office",
        status: "activated",
      },
      {
        id: 7,
        empNo: "AC101",
        empName: "Jordyn George",
        email: "jordyn@unpixel.com",
        jobTitle: "IT Support",
        lineManager: "@Pristiacandra",
        department: "Team Product",
        office: "Unpixel Office",
        status: "onboarding",
      },
      {
        id: 8,
        empNo: "AC211",
        empName: "Skylar Herwitz",
        email: "skylar@unpixel.com",
        jobTitle: "3D Designer",
        lineManager: "@Pristiacandra",
        department: "Team Product",
        office: "Unpixel Office",
        status: "active",
      },
    ];

    setEmployees(data);
  }, []);

  // Toggle filter panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Open filter dropdown
  const openFilter = (filterId) => {
    setActiveFilter(activeFilter === filterId ? null : filterId);
  };

  // Apply a filter
  const applyFilter = (category, value) => {
    const newFilter = {
      field: category.toLowerCase(),
      value: value.toLowerCase(),
    };

    // Check if this filter already exists
    const existingFilterIndex = appliedFilters.findIndex(
      (filter) =>
        filter.field === newFilter.field && filter.value === newFilter.value
    );

    if (existingFilterIndex === -1) {
      // Add new filter
      setAppliedFilters([...appliedFilters, newFilter]);
    }

    setActiveFilter(null);
  };

  // Remove a filter
  const removeFilter = (index) => {
    const newFilters = [...appliedFilters];
    newFilters.splice(index, 1);
    setAppliedFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setAppliedFilters([]);
  };

  // Row selection
  const toggleRowSelection = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Toggle action menu for a row
  const toggleActionMenu = (id, e) => {
    e.stopPropagation();
    setActionForRow(actionForRow === id ? null : id);
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((employee) => {
    // Search filter
    const searchMatch =
      searchQuery === "" ||
      Object.values(employee).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Applied filters
    const filterMatch =
      appliedFilters.length === 0 ||
      appliedFilters.every((filter) => {
        const employeeValue = employee[filter.field];
        return (
          String(employeeValue).toLowerCase() ===
          String(filter.value).toLowerCase()
        );
      });

    return searchMatch && filterMatch;
  });

  // Get status color based on employee status
  const getStatusBadgeClasses = (status) => {
    const statusObj = employeeStatuses.find((s) => s.value === status);
    return statusObj
      ? statusObj.color
      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  // Get status label based on employee status
  const getStatusLabel = (status) => {
    const statusObj = employeeStatuses.find((s) => s.value === status);
    return statusObj ? statusObj.label : "Unknown";
  };

  // Click handler for employee name (navigate to profile)
  const goToEmployeeProfile = (id) => {
    console.log(`Navigate to employee profile ${id}`);
    // In a real app, would use router.push(`/employees/${id}`);
  };

  // Theme-based styling
  const theme = {
    bg: darkMode ? "bg-gray-900" : "bg-gray-100",
    card: darkMode ? "bg-gray-800" : "bg-white",
    text: darkMode ? "text-white" : "text-gray-900",
    secondaryText: darkMode ? "text-gray-300" : "text-gray-700",
    mutedText: darkMode ? "text-gray-400" : "text-gray-500",
    border: darkMode ? "border-gray-700" : "border-gray-200",
    input: darkMode ? "bg-gray-700" : "bg-gray-50",
    button: darkMode
      ? "bg-gray-700 hover:bg-gray-600"
      : "bg-gray-100 hover:bg-gray-200",
    tableHeader: darkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-gray-50 border-gray-200",
    tableRow: darkMode
      ? "border-gray-700 hover:bg-gray-700"
      : "border-gray-200 hover:bg-gray-50",
    accent: "bg-emerald-500",
    accentHover: "hover:bg-emerald-600",
    dropdown: darkMode ? "bg-gray-700" : "bg-white",
    dropdownHover: darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100",
    shadow: darkMode ? "" : "shadow-md",
  };

  return (
    <div className={`${theme.card} rounded-lg ${theme.shadow} p-6`}>
      {/* Headcount Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className={`${theme.mutedText} text-sm`}>Manage your Employee</p>
        </div>
        <div className="flex space-x-3">
          <button
            className={`${theme.button} px-4 py-2 rounded-md flex items-center`}
          >
            <Download size={18} className="mr-2" />
            Download
          </button>
          <button
            className={`${theme.accent} ${theme.accentHover} text-white px-4 py-2 rounded-md flex items-center`}
          >
            <Plus size={18} className="mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-lg">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.mutedText}`}
              size={18}
            />
            <input
              type="text"
              placeholder="Search employee"
              className={`${theme.input} ${theme.text} w-full pl-10 pr-4 py-2 rounded-md focus:outline-none`}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="flex space-x-2">
            <div className="relative">
              <button
                className={`${theme.button} px-4 py-2 rounded-md flex items-center`}
              >
                All Offices <ChevronDown size={16} className="ml-2" />
              </button>
            </div>

            <div className="relative">
              <button
                className={`${theme.button} px-4 py-2 rounded-md flex items-center`}
              >
                All Jobs <ChevronDown size={16} className="ml-2" />
              </button>
            </div>

            <div className="relative">
              <button
                className={`${theme.button} px-4 py-2 rounded-md flex items-center`}
              >
                All Status <ChevronDown size={16} className="ml-2" />
              </button>
            </div>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              onClick={toggleFilters}
            >
              <Filter size={16} className="mr-2" />
              Filter and more
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            className={`${theme.card} border ${theme.border} rounded-md p-6 mt-4`}
          >
            <div className="grid grid-cols-3 gap-4">
              {filterCategories.map((category) => (
                <div key={category.id} className="mb-4">
                  <div className="relative">
                    <button
                      className={`w-full ${theme.button} border ${theme.border} rounded-md px-4 py-2 text-left flex justify-between items-center`}
                      onClick={() => openFilter(category.id)}
                    >
                      {category.label} <ChevronDown size={16} />
                    </button>
                    <button
                      className={`absolute top-1/2 -right-10 transform -translate-y-1/2 p-1 rounded-full ${theme.button}`}
                    >
                      <Plus size={16} />
                    </button>

                    {/* Dropdown for filter options */}
                    {activeFilter === category.id && (
                      <div
                        className={`absolute z-10 mt-1 w-full ${theme.dropdown} border ${theme.border} rounded-md shadow-lg`}
                      >
                        {category.options.map((option, i) => (
                          <div
                            key={i}
                            className={`px-4 py-2 ${theme.dropdownHover} cursor-pointer`}
                            onClick={() => applyFilter(category.id, option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Applied filters */}
            {appliedFilters.length > 0 && (
              <div className="mt-4">
                <div className={`text-sm ${theme.mutedText} mb-2`}>
                  Applied filters:
                </div>
                <div className="flex flex-wrap gap-2">
                  {appliedFilters.map((filter, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1 rounded-full ${theme.button} flex items-center`}
                    >
                      <span className="mr-2">
                        {filter.field} - {filter.value}
                      </span>
                      <button
                        className={`${theme.mutedText} hover:${theme.text}`}
                        onClick={() => removeFilter(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-4 py-2 rounded-md"
                onClick={clearFilters}
              >
                Clear Filter
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                Apply Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employees Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className={`${theme.tableHeader}`}>
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600"
                  onChange={() => {
                    /* Handle select all */
                  }}
                />
              </th>
              {columns.slice(1).map((column) => (
                <th
                  key={column.id}
                  className="p-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className={`border-b ${theme.tableRow}`}>
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600"
                    checked={selectedRows.includes(employee.id)}
                    onChange={() => toggleRowSelection(employee.id)}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {employee.empName.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div
                        className="text-sm font-medium cursor-pointer hover:text-blue-500"
                        onClick={() => goToEmployeeProfile(employee.id)}
                      >
                        {employee.empName}
                      </div>
                      <div className={`text-xs ${theme.mutedText}`}>
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm">{employee.jobTitle}</td>
                <td className="p-3 text-sm">{employee.lineManager}</td>
                <td className="p-3 text-sm">{employee.department}</td>
                <td className="p-3 text-sm">{employee.office}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${getStatusBadgeClasses(
                      employee.status
                    )}`}
                  >
                    {getStatusLabel(employee.status)}
                  </span>
                </td>
                <td className="p-3 relative">
                  <button
                    onClick={(e) => toggleActionMenu(employee.id, e)}
                    className={`p-1 rounded-full ${theme.button}`}
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {/* Action Menu Dropdown */}
                  {actionForRow === employee.id && (
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
                        >
                          <Palette size={16} className="mr-2" />
                          Change Row Color
                        </div>
                        <div
                          className={`flex items-center px-4 py-2 text-sm ${theme.dropdownHover} cursor-pointer text-red-500`}
                        >
                          <Trash size={16} className="mr-2" />
                          Delete
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className={`text-sm ${theme.mutedText}`}>
            Showing 1 to 8 of 50 entries
          </div>
          <div className="flex space-x-1">
            <button className={`px-3 py-1 rounded-md ${theme.button}`}>
              &lt;
            </button>
            <button className={`px-3 py-1 rounded-md bg-blue-600 text-white`}>
              1
            </button>
            <button className={`px-3 py-1 rounded-md ${theme.button}`}>
              2
            </button>
            <button className={`px-3 py-1 rounded-md ${theme.button}`}>
              3
            </button>
            <button className={`px-3 py-1 rounded-md ${theme.button}`}>
              ...
            </button>
            <button className={`px-3 py-1 rounded-md ${theme.button}`}>
              10
            </button>
            <button className={`px-3 py-1 rounded-md ${theme.button}`}>
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadcountTable;
