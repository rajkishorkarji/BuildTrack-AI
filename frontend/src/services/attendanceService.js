import api from './api';

const attendanceService = {
  list: async () => (await api.get('/attendance')).data?.data || [],
  checkIn: async ({ workerId, projectId, status }) =>
    (await api.post('/attendance/check-in', { workerId, projectId, status })).data?.data,
  checkInByQr: async ({ qrCodeToken, projectId }) =>
    (await api.post('/attendance/check-in/qr', { qrCodeToken, projectId })).data?.data,
  checkOut: async (attendanceId) =>
    (await api.patch(`/attendance/${attendanceId}/check-out`)).data?.data,
  verify: async (attendanceId, verified) =>
    (await api.patch(`/attendance/${attendanceId}/verification`, { verified })).data?.data,
};

export default attendanceService;
