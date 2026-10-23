import api from './api.js';

export const diagramService = {
  get: (projectId) => api.get(`/projects/${projectId}/diagrams`),
  generate: (projectId) => api.post(`/projects/${projectId}/diagrams`),
};
