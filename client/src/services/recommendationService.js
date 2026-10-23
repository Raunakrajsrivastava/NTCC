import api from './api.js';

export const recommendationService = {
  generate: (projectId, weights = null) =>
    api.post(`/projects/${projectId}/recommendations/generate`, weights ? { weights } : {}),
  get: (projectId) =>
    api.get(`/projects/${projectId}/recommendations`),
  recalculate: (projectId, weights) =>
    api.post(`/projects/${projectId}/recommendations/recalculate`, { weights }),
};
