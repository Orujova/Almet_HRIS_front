// src/utils/employeeSorting.js

/**
 * Əməkdaşların sıralanması üçün funksiya
 * @param {Array} employees - Əməkdaşlar siyahısı
 * @param {Array} sorting - Sıralama parametrləri
 * @returns {Array} - Sıralanmış əməkdaşlar siyahısı
 */
export const sortEmployees = (employees, sorting) => {
  if (!sorting || sorting.length === 0) {
    // Default sıralama - adına görə artma sırasında
    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
  }

  return [...employees].sort((a, b) => {
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
};

/**
 * Yeni sıralama parametrinin əlavə edilməsi/yenilənməsi
 * @param {Array} currentSorting - Mövcud sıralama parametrləri
 * @param {string} field - Sıralanacaq sahə
 * @returns {Array} - Yenilənmiş sıralama parametrləri
 */
export const updateSorting = (currentSorting, field) => {
  const currentSortIndex = currentSorting.findIndex((s) => s.field === field);

  if (currentSortIndex >= 0) {
    const currentSort = currentSorting[currentSortIndex];
    if (currentSort.direction === "asc") {
      const newSorting = [...currentSorting];
      newSorting[currentSortIndex] = { field, direction: "desc" };
      return newSorting;
    } else {
      const newSorting = currentSorting.filter((_, index) => index !== currentSortIndex);
      return newSorting.length ? newSorting : [{ field: "name", direction: "asc" }];
    }
  } else {
    if (currentSorting.length >= 3) {
      return [...currentSorting.slice(1), { field, direction: "asc" }];
    } else {
      return [...currentSorting, { field, direction: "asc" }];
    }
  }
};

/**
 * Müəyyən bir sahənin sıralama istiqamətini tapmaq üçün funksiya
 * @param {Array} sorting - Sıralama parametrləri
 * @param {string} field - Sıralanacaq sahə
 * @returns {string|null} - Sıralama istiqaməti (asc, desc) və ya null
 */
export const getSortDirection = (sorting, field) => {
  const sort = sorting.find((s) => s.field === field);
  return sort ? sort.direction : null;
};