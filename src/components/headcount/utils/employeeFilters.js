// src/utils/employeeFilters.js

/**
 * Əməkdaşların filtrlənməsi üçün funksiya
 * @param {Array} employees - Əməkdaşlar siyahısı
 * @param {Object} filters - Filtrləmə parametrləri
 * @returns {Array} - Filtrlənmiş əməkdaşlar siyahısı
 */
export const filterEmployees = (
  employees,
  {
    searchTerm = "",
    statusFilter = "all",
    officeFilter = "all",
    departmentFilter = "all",
    appliedFilters = {},
  }
) => {
  return employees.filter((emp) => {
    // Axtarış mətninə uyğun filtrləmə
    const matchesSearch = !searchTerm
      ? true
      : emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filtrləməsi
    const matchesStatus =
      statusFilter === "all"
        ? true
        : emp.status.toLowerCase() === statusFilter.toLowerCase();

    // Ofis filtrləməsi
    const matchesOffice =
      officeFilter === "all"
        ? true
        : emp.office.toLowerCase().includes(officeFilter.toLowerCase());

    // Departament filtrləməsi
    const matchesDepartment =
      departmentFilter === "all"
        ? true
        : emp.department.toLowerCase() === departmentFilter.toLowerCase();

    // Əlavə filtr parametrləri
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
  });
};

/**
 * Aktiv filtrləri hazırlayan funksiya
 * @param {string} statusFilter - Status filtr dəyəri
 * @param {string} officeFilter - Ofis filtr dəyəri
 * @param {string} departmentFilter - Departament filtr dəyəri
 * @param {Object} appliedFilters - Tətbiq edilmiş əlavə filtrlər
 * @returns {Array} - Aktiv filtrlər siyahısı
 */
export const getActiveFilters = (
  statusFilter,
  officeFilter,
  departmentFilter,
  appliedFilters
) => {
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
      const label = Array.isArray(value) 
        ? `${displayName}: ${value.join(", ")}` 
        : `${displayName}: ${value}`;
      activeFilters.push({ key, label });
    }
  });
  
  return activeFilters;
};