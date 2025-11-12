import { useState } from 'react';
import { Users, Search, ChevronRight, Lock, X, Building2 } from 'lucide-react';

export default function TeamMembersWithSearch({ 
  employees = [], 
  currentUserId,
  canViewEmployee,
  onSelectEmployee,
  darkMode 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  // ✅ Get unique departments, positions, and companies for filters
  const departments = [...new Set(employees.map(e => e.employee_department || e.department))].filter(Boolean).sort();
  const positions = [...new Set(employees.map(e => e.employee_position_group || e.position))].filter(Boolean).sort();
  const companies = [...new Set(employees.map(e => e.employee_company || e.company))].filter(Boolean).sort();

  // ✅ Filter logic
  const filteredEmployees = employees.filter(emp => {
    // ⛔ Hide current user from seeing themselves
    if (emp.id === currentUserId) return false;
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      (emp.employee_name || emp.name || '').toLowerCase().includes(searchLower) ||
      (emp.employee_id || '').toLowerCase().includes(searchLower);
    
    // Department filter
    const matchesDepartment = !filterDepartment || 
      (emp.employee_department || emp.department) === filterDepartment;
    
    // Position filter
    const matchesPosition = !filterPosition || 
      (emp.employee_position_group || emp.position) === filterPosition;
    
    // Company filter
    const matchesCompany = !filterCompany || 
      (emp.employee_company || emp.company) === filterCompany;
    
    return matchesSearch && matchesDepartment && matchesPosition && matchesCompany;
  });

  const getStatusBadge = (employee) => {
    // ✅ Calculate actual status
    const objPct = parseFloat(employee.objectives_percentage);
    const compPct = parseFloat(employee.competencies_percentage);
    
    let status = employee.approval_status || 'NOT_STARTED';
    
    // ✅ Override to COMPLETED if both percentages exist
    if (!isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0) {
      status = 'COMPLETED';
    }
    
    const badges = {
      'DRAFT': { text: 'Draft', class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
      'NOT_STARTED': { text: 'Not Started', class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
      'PENDING_EMPLOYEE_APPROVAL': { text: 'Pending', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      'PENDING_MANAGER_APPROVAL': { text: 'Review', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      'APPROVED': { text: 'Approved', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      'COMPLETED': { text: 'Completed', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      'NEED_CLARIFICATION': { text: 'Clarification', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    };
    
    return badges[status] || badges['NOT_STARTED'];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterPosition('');
    setFilterCompany('');
  };

  const hasActiveFilters = searchTerm || filterDepartment || filterPosition || filterCompany;

  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">
          <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
            Team Members
          </h3>
          <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
            {filteredEmployees.length} of {employees.length - 1} employees
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or employee ID..."
            className={`w-full pl-10 pr-4 h-10 text-sm rounded-xl border ${
              darkMode 
                ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-bali-hai' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30`}
          />
        </div>

        {/* Filter Row - Department & Position only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className={`h-10 px-3 text-sm rounded-xl border ${
              darkMode 
                ? 'bg-almet-san-juan border-almet-comet text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30`}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Position Filter */}
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className={`h-10 px-3 text-sm rounded-xl border ${
              darkMode 
                ? 'bg-almet-san-juan border-almet-comet text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30`}
          >
            <option value="">All Positions</option>
            {positions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        {/* ✅ Company Filter - Chip/Button Style */}
        <div className={`${darkMode ? 'bg-almet-san-juan/30' : 'bg-almet-mystic/30'} rounded-xl p-3`}>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-almet-sapphire" />
            <h4 className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              Filter by Company
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* All Companies Button */}
            <button
              onClick={() => setFilterCompany('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterCompany === ''
                  ? 'bg-almet-sapphire text-white shadow-sm'
                  : darkMode
                    ? 'bg-almet-comet/50 text-almet-bali-hai hover:bg-almet-comet'
                    : 'bg-white text-almet-waterloo hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Companies
            </button>

            {/* Company Chips */}
            {companies.map(company => (
              <button
                key={company}
                onClick={() => setFilterCompany(company)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterCompany === company
                    ? 'bg-almet-sapphire text-white shadow-sm'
                    : darkMode
                      ? 'bg-almet-comet/50 text-almet-bali-hai hover:bg-almet-comet'
                      : 'bg-white text-almet-waterloo hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {company}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`w-full h-9 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
              darkMode 
                ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            } transition-colors`}
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Employee List */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 font-medium">
            {hasActiveFilters ? 'No employees match your filters' : 'No team members'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEmployees.map(employee => {
            const hasAccess = canViewEmployee(employee.id);
            const badge = getStatusBadge(employee);
            
            return (
              <div
                key={employee.id}
                onClick={() => hasAccess && onSelectEmployee(employee)}
                className={`${
                  darkMode ? 'bg-almet-san-juan hover:bg-almet-comet' : 'bg-almet-mystic hover:bg-gray-100'
                } rounded-xl p-4 transition-all ${hasAccess ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {(employee.employee_name || employee.name || 'U').charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                          {employee.employee_name || employee.name}
                        </h4>
                        {!hasAccess && <Lock className="w-3 h-3 text-almet-waterloo flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-almet-waterloo dark:text-almet-bali-hai flex-wrap">
                        <span className="truncate">{employee.employee_position_group || employee.position}</span>
                        <span>•</span>
                        <span className="truncate">{employee.employee_department || employee.department}</span>
                        {/* ✅ Company Display with Icon */}
                        {(employee.employee_company || employee.company) && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 font-medium text-almet-sapphire dark:text-almet-sapphire">
                              <Building2 className="w-3 h-3" />
                              {employee.employee_company || employee.company}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.class}`}>
                      {badge.text}
                    </span>
                    {hasAccess && (
                      <ChevronRight className="w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}