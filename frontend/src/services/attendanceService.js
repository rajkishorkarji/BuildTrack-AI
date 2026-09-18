import api from './api';

const attendanceService = {
  list: async () => (await api.get('/attendance')).data?.data || [],
  getDynamicQr: async (projectId) =>
    (await api.get(`/attendance/dynamic-qr/${projectId}`)).data?.data,
  checkIn: async ({ workerId, projectId, status, latitude, longitude, accuracy }) =>
    (await api.post('/attendance/check-in', { workerId, projectId, status, latitude, longitude, accuracy })).data?.data,
  checkInByQr: async ({ qrCodeToken, projectId, latitude, longitude, accuracy }) =>
    (await api.post('/attendance/check-in/qr', { qrCodeToken, projectId, latitude, longitude, accuracy })).data?.data,
  checkOut: async (attendanceId, { latitude, longitude } = {}) =>
    (await api.patch(`/attendance/${attendanceId}/check-out`, { latitude, longitude })).data?.data,
  verify: async (attendanceId, verified) =>
    (await api.patch(`/attendance/${attendanceId}/verification`, { verified })).data?.data,
};

export default attendanceService;

