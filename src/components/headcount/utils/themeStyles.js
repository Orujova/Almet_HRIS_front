// src/components/headcount/utils/themeStyles.js - FIXED EXPORTS

/**
 * Global color mode management
 */
let COLOR_MODE = 'HIERARCHY';
let REFERENCE_DATA = null;

/**
 * Color mode listeners for real-time updates
 */
const COLOR_MODE_LISTENERS = new Set();

/**
 * Enhanced predefined color palette for automatic assignment
 */
const COLOR_PALETTE = [
  { primary: '#9333ea', light: '#a855f7', bg: '#faf5ff', bgDark: '#581c87' }, // purple
  { primary: '#2563eb', light: '#3b82f6', bg: '#eff6ff', bgDark: '#1e3a8a' }, // blue
  { primary: '#059669', light: '#10b981', bg: '#ecfdf5', bgDark: '#064e3b' }, // emerald
  { primary: '#0891b2', light: '#06b6d4', bg: '#ecfeff', bgDark: '#164e63' }, // cyan
  { primary: '#dc2626', light: '#ef4444', bg: '#fef2f2', bgDark: '#991b1b' }, // red
  { primary: '#ea580c', light: '#f97316', bg: '#fff7ed', bgDark: '#9a3412' }, // orange
  { primary: '#0d9488', light: '#14b8a6', bg: '#f0fdfa', bgDark: '#134e4a' }, // teal
  { primary: '#7c3aed', light: '#8b5cf6', bg: '#f5f3ff', bgDark: '#4c1d95' }, // violet
  { primary: '#db2777', light: '#ec4899', bg: '#fdf2f8', bgDark: '#831843' }, // pink
  { primary: '#16a34a', light: '#22c55e', bg: '#f0fdf4', bgDark: '#14532d' }, // green
  { primary: '#0369a1', light: '#0284c7', bg: '#f0f9ff', bgDark: '#0c4a6e' }, // sky
  { primary: '#ca8a04', light: '#eab308', bg: '#fefce8', bgDark: '#713f12' }, // yellow
];

/**
 * Default color configuration
 */
const DEFAULT_COLOR = {
  primary: '#6b7280',
  light: '#9ca3af',
  bg: '#f9fafb',
  bgDark: '#374151'
};

/**
 * Theme styles helper function
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
 * FIXED: Set reference data from API
 */
export const setReferenceData = (data) => {
  console.log('THEME: setReferenceData called with:', data);
  
  if (!data) {
    console.warn('THEME: No reference data provided');
    return;
  }
  
  REFERENCE_DATA = data;
  
  // Trigger color mode update to refresh colors
  notifyColorModeListeners(COLOR_MODE);
  
  // Dispatch global event for components using addEventListener
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('referenceDataUpdated', { 
      detail: { data, timestamp: Date.now() } 
    }));
  }
};

/**
 * FIXED: Color mode listener management - PROPER EXPORT
 */
export const addColorModeListener = (listener) => {
  console.log('THEME: Adding color mode listener, current listeners:', COLOR_MODE_LISTENERS.size);
  
  if (typeof listener !== 'function') {
    console.error('THEME: Listener must be a function:', typeof listener);
    return () => {}; // Return empty cleanup function
  }
  
  COLOR_MODE_LISTENERS.add(listener);
  console.log('THEME: Listener added, total listeners:', COLOR_MODE_LISTENERS.size);
  
  // Immediately call with current mode
  try {
    listener(COLOR_MODE);
  } catch (error) {
    console.error('THEME: Error calling new listener:', error);
  }
  
  // Return cleanup function
  const cleanup = () => {
    const wasDeleted = COLOR_MODE_LISTENERS.delete(listener);
    console.log('THEME: Listener removed:', wasDeleted);
  };
  
  return cleanup;
};

const notifyColorModeListeners = (mode) => {
  console.log('THEME: Notifying listeners with mode:', mode);
  COLOR_MODE_LISTENERS.forEach(listener => {
    try {
      listener(mode);
    } catch (error) {
      console.error('THEME: Error in listener:', error);
    }
  });
};


/**
 * Validate hex color
 */
const isValidHexColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

/**
 * Generate color variants from base color
 */
