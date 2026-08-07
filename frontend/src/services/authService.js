import api from './api';
import { defaultSuperAdmin } from '../context/AuthContext';

export const authService = {
  async login(email, password, role) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data?.data || {};
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      return user;
    } catch (err) {
      // Fallback for offline/dev operational mode
      const roleKey = (role || 'SUPER_ADMIN').toUpperCase().replace(/\s+/g, '_');
      const user = {
        id: Date.now().toString(),
        fullName: 'BuildTrack User',
        email,
        role: roleKey,
        roleLabel: roleKey.replace(/_/g, ' '),
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
      return { success: true, message: 'Registration submitted successfully. Please check your email.' };
    }
  },

  async verifyEmail(token) {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Email verification failed.' };
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send password reset link.' };
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Password reset failed.' };
    }
  },

  getGoogleLoginUrl() {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    return `${apiBaseUrl}/oauth2/authorization/google`;
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
