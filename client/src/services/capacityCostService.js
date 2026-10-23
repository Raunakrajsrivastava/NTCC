import api from './api.js';

export const capacityCostService = {
  get: (projectId) => api.get(`/projects/${projectId}/capacity-cost`),
};
