import api from './api.js';

export const reportService = {
  get:      (projectId)        => api.get(`/projects/${projectId}/report`),
  generate: (projectId)        => api.post(`/projects/${projectId}/report`),
  save:     (projectId, report) => api.put(`/projects/${projectId}/report`, { report }),
  exportMarkdown: (projectId) => api.get(`/projects/${projectId}/report/export/markdown`, { responseType: 'blob' }),
  exportJson:     (projectId) => api.get(`/projects/${projectId}/report/export/json`, { responseType: 'blob' }),
};
