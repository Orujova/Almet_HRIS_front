// src/components/headcount/HeadcountTable.jsx
"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { getThemeStyles } from "./utils/themeStyles";
import { filterEmployees, getActiveFilters } from "./utils/employeeFilters";
import { sortEmployees, updateSorting, getSortDirection } from "./utils/employeeSorting";
import { getMockEmployees } from "./utils/mockData";

// Komponentlər
import HeadcountHeader from "./HeadcountHeader";
import SearchBar from "./SearchBar";
import QuickFilterBar from "./QuickFilterBar";
import AdvancedFilterPanel from "./AdvancedFilterPanel";
import EmployeeTable from "./EmployeeTable";
import Pagination from "./Pagination";
import ActionMenu from "./ActionMenu";
import HierarchyLegend from "./HierarchyLegend";
import ColorSelector from "./ColorModeSelector";

/**
 * Ana əməkdaşlar cədvəli komponenti
 * Bütün state və məntiqi özündə saxlayır
 * @returns {JSX.Element} - Əməkdaşlar cədvəli komponenti
 */
const HeadcountTable = () => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);
  
  // Filter və axtarış vəziyyətləri
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  
  // Əməkdaş məlumatları vəziyyətləri
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [employeeVisibility, setEmployeeVisibility] = useState({});
  
  // Sıralama vəziyyəti
  const [sorting, setSorting] = useState([{ field: "name", direction: "asc" }]);
  
  // Səhifələmə vəziyyəti
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalEmployees, setTotalEmployees] = useState(0);
  
  // Əməliyyatlar menyusu vəziyyəti
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionButtonRef = useRef(null);

  // Test əməkdaş məlumatlarını yüklə
  useEffect(() => {
    const mockEmployees = getMockEmployees();
    setEmployees(mockEmployees);
    setTotalEmployees(mockEmployees.length);
    
    // Görünmə vəziyyətini başlat
    const visibilityMap = {};
    mockEmployees.forEach(emp => {
      visibilityMap[emp.id] = true;
    });
    setEmployeeVisibility(visibilityMap);
  }, []);

  // Hamısını seçmək funksiyası
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredAndSortedEmployees.map((emp) => emp.id));
    }
    setSelectAll(!selectAll);
  };

  // Tək əməkdaşı seçmək funksiyası
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

  // Axtarış funksiyası
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Əlavə filtrlər panelini açıb-bağlamaq
  const toggleAdvancedFilter = () => {
    setIsAdvancedFilterOpen(!isAdvancedFilterOpen);
  };

  // Əlavə filtrləri tətbiq etmək
  const handleApplyAdvancedFilters = (filters) => {
    setAppliedFilters(filters);
    setIsAdvancedFilterOpen(false);
    setCurrentPage(1);
  };

  // Bütün filtrləri təmizləmək
  const handleClearAllFilters = () => {
    setAppliedFilters({});
    setStatusFilter("all");
    setOfficeFilter("all");
    setDepartmentFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Status filtrini dəyişmək
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Ofis filtrini dəyişmək
  const handleOfficeChange = (value) => {
    setOfficeFilter(value);
    setCurrentPage(1);
  };

  // Departament filtrini dəyişmək
  const handleDepartmentChange = (value) => {
    setDepartmentFilter(value);
    setCurrentPage(1);
  };

  // Konkret bir filtri təmizləmək
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

  // Sütun sıralamasını dəyişmək
  const handleSort = (field) => {
    const newSorting = updateSorting(sorting, field);
    setSorting(newSorting);
  };

  // Sıralama istiqamətini əldə etmək
  const handleGetSortDirection = (field) => {
    return getSortDirection(sorting, field);
  };

  // Əməliyyatlar menyusunu açıb-bağlamaq
  const toggleActionMenu = () => {
    setIsActionMenuOpen(!isActionMenuOpen);
  };

  // Seçilmiş əməkdaşlar üzərində əməliyyat
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

  // Tək əməkdaş üzərində əməliyyat
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
    } else if (action === "viewDetails") {
      alert(`Viewing details for ${employee.name}`);
    } else if (action === "editEmployee") {
      alert(`Editing ${employee.name}`);
    }
  };

  // Görünmə vəziyyətini dəyişmək
  const handleVisibilityChange = (employeeId, newVisibility) => {
    setEmployeeVisibility(prev => ({
      ...prev,
      [employeeId]: newVisibility,
    }));
    console.log(`Employee ${employeeId} visibility set to ${newVisibility}`);
  };

  // Filtrləmə və sıralama tətbiq edilmiş əməkdaşlar
  const filteredAndSortedEmployees = useMemo(() => {
    const filteredEmployees = filterEmployees(employees, {
      searchTerm,
      statusFilter,
      officeFilter,
      departmentFilter,
      appliedFilters,
    });
    
    return sortEmployees(filteredEmployees, sorting);
  }, [
    employees,
    searchTerm,
    statusFilter,
    officeFilter,
    departmentFilter,
    appliedFilters,
    sorting,
  ]);

  // Səhifələmə
  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedEmployees.slice(indexOfFirstItem, indexOfLastItem);

  // Səhifə dəyişmə funksiyası
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Səhifə başına elementlərin sayını dəyişmək
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Aktiv filtrlər
  const activeFilters = useMemo(() => {
    return getActiveFilters(statusFilter, officeFilter, departmentFilter, appliedFilters);
  }, [statusFilter, officeFilter, departmentFilter, appliedFilters]);

  // Filtrlər aktivdir ya yox
  const hasActiveFilters = searchTerm || 
    Object.keys(appliedFilters).length > 0 || 
    statusFilter !== "all" || 
    officeFilter !== "all" || 
    departmentFilter !== "all";

  return (
    <div className="container mx-auto pt-3 max-w-full">
      {/* Başlıq bölməsi */}
      <div className="relative">
        <HeadcountHeader
          onToggleAdvancedFilter={toggleAdvancedFilter}
          onToggleActionMenu={toggleActionMenu}
          isActionMenuOpen={isActionMenuOpen}
          selectedEmployees={selectedEmployees}
          ref={actionButtonRef}
        />

        {/* Əməliyyatlar menyusu */}
        {isActionMenuOpen && (
          <div className="absolute right-2 top-16 z-50">
            <ActionMenu 
              isOpen={isActionMenuOpen}
              onClose={() => setIsActionMenuOpen(false)}
              onAction={handleBulkAction}
            />
          </div>
        )}
      </div>

      {/* Əlavə Filtrlər Paneli */}
      {isAdvancedFilterOpen && (
        <AdvancedFilterPanel
          onApply={handleApplyAdvancedFilters}
          onClose={() => setIsAdvancedFilterOpen(false)}
          initialFilters={appliedFilters}
        />
      )}

      {/* Tez filtr paneli */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-4">
      
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
       
        
        <div className="flex-shrink-0">
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
        </div>
      </div>

      {/* Hierarchy Legend */}
      <HierarchyLegend />
      <ColorSelector/>

      {/* Əməkdaşlar cədvəli */}
      <EmployeeTable
        employees={currentItems}
        selectedEmployees={selectedEmployees}
        selectAll={selectAll}
        onToggleSelectAll={toggleSelectAll}
        onToggleEmployeeSelection={toggleEmployeeSelection}
        onSort={handleSort}
        getSortDirection={handleGetSortDirection}
        employeeVisibility={employeeVisibility}
        onVisibilityChange={handleVisibilityChange}
        onEmployeeAction={handleEmployeeAction}
        hasFilters={hasActiveFilters}
        onClearFilters={handleClearAllFilters}
      />

      {/* Səhifələmə */}
      {filteredAndSortedEmployees.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAndSortedEmployees.length}
          startIndex={indexOfFirstItem}
          endIndex={Math.min(indexOfLastItem, filteredAndSortedEmployees.length)}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default HeadcountTable;