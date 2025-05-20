// src/utils/mockData.js

/**
 * Test üçün istifadə edilən əməkdaşların verilənlərini qaytarır
 * @returns {Array} - Test əməkdaşları siyahısı
 */
export const getMockEmployees = () => {
  return [
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
          {id: "HC27",
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
  ];
};

/**
 * Biznes funksiyaları siyahısını qaytarır
 * @returns {Array} - Biznes funksiyaları
 */
export const getBusinessFunctions = () => {
  return ["Holding", "Trading", "Georgia", "UK"];
};

/**
 * Departamentlər siyahısını qaytarır
 * @returns {Array} - Departamentlər
 */
export const getDepartments = () => {
  return [
    "ADMINISTRATIVE",
    "COMPLIANCE",
    "FINANCE",
    "HR",
    "OPERATIONS",
    "PROJECTS MANAGEMENT",
    "TRADE",
    "STOCK SALES"
  ];
};

/**
 * Ofislər siyahısını qaytarır
 * @returns {Array} - Ofislər
 */
export const getOffices = () => {
  return ["Baku HQ", "Dubai Office", "Tbilisi Office", "London Office"];
};

/**
 * Status siyahısını qaytarır
 * @returns {Array} - Statuslar
 */
export const getStatuses = () => {
  return ["ACTIVE", "ON LEAVE", "PROBATION"];
};

/**
 * Vəzifə qrupları siyahısını qaytarır
 * @returns {Array} - Vəzifə qrupları
 */
export const getPositionGroups = () => {
  return [
    "BLUE COLLAR",
    "JUNIOR SPECIALIST",
    "SPECIALIST",
    "SENIOR SPECIALIST",
    "MANAGER",
    "HEAD OF DEPARTMENT",
    "DIRECTOR"
  ];
};