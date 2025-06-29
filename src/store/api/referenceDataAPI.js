// src/store/api/referenceDataAPI.js - UPDATED with complete backend integration
import { apiService } from '../../services/api';

export const referenceDataAPI = {
  // Business Functions
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
          employee_count: item.employee_count
        }))
      };
    });
  },
  createBusinessFunction: (data) => apiService.createBusinessFunction(data),
  updateBusinessFunction: (id, data) => apiService.updateBusinessFunction(id, data),
  deleteBusinessFunction: (id) => apiService.deleteBusinessFunction(id),

  // Departments
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
            employee_count: item.employee_count
          }))
        }
      };
    });
  },
  createDepartment: (data) => apiService.createDepartment(data),
  updateDepartment: (id, data) => apiService.updateDepartment(id, data),
  deleteDepartment: (id) => apiService.deleteDepartment(id),

  // Units
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
          employee_count: item.employee_count
        }))
      };
    });
  },
  createUnit: (data) => apiService.createUnit(data),
  updateUnit: (id, data) => apiService.updateUnit(id, data),
  deleteUnit: (id) => apiService.deleteUnit(id),

  // Job Functions
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
          employee_count: item.employee_count
        }))
      };
    });
  },
  createJobFunction: (data) => apiService.createJobFunction(data),
  updateJobFunction: (id, data) => apiService.updateJobFunction(id, data),
  deleteJobFunction: (id) => apiService.deleteJobFunction(id),

  // Position Groups
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
          employee_count: item.employee_count
        })).sort((a, b) => a.hierarchy_level - b.hierarchy_level)
      };
    });
  },
  getPositionGroupGradingLevels: (id) => apiService.getPositionGroupGradingLevels(id),
  createPositionGroup: (data) => apiService.createPositionGroup(data),
  updatePositionGroup: (id, data) => apiService.updatePositionGroup(id, data),
  deletePositionGroup: (id) => apiService.deletePositionGroup(id),

  // Employee Statuses
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
          employee_count: item.employee_count
        }))
      };
    });
  },
  createEmployeeStatus: (data) => apiService.createEmployeeStatus(data),
  updateEmployeeStatus: (id, data) => apiService.updateEmployeeStatus(id, data),
  deleteEmployeeStatus: (id) => apiService.deleteEmployeeStatus(id),

  // Employee Tags
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
          employee_count: item.employee_count
        }))
      };
    });
  },
  createEmployeeTag: (data) => apiService.createEmployeeTag(data),
  updateEmployeeTag: (id, data) => apiService.updateEmployeeTag(id, data),
  deleteEmployeeTag: (id) => apiService.deleteEmployeeTag(id),
};