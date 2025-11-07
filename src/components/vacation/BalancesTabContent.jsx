"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Download,
  Edit,
  X,
  Filter,
  TrendingUp,
  TrendingDown,
  Save,
  Search,
} from "lucide-react";

import { VacationService, VacationHelpers } from '@/services/vacationService';

const BalancesTabContent = ({ userPermissions = {}, darkMode, showSuccess, showError }) => {
  const [balances, setBalances] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBalance, setEditingBalance] = useState(null);
  const [editValues, setEditValues] = useState({});

  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    department: "",
    min_remaining: "",
    max_remaining: "",
  });

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const response = await VacationService.getAllBalances(filters);
      setBalances(response?.balances || []);
      setSummary(response?.summary || null);
    } catch (error) {
      console.error("Balances fetch error:", error);
      showError?.("Failed to load vacation balances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async () => {
    try {
      const params = {
        year: filters.year,
        department: filters.department,
        min_remaining: filters.min_remaining,
        max_remaining: filters.max_remaining,
      };
      const blob = await VacationService.exportBalances(params);
      VacationHelpers.downloadBlobFile(blob, `vacation_balances_${filters.year}.xlsx`);
      showSuccess?.("Export completed successfully");
    } catch (error) {
      console.error("Export error:", error);
      showError?.("Export failed");
    }
  };

  const handleApplyFilters = () => {
    fetchBalances();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      year: new Date().getFullYear(),
      department: "",
      min_remaining: "",
      max_remaining: "",
    });
    setSearchTerm("");
    fetchBalances();
  };

  const handleEditBalance = (balance) => {
    setEditingBalance(balance.id);
    setEditValues({
      employee_id: balance.employee,
      year: balance.year,
      start_balance: balance.start_balance,
      yearly_balance: balance.yearly_balance,
      used_days: balance.used_days,
      scheduled_days: balance.scheduled_days,
    });
  };

  const handleSaveBalance = async () => {
    try {
      await VacationService.updateEmployeeBalance(editValues);
      showSuccess?.("Balance updated successfully");
      setEditingBalance(null);
      setEditValues({});
      fetchBalances();
    } catch (error) {
      console.error("Update error:", error);
      showError?.("Failed to update balance");
    }
  };

  const handleCancelEdit = () => {
    setEditingBalance(null);
    setEditValues({});
  };

  const filteredBalances = balances.filter((balance) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    const name = (balance.employee_name || "").toLowerCase();
    const empId = String(balance.employee_id || "").toLowerCase();

    return name.includes(term) || empId.includes(term);
  });

  const getBalanceStatus = (balance) => {
    if (balance.remaining_balance < 5) {
      return {
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-900/20",
        label: "Critical",
      };
    } else if (balance.remaining_balance < 10) {
      return {
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        label: "Low",
      };
    } else if (balance.remaining_balance > 20) {
      return {
        color: "text-green-600",
        bg: "bg-green-50 dark:bg-green-900/20",
        label: "Excellent",
      };
    }
    return {
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      label: "Good",
    };
  };

  const canUpdate =
    userPermissions.is_admin ||
    userPermissions.permissions?.includes("vacation.balance.update");
  const canExport =
    userPermissions.is_admin ||
    userPermissions.permissions?.includes("vacation.balance.export");

  return (
    <div className="space-y-5">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or employee ID..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          {canExport && (
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">
                  Total Employees
                </p>
                <p className="text-xl font-semibold text-almet-sapphire">
                  {summary.total_employees}
                </p>
              </div>
              <Users className="w-5 h-5 text-almet-sapphire" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">
                  Total Allocated
                </p>
                <p className="text-xl font-semibold text-almet-astral">
                  {summary.total_allocated}
                </p>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  days
                </p>
              </div>
              <Calendar className="w-5 h-5 text-almet-astral" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">
                  Total Used
                </p>
                <p className="text-xl font-semibold text-orange-600">
                  {summary.total_used}
                </p>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  days
                </p>
              </div>
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">
                  Total Remaining
                </p>
                <p className="text-xl font-semibold text-green-600">
                  {summary.total_remaining}
                </p>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  days
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">
              Filter Balances
            </h3>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                Year
              </label>
              <input
                type="number"
                value={filters.year}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, year: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                Department
              </label>
              <input
                type="text"
                value={filters.department}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, department: e.target.value }))
                }
                placeholder="Filter by department"
                className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                Min Remaining Days
              </label>
              <input
                type="number"
                value={filters.min_remaining}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    min_remaining: e.target.value,
                  }))
                }
                placeholder="0"
                className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                Max Remaining Days
              </label>
              <input
                type="number"
                value={filters.max_remaining}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    max_remaining: e.target.value,
                  }))
                }
                placeholder="28"
                className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="px-4 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm border border-almet-mystic dark:border-almet-comet text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Balances Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-almet-sapphire border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
              <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
                <tr>
                  {[
                    "Employee",
                    "Department",
                    "Total",
                    "Used",
                    "Scheduled",
                    "Remaining",
                    "To Plan",
                    "Status",
                    ...(canUpdate ? ["Actions"] : []),
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                {filteredBalances.map((balance) => {
                  const status = getBalanceStatus(balance);
                  const isEditing = editingBalance === balance.id;

                  return (
                    <tr
                      key={balance.id}
                      className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-almet-cloud-burst dark:text-white">
                            {balance.employee_name}
                          </p>
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                            {balance.employee_id}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-almet-waterloo dark:text-almet-bali-hai">
                        {balance.department_name}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-almet-sapphire">
                        {balance.total_balance}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editValues.used_days}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                used_days: e.target.value,
                              }))
                            }
                            className="w-20 px-2 py-1 text-sm text-center border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-orange-600">
                            {balance.used_days}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editValues.scheduled_days}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                scheduled_days: e.target.value,
                              }))
                            }
                            className="w-20 px-2 py-1 text-sm text-center border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-almet-steel-blue">
                            {balance.scheduled_days}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-green-600 dark:text-green-400">
                        {balance.remaining_balance}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-red-600">
                        {balance.should_be_planned}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      {canUpdate && (
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={handleSaveBalance}
                                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 transition-colors"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEditBalance(balance)}
                              className="p-1 text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}

                {filteredBalances.length === 0 && (
                  <tr>
                    <td
                      colSpan={canUpdate ? 9 : 8}
                      className="px-4 py-12 text-center"
                    >
                      <Calendar className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                      <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                        No balances found
                      </p>
                      <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">
                        Try adjusting your filters
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

     
    </div>
  );
};

export default BalancesTabContent;
