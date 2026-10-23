import api from './api.js';

export const validationService = {
  get: (projectId) => api.get(`/projects/${projectId}/validate`),
  run: (projectId) => api.post(`/projects/${projectId}/validate`),
};
