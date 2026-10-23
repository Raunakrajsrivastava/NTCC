import api from './api.js';

export const traceabilityService = {
  get: (projectId) => api.get(`/projects/${projectId}/traceability`),
  createADR: (projectId, data) => api.post(`/projects/${projectId}/traceability/adrs`, data),
  updateADR: (projectId, adrId, data) => api.put(`/projects/${projectId}/traceability/adrs/${adrId}`, data),
};
