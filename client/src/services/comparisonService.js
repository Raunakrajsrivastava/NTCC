import api from './api.js';

export const comparisonService = {
  get: (projectId) => api.get(`/projects/${projectId}/compare`),
  compare: (projectId, presetIds) => api.post(`/projects/${projectId}/compare`, { presetIds }),
};
