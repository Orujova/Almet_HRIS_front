// services/competencyApi.js
import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Token management utility
const TokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("accessToken");
    }
    return null;
  },

  setAccessToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("accessToken", token);
    }
  },

  removeTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      // Redirect to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Skill Groups API
export const skillGroupsApi = {
  // Get all skill groups
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/competency/skill-groups/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching skill groups:', error);
      throw error;
    }
  },

  // Get single skill group with skills
  getById: async (id) => {
    try {
      const response = await api.get(`/competency/skill-groups/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill group:', error);
      throw error;
    }
  },

  // Create new skill group
  create: async (data) => {
    try {
      const response = await api.post('/competency/skill-groups/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating skill group:', error);
      throw error;
    }
  },

  // Update skill group
  update: async (id, data) => {
    try {
      const response = await api.put(`/competency/skill-groups/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating skill group:', error);
      throw error;
    }
  },

  // Delete skill group
  delete: async (id) => {
    try {
      await api.delete(`/competency/skill-groups/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting skill group:', error);
      throw error;
    }
  },

  // Get skills for a specific group
  getSkills: async (id) => {
    try {
      const response = await api.get(`/competency/skill-groups/${id}/skills/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group skills:', error);
      throw error;
    }
  }
};

// Skills API
export const skillsApi = {
  // Get all skills
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/competency/skills/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  },

  // Get single skill
  getById: async (id) => {
    try {
      const response = await api.get(`/competency/skills/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill:', error);
      throw error;
    }
  },

  // Create new skill
  create: async (data) => {
    try {
      const response = await api.post('/competency/skills/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  },

  // Update skill
  update: async (id, data) => {
    try {
      const response = await api.put(`/competency/skills/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  },

  // Delete skill
  delete: async (id) => {
    try {
      await api.delete(`/competency/skills/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  }
};

// Behavioral Groups API
export const behavioralGroupsApi = {
  // Get all behavioral groups
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/competency/behavioral-groups/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching behavioral groups:', error);
      throw error;
    }
  },

  // Get single behavioral group with competencies
  getById: async (id) => {
    try {
      const response = await api.get(`/competency/behavioral-groups/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching behavioral group:', error);
      throw error;
    }
  },

  // Create new behavioral group
  create: async (data) => {
    try {
      const response = await api.post('/competency/behavioral-groups/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating behavioral group:', error);
      throw error;
    }
  },

  // Update behavioral group
  update: async (id, data) => {
    try {
      const response = await api.put(`/competency/behavioral-groups/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating behavioral group:', error);
      throw error;
    }
  },

  // Delete behavioral group
  delete: async (id) => {
    try {
      await api.delete(`/competency/behavioral-groups/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting behavioral group:', error);
      throw error;
    }
  },

  // Get competencies for a specific group
  getCompetencies: async (id) => {
    try {
      const response = await api.get(`/competency/behavioral-groups/${id}/competencies/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group competencies:', error);
      throw error;
    }
  }
};

// Behavioral Competencies API
export const behavioralCompetenciesApi = {
  // Get all behavioral competencies
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/competency/behavioral-competencies/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching behavioral competencies:', error);
      throw error;
    }
  },

  // Get single behavioral competency
  getById: async (id) => {
    try {
      const response = await api.get(`/competency/behavioral-competencies/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching behavioral competency:', error);
      throw error;
    }
  },

  // Create new behavioral competency
  create: async (data) => {
    try {
      const response = await api.post('/competency/behavioral-competencies/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating behavioral competency:', error);
      throw error;
    }
  },

  // Update behavioral competency
  update: async (id, data) => {
    try {
      const response = await api.put(`/competency/behavioral-competencies/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating behavioral competency:', error);
      throw error;
    }
  },

  // Delete behavioral competency
  delete: async (id) => {
    try {
      await api.delete(`/competency/behavioral-competencies/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting behavioral competency:', error);
      throw error;
    }
  }
};

// Combined API service
export const competencyApi = {
  skillGroups: skillGroupsApi,
  skills: skillsApi,
  behavioralGroups: behavioralGroupsApi,
  behavioralCompetencies: behavioralCompetenciesApi
};

export default competencyApi;