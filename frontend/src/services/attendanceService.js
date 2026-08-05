import api, { realtimeBus } from './api';

let attendanceRecords = [
  { id: 1, workerId: 'W-101', name: 'Rahul Kumar', role: 'Mason', site: 'Metro Tower', checkIn: '08:12 AM', checkOut: '--', status: 'PRESENT' },
  { id: 2, workerId: 'W-102', name: 'Arjun Mehta', role: 'Electrician', site: 'Metro Tower', checkIn: '08:30 AM', checkOut: '--', status: 'PRESENT' },
  { id: 3, workerId: 'W-103', name: 'Sita Ram', role: 'Carpenter', site: 'Riverside Apt', checkIn: '09:00 AM', checkOut: '--', status: 'PRESENT' },
  { id: 4, workerId: 'W-104', name: 'Vikash Singh', role: 'Welder', site: 'Skyline Mall', checkIn: '--', checkOut: '--', status: 'ABSENT' },
];

export const attendanceService = {
  async getAttendance() {
    try {
      const res = await api.get('/attendance');
      return res.data?.data || attendanceRecords;
    } catch {
      return attendanceRecords;
    }
  },

  async toggleCheckIn(id) {
    attendanceRecords = attendanceRecords.map((record) => {
      if (record.id === id) {
        const isPresent = record.status === 'PRESENT';
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...record,
          status: isPresent ? 'ABSENT' : 'PRESENT',
          checkIn: isPresent ? record.checkIn : now,
          checkOut: isPresent ? now : '--',
        };
      }
      return record;
    });
    realtimeBus.emit('ATTENDANCE_UPDATE', attendanceRecords);
    return attendanceRecords;
  },

  subscribeToAttendance(callback) {
    callback(attendanceRecords);
    return realtimeBus.subscribe('ATTENDANCE_UPDATE', callback);
  },
};

export default attendanceService;
