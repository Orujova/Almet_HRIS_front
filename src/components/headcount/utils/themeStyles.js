// src/utils/themeStyles.js

/**
 * Global color mode management
 */
let COLOR_MODE = 'HIERARCHY';

/**
 * Üslubların hazırlanması üçün funksiya
 * @param {boolean} darkMode - Qaranlıq rejim fəaldır ya yox
 * @returns {Object} - Üslublar obyekti
 */
export const getThemeStyles = (darkMode) => {
  return {
    bgCard: darkMode ? "bg-gray-800" : "bg-white",
    textPrimary: darkMode ? "text-white" : "text-gray-900",
    textSecondary: darkMode ? "text-gray-300" : "text-gray-700",
    textMuted: darkMode ? "text-gray-400" : "text-gray-500",
    borderColor: darkMode ? "border-gray-700" : "border-gray-200",
    inputBg: darkMode ? "bg-gray-700" : "bg-gray-100",
    btnPrimary: darkMode
      ? "bg-almet-sapphire hover:bg-almet-astral"
      : "bg-almet-sapphire hover:bg-almet-astral",
    btnSecondary: darkMode
      ? "bg-gray-700 hover:bg-gray-600"
      : "bg-gray-200 hover:bg-gray-300",
    hoverBg: darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100",
    shadowClass: darkMode ? "" : "shadow",
    theadBg: darkMode ? "bg-gray-700" : "bg-gray-50",
  };
};

/**
 * Rəng konfigurasiya obyekti - bunu dəyişməklə bütün rənglər dəyişir
 */
export const COLOR_CONFIG = {
  // Hierarchy rəngləri
  HIERARCHY: {
    'VC': { 
      primary: '#9333ea', // purple-600
      light: '#a855f7',   // purple-500
      bg: '#faf5ff',      // purple-50
      bgDark: '#581c87'   // purple-900
    },
    'DIRECTOR': {
      primary: '#2563eb', // blue-600
      light: '#3b82f6',   // blue-500
      bg: '#eff6ff',      // blue-50
      bgDark: '#1e3a8a'   // blue-900
    },
    'MANAGER': {
      primary: '#059669', // emerald-600
      light: '#10b981',   // emerald-500
      bg: '#ecfdf5',      // emerald-50
      bgDark: '#064e3b'   // emerald-900
    },
    'HEAD OF DEPARTMENT': {
      primary: '#0891b2', // cyan-600
      light: '#06b6d4',   // cyan-500
      bg: '#ecfeff',      // cyan-50
      bgDark: '#164e63'   // cyan-900
    },
    'SENIOR SPECIALIST': {
      primary: '#ca8a04', // yellow-600
      light: '#eab308',   // yellow-500
      bg: '#fefce8',      // yellow-50
      bgDark: '#713f12'   // yellow-900
    },
    'SPECIALIST': {
      primary: '#ea580c', // orange-600
      light: '#f97316',   // orange-500
      bg: '#fff7ed',      // orange-50
      bgDark: '#9a3412'   // orange-900
    },
    'JUNIOR SPECIALIST': {
      primary: '#dc2626', // red-600
      light: '#ef4444',   // red-500
      bg: '#fef2f2',      // red-50
      bgDark: '#991b1b'   // red-900
    },
    'BLUE COLLAR': {
      primary: '#0d9488', // teal-600
      light: '#14b8a6',   // teal-500
      bg: '#f0fdfa',      // teal-50
      bgDark: '#134e4a'   // teal-900
    }
  },
  
  // Departament rəngləri
  DEPARTMENT: {
    'BUSINESS DEVELOPMENT': {
      primary: '#2563eb',
      light: '#3b82f6',
      bg: '#eff6ff',
      bgDark: '#1e3a8a'
    },
    'FINANCE': {
      primary: '#059669',
      light: '#10b981',
      bg: '#ecfdf5',
      bgDark: '#064e3b'
    },
    'COMPLIANCE': {
      primary: '#dc2626',
      light: '#ef4444',
      bg: '#fef2f2',
      bgDark: '#991b1b'
    },
    'HR': {
      primary: '#9333ea',
      light: '#a855f7',
      bg: '#faf5ff',
      bgDark: '#581c87'
    },
    'ADMINISTRATIVE': {
      primary: '#ca8a04',
      light: '#eab308',
      bg: '#fefce8',
      bgDark: '#713f12'
    },
    'OPERATIONS': {
      primary: '#ea580c',
      light: '#f97316',
      bg: '#fff7ed',
      bgDark: '#9a3412'
    },
    'PROJECTS MANAGEMENT': {
      primary: '#0d9488',
      light: '#14b8a6',
      bg: '#f0fdfa',
      bgDark: '#134e4a'
    },
    'TRADE': {
      primary: '#7c3aed',
      light: '#8b5cf6',
      bg: '#f5f3ff',
      bgDark: '#4c1d95'
    },
    'STOCK SALES': {
      primary: '#db2777',
      light: '#ec4899',
      bg: '#fdf2f8',
      bgDark: '#831843'
    }
  },
  
  // Business Function rəngləri
  BUSINESS_FUNCTION: {
    'Holding': {
      primary: '#2563eb',
      light: '#3b82f6',
      bg: '#eff6ff',
      bgDark: '#1e3a8a'
    },
    'Trading': {
      primary: '#059669',
      light: '#10b981',
      bg: '#ecfdf5',
      bgDark: '#064e3b'
    },
    'Georgia': {
      primary: '#dc2626',
      light: '#ef4444',
      bg: '#fef2f2',
      bgDark: '#991b1b'
    },
    'UK': {
      primary: '#9333ea',
      light: '#a855f7',
      bg: '#faf5ff',
      bgDark: '#581c87'
    }
  },
  
  // Grade rəngləri
  GRADE: {
    '1': {
      primary: '#dc2626', // red-600
      light: '#ef4444',
      bg: '#fef2f2',
      bgDark: '#991b1b'
    },
    '2': {
      primary: '#ea580c', // orange-600
      light: '#f97316',
      bg: '#fff7ed',
      bgDark: '#9a3412'
    },
    '3': {
      primary: '#ca8a04', // yellow-600
      light: '#eab308',
      bg: '#fefce8',
      bgDark: '#713f12'
    },
    '4': {
      primary: '#059669', // emerald-600
      light: '#10b981',
      bg: '#ecfdf5',
      bgDark: '#064e3b'
    },
    '5': {
      primary: '#0891b2', // cyan-600
      light: '#06b6d4',
      bg: '#ecfeff',
      bgDark: '#164e63'
    },
    '6': {
      primary: '#2563eb', // blue-600
      light: '#3b82f6',
      bg: '#eff6ff',
      bgDark: '#1e3a8a'
    },
    '7': {
      primary: '#7c3aed', // violet-600
      light: '#8b5cf6',
      bg: '#f5f3ff',
      bgDark: '#4c1d95'
    },
    '8': {
      primary: '#9333ea', // purple-600
      light: '#a855f7',
      bg: '#faf5ff',
      bgDark: '#581c87'
    }
  },
  
  // Default rəng
  DEFAULT: {
    primary: '#6b7280',
    light: '#9ca3af',
    bg: '#f9fafb',
    bgDark: '#374151'
  }
};

