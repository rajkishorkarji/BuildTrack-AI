import api from './api';

let reports = [
  { id: 1, title: 'DPR - Metro Tower Complex - Floor 14 Concrete Pour', author: 'Divya Krishnan', date: '2025-06-21', status: 'Submitted', weather: 'Sunny 31°C' },
  { id: 2, title: 'DPR - Riverside Apartments - Plumbing & Electrical', author: 'Vikram Nair', date: '2025-06-20', status: 'Approved', weather: 'Partly Cloudy' },
];

export const reportService = {
  async getReports() {
    try {
      const res = await api.get('/reports');
      return res.data?.data || reports;
    } catch {
      return reports;
    }
  },

  async createReport(reportData) {
    const newReport = {
      id: Date.now(),
      title: reportData.title,
      author: reportData.author || 'Site Engineer',
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      weather: reportData.weather || 'Clear',
    };
    reports = [newReport, ...reports];
    return newReport;
  },
};

export default reportService;
