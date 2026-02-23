import api from './api';

const transactionsService = {
  async getTransactions(filters = {}) {
    const res = await api.get('/transactions', { params: filters });
    return res.data.data;
  },
  async getMonthlySummary(month, year) {
    const res = await api.get('/transactions/summary', { params: { month, year } });
    return res.data.data;
  },
  async getSpendingTrend() {
    const res = await api.get('/transactions/trend');
    return res.data.data;
  },
  async addTransaction(data) {
    const res = await api.post('/transactions', data);
    return res.data.data;
  },
  async updateCategory(id, category) {
    const res = await api.put(`/transactions/${id}/category`, { category });
    return res.data.data;
  },
};

export default transactionsService;