/**
 * Employee üçün rəng əldə etmək
 * @param {Object} employee - Employee obyekti
 * @param {boolean} darkMode - Dark mode
 * @returns {Object} - Rəng obyekti
 */
export const getEmployeeColors = (employee, darkMode = false) => {
  const mode = COLOR_MODE;
  let colorKey = '';
  
  switch (mode) {
    case 'HIERARCHY':
      colorKey = employee.positionGroup;
      break;
    case 'DEPARTMENT':
      colorKey = employee.department;
      break;
    case 'BUSINESS_FUNCTION':
      colorKey = employee.businessFunction;
      break;
    case 'GRADE':
      colorKey = employee.grade;
      break;
    default:
      colorKey = employee.positionGroup;
  }
  
  const colorConfig = COLOR_CONFIG[mode];
  const selectedColor = colorConfig?.[colorKey] || COLOR_CONFIG.DEFAULT;
  
  return {
    borderColor: selectedColor.primary,
    backgroundColor: darkMode ? selectedColor.bgDark : selectedColor.bg,
    dotColor: selectedColor.light,
    textColor: darkMode ? '#ffffff' : '#000000',
    
    // CSS inline styles (Tailwind-dən asılı olmayan)
    borderStyle: `4px solid ${selectedColor.primary}`,
    backgroundStyle: darkMode ? 
      `background-color: ${selectedColor.bgDark}20` : 
      `background-color: ${selectedColor.bg}40`,
    dotStyle: `background-color: ${selectedColor.light}`,
    avatarStyle: `background-color: ${selectedColor.primary}`
  };
};