const generateColorVariants = (baseColor) => {
  if (!isValidHexColor(baseColor)) {
    return DEFAULT_COLOR;
  }
  
  try {
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const lightR = Math.min(255, r + 40);
    const lightG = Math.min(255, g + 40);
    const lightB = Math.min(255, b + 40);
    const light = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
    
    const bg = `rgba(${r}, ${g}, ${b}, 0.1)`;
    const bgDark = `rgba(${r}, ${g}, ${b}, 0.6)`;
    
    return {
      primary: baseColor,
      light: light,
      bg: bg,
      bgDark: bgDark
    };
  } catch (error) {
    console.error('THEME: Error generating color variants:', error);
    return DEFAULT_COLOR;
  }
};

// themeStyles.js-də getEmployeeColors funksiyasını debug ilə əvəzləyin

/**
 * MAIN FUNCTION: Get employee colors with enhanced debugging
 */
export const getEmployeeColors = (employee, darkMode = false) => {
  const mode = COLOR_MODE;
  let colorKey = '';
  
  console.log(`THEME: getEmployeeColors called for employee: "${employee?.name}"`, {
    mode,
    employee_data: {
      position_group_name: employee.position_group_name,
      department_name: employee.department_name,
      business_function_name: employee.business_function_name,
      status_name: employee.status_name
    }
  });
  
  // Determine the key based on mode and employee data
  switch (mode) {
    case 'HIERARCHY':
      colorKey = employee.position_group_name || 
                 employee.positionGroup || 
                 employee.position_group || 
                 'Unknown Position';
      break;
    case 'DEPARTMENT':
      colorKey = employee.department_name || 
                 employee.department || 
                 'Unknown Department';
      break;
    case 'BUSINESS_FUNCTION':
      colorKey = employee.business_function_name || 
                 employee.businessFunction || 
                 employee.business_function || 
                 'Unknown Function';
      break;
    case 'UNIT':
      colorKey = employee.unit_name || 
                 employee.unit || 
                 'Unknown Unit';
      break;
    case 'JOB_FUNCTION':
      colorKey = employee.job_function_name || 
                 employee.jobFunction || 
                 employee.job_function || 
                 'Unknown Job Function';
      break;
    case 'GRADE':
      colorKey = employee.grading_level || 
                 employee.grade || 
                 'No Grade';
      break;
    case 'STATUS':
      colorKey = employee.status_name || 
                 employee.status || 
                 'Unknown Status';
      break;
 
    default:
      colorKey = employee.position_group_name || 
                 employee.positionGroup || 
                 employee.position_group || 
                 'Default';
  }
  
  console.log(`THEME: Resolved color key: "${colorKey}" for mode: ${mode}`);
  
  // Build dynamic color config
  const colorConfig = buildDynamicColorConfig(mode);
  console.log(`THEME: Available color keys in config:`, Object.keys(colorConfig));
  
  // Try exact match first
  let selectedColor = colorConfig[colorKey];
  
  // If no exact match, try case-insensitive search
  if (!selectedColor) {
    const exactKey = Object.keys(colorConfig).find(key => 
      key.toLowerCase() === colorKey.toLowerCase()
    );
    if (exactKey) {
      selectedColor = colorConfig[exactKey];
      console.log(`THEME: Found case-insensitive match: "${exactKey}" for "${colorKey}"`);
    }
  }
  
  // If still no match, try partial matching
  if (!selectedColor) {
    const partialKey = Object.keys(colorConfig).find(key => 
      key.includes(colorKey) || colorKey.includes(key)
    );
    if (partialKey) {
      selectedColor = colorConfig[partialKey];
      console.log(`THEME: Found partial match: "${partialKey}" for "${colorKey}"`);
    }
  }
  
  // Use default if still no match
  if (!selectedColor) {
    selectedColor = DEFAULT_COLOR;
    console.warn(`THEME: No match found for "${colorKey}", using default color. Available keys:`, Object.keys(colorConfig));
  } else {
    console.log(`THEME: SUCCESS - Found color for "${colorKey}":`, selectedColor.primary);
  }

  return {
    borderColor: selectedColor.primary,
    backgroundColor: darkMode ? selectedColor.bgDark : selectedColor.bg,
    dotColor: selectedColor.light,
    textColor: darkMode ? '#ffffff' : '#000000',
    borderStyle: `4px solid ${selectedColor.primary}`,
    backgroundStyle: darkMode ? 
      `background-color: ${selectedColor.bgDark}` : 
      `background-color: ${selectedColor.bg}`,
    dotStyle: `background-color: ${selectedColor.light}`,
    avatarStyle: `background-color: ${selectedColor.primary}`
  };
};

