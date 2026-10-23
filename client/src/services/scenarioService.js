import api from './api.js';

export const scenarioService = {
  get: (projectId) => api.get(`/projects/${projectId}/scenarios`),
  create: (projectId, data) => api.post(`/projects/${projectId}/scenarios`, data),
  delete: (projectId, scenarioId) => api.delete(`/projects/${projectId}/scenarios/${scenarioId}`),
};
