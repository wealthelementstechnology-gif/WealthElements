import api from './api';

const getAlerts = async (status = 'PENDING') => {
  const response = await api.get(`/alerts?status=${status}`);
  return response.data;
};

const getAlertSummary = async () => {
  const response = await api.get('/alerts/summary');
  return response.data;
};

const dismissAlert = async (id) => {
  const response = await api.put(`/alerts/${id}/dismiss`);
  return response.data;
};

const actOnAlert = async (id) => {
  const response = await api.put(`/alerts/${id}/act`);
  return response.data;
};

const triggerFetch = async () => {
  const response = await api.post('/alerts/trigger-fetch');
  return response.data;
};

const getNewsFeed = async () => {
  const response = await api.get('/alerts/news-feed');
  return response.data;
};

export default { getAlerts, getAlertSummary, dismissAlert, actOnAlert, triggerFetch, getNewsFeed };
