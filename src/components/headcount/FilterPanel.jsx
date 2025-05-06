// src/components/headcount/FilterPanel.jsx
import React, { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

const FilterPanel = ({ filterOptions, onApplyFilters, onClearFilters }) => {
  const { darkMode } = useTheme();
  const [selectedFilters, setSelectedFilters] = useState({});

  // Theme-dependent classes
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-100";
  const btnPrimary = darkMode
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-500 hover:bg-blue-600";

  const handleFilterChange = (filterName, value) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterName]: value,
    });
  };

  const handleApplyFilters = () => {
    const appliedFilters = Object.entries(selectedFilters)
      .filter(([_, value]) => value)
      .map(([name, value]) => `${name} - ${value}`);
    onApplyFilters(appliedFilters);
  };

  const handleClearFilters = () => {
    setSelectedFilters({});
    onClearFilters();
  };

  return (
    <div className="border rounded-lg p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filterOptions.map((filter) => (
          <div key={filter.name} className="flex flex-col">
            <div className="relative w-full mb-2">
              <div className="flex items-center justify-between border rounded-md overflow-hidden">
                <select
                  className={`appearance-none w-full p-2 pr-8 border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={selectedFilters[filter.name] || ""}
                  onChange={(e) =>
                    handleFilterChange(filter.name, e.target.value)
                  }
                >
                  <option value="">{filter.name}</option>
                  {filter.options.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown size={16} className={textMuted} />
                </div>
                <button
                  className="absolute top-2 right-8 text-blue-500 hover:text-blue-600"
                  title="Add new option"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6 space-x-3">
        <button
          className="bg-orange-100 text-orange-600 px-6 py-2 rounded-md hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800 font-medium"
          onClick={handleClearFilters}
        >
          Clear Filter
        </button>
        <button
          className={`${btnPrimary} text-white px-6 py-2 rounded-md font-medium`}
          onClick={handleApplyFilters}
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
