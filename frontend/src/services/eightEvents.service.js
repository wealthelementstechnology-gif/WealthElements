import api from './api';

const eightEventsService = {
  async savePlan(data) {
    const res = await api.post('/eight-events', data);
    return res.data.data;
  },

  async getPlan() {
    const res = await api.get('/eight-events');
    return res.data.data;
  },
};

export default eightEventsService;
