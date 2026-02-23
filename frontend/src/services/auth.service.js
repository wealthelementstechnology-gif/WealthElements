import api from './api';

const authService = {
  // Register new user with phone + password
  async register(phone, password) {
    const res = await api.post('/auth/register', { phone, password });
    const { user, accessToken } = res.data.data;
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    return { user, accessToken };
  },

  // Login with phone + password
  async login(phone, password) {
    const res = await api.post('/auth/login', { phone, password });
    const { user, accessToken } = res.data.data;
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    return { user, accessToken };
  },

  // Get current user profile
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  // Logout
  async logout() {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
  },
};

export default authService;
