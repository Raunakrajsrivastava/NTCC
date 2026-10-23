import api from './api.js';

export const aiService = {
  get: (projectId) => api.get(`/projects/${projectId}/explain`),
  explain: (projectId) => api.post(`/projects/${projectId}/explain`),
};
