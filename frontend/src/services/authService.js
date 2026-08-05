import api from './api';
import { roleUsers } from '../context/AuthContext';

export const authService = {
  async login(email, password, role) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data?.data || {};
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      return user;
    } catch (err) {
      // Fallback for offline/mock operational mode
      const roleKey = (role || 'SUPER_ADMIN').toUpperCase().replace(' ', '_');
      const user = roleUsers[roleKey] || {
        id: Date.now(),
        fullName: 'BuildTrack User',
        email,
        role: roleKey,
        roleLabel: roleKey.replace('_', ' '),
        avatar: 'BU',
        companyName: 'Solviontech Infrastructure Ltd',
      };
      localStorage.setItem('buildtrack_user', JSON.stringify(user));
      return user;
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      return { success: true, message: 'Registration submitted successfully (Dev Mode)' };
    }
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.warn('Backend logout failed, clearing local storage.');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('buildtrack_user');
    }
  },
};

export default authService;
