"use client";
import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Filter,
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import Link from "next/link";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import FilterPanel from "./FilterPanel";
import HeadcountActions from "./HeadcountActions";
import HeadcountActionButton from "./HeadcountActionButton";
import EmployeeRow from "./EmployeeRow";

const HeadcountTable = () => {
  const { darkMode } = useTheme();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-100";
  const btnPrimary = darkMode
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-500 hover:bg-blue-600";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600"
    : "bg-gray-200 hover:bg-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const shadowClass = darkMode ? "" : "shadow-md";
  const theadBg = darkMode ? "bg-gray-700" : "bg-gray-50";
  // Fixed pagination styles regardless of theme
  const paginationBg = "bg-gray-700";
  const paginationText = "text-white";
  const activePage = "bg-blue-500";

  // Mock employee data based on the Excel screenshot
  useEffect(() => {
    const mockEmployees = [
      {
        id: "HC01",
        empNo: "EJ2023",
        name: "Eric Johnson",
        email: "ej2023@unpixel.com",
        jobTitle: "DEPUTY CHAIRMAN OF PRODUCT REPOSITIONING",
        lineManager: "@linda",
        team: "Team Product",
        office: "Unpixel Office",
        status: "ACTIVE",
        statusBadge: "ACTIVE",
      },
      {
        id: "HC02",
        empNo: "AN1023",
        name: "Aria Sanderson",
        email: "an1023@unpixel.com",
        jobTitle: "DEPUTY CHAIRMAN OF CORPORATE ACTIVITIES",
        lineManager: "@eric",
        team: "Team Product",
        office: "Unpixel Office",
        status: "ACTIVE",
        statusBadge: "ACTIVE",
      },
      {
        id: "HC03",
        empNo: "JK23",
        name: "James Kowalski",
        email: "jk23@unpixel.com",
        jobTitle: "ADMINISTRATIVE SPECIALIST",
        lineManager: "@maria",
        team: "Team Support",
        office: "Unpixel Office",
        status: "ACTIVE",
        statusBadge: "ACTIVE",
      },
      {
        id: "HC04",
        empNo: "ML25",
        name: "Maria Torelli",
        email: "ml25@unpixel.com",
        jobTitle: "ADMIN",
        lineManager: "@james",
        team: "Team Support",
        office: "Central HQ",
        status: "ON BOARDING",
        statusBadge: "ON BOARDING",
      },
      {
        id: "HC05",
        empNo: "DK67",
        name: "Darius Krawczyk",
        email: "dk67@unpixel.com",
        jobTitle: "ADMINISTRATIVE ASSISTANT",
        lineManager: "@james",
        team: "Team Support",
        office: "Central HQ",
        status: "PROBATION",
        statusBadge: "PROBATION",
      },
      {
        id: "HC06",
        empNo: "LJ34",
        name: "Laura Jovanovic",
        email: "lj34@unpixel.com",
        jobTitle: "LEGAL",
        lineManager: "@eric",
        team: "Team Support",
        office: "Central HQ",
        status: "ACTIVE",
        statusBadge: "ACTIVE",
      },
      {
        id: "HC07",
        empNo: "TS115",
        name: "Tamara Singh",
        email: "ts115@unpixel.com",
        jobTitle: "SENIOR BUDGETING & CONTROLLING SPECIALIST",
        lineManager: "@eric",
        team: "Team Finance",
        office: "Unpixel Office",
        status: "ON LEAVE",
        statusBadge: "ON LEAVE",
      },
      {
        id: "HC08",
        empNo: "RT201",
        name: "Ryan Thompson",
        email: "rt201@unpixel.com",
        jobTitle: "SENIOR BUSINESS SYSTEMS ANALYST",
        lineManager: "@tamara",
        team: "Team Product",
        office: "Unpixel Office",
        status: "ACTIVE",
        statusBadge: "ACTIVE",
      },
      {
        id: "HC09",
        empNo: "MC123",
        name: "Maria Calzoni",
        email: "mc123@unpixel.com",
        jobTitle: "HEAD OF BUDGETING & CONTROLLING",
        lineManager: "@eric",
        team: "Team Finance",
        office: "Unpixel Office",
        status: "ACTIVE",
        statusBadge: "ACTIVE",
      },
      {
        id: "HC10",
        empNo: "JD89",
        name: "John Doe",
        email: "jd89@unpixel.com",
        jobTitle: "HR OPERATIONS SPECIALIST",
        lineManager: "@eric",
        team: "Team HR",
        office: "Central HQ",
        status: "ACTIVE",
        statusBadge: "ACTIVE",
      },
      {
        id: "HC11",
        empNo: "SM67",
        name: "Sarah Miller",
        email: "sm67@unpixel.com",
        jobTitle: "FINANCIAL ANALYST",
        lineManager: "@eric",
        team: "Team Finance",
        office: "Unpixel Office",
        status: "ACTIVE",
        statusBadge: "ACTIVE",
      },
      {
        id: "HC12",
        empNo: "BT78",
        name: "Benjamin Turner",
        email: "bt78@unpixel.com",
        jobTitle: "SUPPLY CHAIN MANAGER",
        lineManager: "@linda",
        team: "Team Operations",
        office: "Central HQ",
        status: "ACTIVE",
        statusBadge: "ACTIVE",
      },
    ];

    setEmployees(mockEmployees);
    setTotalEmployees(mockEmployees.length);
  }, []);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleEmployeeSelection = (id) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id));
      if (selectAll) setSelectAll(false);
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
      if (selectedEmployees.length + 1 === filteredEmployees.length)
        setSelectAll(true);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Fixed toggle function - now specifically for opening/closing the filter panel
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleOfficeFilterChange = (e) => {
    setOfficeFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleTeamFilterChange = (e) => {
    setTeamFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    setIsFilterOpen(false);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setAppliedFilters([]);
  };

  const handleActionMenuClick = (employeeId, action) => {
    console.log(`Action ${action} for employee ${employeeId}`);
    // Implement actions based on the clicked option
  };

  const handleMoreActions = (action) => {
    console.log(`More action: ${action}`);

    // Specific action handling
    if (action === "toggleFilter") {
      toggleFilter();
    }
  };

  // Filter employees based on search and applied filters
  const filteredEmployees = employees.filter((emp) => {
    // Text search
    const matchesSearch = !searchTerm
      ? true
      : emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all"
        ? true
        : emp.status.toLowerCase() === statusFilter.toLowerCase();

    // Office filter
    const matchesOffice =
      officeFilter === "all"
        ? true
        : emp.office.toLowerCase() ===
          officeFilter
            .toLowerCase()
            .replace("unpixel", "unpixel office")
            .replace("central", "central hq");

    // Team filter
    const matchesTeam =
      teamFilter === "all"
        ? true
        : emp.team.toLowerCase() ===
          teamFilter
            .toLowerCase()
            .replace("product", "team product")
            .replace("support", "team support")
            .replace("finance", "team finance")
            .replace("hr", "team hr")
            .replace("operations", "team operations");

    return matchesSearch && matchesStatus && matchesOffice && matchesTeam;
  });
  // Additional filtering logic based on appliedFilters would go here

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`${paginationBg} ${paginationText} p-1 rounded-md w-8 h-8 flex items-center justify-center mx-1 ${
            currentPage === i ? activePage : ""
          }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  // Filter options
  const filterOptions = [
    {
      name: "Team",
      options: [
        "Team Product",
        "Team Support",
        "Team Finance",
        "Team HR",
        "Team Operations",
      ],
    },
    {
      name: "Office",
      options: ["Unpixel Office", "Central HQ"],
    },
    {
      name: "Line Manager",
      options: ["@eric", "@linda", "@maria", "@james", "@tamara"],
    },
    {
      name: "Status",
      options: ["ACTIVE", "ON BOARDING", "PROBATION", "ON LEAVE"],
    },
  ];

  return (
    <div className="container mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Employees</h1>
          <p className={`text-sm ${textMuted}`}>Manage your Employee</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/structure/add-employee">
            <button
              className={`${btnPrimary} text-white px-4 py-2 rounded-md flex items-center`}
            >
              <Plus size={16} className="mr-2" />
              Add new HC
            </button>
          </Link>
          <HeadcountActionButton onAction={handleMoreActions} />

          {/* Dedicated filter button */}
          <button
            onClick={toggleFilter}
            className={`${btnSecondary} ${textPrimary} px-4 py-2 rounded-md flex items-center`}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div
          className={`${bgCard} border ${borderColor} rounded-lg mb-6 ${shadowClass}`}
        >
          <FilterPanel
            filterOptions={filterOptions}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {/* Applied Filters */}
      {appliedFilters.length > 0 && (
        <div className={`${textPrimary} mb-4`}>
          <p>Applied filters: {appliedFilters.join(", ")}</p>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search employee"
            value={searchTerm}
            onChange={handleSearchChange}
            className={`w-full p-2 pl-10 pr-4 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`}
            size={18}
          />
        </div>
        <div className="flex space-x-2 flex-wrap">
          {/* Additional controls */}
          <div className="relative">
            <select
              className={`p-2 pr-8 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={officeFilter}
              onChange={handleOfficeFilterChange}
            >
              <option value="all">All Offices</option>
              <option value="unpixel">Unpixel Office</option>
              <option value="central">Central HQ</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown size={16} className={textMuted} />
            </div>
          </div>
          <div className="relative">
            <select
              className={`p-2 pr-8 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={teamFilter}
              onChange={handleTeamFilterChange}
            >
              <option value="all">All Teams</option>
              <option value="product">Team Product</option>
              <option value="support">Team Support</option>
              <option value="finance">Team Finance</option>
              <option value="hr">Team HR</option>
              <option value="operations">Team Operations</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown size={16} className={textMuted} />
            </div>
          </div>
          <div className="relative">
            <select
              className={`p-2 pr-8 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on boarding">On Boarding</option>
              <option value="probation">Probation</option>
              <option value="on leave">On Leave</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown size={16} className={textMuted} />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className={`${bgCard} rounded-lg overflow-hidden ${shadowClass}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${theadBg}`}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                    <span
                      className={`ml-2 text-xs font-medium ${textMuted} uppercase tracking-wider`}
                    >
                      Employee Name
                    </span>
                    <ChevronDown size={14} className={`ml-1 ${textMuted}`} />
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}
                >
                  <div className="flex items-center">
                    <span>Job Title</span>
                    <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}
                >
                  <div className="flex items-center">
                    <span>Line Manager</span>
                    <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}
                >
                  <div className="flex items-center">
                    <span>Team</span>
                    <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}
                >
                  <div className="flex items-center">
                    <span>Office</span>
                    <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}
                >
                  Employee Status
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-right text-xs font-medium ${textMuted} uppercase tracking-wider`}
                >
                  <div className="flex items-center justify-end">
                    <span>All Status</span>
                    <Check size={14} className="ml-1 text-green-500" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className={`divide-y ${borderColor}`}>
              {currentItems.map((employee) => (
                <tr
                  key={employee.id}
                  className={`${
                    selectedEmployees.includes(employee.id)
                      ? darkMode
                        ? "bg-gray-700"
                        : "bg-blue-50"
                      : ""
                  } ${hoverBg} transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => toggleEmployeeSelection(employee.id)}
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
                            {employee.email}
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
                        {employee.lineManager}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${textPrimary}`}>
                      {employee.team}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${textPrimary}`}>
                      {employee.office}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EmployeeStatusBadge status={employee.statusBadge} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`${textPrimary}`}>{employee.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <HeadcountActions
                      employeeId={employee.id}
                      onAction={handleActionMenuClick}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredEmployees.length === 0 && (
          <div className="py-10 text-center">
            <p className={`${textMuted} text-lg`}>
              No employees found matching your search criteria.
            </p>
          </div>
        )}

        {/* Pagination - Updated to maintain dark style regardless of theme */}
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6">
          <div className="flex items-center">
            <button
              className={`bg-gray-700 text-white p-1 rounded-md mr-2 ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            {renderPageNumbers()}
            {totalPages > 5 && currentPage + 2 < totalPages && (
              <>
                <span className={`${textMuted} mx-1`}>...</span>
                <button
                  onClick={() => paginate(totalPages)}
                  className={`${paginationBg} ${paginationText} p-1 rounded-md w-8 h-8 flex items-center justify-center mx-1`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              className={`bg-gray-700 text-white p-1 rounded-md ml-2 ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className={`${textMuted} text-sm`}>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredEmployees.length)} of{" "}
            {filteredEmployees.length} entries
          </div>
          <div className="flex items-center">
            <span className={`${textMuted} mr-2`}>Show</span>
            <select
              className={`p-1 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
            >
              <option value="8">8</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadcountTable;
