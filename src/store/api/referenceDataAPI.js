// src/store/api/referenceDataAPI.js - Complete Reference Data API with all endpoints
import { apiService } from '../../services/api';

export const referenceDataAPI = {
  // ========================================
  // BUSINESS FUNCTIONS
  // ========================================
  getBusinessFunctions: () => apiService.getBusinessFunctions(),
  getBusinessFunction: (id) => apiService.getBusinessFunction(id),
  getBusinessFunctionDropdown: () => {
    // Transform regular response to dropdown format
    return apiService.getBusinessFunctions().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          code: item.code,
          employee_count: item.employee_count,
          is_active: item.is_active
        }))
      };
    });
  },
  createBusinessFunction: (data) => apiService.createBusinessFunction(data),
  updateBusinessFunction: (id, data) => apiService.updateBusinessFunction(id, data),
  partialUpdateBusinessFunction: (id, data) => apiService.partialUpdateBusinessFunction(id, data),
  deleteBusinessFunction: (id) => apiService.deleteBusinessFunction(id),

  // ========================================
  // DEPARTMENTS
  // ========================================
  getDepartments: (businessFunctionId) => {
    const params = businessFunctionId ? { business_function: businessFunctionId } : {};
    return apiService.getDepartments(params);
  },
  getDepartment: (id) => apiService.getDepartment(id),
  getDepartmentDropdown: (businessFunctionId) => {
    const params = businessFunctionId ? { business_function: businessFunctionId } : {};
    return apiService.getDepartments(params).then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: {
          results: data.map(item => ({
            value: item.id,
            label: item.name,
            business_function: item.business_function,
            business_function_name: item.business_function_name,
            business_function_code: item.business_function_code,
            employee_count: item.employee_count,
            unit_count: item.unit_count,
            head_of_department: item.head_of_department,
            head_name: item.head_name,
            is_active: item.is_active
          }))
        }
      };
    });
  },
  createDepartment: (data) => apiService.createDepartment(data),
  updateDepartment: (id, data) => apiService.updateDepartment(id, data),
  partialUpdateDepartment: (id, data) => apiService.partialUpdateDepartment(id, data),
  deleteDepartment: (id) => apiService.deleteDepartment(id),

  // ========================================
  // UNITS
  // ========================================
  getUnits: (departmentId) => {
    const params = departmentId ? { department: departmentId } : {};
    return apiService.getUnits(params);
  },
  getUnit: (id) => apiService.getUnit(id),
  getUnitDropdown: (departmentId) => {
    const params = departmentId ? { department: departmentId } : {};
    return apiService.getUnits(params).then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          department: item.department,
          department_name: item.department_name,
          business_function_name: item.business_function_name,
          employee_count: item.employee_count,
          unit_head: item.unit_head,
          unit_head_name: item.unit_head_name,
          is_active: item.is_active
        }))
      };
    });
  },
  createUnit: (data) => apiService.createUnit(data),
  updateUnit: (id, data) => apiService.updateUnit(id, data),
  partialUpdateUnit: (id, data) => apiService.partialUpdateUnit(id, data),
  deleteUnit: (id) => apiService.deleteUnit(id),

  // ========================================
  // JOB FUNCTIONS
  // ========================================
  getJobFunctions: () => apiService.getJobFunctions(),
  getJobFunction: (id) => apiService.getJobFunction(id),
  getJobFunctionDropdown: () => {
    return apiService.getJobFunctions().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          description: item.description,
          employee_count: item.employee_count,
          is_active: item.is_active
        }))
      };
    });
  },
  createJobFunction: (data) => apiService.createJobFunction(data),
  updateJobFunction: (id, data) => apiService.updateJobFunction(id, data),
  partialUpdateJobFunction: (id, data) => apiService.partialUpdateJobFunction(id, data),
  deleteJobFunction: (id) => apiService.deleteJobFunction(id),

  // ========================================
  // POSITION GROUPS
  // ========================================
  getPositionGroups: () => apiService.getPositionGroups(),
  getPositionGroup: (id) => apiService.getPositionGroup(id),
  getPositionGroupsByHierarchy: () => {
    return apiService.getPositionGroups({ ordering: 'hierarchy_level' });
  },
  getPositionGroupDropdown: () => {
    return apiService.getPositionGroups().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.display_name || item.name,
          name: item.name,
          hierarchy_level: item.hierarchy_level,
          grading_shorthand: item.grading_shorthand,
          grading_levels: item.grading_levels,
          employee_count: item.employee_count,
          is_active: item.is_active
        })).sort((a, b) => a.hierarchy_level - b.hierarchy_level)
      };
    });
  },
  getPositionGroupGradingLevels: (id) => apiService.getPositionGroupGradingLevels(id),
  createPositionGroup: (data) => apiService.createPositionGroup(data),
  updatePositionGroup: (id, data) => apiService.updatePositionGroup(id, data),
  partialUpdatePositionGroup: (id, data) => apiService.partialUpdatePositionGroup(id, data),
  deletePositionGroup: (id) => apiService.deletePositionGroup(id),

  // ========================================
  // EMPLOYEE STATUSES
  // ========================================
  getEmployeeStatuses: () => apiService.getEmployeeStatuses(),
  getEmployeeStatus: (id) => apiService.getEmployeeStatus(id),
  getEmployeeStatusDropdown: () => {
    return apiService.getEmployeeStatuses().then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          status_type: item.status_type,
          color: item.color,
          affects_headcount: item.affects_headcount,
          allows_org_chart: item.allows_org_chart,
          employee_count: item.employee_count,
          is_active: item.is_active,
          // Duration fields for different contract types
          onboarding_duration: item.onboarding_duration,
          probation_duration_3m: item.probation_duration_3m,
          probation_duration_6m: item.probation_duration_6m,
          probation_duration_1y: item.probation_duration_1y,
          probation_duration_2y: item.probation_duration_2y,
          probation_duration_3y: item.probation_duration_3y,
          probation_duration_permanent: item.probation_duration_permanent
        }))
      };
    });
  },
  createEmployeeStatus: (data) => apiService.createEmployeeStatus(data),
  updateEmployeeStatus: (id, data) => apiService.updateEmployeeStatus(id, data),
  partialUpdateEmployeeStatus: (id, data) => apiService.partialUpdateEmployeeStatus(id, data),
  deleteEmployeeStatus: (id) => apiService.deleteEmployeeStatus(id),

  // ========================================
  // EMPLOYEE TAGS
  // ========================================
  getEmployeeTags: (tagType) => {
    const params = tagType ? { tag_type: tagType } : {};
    return apiService.getEmployeeTags(params);
  },
  getEmployeeTag: (id) => apiService.getEmployeeTag(id),
  getEmployeeTagDropdown: (tagType) => {
    const params = tagType ? { tag_type: tagType } : {};
    return apiService.getEmployeeTags(params).then(response => {
      const data = response.data.results || response.data || [];
      return {
        ...response,
        data: data.map(item => ({
          value: item.id,
          label: item.name,
          tag_type: item.tag_type,
          color: item.color,
          employee_count: item.employee_count,
          is_active: item.is_active
        }))
      };
    });
  },
  createEmployeeTag: (data) => apiService.createEmployeeTag(data),
  updateEmployeeTag: (id, data) => apiService.updateEmployeeTag(id, data),
  partialUpdateEmployeeTag: (id, data) => apiService.partialUpdateEmployeeTag(id, data),
  deleteEmployeeTag: (id) => apiService.deleteEmployeeTag(id),

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  
  // Get all reference data at once for forms
  getAllReferenceData: async () => {
    try {
      const [
        businessFunctions,
        jobFunctions,
        positionGroups,
        employeeStatuses,
        employeeTags
      ] = await Promise.all([
        referenceDataAPI.getBusinessFunctionDropdown(),
        referenceDataAPI.getJobFunctionDropdown(),
        referenceDataAPI.getPositionGroupDropdown(),
        referenceDataAPI.getEmployeeStatusDropdown(),
        referenceDataAPI.getEmployeeTagDropdown()
      ]);

      return {
        businessFunctions: businessFunctions.data,
        jobFunctions: jobFunctions.data,
        positionGroups: positionGroups.data,
        employeeStatuses: employeeStatuses.data,
        employeeTags: employeeTags.data
      };
    } catch (error) {
      throw new Error('Failed to fetch reference data: ' + error.message);
    }
  },

  // Get hierarchical data (Business Function -> Department -> Unit)
  getHierarchicalData: async (businessFunctionId, departmentId) => {
    try {
      const promises = [referenceDataAPI.getBusinessFunctionDropdown()];
      
      if (businessFunctionId) {
        promises.push(referenceDataAPI.getDepartmentDropdown(businessFunctionId));
        
        if (departmentId) {
          promises.push(referenceDataAPI.getUnitDropdown(departmentId));
        }
      }

      const results = await Promise.all(promises);
      
      return {
        businessFunctions: results[0].data,
        departments: results[1]?.data.results || [],
        units: results[2]?.data || []
      };
    } catch (error) {
      throw new Error('Failed to fetch hierarchical data: ' + error.message);
    }
  },

  // Validate hierarchical relationships
  validateHierarchy: async (businessFunctionId, departmentId, unitId) => {
    try {
      const validations = {};

      // Validate business function
      if (businessFunctionId) {
        const bf = await referenceDataAPI.getBusinessFunction(businessFunctionId);
        validations.businessFunction = bf.data.is_active;
      }

      // Validate department belongs to business function
      if (departmentId) {
        const dept = await referenceDataAPI.getDepartment(departmentId);
        validations.department = dept.data.is_active && 
          (!businessFunctionId || dept.data.business_function === parseInt(businessFunctionId));
      }

      // Validate unit belongs to department
      if (unitId) {
        const unit = await referenceDataAPI.getUnit(unitId);
        validations.unit = unit.data.is_active && 
          (!departmentId || unit.data.department === parseInt(departmentId));
      }

      return validations;
    } catch (error) {
      throw new Error('Failed to validate hierarchy: ' + error.message);
    }
  },

  // Get entity counts for statistics
  getEntityCounts: async () => {
    try {
      const [
        businessFunctions,
        departments,
        units,
        jobFunctions,
        positionGroups,
        employeeStatuses,
        employeeTags
      ] = await Promise.all([
        referenceDataAPI.getBusinessFunctions(),
        referenceDataAPI.getDepartments(),
        referenceDataAPI.getUnits(),
        referenceDataAPI.getJobFunctions(),
        referenceDataAPI.getPositionGroups(),
        referenceDataAPI.getEmployeeStatuses(),
        referenceDataAPI.getEmployeeTags()
      ]);

      return {
        businessFunctions: businessFunctions.data.count || businessFunctions.data.length || 0,
        departments: departments.data.count || departments.data.length || 0,
        units: units.data.count || units.data.length || 0,
        jobFunctions: jobFunctions.data.count || jobFunctions.data.length || 0,
        positionGroups: positionGroups.data.count || positionGroups.data.length || 0,
        employeeStatuses: employeeStatuses.data.count || employeeStatuses.data.length || 0,
        employeeTags: employeeTags.data.count || employeeTags.data.length || 0
      };
    } catch (error) {
      throw new Error('Failed to fetch entity counts: ' + error.message);
    }
  },

  // Search across all reference data
  searchReferenceData: async (searchTerm, types = []) => {
    try {
      const searchPromises = [];
      const searchTypes = types.length > 0 ? types : [
        'businessFunctions', 'departments', 'units', 'jobFunctions', 
        'positionGroups', 'employeeStatuses', 'employeeTags'
      ];

      if (searchTypes.includes('businessFunctions')) {
        searchPromises.push(
          referenceDataAPI.getBusinessFunctions({ search: searchTerm })
            .then(res => ({ type: 'businessFunctions', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('departments')) {
        searchPromises.push(
          referenceDataAPI.getDepartments({ search: searchTerm })
            .then(res => ({ type: 'departments', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('units')) {
        searchPromises.push(
          referenceDataAPI.getUnits({ search: searchTerm })
            .then(res => ({ type: 'units', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('jobFunctions')) {
        searchPromises.push(
          referenceDataAPI.getJobFunctions({ search: searchTerm })
            .then(res => ({ type: 'jobFunctions', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('positionGroups')) {
        searchPromises.push(
          referenceDataAPI.getPositionGroups({ search: searchTerm })
            .then(res => ({ type: 'positionGroups', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('employeeStatuses')) {
        searchPromises.push(
          referenceDataAPI.getEmployeeStatuses({ search: searchTerm })
            .then(res => ({ type: 'employeeStatuses', data: res.data.results || res.data }))
        );
      }

      if (searchTypes.includes('employeeTags')) {
        searchPromises.push(
          referenceDataAPI.getEmployeeTags({ search: searchTerm })
            .then(res => ({ type: 'employeeTags', data: res.data.results || res.data }))
        );
      }

      const results = await Promise.all(searchPromises);
      
      return results.reduce((acc, result) => {
        acc[result.type] = result.data;
        return acc;
      }, {});
    } catch (error) {
      throw new Error('Failed to search reference data: ' + error.message);
    }
  }
};

export default referenceDataAPI;