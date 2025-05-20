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
    // Buraya digər əməkdaşlar əlavə edilə bilər - orijinal fayldan götürə bilərsiniz
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