// components/vacation/VacationCalendar.jsx
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, Filter, X, Star, Briefcase } from 'lucide-react';
import { VacationService } from '@/services/vacationService';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import { DayDetailModal } from './DayDetailModal';

const VacationCalendar = ({ darkMode, showSuccess, showError }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    employee_id: '',
    department_id: '',
    business_function_id: ''
  });
  
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [businessFunctions, setBusinessFunctions] = useState([]);
  
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayClick = (date, dayHolidays, dayVacations) => {
    setSelectedDay({
      date,
      holidays: dayHolidays,
      vacations: dayVacations
    });
    setShowDayDetail(true);
  };

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, filters]);

  // ✅ Fetch filter options once on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const data = await VacationService.getCalendarEvents({
        month,
        year,
        ...filters
      });
      
      setHolidays(data.holidays || []);
      setVacations(data.vacations || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Calendar fetch error:', error);
      showError?.('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch all filter options from ALL vacation records
  const fetchFilterOptions = async () => {
    try {
      // Get ALL vacation records without any filters to extract unique values
      const allRecords = await VacationService.getAllVacationRecords({});
      
      if (allRecords && allRecords.records) {
        // Extract unique employees
        const uniqueEmployees = new Map();
        allRecords.records.forEach(record => {
          if (record.employee_id && !uniqueEmployees.has(record.employee_id)) {
            uniqueEmployees.set(record.employee_id, {
              id: record.employee_id,
              name: record.employee_name,
              employee_id: record.employee_id
            });
          }
        });
        setEmployees(Array.from(uniqueEmployees.values()));

        // Extract unique business functions (companies)
        const uniqueBusinessFunctions = new Map();
        allRecords.records.forEach(record => {
          if (record.business_function && !uniqueBusinessFunctions.has(record.business_function)) {
            uniqueBusinessFunctions.set(record.business_function, {
              id: record.business_function, // Using name as ID since we don't have ID in response
              name: record.business_function
            });
          }
        });
        setBusinessFunctions(Array.from(uniqueBusinessFunctions.values()));

        // Extract unique departments
        const uniqueDepartments = new Map();
        allRecords.records.forEach(record => {
          if (record.department && !uniqueDepartments.has(record.department)) {
            uniqueDepartments.set(record.department, {
              id: record.department, // Using name as ID since we don't have ID in response
              name: record.department
            });
          }
        });
        setDepartments(Array.from(uniqueDepartments.values()));
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
      showError?.('Failed to load filter options');
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const holidaysOnDate = holidays.filter(h => h.date === dateStr);
    const vacationsOnDate = vacations.filter(v => {
      return dateStr >= v.start_date && dateStr <= v.end_date;
    });
    
    return { holidays: holidaysOnDate, vacations: vacationsOnDate };
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const clearFilters = () => {
    setFilters({
      employee_id: '',
      department_id: '',
      business_function_id: ''
    });
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] border border-almet-mystic/10 dark:border-almet-comet/10 bg-gray-50 dark:bg-gray-900/50" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const { holidays: dayHolidays, vacations: dayVacations } = getEventsForDate(date);
      const today = isToday(date);

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(date, dayHolidays, dayVacations)}
          className={`cursor-pointer min-h-[120px] border border-almet-mystic/30 dark:border-almet-comet/30 p-2 transition-all ${
            today
              ? 'bg-almet-sapphire/5 dark:bg-almet-sapphire/10 border-almet-sapphire dark:border-almet-astral'
              : 'bg-white dark:bg-gray-800 hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30'
          }`}
        >
          {/* Day number */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${
              today ? 'text-almet-sapphire dark:text-almet-astral' : 'text-almet-cloud-burst dark:text-white'
            }`}>
              {day}
            </span>
            {(dayHolidays.length > 0 || dayVacations.length > 0) && (
              <span className="text-[10px] bg-almet-sapphire/10 dark:bg-almet-astral/10 text-almet-sapphire dark:text-almet-astral px-1.5 py-0.5 rounded">
                {dayHolidays.length + dayVacations.length}
              </span>
            )}
          </div>

          {/* Holidays */}
          {dayHolidays.map((holiday, idx) => (
            <div
              key={`holiday-${idx}`}
              className="mb-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] rounded truncate"
              title={holiday.name}
            >
              <Star className="w-2.5 h-2.5 inline mr-1" />
              {holiday.name}
            </div>
          ))}

          {/* Vacations */}
          {dayVacations.slice(0, 3).map((vacation, idx) => (
            <div
              key={`vacation-${idx}`}
              className={`mb-1 px-2 py-1 text-[10px] rounded truncate ${
                vacation.status_code === 'APPROVED'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : vacation.status_code === 'SCHEDULED'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              }`}
              title={`${vacation.employee_name} - ${vacation.vacation_type}`}
            >
              <div className="font-medium truncate">{vacation.employee_name}</div>
              <div className="text-[9px] opacity-75 truncate">{vacation.vacation_type}</div>
            </div>
          ))}

          {/* More indicator */}
          {dayVacations.length > 3 && (
            <div className="text-[10px] text-almet-waterloo dark:text-gray-400 text-center mt-1">
              +{dayVacations.length - 3} more
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-almet-cloud-burst dark:text-white">
            <CalendarIcon className="w-6 h-6 inline mr-2" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-sapphire/90 transition-all"
          >
            Today
          </button>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="text-sm text-red-600 dark:text-red-400 mb-1">Holidays</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.total_holidays}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Vacations</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.total_vacations}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Employees</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summary.employees_on_vacation}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-almet-cloud-burst dark:text-white">
              Filter Calendar
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                Employee
              </label>
              <SearchableDropdown
                options={employees.map(emp => ({
                  value: emp.id,
                  label: `${emp.name} (${emp.employee_id})`
                }))}
                value={filters.employee_id}
                onChange={(value) => setFilters(prev => ({ ...prev, employee_id: value || '' }))}
                placeholder="All Employees"
                allowUncheck={true}
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                Company
              </label>
              <SearchableDropdown
                options={businessFunctions.map(bf => ({
                  value: bf.id,
                  label: bf.name
                }))}
                value={filters.business_function_id}
                onChange={(value) => setFilters(prev => ({ ...prev, business_function_id: value || '' }))}
                placeholder="All Companies"
                allowUncheck={true}
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-400 mb-1">
                Department
              </label>
              <SearchableDropdown
                options={departments.map(dept => ({
                  value: dept.id,
                  label: dept.name
                }))}
                value={filters.department_id}
                onChange={(value) => setFilters(prev => ({ ...prev, department_id: value || '' }))}
                placeholder="All Departments"
                allowUncheck={true}
                darkMode={darkMode}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-almet-sapphire border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className="py-3 text-center text-xs font-semibold text-almet-cloud-burst dark:text-white border-b border-almet-mystic/30 dark:border-almet-comet/30"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {renderCalendar()}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded" />
          <span className="text-almet-waterloo dark:text-gray-400">Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded" />
          <span className="text-almet-waterloo dark:text-gray-400">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded" />
          <span className="text-almet-waterloo dark:text-gray-400">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/30 rounded" />
          <span className="text-almet-waterloo dark:text-gray-400">Pending</span>
        </div>
      </div>

      <DayDetailModal
        isOpen={showDayDetail}
        onClose={() => setShowDayDetail(false)}
        date={selectedDay?.date}
        holidays={selectedDay?.holidays}
        vacations={selectedDay?.vacations}
      />
    </div>
  );
};

export default VacationCalendar;