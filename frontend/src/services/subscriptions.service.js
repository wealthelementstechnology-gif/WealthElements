import api from './api';

const subscriptionsService = {
  async getSubscriptions() {
    const res = await api.get('/subscriptions');
    return res.data.data;
  },
  async addSubscription(data) {
    const res = await api.post('/subscriptions', data);
    return res.data.data;
  },
  async confirmSubscription(id) {
    const res = await api.put(`/subscriptions/${id}/confirm`);
    return res.data.data;
  },
  async cancelSubscription(id) {
    const res = await api.put(`/subscriptions/${id}/cancel`);
    return res.data.data;
  },
};

export default subscriptionsService;
