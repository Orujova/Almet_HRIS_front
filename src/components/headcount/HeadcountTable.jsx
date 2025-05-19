// src/components/headcount/HeadcountTable.jsx
"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  X,
  Check,
  ArrowUpDown,
  AlertCircle,
  Users
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import Link from "next/link";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import EmployeeTag from "./EmployeeTag";
import SortingIndicator from "./SortingIndicator";
import ActionsDropdown from "./ActionsDropdown";

const HeadcountTable = () => {
  const { darkMode } = useTheme();
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [businessFunctionFilter, setBusinessFunctionFilter] = useState("all");
  const [sorting, setSorting] = useState([{ field: "name", direction: "asc" }]);
  const [quickFilters, setQuickFilters] = useState([]);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef(null);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-100";
  const btnPrimary = darkMode
    ? "bg-almet-sapphire hover:bg-almet-astral"
    : "bg-almet-sapphire hover:bg-almet-astral";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600"
    : "bg-gray-200 hover:bg-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const shadowClass = darkMode ? "" : "shadow";
  const theadBg = darkMode ? "bg-gray-700" : "bg-gray-50";

  // Mock employee data
  useEffect(() => {
    const mockEmployees = [
      {
        id: "HC01",
        empNo: "EJ2023",
        name: "Eric Johnson",
        email: "eric.johnson@almetholding.com",
        businessFunction: "Marketing",
        department: "BUSINESS DEVELOPMENT",
        unit: "BUSINESS DEVELOPMENT",
        jobFunction: "Product Management",
        jobTitle: "DEPUTY CHAIRMAN OF PRODUCT REPOSITIONING",
        positionGroup: "Executive",
        grade: "P4",
        lineManager: "Linda Campbell",
        lineManagerHcNumber: "LC1020",
        startDate: "2023-01-15",
        endDate: null,
        status: "ACTIVE",
        tags: ["Team Lead"],
        office: "Baku HQ"
      },
      {
        id: "HC02",
        empNo: "AN1023",
        name: "Aria Sanderson",
        email: "aria.sanderson@almetholding.com",
        businessFunction: "Marketing",
        department: "BUSINESS DEVELOPMENT",
        unit: "PRODUCT MANAGEMENT",
        jobFunction: "Product Management",
        jobTitle: "DEPUTY CHAIRMAN OF CORPORATE ACTIVITIES",
        positionGroup: "Executive", 
        grade: "P4",
        lineManager: "Eric Johnson",
        lineManagerHcNumber: "EJ2023",
        startDate: "2023-03-10",
        endDate: null,
        status: "ACTIVE",
        tags: ["Project Lead"],
        office: "Baku HQ"
      },
      {
        id: "HC03",
        empNo: "JK23",
        name: "James Kowalski",
        email: "james.kowalski@almetholding.com",
        businessFunction: "HR",
        department: "ADMINISTRATIVE",
        unit: "BUSINESS SUPPORT",
        jobFunction: "Administrative",
        jobTitle: "ADMINISTRATIVE SPECIALIST",
        positionGroup: "Specialist",
        grade: "S3",
        lineManager: "Maria Delgado",
        lineManagerHcNumber: "MD2055",
        startDate: "2022-06-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Dubai Office"
      },
      {
        id: "HC04",
        empNo: "ML25",
        name: "Maria Lindgren",
        email: "maria.lindgren@almetholding.com",
        businessFunction: "HR",
        department: "HR",
        unit: "BUSINESS SUPPORT",
        jobFunction: "HR Operations",
        jobTitle: "ADMIN",
        positionGroup: "Admin",
        grade: "A2",
        lineManager: "James Kowalski",
        lineManagerHcNumber: "JK23",
        startDate: "2024-01-10",
        endDate: null,
        status: "ON BOARDING",
        tags: [],
        office: "Baku HQ"
      },
      {
        id: "HC05",
        empNo: "DK67",
        name: "Darius Krawczyk",
        email: "darius.krawczyk@almetholding.com",
        businessFunction: "HR",
        department: "ADMINISTRATIVE",
        unit: "BUSINESS SUPPORT",
        jobFunction: "Administrative",
        jobTitle: "ADMINISTRATIVE ASSISTANT",
        positionGroup: "Junior Specialist",
        grade: "JS1",
        lineManager: "James Kowalski",
        lineManagerHcNumber: "JK23",
        startDate: "2023-11-01",
        endDate: null,
        status: "PROBATION",
        tags: [],
        office: "Baku HQ"
      },
      {
        id: "HC06",
        empNo: "LJ34",
        name: "Laura Jovanovic",
        email: "laura.jovanovic@almetholding.com",
        businessFunction: "Legal",
        department: "COMPLIANCE",
        unit: "BUSINESS SUPPORT",
        jobFunction: "Legal",
        jobTitle: "LEGAL COUNSEL",
        positionGroup: "Senior Specialist",
        grade: "SS2",
        lineManager: "Eric Johnson",
        lineManagerHcNumber: "EJ2023",
        startDate: "2023-05-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Baku HQ"
      },
      {
        id: "HC07",
        empNo: "TS115",
        name: "Tamara Singh",
        email: "tamara.singh@almetholding.com",
        businessFunction: "Finance",
        department: "FINANCE",
        unit: "BUSINESS DEVELOPMENT",
        jobFunction: "Finance Business",
        jobTitle: "SENIOR BUDGETING & CONTROLLING SPECIALIST",
        positionGroup: "Senior Specialist",
        grade: "SS4",
        lineManager: "Eric Johnson",
        lineManagerHcNumber: "EJ2023",
        startDate: "2022-09-01",
        endDate: null,
        status: "ON LEAVE",
        tags: ["Maternity"],
        office: "Dubai Office"
      },
      {
        id: "HC08",
        empNo: "RT201",
        name: "Ryan Thompson",
        email: "ryan.thompson@almetholding.com",
        businessFunction: "IT",
        department: "BUSINESS DEVELOPMENT",
        unit: "PRODUCT DEVELOPMENT",
        jobFunction: "Product Management",
        jobTitle: "SENIOR BUSINESS SYSTEMS ANALYST",
        positionGroup: "Senior Specialist",
        grade: "SS3",
        lineManager: "Tamara Singh",
        lineManagerHcNumber: "TS115",
        startDate: "2023-02-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Baku HQ"
      },
      {
        id: "HC09",
        empNo: "MC123",
        name: "Maria Calzoni",
        email: "maria.calzoni@almetholding.com",
        businessFunction: "Finance",
        department: "FINANCE",
        unit: "BUSINESS DEVELOPMENT",
        jobFunction: "Finance Business",
        jobTitle: "HEAD OF BUDGETING & CONTROLLING",
        positionGroup: "Executive",
        grade: "P3",
        lineManager: "Eric Johnson",
        lineManagerHcNumber: "EJ2023",
        startDate: "2022-03-10",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Baku HQ"
      },
      {
        id: "HC10",
        empNo: "JD89",
        name: "John Doe",
        email: "john.doe@almetholding.com",
        businessFunction: "HR",
        department: "HR",
        unit: "BUSINESS SUPPORT",
        jobFunction: "HR Operations",
        jobTitle: "HR OPERATIONS SPECIALIST",
        positionGroup: "Specialist",
        grade: "S3",
        lineManager: "Eric Johnson",
        lineManagerHcNumber: "EJ2023",
        startDate: "2023-01-05",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Dubai Office"
      },
      {
        id: "HC11",
        empNo: "SM67",
        name: "Sarah Miller",
        email: "sarah.miller@almetholding.com",
        businessFunction: "Finance",
        department: "FINANCE",
        unit: "BUSINESS DEVELOPMENT",
        jobFunction: "Finance Business",
        jobTitle: "FINANCIAL ANALYST",
        positionGroup: "Specialist",
        grade: "S4",
        lineManager: "Maria Calzoni",
        lineManagerHcNumber: "MC123",
        startDate: "2023-04-20",
        endDate: null,
        status: "ACTIVE",
        tags: ["Sick Leave"],
        office: "Baku HQ"
      },
      {
        id: "HC12",
        empNo: "BT78",
        name: "Benjamin Turner",
        email: "benjamin.turner@almetholding.com",
        businessFunction: "Operations",
        department: "BUSINESS DEVELOPMENT",
        unit: "CORE OPERATIONS",
        jobFunction: "Operations Management",
        jobTitle: "SUPPLY CHAIN MANAGER",
        positionGroup: "Manager",
        grade: "M2",
        lineManager: "Linda Campbell",
        lineManagerHcNumber: "LC1020",
        startDate: "2022-11-15",
        endDate: null,
        status: "ACTIVE",
        tags: ["Suspension"],
        office: "Dubai Office"
      },
    ];

    setEmployees(mockEmployees);
    setTotalEmployees(mockEmployees.length);
  }, []);

  // Toggle select all functionality
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredAndSortedEmployees.map((emp) => emp.id));
    }
    setSelectAll(!selectAll);
  };

  // Toggle individual employee selection
  const toggleEmployeeSelection = (id) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id));
      if (selectAll) setSelectAll(false);
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
      if (selectedEmployees.length + 1 === filteredAndSortedEmployees.length)
        setSelectAll(true);
    }
  };

  // Search handling
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Toggle advanced filter panel
  const toggleAdvancedFilter = () => {
    setIsAdvancedFilterOpen(!isAdvancedFilterOpen);
  };

  // Apply advanced filters
  const handleApplyAdvancedFilters = (filters) => {
    console.log("Applied filters:", filters);
    
    // Transform filters into applied filters list for display
    const newAppliedFilters = Object.entries(filters)
      .filter(([_, values]) => {
        if (Array.isArray(values)) return values.length > 0;
        return values !== "" && values !== null && values !== undefined;
      })
      .map(([key, values]) => {
        const fieldName = key.replace(/([A-Z])/g, ' $1').trim();
        const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        
        if (Array.isArray(values)) {
          return `${displayName}: ${values.join(", ")}`;
        }
        return `${displayName}: ${values}`;
      });
    
    setAppliedFilters(newAppliedFilters);
    setIsAdvancedFilterOpen(false);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setAppliedFilters([]);
    setStatusFilter("all");
    setDepartmentFilter("all");
    setBusinessFunctionFilter("all");
    setQuickFilters([]);
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle department filter change
  const handleDepartmentFilterChange = (e) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle business function filter change
  const handleBusinessFunctionFilterChange = (e) => {
    setBusinessFunctionFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle quick filter toggle
  const handleQuickFilterToggle = (filter) => {
    if (quickFilters.includes(filter)) {
      setQuickFilters(quickFilters.filter(f => f !== filter));
    } else {
      setQuickFilters([...quickFilters, filter]);
    }
    setCurrentPage(1);
  };

  // Handle column sorting
  const handleSort = (field) => {
    const currentSortIndex = sorting.findIndex(s => s.field === field);
    
    if (currentSortIndex >= 0) {
      // This field is already being sorted, toggle direction or remove
      const currentSort = sorting[currentSortIndex];
      
      if (currentSort.direction === 'asc') {
        // Change to descending
        const newSorting = [...sorting];
        newSorting[currentSortIndex] = { field, direction: 'desc' };
        setSorting(newSorting);
      } else {
        // Remove this sort field
        const newSorting = sorting.filter((_, index) => index !== currentSortIndex);
        setSorting(newSorting.length ? newSorting : [{ field: 'name', direction: 'asc' }]);
      }
    } else {
      // Add this field as a new sort (multi-sort)
      if (sorting.length >= 3) {
        // Limit to 3 simultaneous sorts
        setSorting([...sorting.slice(1), { field, direction: 'asc' }]);
      } else {
        setSorting([...sorting, { field, direction: 'asc' }]);
      }
    }
  };

  // Get sort direction for a field
  const getSortDirection = (field) => {
    const sort = sorting.find(s => s.field === field);
    return sort ? sort.direction : null;
  };

  // Handle action menu for multiple selected employees
  const toggleActionMenu = () => {
    setIsActionMenuOpen(!isActionMenuOpen);
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setIsActionMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle bulk actions on selected employees
  const handleBulkAction = (action) => {
    console.log(`Bulk action ${action} for employees:`, selectedEmployees);
    setIsActionMenuOpen(false);
    
    if (action === 'export') {
      alert(`Exporting data for ${selectedEmployees.length} employee(s)`);
    } else if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedEmployees.length} employee(s)? This action cannot be undone.`)) {
        // Handle bulk delete
        alert(`${selectedEmployees.length} employee(s) deleted`);
        setSelectedEmployees([]);
      }
    } else if (action === 'changeManager') {
      // Show change manager UI
      alert('Change manager UI would open here');
    }
  };

  // Handle actions on individual employees
  const handleEmployeeAction = (employeeId, action) => {
    const employee = employees.find(emp => emp.id === employeeId);
    
    console.log(`Action ${action} for employee ${employeeId}`);
    
    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
        // Handle delete
        alert(`Employee ${employee.name} deleted`);
      }
    } else if (action === 'addTag') {
      const tag = prompt('Enter tag for employee (e.g., "Sick Leave", "Maternity", "Suspension")');
      if (tag) {
        // Handle adding tag
        alert(`Tag "${tag}" added to employee ${employee.name}`);
      }
    } else if (action === 'changeManager') {
      // Show change manager UI
      alert('Change manager UI would open here');
    } else if (action === 'viewJobDescription') {
      alert(`Viewing job description for ${employee.name}`);
    } else if (action === 'performanceMatrix') {
      alert(`Viewing performance matrix for ${employee.name}`);
    } else if (action === 'message') {
      alert(`Messaging ${employee.name}`);
    }
  };

  // Filter, sort, and paginate employees
  const filteredAndSortedEmployees = useMemo(() => {
    // Apply all filters
    return employees
      .filter(emp => {
        // Text search
        const matchesSearch = !searchTerm
          ? true
          : (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
             emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));

        // Status filter
        const matchesStatus = statusFilter === 'all'
          ? true
          : emp.status.toLowerCase() === statusFilter.toLowerCase();

        // Department filter
        const matchesDepartment = departmentFilter === 'all'
          ? true
          : emp.department.toLowerCase() === departmentFilter.toLowerCase();

        // Business function filter
        const matchesBusinessFunction = businessFunctionFilter === 'all'
          ? true
          : emp.businessFunction.toLowerCase() === businessFunctionFilter.toLowerCase();

        // Quick filters
        const matchesQuickFilters = quickFilters.length === 0
          ? true
          : quickFilters.some(filter => {
              if (filter === 'baku') return emp.office.toLowerCase().includes('baku');
              if (filter === 'dubai') return emp.office.toLowerCase().includes('dubai');
              if (filter === 'tags') return emp.tags && emp.tags.length > 0;
              return true;
            });

        return matchesSearch && matchesStatus && matchesDepartment && 
               matchesBusinessFunction && matchesQuickFilters;
      })
      .sort((a, b) => {
        // Apply multi-level sorting
        for (const sort of sorting) {
          const field = sort.field;
          const direction = sort.direction === 'asc' ? 1 : -1;
          
          // Handle different field types
          if (typeof a[field] === 'string' && typeof b[field] === 'string') {
            const comparison = a[field].localeCompare(b[field]);
            if (comparison !== 0) return comparison * direction;
          } else if (field === 'startDate' || field === 'endDate') {
            // Date comparison
            const dateA = a[field] ? new Date(a[field]) : new Date(0);
            const dateB = b[field] ? new Date(b[field]) : new Date(0);
            const comparison = dateA - dateB;
            if (comparison !== 0) return comparison * direction;
          } else {
            // Regular comparison
            if (a[field] < b[field]) return -1 * direction;
            if (a[field] > b[field]) return 1 * direction;
          }
        }
        return 0;
      });
  }, [
    employees, 
    searchTerm, 
    statusFilter, 
    departmentFilter, 
    businessFunctionFilter, 
    sorting,
    quickFilters,
    appliedFilters
  ]);

 // Get department color for row background
  const getDepartmentColor = (department, businessFunction) => {
    if (department.includes("BUSINESS DEVELOPMENT")) {
      return darkMode ? "bg-blue-900/10" : "bg-blue-50";
    } else if (department.includes("FINANCE")) {
      return darkMode ? "bg-green-900/10" : "bg-green-50";
    } else if (department.includes("COMPLIANCE")) {
      return darkMode ? "bg-red-900/10" : "bg-red-50";
    } else if (department.includes("HR")) {
      return darkMode ? "bg-purple-900/10" : "bg-purple-50";
    } else if (department.includes("ADMINISTRATIVE")) {
      return darkMode ? "bg-yellow-900/10" : "bg-yellow-50";
    } else {
      return "";
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedEmployees.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Render page numbers for pagination
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
          className={`p-1 rounded-md w-8 h-8 flex items-center justify-center mx-1 ${
            currentPage === i 
              ? "bg-almet-sapphire text-white" 
              : "bg-gray-700 text-white dark:bg-gray-600"
          }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  // Department options for filter
  const departmentOptions = [...new Set(employees.map(emp => emp.department))];
  
  // Business function options for filter
  const businessFunctionOptions = [...new Set(employees.map(emp => emp.businessFunction))];

  return (
    <div className="container mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Employees</h1>
          <p className={`text-sm ${textMuted}`}>Manage your organization's employee database</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/structure/add-employee">
            <button className={`${btnPrimary} text-white px-4 py-2 rounded-md flex items-center`}>
              <Plus size={16} className="mr-2" />
              Add New Employee
            </button>
          </Link>
          
          <button
            onClick={toggleAdvancedFilter}
            className={`${btnSecondary} ${textPrimary} px-4 py-2 rounded-md flex items-center`}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
          
          <div className="relative" ref={actionMenuRef}>
            <button
              onClick={toggleActionMenu}
              disabled={selectedEmployees.length === 0}
              className={`${btnSecondary} ${textPrimary} px-4 py-2 rounded-md flex items-center ${
                selectedEmployees.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Download size={16} className="mr-2" />
              Actions {selectedEmployees.length > 0 ? `(${selectedEmployees.length})` : ''}
              <ChevronDown size={16} className="ml-2" />
            </button>
            
            {isActionMenuOpen && (
              <div className={`absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"} ring-1 ring-black ring-opacity-5`}>
                <div className="py-1" role="menu">
                  <button
                    className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
                    onClick={() => handleBulkAction('export')}
                  >
                    <div className="flex items-center">
                      <Download size={16} className="mr-2 text-blue-500" />
                      <span>Export Selected Data</span>
                    </div>
                  </button>
                  <button
                    className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
                    onClick={() => handleBulkAction('changeManager')}
                  >
                    <div className="flex items-center">
                      <Users size={16} className="mr-2 text-green-500" />
                      <span>Change Line Manager</span>
                    </div>
                  </button>
                  <button
                    className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left border-t border-gray-200 dark:border-gray-700 mt-1 pt-1`}
                    onClick={() => handleBulkAction('delete')}
                  >
                    <div className="flex items-center">
                      <Trash2 size={16} className="mr-2 text-red-500" />
                      <span className="text-red-500 dark:text-red-400">Delete Selected</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {isAdvancedFilterOpen && (
        <div className={`${bgCard} p-6 rounded-lg border ${borderColor} mb-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-medium ${textPrimary}`}>Advanced Filters</h3>
            <button 
              onClick={() => setIsAdvancedFilterOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Here you would include your advanced filter controls */}
          <p className={textSecondary}>Add your advanced filter controls here</p>
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={handleClearAllFilters}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Reset
            </button>
            <button
              onClick={() => handleApplyAdvancedFilters({})}
              className={`${btnPrimary} text-white px-4 py-2 rounded-md`}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Applied Filters */}
      {(appliedFilters.length > 0 || quickFilters.length > 0 || statusFilter !== 'all' || departmentFilter !== 'all' || businessFunctionFilter !== 'all') && (
        <div className={`${bgCard} rounded-lg p-3 mb-4 ${shadowClass} flex items-center justify-between`}>
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`${textMuted} text-sm`}>Applied filters:</span>
            
            {/* Status filter */}
            {statusFilter !== 'all' && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md text-xs flex items-center">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="ml-1">
                  <X size={14} />
                </button>
              </span>
            )}
            
            {/* Department filter */}
            {departmentFilter !== 'all' && (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded-md text-xs flex items-center">
                Department: {departmentFilter}
                <button onClick={() => setDepartmentFilter('all')} className="ml-1">
                  <X size={14} />
                </button>
              </span>
            )}
            
            {/* Business function filter */}
            {businessFunctionFilter !== 'all' && (
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-md text-xs flex items-center">
                Business Function: {businessFunctionFilter}
                <button onClick={() => setBusinessFunctionFilter('all')} className="ml-1">
                  <X size={14} />
                </button>
              </span>
            )}
            
            {/* Quick filters */}
            {quickFilters.map(filter => (
              <span key={filter} className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-md text-xs flex items-center">
                {filter === 'baku' ? 'Baku Office' : 
                 filter === 'dubai' ? 'Dubai Office' : 
                 filter === 'tags' ? 'Has Tags' : filter}
                <button onClick={() => handleQuickFilterToggle(filter)} className="ml-1">
                  <X size={14} />
                </button>
              </span>
            ))}
            
            {/* Advanced filters */}
            {appliedFilters.map((filter, index) => (
              <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-md text-xs">
                {filter}
              </span>
            ))}
          </div>
          
          <button
            onClick={handleClearAllFilters}
            className="text-red-500 dark:text-red-400 text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Search and Quick Filters */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search employees by name, email, HC number..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={`w-full p-2 pl-10 pr-4 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
          />
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`}
            size={18}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* Quick filter pills */}
          <button
            onClick={() => handleQuickFilterToggle('baku')}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
              quickFilters.includes('baku')
                ? 'bg-almet-sapphire text-white'
                : `${btnSecondary} ${textPrimary}`
            }`}
          >
            Baku Office
            {quickFilters.includes('baku') && <X size={14} className="ml-1" />}
          </button>
          
          <button
            onClick={() => handleQuickFilterToggle('dubai')}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
              quickFilters.includes('dubai')
                ? 'bg-almet-sapphire text-white'
                : `${btnSecondary} ${textPrimary}`
            }`}
          >
            Dubai Office
            {quickFilters.includes('dubai') && <X size={14} className="ml-1" />}
          </button>
          
          <button
            onClick={() => handleQuickFilterToggle('tags')}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
              quickFilters.includes('tags')
                ? 'bg-almet-sapphire text-white'
                : `${btnSecondary} ${textPrimary}`
            }`}
          >
            Has Tags
            {quickFilters.includes('tags') && <X size={14} className="ml-1" />}
          </button>
          
          {/* Dropdown filters */}
          <div className="relative">
            <select
              className={`p-2 pr-8 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
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
          
          <div className="relative">
            <select
              className={`p-2 pr-8 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
              value={departmentFilter}
              onChange={handleDepartmentFilterChange}
            >
              <option value="all">All Departments</option>
              {departmentOptions.map((dept, idx) => (
                <option key={idx} value={dept.toLowerCase()}>{dept}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown size={16} className={textMuted} />
            </div>
          </div>
          
          <div className="relative">
            <select
              className={`p-2 pr-8 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
              value={businessFunctionFilter}
              onChange={handleBusinessFunctionFilterChange}
            >
              <option value="all">All Functions</option>
              {businessFunctionOptions.map((func, idx) => (
                <option key={idx} value={func.toLowerCase()}>{func}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown size={16} className={textMuted} />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className={`${bgCard} rounded-lg overflow-hidden ${shadowClass}`}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${theadBg}`}>
              <tr>
                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                    <button 
                      className={`ml-2 text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort('name')}
                    >
                      Employee Info
                      <SortingIndicator direction={getSortDirection('name')} />
                    </button>
                  </div>
                </th>
                
                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button 
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort('grade')}
                    >
                      Grade/Email
                      <SortingIndicator direction={getSortDirection('grade')} />
                    </button>
                  </div>
                </th>
                
                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button 
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort('businessFunction')}
                    >
                      Business Info
                      <SortingIndicator direction={getSortDirection('businessFunction')} />
                    </button>
                  </div>
                </th>
                
                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button 
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort('unit')}
                    >
                      Unit/Job
                      <SortingIndicator direction={getSortDirection('unit')} />
                    </button>
                  </div>
                </th>
                
                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button 
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort('jobTitle')}
                    >
                      Job/Position
                      <SortingIndicator direction={getSortDirection('jobTitle')} />
                    </button>
                  </div>
                </th>
                
                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button 
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort('lineManager')}
                    >
                      Line Manager
                      <SortingIndicator direction={getSortDirection('lineManager')} />
                    </button>
                  </div>
                </th>
                
                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button 
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort('startDate')}
                    >
                      Dates
                      <SortingIndicator direction={getSortDirection('startDate')} />
                    </button>
                  </div>
                </th>
                
                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button 
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort('status')}
                    >
                      Status/Tags
                      <SortingIndicator direction={getSortDirection('status')} />
                    </button>
                  </div>
                </th>
                
                <th scope="col" className="px-3 py-3 text-right">
                  <span className={`text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${borderColor}`}>
              {currentItems.length > 0 ? (
                currentItems.map((employee) => (
                  <tr
                    key={employee.id}
                    className={`${
                      selectedEmployees.includes(employee.id)
                        ? darkMode
                          ? "bg-almet-sapphire/20"
                          : "bg-almet-sapphire/10"
                        : getDepartmentColor(employee.department, employee.businessFunction)
                    } ${hoverBg} transition-colors duration-150`}
                  >
                    {/* Employee Info */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => toggleEmployeeSelection(employee.id)}
                        />
                        <div className="ml-3">
                          <Link href={`/structure/employee/${employee.id}`}>
                            <div className={`text-sm font-medium ${textPrimary} hover:underline flex items-center`}>
                              {employee.name}
                            </div>
                          </Link>
                          <div className="flex flex-col">
                            <div className={`text-xs ${textMuted}`}>
                              HC: {employee.empNo}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Grade/Email */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className={`text-sm ${textSecondary}`}>
                          {employee.grade}
                        </div>
                        <div className={`text-xs ${textMuted}`}>
                          {employee.email}
                        </div>
                      </div>
                    </td>
                    
                    {/* Business Info */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className={`text-sm ${textSecondary}`}>
                          {employee.businessFunction}
                        </div>
                        <div className={`text-xs ${textMuted}`}>
                          {employee.department}
                        </div>
                      </div>
                    </td>
                    
                    {/* Unit / Job Function */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className={`text-sm ${textSecondary}`}>
                          {employee.unit}
                        </div>
                        <div className={`text-xs ${textMuted}`}>
                          {employee.jobFunction}
                        </div>
                      </div>
                    </td>
                    
                    {/* Job Title / Position */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className={`text-sm ${textSecondary}`}>
                          {employee.jobTitle.split(" ").slice(0, 3).join(" ")}
                          {employee.jobTitle.split(" ").length > 3 && "..."}
                        </div>
                        <div className={`text-xs ${textMuted}`}>
                          {employee.positionGroup}
                        </div>
                      </div>
                    </td>
                    
                    {/* Line Manager */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className={`text-sm ${textSecondary}`}>
                          {employee.lineManager}
                        </div>
                        <div className={`text-xs ${textMuted}`}>
                          HC: {employee.lineManagerHcNumber}
                        </div>
                      </div>
                    </td>
                    
                    {/* Dates */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className={`text-sm ${textSecondary}`}>
                          Start: {new Date(employee.startDate).toLocaleDateString()}
                        </div>
                        {employee.endDate && (
                          <div className={`text-xs ${textMuted}`}>
                            End: {new Date(employee.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Status & Tags */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <EmployeeStatusBadge status={employee.status} />
                        <div className="flex flex-wrap gap-1 mt-1">
                          {employee.tags && employee.tags.map((tag, idx) => (
                            <EmployeeTag key={idx} tag={tag} />
                          ))}
                        </div>
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-3 py-3 whitespace-nowrap text-right">
                      <ActionsDropdown 
                        employeeId={employee.id}
                        onAction={handleEmployeeAction}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center">
                      <AlertCircle size={48} className="text-gray-400 mb-3" />
                      <p className={`${textPrimary} text-lg font-medium`}>No employees found</p>
                      <p className={`${textMuted} mt-1`}>
                        {searchTerm || appliedFilters.length > 0 || statusFilter !== 'all' || departmentFilter !== 'all' || businessFunctionFilter !== 'all' ? 
                          "Try adjusting your search or filters to find what you're looking for." : 
                          "Add your first employee to get started."}
                      </p>
                      {(searchTerm || appliedFilters.length > 0 || statusFilter !== 'all' || departmentFilter !== 'all' || businessFunctionFilter !== 'all') && (
                        <button
                          onClick={handleClearAllFilters}
                          className="mt-3 text-almet-sapphire hover:text-almet-astral dark:text-almet-steel-blue"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAndSortedEmployees.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
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
                    className="bg-gray-700 text-white p-1 rounded-md w-8 h-8 flex items-center justify-center mx-1"
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
              {Math.min(indexOfLastItem, filteredAndSortedEmployees.length)} of{" "}
              {filteredAndSortedEmployees.length} employees
            </div>
            
            <div className="flex items-center">
              <span className={`${textMuted} mr-2`}>Show</span>
              <select
                className={`p-1 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeadcountTable;