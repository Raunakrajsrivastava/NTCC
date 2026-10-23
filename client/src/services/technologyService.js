import api from './api.js';

export const technologyService = {
  getTechnologies: (params = {}) => api.get('/technologies', { params }),
  getTechnologyById: (id) => api.get(`/technologies/${id}`),
};
