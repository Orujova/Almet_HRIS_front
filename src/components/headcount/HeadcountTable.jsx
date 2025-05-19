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
  AlertCircle,
  Users,
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import Link from "next/link";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import EmployeeTag from "./EmployeeTag";
import SortingIndicator from "./SortingIndicator";
import ActionsDropdown from "./ActionsDropdown";
import QuickFilterBar from "./QuickFilterBar";
import AdvancedFilterPanel from "./AdvancedFilterPanel";

const HeadcountTable = () => {
  const { darkMode } = useTheme();
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sorting, setSorting] = useState([{ field: "name", direction: "asc" }]);
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

  // Mock employee data aligned with the screenshot
  useEffect(() => {
    const mockEmployees = [
      {
        id: "HC01",
        empNo: "HLD01",
        name: "Bala Oruczade Mammad Oglu",
        email: "bala.oruczade@almetholding.com",
        businessFunction: "Holding",
        department: "BUSINESS DEVELOPMENT",
        unit: "STRATEGY EXECUTION",
        jobFunction: "DEPUTY CHAIRMAN ON FINANCE & BUSINESS DEVELOPMENT",
        jobTitle: "Direktor müavini",
        positionGroup: "VC",
        grade: "8",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-01-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Baku HQ",
      },
      {
        id: "HC02",
        empNo: "HLD02",
        name: "Şirin Camalli Rasad Oglu",
        email: "şirin.camalli@almetholding.com",
        businessFunction: "Holding",
        department: "BUSINESS DEVELOPMENT",
        unit: "STRATEGY EXECUTION",
        jobFunction: "DEPUTY CHAIRMAN ON FINANCE & BUSINESS DEVELOPMENT",
        jobTitle: "Direktor",
        positionGroup: "DIRECTOR",
        grade: "7",
        lineManager: null,
        lineManagerHcNumber: null,
        startDate: "2022-03-10",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Baku HQ",
      },
      {
        id: "HC03",
        empNo: "HLD03",
        name: "Safa Nacafova Mammadli Qizi",
        email: "safa.nacafova@almetholding.com",
        businessFunction: "Holding",
        department: "ADMINISTRATIVE",
        unit: "ADMINISTRATION",
        jobFunction: "ADMINISTRATION SPECIALIST",
        jobTitle: "Ofis-menecer",
        positionGroup: "JUNIOR SPECIALIST",
        grade: "2",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-06-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Baku HQ",
      },
      {
        id: "HC04",
        empNo: "HLD04",
        name: "Yelena Amrakhova Talibova",
        email: "yelena.amrakhova@almetholding.com",
        businessFunction: "Holding",
        department: "ADMINISTRATIVE",
        unit: "FACILITIES",
        jobFunction: "DRIVER",
        jobTitle: "Sürücü",
        positionGroup: "BLUE COLLAR",
        grade: "1",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-11-01",
        endDate: null,
        status: "PROBATION",
        tags: [],
        office: "Baku HQ",
      },
      {
        id: "HC05",
        empNo: "HLD06",
        name: "Sebuhi Isayev Samir Oglu",
        email: "sebuhi.isayev@almetholding.com",
        businessFunction: "Holding",
        department: "COMPLIANCE",
        unit: "BUSINESS SUPPORT",
        jobFunction: "LEGAL",
        jobTitle: "Hüquqşünas - komplayns üzre menecer",
        positionGroup: "HEAD OF DEPARTMENT",
        grade: "6",
        lineManager: "Safa Nacafova Mammadli Qizi",
        lineManagerHcNumber: "HLD03",
        startDate: "2022-09-01",
        endDate: null,
        status: "ON LEAVE",
        tags: ["Sick Leave"],
        office: "Baku HQ",
      },
      {
        id: "HC06",
        empNo: "HLD10",
        name: "Emin Eminzade Mubarak Oglu",
        email: "emin.eminzade@almetholding.com",
        businessFunction: "Holding",
        department: "FINANCE",
        unit: "FINANCE OPERATIONS",
        jobFunction: "SENIOR BUDGETING & CONTROLLING SPECIALIST",
        jobTitle: "Mühasib",
        positionGroup: "SENIOR SPECIALIST",
        grade: "4",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-02-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Baku HQ",
      },
      {
        id: "HC07",
        empNo: "HLD11",
        name: "Umud Mukhtarov Yusif Oglu",
        email: "umud.mukhtarov@almetholding.com",
        businessFunction: "Holding",
        department: "FINANCE",
        unit: "FINANCE OPERATIONS",
        jobFunction: "SENIOR BUDGETING & CONTROLLING SPECIALIST",
        jobTitle: "Baş mühasib",
        positionGroup: "SENIOR SPECIALIST",
        grade: "4",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2022-03-10",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Baku HQ",
      },
      {
        id: "HC08",
        empNo: "HLD12",
        name: "Gunel Musayeva Azer Qizi",
        email: "gunel.musayeva@almetholding.com",
        businessFunction: "Holding",
        department: "FINANCE",
        unit: "FINANCE BUSINESS",
        jobFunction: "HEAD OF BUDGETING & CONTROLLING",
        jobTitle: "Maliyyə üzrə menecer",
        positionGroup: "HEAD OF DEPARTMENT",
        grade: "7",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-01-05",
        endDate: null,
        status: "ON LEAVE",
        tags: ["Maternity"],
        office: "Baku HQ",
      },
      {
        id: "HC09",
        empNo: "HLD14",
        name: "Sevinc Agayeva Qizi",
        email: "sevinc.agayeva@almetholding.com",
        businessFunction: "Holding",
        department: "HR",
        unit: "BUSINESS SUPPORT",
        jobFunction: "HR BUSINESS PARTNER",
        jobTitle: "İnsan resursları üzrə təcrübəçi",
        positionGroup: "SPECIALIST",
        grade: "3",
        lineManager: "Safa Nacafova Mammadli Qizi",
        lineManagerHcNumber: "HLD03",
        startDate: "2023-04-20",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Baku HQ",
      },
      {
        id: "HC10",
        empNo: "HLD15",
        name: "Nigar Quliyeva Bahadi Qizi",
        email: "nigar.quliyeva@almetholding.com",
        businessFunction: "Holding",
        department: "HR",
        unit: "BUSINESS SUPPORT",
        jobFunction: "HR BUSINESS PARTNER",
        jobTitle: "İnsan resursları üzrə təcrübəçi",
        positionGroup: "SPECIALIST",
        grade: "3",
        lineManager: "Safa Nacafova Mammadli Qizi",
        lineManagerHcNumber: "HLD03",
        startDate: "2022-11-15",
        endDate: null,
        status: "PROBATION",
        tags: [],
        office: "Baku HQ",
      },
     
      {
        id: "HC11",
        empNo: "HLD16",
        name: "Vüqar Calalov Rasad Oglu",
        email: "vuqar.calalov@almetholding.com",
        businessFunction: "Holding",
        department: "OPERATIONS",
        unit: "COMMERCE",
        jobFunction: "OPERATIONS SPECIALIST",
        jobTitle: "Anbar üzrə təcrübəçi",
        positionGroup: "JUNIOR SPECIALIST",
        grade: "2",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-03-10",
        endDate: null,
        status: "ACTIVE",
        tags: ["Suspension"],
        office: "Baku HQ",
      },
      {
        id: "HC12",
        empNo: "HLD21",
        name: "Şirin Camalli Rasad Oglu",
        email: "şirin.camalli@almetholding.com",
        businessFunction: "Holding",
        department: "PROJECTS MANAGEMENT",
        unit: "PROJECTS MANAGEMENT",
        jobFunction: "BUSINESS DEVELOPMENT DIRECTOR",
        jobTitle: "Biznesin inkişafı üzrə Direktor",
        positionGroup: "DIRECTOR",
        grade: "7",
        lineManager: null,
        lineManagerHcNumber: null,
        startDate: "2022-03-10",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Baku HQ",
      },
      {
        id: "HC13",
        empNo: "HLD24",
        name: "Vüqar Isgandarov Vahid Oglu",
        email: "vuqar.isgandarov@almetholding.com",
        businessFunction: "Holding",
        department: "TRADE",
        unit: "COMMERCE",
        jobFunction: "REGIONAL COMMERCIAL DIRECTOR",
        jobTitle: "Kommersiya Direktoru",
        positionGroup: "DIRECTOR",
        grade: "7",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-01-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Baku HQ",
      },
      {
        id: "HC14",
        empNo: "HLD28",
        name: "Gunay Mammadova Tapdiq Qizi",
        email: "gunay.mammadova@almetholding.com",
        businessFunction: "Trading",
        department: "ADMINISTRATIVE",
        unit: "ADMINISTRATION",
        jobFunction: "FACILITIES ASSISTANT",
        jobTitle: "Ofis-menecer",
        positionGroup: "JUNIOR SPECIALIST",
        grade: "2",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-06-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Dubai Office",
      },
      {
        id: "HC15",
        empNo: "TRD04",
        name: "Xadica Aliquliyeva Imran Qizi",
        email: "xadica.aliquliyeva@almetholding.com",
        businessFunction: "Trading",
        department: "COMPLIANCE",
        unit: "BUSINESS SUPPORT",
        jobFunction: "HSE SPECIALIST",
        jobTitle: "SOT üzrə mütəxəssis",
        positionGroup: "SPECIALIST",
        grade: "3",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-11-01",
        endDate: null,
        status: "ON LEAVE",
        tags: ["Sick Leave"],
        office: "Dubai Office",
      },
      {
        id: "HC16",
        empNo: "TRD05",
        name: "Irada Mammadova Izatulla Qizi",
        email: "irada.mammadova@almetholding.com",
        businessFunction: "Trading",
        department: "FINANCE",
        unit: "FINANCE OPERATIONS",
        jobFunction: "SENIOR ACCOUNTANT",
        jobTitle: "Baş mühasib",
        positionGroup: "SENIOR SPECIALIST",
        grade: "4",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2022-09-01",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Dubai Office",
      },
      {
        id: "HC17",
        empNo: "TRD06",
        name: "Fəridə Qiyasova Zülfiyyə Qizi",
        email: "farida.qiyasova@almetholding.com",
        businessFunction: "Trading",
        department: "FINANCE",
        unit: "FINANCE OPERATIONS",
        jobFunction: "ACCOUNTANT",
        jobTitle: "Mühasib",
        positionGroup: "SPECIALIST",
        grade: "3",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-02-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Dubai Office",
      },
      {
        id: "HC18",
        empNo: "TRD07",
        name: "Nəzrin Calalova Calal Qizi",
        email: "nazrin.calalova@almetholding.com",
        businessFunction: "Trading",
        department: "OPERATIONS",
        unit: "COMMERCE",
        jobFunction: "OPERATIONS SPECIALIST",
        jobTitle: "Anbar üzrə təcrübəçi",
        positionGroup: "JUNIOR SPECIALIST",
        grade: "2",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2022-03-10",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Dubai Office",
      },
      {
        id: "HC19",
        empNo: "TRD10",
        name: "Kamran Calalov Bahadir Oglu",
        email: "kamran.calalov@almetholding.com",
        businessFunction: "Trading",
        department: "OPERATIONS",
        unit: "LOGISTICS",
        jobFunction: "SENIOR CUSTOMS SPECIALIST",
        jobTitle: "Gömrük üzrə mütəxəssis",
        positionGroup: "SENIOR SPECIALIST",
        grade: "4",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-01-05",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Dubai Office",
      },
      {
        id: "HC20",
        empNo: "TRD12",
        name: "Huseyn Calalov Kərim Oglu",
        email: "huseyn.calalov@almetholding.com",
        businessFunction: "Trading",
        department: "OPERATIONS",
        unit: "COMMERCE",
        jobFunction: "OPERATIONS MANAGER",
        jobTitle: "Fəhlə",
        positionGroup: "BLUE COLLAR",
        grade: "1",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-04-20",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Dubai Office",
      },
      {
        id: "HC21",
        empNo: "TRD13",
        name: "Cavid Qiyasov Çavdar Oglu",
        email: "cavid.qiyasov@almetholding.com",
        businessFunction: "Trading",
        department: "OPERATIONS",
        unit: "WAREHOUSE INVENTORY",
        jobFunction: "WAREHOUSEMAN",
        jobTitle: "Fəhlə",
        positionGroup: "BLUE COLLAR",
        grade: "1",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2022-11-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Dubai Office",
      },
      {
        id: "HC22",
        empNo: "TRD16",
        name: "Fərhad Bəyov Rüstəm Oglu",
        email: "farhad.bayov@almetholding.com",
        businessFunction: "Trading",
        department: "STOCK SALES",
        unit: "COMMERCE",
        jobFunction: "SALES EXECUTIVE",
        jobTitle: "Satış üzrə mütəxəssis",
        positionGroup: "SPECIALIST",
        grade: "3",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-03-10",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Dubai Office",
      },
      {
        id: "HC23",
        empNo: "GEO01",
        name: "Mariami Javakhishvili",
        email: "mariami.javakhishvili@almetholding.com",
        businessFunction: "Georgia",
        department: "ADMINISTRATIVE",
        unit: "ADMINISTRATION",
        jobFunction: "FACILITIES ASSISTANT",
        jobTitle: "Housekeeping",
        positionGroup: "BLUE COLLAR",
        grade: "1",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-01-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Tbilisi Office",
      },
      {
        id: "HC24",
        empNo: "GEO04",
        name: "Khatia Tkebuchava",
        email: "khatia.tkebuchava@almetholding.com",
        businessFunction: "Georgia",
        department: "FINANCE",
        unit: "FINANCE OPERATIONS",
        jobFunction: "CHIEF ACCOUNTANT",
        jobTitle: "Chief Accountant",
        positionGroup: "SENIOR SPECIALIST",
        grade: "5",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-06-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Tbilisi Office",
      },
      {
        id: "HC25",
        empNo: "GEO05",
        name: "Akaki Kobakhidze",
        email: "akaki.kobakhidze@almetholding.com",
        businessFunction: "Georgia",
        department: "OPERATIONS",
        unit: "COMMERCE",
        jobFunction: "CUSTOMS SPECIALIST",
        jobTitle: "Customs Officer",
        positionGroup: "SPECIALIST",
        grade: "3",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-11-01",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Tbilisi Office",
      },
      {
        id: "HC26",
        empNo: "GEO06",
        name: "Nino Tkhilashvili",
        email: "nino.tkhilashvili@almetholding.com",
        businessFunction: "Georgia",
        department: "OPERATIONS",
        unit: "WAREHOUSE INVENTORY",
        jobFunction: "WAREHOUSE FOREMAN",
        jobTitle: "Warehouse Manager",
        positionGroup: "MANAGER",
        grade: "4",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2022-09-01",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Tbilisi Office",
      },
      {
        id: "HC27",
        empNo: "GEO07",
        name: "Irakli Sabadze",
        email: "irakli.sabadze@almetholding.com",
        businessFunction: "Georgia",
        department: "OPERATIONS",
        unit: "COMMERCE",
        jobFunction: "OPERATIONS SPECIALIST",
        jobTitle: "Operations Specialist",
        positionGroup: "SPECIALIST",
        grade: "3",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-02-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Tbilisi Office",
      },
      {
        id: "HC28",
        empNo: "GEO08",
        name: "Giorgi Jishkariani",
        email: "giorgi.jishkariani@almetholding.com",
        businessFunction: "Georgia",
        department: "STOCK SALES",
        unit: "COMMERCE",
        jobFunction: "SALES EXECUTIVE",
        jobTitle: "Sales Representative",
        positionGroup: "SPECIALIST",
        grade: "3",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2022-03-10",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "Tbilisi Office",
      },
      {
        id: "HC29",
        empNo: "UK01",
        name: "Serena Marshall",
        email: "serena.marshall@almetholding.com",
        businessFunction: "UK",
        department: "FINANCE",
        unit: "FINANCE OPERATIONS",
        jobFunction: "DEPUTY CHAIRMAN ON COMMERCIAL ACTIVITIES EUROPE REGION",
        jobTitle: "Direktor",
        positionGroup: "DIRECTOR",
        grade: "7",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-01-05",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "London Office",
      },
      {
        id: "HC30",
        empNo: "UK02",
        name: "Joseph Jesudas Babuji",
        email: "joseph.jesudas@almetholding.com",
        businessFunction: "UK",
        department: "FINANCE",
        unit: "FINANCE OPERATIONS",
        jobFunction: "CHIEF ACCOUNTANT",
        jobTitle: "Chief Accountant",
        positionGroup: "SENIOR SPECIALIST",
        grade: "5",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-04-20",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "London Office",
      },
      {
        id: "HC31",
        empNo: "UK03",
        name: "Richard Millard",
        email: "richard.millard@almetholding.com",
        businessFunction: "UK",
        department: "OPERATIONS",
        unit: "COMMERCE",
        jobFunction: "OPERATIONS MANAGER",
        jobTitle: "Operations Manager",
        positionGroup: "MANAGER",
        grade: "5",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2022-11-15",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "London Office",
      },
      {
        id: "HC32",
        empNo: "UK06",
        name: "Anna Wolczyk",
        email: "anna.wolczyk@almetholding.com",
        businessFunction: "UK",
        department: "TRADE",
        unit: "COMMERCE",
        jobFunction: "OPERATIONS SPECIALIST",
        jobTitle: "Operations Specialist",
        positionGroup: "SPECIALIST",
        grade: "3",
        lineManager: "Şirin Camalli Rasad Oglu",
        lineManagerHcNumber: "HLD02",
        startDate: "2023-03-10",
        endDate: null,
        status: "ACTIVE",
        tags: [],
        office: "London Office",
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
    setAppliedFilters(filters);
    setIsAdvancedFilterOpen(false);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setAppliedFilters({});
    setStatusFilter("all");
    setOfficeFilter("all");
    setDepartmentFilter("all");
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle office filter change
  const handleOfficeChange = (value) => {
    setOfficeFilter(value);
    setCurrentPage(1);
  };

  // Handle department filter change
  const handleDepartmentChange = (value) => {
    setDepartmentFilter(value);
    setCurrentPage(1);
  };

  // Handle column sorting
  const handleSort = (field) => {
    const currentSortIndex = sorting.findIndex((s) => s.field === field);

    if (currentSortIndex >= 0) {
      const currentSort = sorting[currentSortIndex];
      if (currentSort.direction === "asc") {
        const newSorting = [...sorting];
        newSorting[currentSortIndex] = { field, direction: "desc" };
        setSorting(newSorting);
      } else {
        const newSorting = sorting.filter((_, index) => index !== currentSortIndex);
        setSorting(newSorting.length ? newSorting : [{ field: "name", direction: "asc" }]);
      }
    } else {
      if (sorting.length >= 3) {
        setSorting([...sorting.slice(1), { field, direction: "asc" }]);
      } else {
        setSorting([...sorting, { field, direction: "asc" }]);
      }
    }
  };

  // Get sort direction for a field
  const getSortDirection = (field) => {
    const sort = sorting.find((s) => s.field === field);
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

    if (action === "export") {
      alert(`Exporting data for ${selectedEmployees.length} employee(s)`);
    } else if (action === "delete") {
      if (
        confirm(
          `Are you sure you want to delete ${selectedEmployees.length} employee(s)? This action cannot be undone.`
        )
      ) {
        alert(`${selectedEmployees.length} employee(s) deleted`);
        setSelectedEmployees([]);
      }
    } else if (action === "changeManager") {
      alert("Change manager UI would open here");
    }
  };

  // Handle actions on individual employees
  const handleEmployeeAction = (employeeId, action) => {
    const employee = employees.find((emp) => emp.id === employeeId);

    console.log(`Action ${action} for employee ${employeeId}`);

    if (action === "delete") {
      if (
        confirm(
          `Are you sure you want to delete ${employee.name}? This action cannot be undone.`
        )
      ) {
        alert(`Employee ${employee.name} deleted`);
      }
    } else if (action === "addTag") {
      const tag = prompt('Enter tag for employee (e.g., "Sick Leave", "Maternity", "Suspension")');
      if (tag) {
        alert(`Tag "${tag}" added to employee ${employee.name}`);
      }
    } else if (action === "changeManager") {
      alert("Change manager UI would open here");
    } else if (action === "viewJobDescription") {
      alert(`Viewing job description for ${employee.name}`);
    } else if (action === "performanceMatrix") {
      alert(`Viewing performance matrix for ${employee.name}`);
    } else if (action === "message") {
      alert(`Messaging ${employee.name}`);
    }
  };

  // Filter, sort, and paginate employees
  const filteredAndSortedEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        // Text search
        const matchesSearch = !searchTerm
          ? true
          : emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            : emp.office.toLowerCase().includes(officeFilter.toLowerCase());

        // Department filter
        const matchesDepartment =
          departmentFilter === "all"
            ? true
            : emp.department.toLowerCase() === departmentFilter.toLowerCase();

        // Advanced filters
        const matchesAdvancedFilters = Object.entries(appliedFilters).every(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return true;

          if (key === "employeeName") {
            return emp.name.toLowerCase().includes(value.toLowerCase());
          }
          if (key === "employeeId") {
            return emp.empNo.toLowerCase().includes(value.toLowerCase());
          }
          if (key === "businessFunctions") {
            return value.includes(emp.businessFunction);
          }
          if (key === "departments") {
            return value.includes(emp.department);
          }
          if (key === "units") {
            return value.includes(emp.unit);
          }
          if (key === "jobFunctions") {
            return value.includes(emp.jobFunction);
          }
          if (key === "positionGroups") {
            return value.includes(emp.positionGroup);
          }
          if (key === "jobTitles") {
            return value.includes(emp.jobTitle);
          }
          if (key === "lineManager") {
            return emp.lineManager && emp.lineManager.toLowerCase().includes(value.toLowerCase());
          }
          if (key === "lineManagerId") {
            return (
              emp.lineManagerHcNumber && emp.lineManagerHcNumber.toLowerCase().includes(value.toLowerCase())
            );
          }
          if (key === "startDate" && value) {
            return new Date(emp.startDate) >= new Date(value);
          }
          if (key === "endDate" && value) {
            return emp.endDate && new Date(emp.endDate) <= new Date(value);
          }
          if (key === "grades") {
            return value.includes(emp.grade);
          }
          return true;
        });

        return matchesSearch && matchesStatus && matchesOffice && matchesDepartment && matchesAdvancedFilters;
      })
      .sort((a, b) => {
        for (const sort of sorting) {
          const field = sort.field;
          const direction = sort.direction === "asc" ? 1 : -1;

          if (typeof a[field] === "string" && typeof b[field] === "string") {
            const comparison = a[field].localeCompare(b[field]);
            if (comparison !== 0) return comparison * direction;
          } else if (field === "startDate" || field === "endDate") {
            const dateA = a[field] ? new Date(a[field]) : new Date(0);
            const dateB = b[field] ? new Date(b[field]) : new Date(0);
            const comparison = dateA - dateB;
            if (comparison !== 0) return comparison * direction;
          } else {
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
    officeFilter,
    departmentFilter,
    sorting,
    appliedFilters,
  ]);

  // Get department color for row background with improved dark mode visibility
  const getDepartmentColor = (department) => {
    if (department.includes("BUSINESS DEVELOPMENT")) {
      return darkMode ? "bg-blue-900/30" : "bg-blue-50";
    } else if (department.includes("FINANCE")) {
      return darkMode ? "bg-green-900/30" : "bg-green-50";
    } else if (department.includes("COMPLIANCE")) {
      return darkMode ? "bg-red-900/30" : "bg-red-50";
    } else if (department.includes("HR")) {
      return darkMode ? "bg-purple-900/30" : "bg-purple-50";
    } else if (department.includes("ADMINISTRATIVE")) {
      return darkMode ? "bg-yellow-900/30" : "bg-yellow-50";
    } else if (department.includes("OPERATIONS")) {
      return darkMode ? "bg-orange-900/30" : "bg-orange-50";
    } else if (department.includes("PROJECTS MANAGEMENT")) {
      return darkMode ? "bg-teal-900/30" : "bg-teal-50";
    } else if (department.includes("TRADE")) {
      return darkMode ? "bg-indigo-900/30" : "bg-indigo-50";
    } else if (department.includes("STOCK SALES")) {
      return darkMode ? "bg-pink-900/30" : "bg-pink-50";
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

  // Prepare active filters for QuickFilterBar
  const activeFilters = [];
  if (statusFilter !== "all") {
    activeFilters.push({ key: "status", label: `Status: ${statusFilter}` });
  }
  if (officeFilter !== "all") {
    activeFilters.push({ key: "office", label: `Office: ${officeFilter}` });
  }
  if (departmentFilter !== "all") {
    activeFilters.push({ key: "department", label: `Department: ${departmentFilter}` });
  }
  Object.entries(appliedFilters).forEach(([key, value]) => {
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      const fieldName = key.replace(/([A-Z])/g, " $1").trim();
      const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      const label = Array.isArray(value) ? `${displayName}: ${value.join(", ")}` : `${displayName}: ${value}`;
      activeFilters.push({ key, label });
    }
  });

  // Handle clearing a specific filter
  const handleClearFilter = (key) => {
    if (key === "status") {
      setStatusFilter("all");
    } else if (key === "office") {
      setOfficeFilter("all");
    } else if (key === "department") {
      setDepartmentFilter("all");
    } else {
      const newFilters = { ...appliedFilters };
      delete newFilters[key];
      setAppliedFilters(newFilters);
    }
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Employees</h1>
          <p className={`text-sm ${textMuted}`}>
            Manage your organization's employee database
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/structure/add-employee">
            <button
              className={`${btnPrimary} text-white px-4 py-2 rounded-md flex items-center`}
            >
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
              Actions {selectedEmployees.length > 0 ? `(${selectedEmployees.length})` : ""}
              <ChevronDown size={16} className="ml-2" />
            </button>

            {isActionMenuOpen && (
              <div
                className={`absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } ring-1 ring-black ring-opacity-5`}
              >
                <div className="py-1" role="menu">
                  <button
                    className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
                    onClick={() => handleBulkAction("export")}
                  >
                    <div className="flex items-center">
                      <Download size={16} className="mr-2 text-blue-500" />
                      <span>Export Selected Data</span>
                    </div>
                  </button>
                  <button
                    className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
                    onClick={() => handleBulkAction("changeManager")}
                  >
                    <div className="flex items-center">
                      <Users size={16} className="mr-2 text-green-500" />
                      <span>Change Line Manager</span>
                    </div>
                  </button>
                  <button
                    className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left border-t border-gray-200 dark:border-gray-700 mt-1 pt-1`}
                    onClick={() => handleBulkAction("delete")}
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
        <AdvancedFilterPanel
          onApply={handleApplyAdvancedFilters}
          onClose={() => setIsAdvancedFilterOpen(false)}
          initialFilters={appliedFilters}
        />
      )}

      {/* Quick Filter Bar */}
      <QuickFilterBar
        onStatusChange={handleStatusChange}
        onOfficeChange={handleOfficeChange}
        onDepartmentChange={handleDepartmentChange}
        statusFilter={statusFilter}
        officeFilter={officeFilter}
        departmentFilter={departmentFilter}
        activeFilters={activeFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Search Bar */}
      <div className="relative w-full md:w-1/3 mb-4">
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
                      onClick={() => handleSort("name")}
                    >
                      Employee Info
                      <SortingIndicator direction={getSortDirection("name")} />
                    </button>
                  </div>
                </th>

                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort("grade")}
                    >
                      Grade/Email
                      <SortingIndicator direction={getSortDirection("grade")} />
                    </button>
                  </div>
                </th>

                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort("businessFunction")}
                    >
                      Business Info
                      <SortingIndicator direction={getSortDirection("businessFunction")} />
                    </button>
                  </div>
                </th>

                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort("unit")}
                    >
                      Unit/Job
                      <SortingIndicator direction={getSortDirection("unit")} />
                    </button>
                  </div>
                </th>

                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort("jobTitle")}
                    >
                      Job/Position
                      <SortingIndicator direction={getSortDirection("jobTitle")} />
                    </button>
                  </div>
                </th>

                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort("lineManager")}
                    >
                      Line Manager
                      <SortingIndicator direction={getSortDirection("lineManager")} />
                    </button>
                  </div>
                </th>

                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort("startDate")}
                    >
                      Dates
                      <SortingIndicator direction={getSortDirection("startDate")} />
                    </button>
                  </div>
                </th>

                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <button
                      className={`text-xs font-medium ${textMuted} uppercase tracking-wider flex items-center`}
                      onClick={() => handleSort("status")}
                    >
                      Status/Tags
                      <SortingIndicator direction={getSortDirection("status")} />
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
                        : getDepartmentColor(employee.department)
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
                            <div
                              className={`text-sm font-medium ${textPrimary} hover:underline flex items-center`}
                            >
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
                          {employee.lineManager || "N/A"}
                        </div>
                        <div className={`text-xs ${textMuted}`}>
                          HC: {employee.lineManagerHcNumber || "N/A"}
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
                          {employee.tags &&
                            employee.tags.map((tag, idx) => (
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
                        {searchTerm || Object.keys(appliedFilters).length > 0 || statusFilter !== "all" || officeFilter !== "all" || departmentFilter !== "all"
                          ? "Try adjusting your search or filters to find what you're looking for."
                          : "Add your first employee to get started."}
                      </p>
                      {(searchTerm || Object.keys(appliedFilters).length > 0 || statusFilter !== "all" || officeFilter !== "all" || departmentFilter !== "all") && (
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