// ENHANCED: buildDynamicColorConfig with more debug info
const buildDynamicColorConfig = (mode) => {
  console.log('THEME: buildDynamicColorConfig for mode:', mode);
  console.log('THEME: Reference data available:', !!REFERENCE_DATA);
  
  if (!REFERENCE_DATA) {
    console.warn('THEME: No reference data, using enhanced fallback');
    // Enhanced fallback with common employee values
    const enhancedFallback = {
     
      'Director': COLOR_PALETTE[1],
      'HOD': COLOR_PALETTE[2],
      'Manager': COLOR_PALETTE[3],
      'Senior Specialist': COLOR_PALETTE[4],
    
    };
    console.log('THEME: Using enhanced fallback with keys:', Object.keys(enhancedFallback));
    return enhancedFallback;
  }

  let sourceData = [];
  
  try {
    switch (mode) {
      case 'HIERARCHY':
        sourceData = REFERENCE_DATA.positionGroups || [];
        console.log('THEME: HIERARCHY mode - position groups:', sourceData.length);
        if (sourceData.length > 0) {
          console.log('THEME: Position group sample:', sourceData[0]);
        }
        break;
      case 'DEPARTMENT':
        sourceData = REFERENCE_DATA.departments || [];
        console.log('THEME: DEPARTMENT mode - departments:', sourceData.length);
        break;
      case 'BUSINESS_FUNCTION':
        sourceData = REFERENCE_DATA.businessFunctions || [];
        console.log('THEME: BUSINESS_FUNCTION mode - business functions:', sourceData.length);
        break;
      case 'UNIT':
        sourceData = REFERENCE_DATA.units || [];
        break;
      case 'JOB_FUNCTION':
        sourceData = REFERENCE_DATA.jobFunctions || [];
        break;
      case 'GRADE':
        sourceData = [];
        if (REFERENCE_DATA.positionGroups) {
          REFERENCE_DATA.positionGroups.forEach(pg => {
            if (pg.grading_levels) {
              pg.grading_levels.forEach(level => {
                sourceData.push({
                  name: level.code || level.display || level.name,
                  display_name: level.full_name || level.display || level.name,
                  id: `${pg.id}_${level.code}`,
                  color: level.color
                });
              });
            }
          });
        }
        break;
      case 'STATUS':
        sourceData = REFERENCE_DATA.employeeStatuses || [];
        break;
      case 'TAGS':
        sourceData = REFERENCE_DATA.employeeTags || [];
        break;
      default:
        sourceData = REFERENCE_DATA.positionGroups || [];
    }

    console.log('THEME: Source data count:', sourceData.length);
    
    if (sourceData.length === 0) {
      console.warn('THEME: No source data for mode:', mode, '- using mode-specific fallback');
      const fallbacks = {
        'HIERARCHY': {
          'Vice Chairman': COLOR_PALETTE[0],
          'Director': COLOR_PALETTE[1],
          'Manager': COLOR_PALETTE[2],
          'Unknown Position': COLOR_PALETTE[3]
        },
        'DEPARTMENT': {
          'OPERATIONS': COLOR_PALETTE[0],
          'Unknown Department': COLOR_PALETTE[1]
        },
        'BUSINESS_FUNCTION': {
          'Holding': COLOR_PALETTE[0],
          'Unknown Function': COLOR_PALETTE[1]
        }
      };
      return fallbacks[mode] || fallbacks['HIERARCHY'];
    }

    const colorConfig = {};
    
    sourceData.forEach((item, index) => {
      let primaryKey, secondaryKey;
      
      if (mode === 'HIERARCHY') {
        // CRITICAL: What employees actually use vs what API provides
        primaryKey = item.name; // This should be the employee field value
        secondaryKey = item.code; // This might be the API short code
      } else if (mode === 'DEPARTMENT') {
        primaryKey = item.name;
        secondaryKey = item.code;
      } else if (mode === 'BUSINESS_FUNCTION') {
        primaryKey = item.name;
        secondaryKey = item.code;
      } else {
        primaryKey = item.name || item.display_name || item.code || item.id;
        secondaryKey = null;
      }
      
      if (!primaryKey) {
        console.warn('THEME: Skipping item without primaryKey:', item);
        return;
      }
      
      let colors;
      if (item.color && isValidHexColor(item.color)) {
        colors = generateColorVariants(item.color);
        console.log(`THEME: Using API color for "${primaryKey}":`, item.color);
      } else {
        const paletteIndex = index % COLOR_PALETTE.length;
        colors = COLOR_PALETTE[paletteIndex];
        console.log(`THEME: Auto-assigned palette color for "${primaryKey}":`, colors.primary);
      }
      
      // Add both keys to config
      colorConfig[primaryKey] = colors;
      
      if (secondaryKey && secondaryKey !== primaryKey) {
        colorConfig[secondaryKey] = colors;
        console.log(`THEME: Added secondary mapping "${secondaryKey}" -> "${primaryKey}"`);
      }
      
      // Add display_name if different
      if (item.display_name && item.display_name !== primaryKey) {
        colorConfig[item.display_name] = colors;
        console.log(`THEME: Added display_name mapping "${item.display_name}" -> "${primaryKey}"`);
      }
    });

    console.log('THEME: Built config with', Object.keys(colorConfig).length, 'keys:', Object.keys(colorConfig));
    return colorConfig;
    
  } catch (error) {
    console.error('THEME: Error building config:', error);
    return {
      'Default': COLOR_PALETTE[0],
      'Vice Chairman': COLOR_PALETTE[0]
    };
  }
};

