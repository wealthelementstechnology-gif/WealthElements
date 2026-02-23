import api from './api';

const profileService = {
  async getProfile() {
    const res = await api.get('/profile');
    return res.data.data;
  },
  async updateProfile(data) {
    const res = await api.put('/profile', data);
    return res.data.data;
  },
  async updateOnboarding(step, completed = false) {
    const res = await api.put('/profile/onboarding', { step, completed });
    return res.data.data;
  },
};

export default profileService;
