"use client";
import { useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

const FilterPanel = ({
  filterCategories,
  appliedFilters,
  onApplyFilter,
  onRemoveFilter,
  onClearFilters,
}) => {
  const { darkMode } = useTheme();
  const [activeFilter, setActiveFilter] = useState(null);

  // Theme-based styling
  const theme = {
    bg: darkMode ? "bg-gray-900" : "bg-gray-100",
    card: darkMode ? "bg-gray-800" : "bg-white",
    text: darkMode ? "text-white" : "text-gray-900",
    secondaryText: darkMode ? "text-gray-300" : "text-gray-700",
    mutedText: darkMode ? "text-gray-400" : "text-gray-500",
    border: darkMode ? "border-gray-700" : "border-gray-200",
    input: darkMode ? "bg-gray-700" : "bg-gray-50",
    button: darkMode
      ? "bg-gray-700 hover:bg-gray-600"
      : "bg-gray-100 hover:bg-gray-200",
    dropdown: darkMode ? "bg-gray-700" : "bg-white",
    dropdownHover: darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100",
  };

  // Open filter dropdown
  const toggleFilter = (filterId) => {
    setActiveFilter(activeFilter === filterId ? null : filterId);
  };

  // Select a filter option
  const selectFilterOption = (category, value) => {
    onApplyFilter(category, value);
    setActiveFilter(null);
  };

  // Add new filter option
  const addNewOption = (categoryId) => {
    // This would open a modal to add a new option
    console.log(`Add new option to ${categoryId}`);
  };

  return (
    <div className={`${theme.card} border ${theme.border} rounded-md p-6`}>
      <div className="grid grid-cols-3 gap-4">
        {filterCategories.map((category) => (
          <div key={category.id} className="mb-4">
            <div className="relative">
              <button
                className={`w-full ${theme.button} border ${theme.border} rounded-md px-4 py-2 text-left flex justify-between items-center`}
                onClick={() => toggleFilter(category.id)}
              >
                {category.label} <ChevronDown size={16} />
              </button>
              <button
                className={`absolute top-1/2 -right-10 transform -translate-y-1/2 p-1 rounded-full ${theme.button}`}
                onClick={() => addNewOption(category.id)}
              >
                <Plus size={16} />
              </button>

              {/* Dropdown for filter options */}
              {activeFilter === category.id && (
                <div
                  className={`absolute z-10 mt-1 w-full ${theme.dropdown} border ${theme.border} rounded-md shadow-lg`}
                >
                  {category.options.map((option, i) => (
                    <div
                      key={i}
                      className={`px-4 py-2 ${theme.dropdownHover} cursor-pointer`}
                      onClick={() => selectFilterOption(category.id, option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Applied filters */}
      {appliedFilters.length > 0 && (
        <div className="mt-4">
          <div className={`text-sm ${theme.mutedText} mb-2`}>
            Applied filters:
          </div>
          <div className="flex flex-wrap gap-2">
            {appliedFilters.map((filter, index) => (
              <div
                key={index}
                className={`px-3 py-1 rounded-full ${theme.button} flex items-center`}
              >
                <span className="mr-2">
                  {filter.field} - {filter.value}
                </span>
                <button
                  className={`${theme.mutedText} hover:${theme.text}`}
                  onClick={() => onRemoveFilter(index)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-4 py-2 rounded-md"
          onClick={onClearFilters}
        >
          Clear Filter
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Apply Filter
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
