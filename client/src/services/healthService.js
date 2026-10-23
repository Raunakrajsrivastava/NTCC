import api from './api';

export const fetchHealthStatus = async () => {
  return await api.get('/health');
};
