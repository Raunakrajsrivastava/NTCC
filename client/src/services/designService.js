import api from './api.js';

export const designService = {
  getHLD: (projectId) => api.get(`/projects/${projectId}/design/hld`),
  generateHLD: (projectId) => api.post(`/projects/${projectId}/design/hld`),
  getLLD: (projectId) => api.get(`/projects/${projectId}/design/lld`),
  generateLLD: (projectId) => api.post(`/projects/${projectId}/design/lld`),
};
