import api from './api';

let workers = [
  { id: 'W-101', name: 'Rose Smith', role: 'Senior Mason', contractor: 'Fox Steel Constructors', phone: '+91 98765 43210', status: 'Active' },
  { id: 'W-102', name: 'Robert Fox', role: 'Prime Contractor', contractor: 'Fox Steel Constructors', phone: '+91 98765 43211', status: 'Active' },
  { id: 'W-103', name: 'Amit Verma', role: 'Site Engineer', contractor: 'Solviontech Infra', phone: '+91 98765 43212', status: 'Active' },
];

export const workerService = {
  async getWorkers() {
    try {
      const res = await api.get('/workers');
      return res.data?.data || workers;
    } catch {
      return workers;
    }
  },

  async addWorker(workerData) {
    const newWorker = {
      id: 'W-' + Math.floor(100 + Math.random() * 900),
      name: workerData.name,
      role: workerData.role || 'Worker',
      contractor: workerData.contractor || 'Solviontech Infra',
      phone: workerData.phone || '+91 90000 00000',
      status: 'Active',
    };
    workers = [newWorker, ...workers];
    return newWorker;
  },
};

export default workerService;