/**
 * FIXED: Set color mode with immediate notification
 */
export const setColorMode = (mode) => {
  console.log('THEME: Setting color mode to:', mode);
  COLOR_MODE = mode;
  
  // Notify listeners immediately
  notifyColorModeListeners(mode);
  
  // Dispatch custom event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('colorModeChanged', { 
      detail: { mode, timestamp: Date.now() } 
    }));
  }
};

/**
 * Get current color mode
 */
export const getCurrentColorMode = () => {
  return COLOR_MODE;
};

/**
 * Get hierarchy legend
 */
export const getHierarchyLegend = (darkMode) => {
  const mode = COLOR_MODE;
  const colorConfig = buildDynamicColorConfig(mode);
  
  return Object.entries(colorConfig).map(([key, colors]) => ({
    level: key,
    description: key,
    color: colors.light,
    colorHex: colors.primary
  }));
};

/**
 * Get available color modes
 */
export const getColorModes = () => {
  const availableModes = [
    { value: 'HIERARCHY', label: 'Position Hierarchy', description: 'Color by job level' }
  ];
  
  if (REFERENCE_DATA?.departments?.length > 0) {
    availableModes.push({ value: 'DEPARTMENT', label: 'Department', description: 'Color by department' });
  }
  
  if (REFERENCE_DATA?.businessFunctions?.length > 0) {
    availableModes.push({ value: 'BUSINESS_FUNCTION', label: 'Business Function', description: 'Color by business unit' });
  }
  
  if (REFERENCE_DATA?.employeeStatuses?.length > 0) {
    availableModes.push({ value: 'STATUS', label: 'Employment Status', description: 'Color by employment status' });
  }
  
  return availableModes;
};

/**
 * Initialize color system with reference data
 */
export const initializeColorSystem = (referenceData) => {
  console.log('THEME: Initializing color system');
  setReferenceData(referenceData);
  
  let selectedMode = 'HIERARCHY';
  if (referenceData?.positionGroups?.length > 0) {
    selectedMode = 'HIERARCHY';
  } else if (referenceData?.departments?.length > 0) {
    selectedMode = 'DEPARTMENT';
  }
  
  setColorMode(selectedMode);
};

/**
 * Backward compatibility functions
 */
export const getHierarchyColors = (positionGroup, darkMode) => {
  const employee = { position_group_name: positionGroup };
  const colors = getEmployeeColors(employee, darkMode);
  return {
    borderColor: `border-l-[${colors.borderColor}]`,
    bgColor: darkMode ? `hover:bg-[${colors.backgroundColor}]` : `hover:bg-[${colors.backgroundColor}]`,
    dotColor: `bg-[${colors.dotColor}]`
  };
};

export const getDepartmentColor = (department, darkMode) => {
  const employee = { department_name: department };
  const colors = getEmployeeColors(employee, darkMode);
  return darkMode ? `bg-[${colors.backgroundColor}]` : `bg-[${colors.backgroundColor}]`;
};