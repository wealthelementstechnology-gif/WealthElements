import api from './api';

const accountsService = {
  async getAccounts() {
    const res = await api.get('/accounts');
    return res.data.data;
  },
  async addAccount(data) {
    const res = await api.post('/accounts', data);
    return res.data.data;
  },
  async updateAccount(id, data) {
    const res = await api.put(`/accounts/${id}`, data);
    return res.data.data;
  },
  async deleteAccount(id) {
    const res = await api.delete(`/accounts/${id}`);
    return res.data;
  },
};

export default accountsService;
