// src/store/api/referenceDataAPI.js
import { apiService } from '../../services/api';

export const referenceDataAPI = {
  // Business Functions
  getBusinessFunctions: () => apiService.get('/business-functions/'),
  getBusinessFunctionDropdown: () => apiService.get('/business-functions/dropdown_options/'),
  createBusinessFunction: (data) => apiService.post('/business-functions/', data),
  updateBusinessFunction: (id, data) => apiService.put(`/business-functions/${id}/`, data),
  deleteBusinessFunction: (id) => apiService.delete(`/business-functions/${id}/`),

  // Departments
  getDepartments: (businessFunctionId) => {
    const params = businessFunctionId ? `?business_function=${businessFunctionId}` : '';
    return apiService.get(`/departments/${params}`);
  },
  getDepartmentDropdown: (businessFunctionId) => {
    const params = businessFunctionId ? `?business_function=${businessFunctionId}` : '';
    return apiService.get(`/departments/dropdown_options/${params}`);
  },
  createDepartment: (data) => apiService.post('/departments/', data),
  updateDepartment: (id, data) => apiService.put(`/departments/${id}/`, data),
  deleteDepartment: (id) => apiService.delete(`/departments/${id}/`),

  // Units
  getUnits: (departmentId) => {
    const params = departmentId ? `?department=${departmentId}` : '';
    return apiService.get(`/units/${params}`);
  },
  getUnitDropdown: (departmentId) => {
    const params = departmentId ? `?department=${departmentId}` : '';
    return apiService.get(`/units/dropdown_options/${params}`);
  },
  createUnit: (data) => apiService.post('/units/', data),
  updateUnit: (id, data) => apiService.put(`/units/${id}/`, data),
  deleteUnit: (id) => apiService.delete(`/units/${id}/`),

  // Job Functions
  getJobFunctions: () => apiService.get('/job-functions/'),
  getJobFunctionDropdown: () => apiService.get('/job-functions/dropdown_options/'),
  createJobFunction: (data) => apiService.post('/job-functions/', data),
  updateJobFunction: (id, data) => apiService.put(`/job-functions/${id}/`, data),
  deleteJobFunction: (id) => apiService.delete(`/job-functions/${id}/`),

  // Position Groups
  getPositionGroups: () => apiService.get('/position-groups/'),
  getPositionGroupsByHierarchy: () => apiService.get('/position-groups/by_hierarchy/'),
  getPositionGroupDropdown: () => apiService.get('/position-groups/dropdown_options/'),
  createPositionGroup: (data) => apiService.post('/position-groups/', data),
  updatePositionGroup: (id, data) => apiService.put(`/position-groups/${id}/`, data),
  deletePositionGroup: (id) => apiService.delete(`/position-groups/${id}/`),

  // Employee Statuses
  getEmployeeStatuses: () => apiService.get('/employee-statuses/'),
  getEmployeeStatusDropdown: () => apiService.get('/employee-statuses/dropdown_options/'),
  createEmployeeStatus: (data) => apiService.post('/employee-statuses/', data),
  updateEmployeeStatus: (id, data) => apiService.put(`/employee-statuses/${id}/`, data),
  deleteEmployeeStatus: (id) => apiService.delete(`/employee-statuses/${id}/`),

  // Employee Tags
  getEmployeeTags: (tagType) => {
    const params = tagType ? `?tag_type=${tagType}` : '';
    return apiService.get(`/employee-tags/${params}`);
  },
  getEmployeeTagDropdown: (tagType) => {
    const params = tagType ? `?tag_type=${tagType}` : '';
    return apiService.get(`/employee-tags/dropdown_options/${params}`);
  },
  createEmployeeTag: (data) => apiService.post('/employee-tags/', data),
  updateEmployeeTag: (id, data) => apiService.put(`/employee-tags/${id}/`, data),
  deleteEmployeeTag: (id) => apiService.delete(`/employee-tags/${id}/`),
};