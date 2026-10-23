import api from './api.js';

export const requirementService = {
  getRequirements: (projectId) => api.get(`/projects/${projectId}/requirements`),
  saveRequirements: (projectId, data) => api.post(`/projects/${projectId}/requirements`, data),
  updateRequirements: (projectId, data) => api.put(`/projects/${projectId}/requirements`, data),
};
