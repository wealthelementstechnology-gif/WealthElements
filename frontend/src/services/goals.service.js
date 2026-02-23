import api from './api';

const goalsService = {
  async getGoals() {
    const res = await api.get('/goals');
    return res.data.data;
  },
  async createGoal(data) {
    const res = await api.post('/goals', data);
    return res.data.data;
  },
  async updateGoal(id, data) {
    const res = await api.put(`/goals/${id}`, data);
    return res.data.data;
  },
  async deleteGoal(id) {
    const res = await api.delete(`/goals/${id}`);
    return res.data;
  },
};

export default goalsService;