/**
 * Hierarchy əsaslı rəngləmə sistemi (köhnə funksiya - geriyə uyğunluq üçün)
 * @param {string} positionGroup - Position Group adı
 * @param {boolean} darkMode - Qaranlıq rejim
 * @returns {Object} - Rəng sinifləri
 */
export const getHierarchyColors = (positionGroup, darkMode) => {
  const employee = { positionGroup };
  const colors = getEmployeeColors(employee, darkMode);
  
  return {
    borderColor: `border-l-[${colors.borderColor}]`,
    bgColor: darkMode ? `hover:bg-[${colors.backgroundColor}]` : `hover:bg-[${colors.backgroundColor}]`,
    dotColor: `bg-[${colors.dotColor}]`
  };
};

/**
 * Departament üçün arxa fon rənginin hazırlanması (köhnə funksiya)
 * @param {string} department - Departament adı
 * @param {boolean} darkMode - Qaranlıq rejim
 * @returns {string} - Background class
 */
export const getDepartmentColor = (department, darkMode) => {
  const employee = { department };
  const colors = getEmployeeColors(employee, darkMode);
  return darkMode ? `bg-[${colors.backgroundColor}]` : `bg-[${colors.backgroundColor}]`;
};

/**
 * Rəng sistemini dəyişmək üçün funksiya
 * @param {string} mode - 'HIERARCHY', 'DEPARTMENT', 'BUSINESS_FUNCTION', 'GRADE'
 */
export const setColorMode = (mode) => {
  COLOR_MODE = mode;
};

/**
 * Cari color mode-u əldə etmək
 */
export const getCurrentColorMode = () => COLOR_MODE;

/**
 * Hierarchy Legend - rəng açıqlamaları
 * @param {boolean} darkMode - Dark mode
 * @returns {Array} - Legend məlumatları
 */
export const getHierarchyLegend = (darkMode) => {
  const mode = COLOR_MODE;
  const config = COLOR_CONFIG[mode] || COLOR_CONFIG.HIERARCHY;
  
  return Object.entries(config).map(([key, colors]) => ({
    level: key,
    description: getLevelDescription(key, mode),
    color: colors.light,
    colorHex: colors.light
  }));
};

/**
 * Səviyyə açıqlaması əldə etmək
 * @param {string} key - Açar
 * @param {string} mode - Rejim
 * @returns {string} - Açıqlama
 */
const getLevelDescription = (key, mode) => {
  const descriptions = {
    HIERARCHY: {
      'VC': 'Vice Chairman',
      'DIRECTOR': 'Director Level',
      'MANAGER': 'Manager Level',
      'HEAD OF DEPARTMENT': 'Head of Department',
      'SENIOR SPECIALIST': 'Senior Specialist',
      'SPECIALIST': 'Specialist',
      'JUNIOR SPECIALIST': 'Junior Specialist',
      'BLUE COLLAR': 'Blue Collar Worker'
    },
    DEPARTMENT: {
      'BUSINESS DEVELOPMENT': 'Business Development',
      'FINANCE': 'Finance Department',
      'COMPLIANCE': 'Compliance Department',
      'HR': 'Human Resources',
      'ADMINISTRATIVE': 'Administrative',
      'OPERATIONS': 'Operations',
      'PROJECTS MANAGEMENT': 'Projects Management',
      'TRADE': 'Trade Department',
      'STOCK SALES': 'Stock Sales'
    },
    BUSINESS_FUNCTION: {
      'Holding': 'Holding Company',
      'Trading': 'Trading Division',
      'Georgia': 'Georgia Operations',
      'UK': 'UK Operations'
    },
    GRADE: {
      '1': 'Grade 1 - Entry Level',
      '2': 'Grade 2 - Junior',
      '3': 'Grade 3 - Standard',
      '4': 'Grade 4 - Experienced',
      '5': 'Grade 5 - Senior',
      '6': 'Grade 6 - Principal',
      '7': 'Grade 7 - Director',
      '8': 'Grade 8 - Executive'
    }
  };
  
  return descriptions[mode]?.[key] || key;
};

/**
 * Rəng rejimləri siyahısı
 */
export const getColorModes = () => [
  { value: 'HIERARCHY', label: 'Position Hierarchy', description: 'Color by job level' },
  { value: 'DEPARTMENT', label: 'Department', description: 'Color by department' },
  { value: 'BUSINESS_FUNCTION', label: 'Business Function', description: 'Color by business unit' },
  { value: 'GRADE', label: 'Grade Level', description: 'Color by grade level' }
];