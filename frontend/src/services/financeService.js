import api from './api';

let financialOverview = {
  totalBudget: '₹150.0 Cr',
  disbursed: '₹84.2 Cr',
  pendingInvoices: '₹12.4 Cr',
  remaining: '₹53.4 Cr',
};

let invoices = [
  { id: 'INV-2025-001', vendor: 'Steeltech Supplies', amount: '₹45,00,000', status: 'PAID', date: '2025-06-10' },
  { id: 'INV-2025-002', vendor: 'UltraTech Cement', amount: '₹78,00,000', status: 'PENDING', date: '2025-06-19' },
  { id: 'INV-2025-003', vendor: 'Fox Steel Constructors', amount: '₹32,50,000', status: 'APPROVED', date: '2025-06-20' },
];

export const financeService = {
  async getOverview() {
    try {
      const res = await api.get('/finance/overview');
      return res.data?.data || financialOverview;
    } catch {
      return financialOverview;
    }
  },

  async getInvoices() {
    try {
      const res = await api.get('/finance/invoices');
      return res.data?.data || invoices;
    } catch {
      return invoices;
    }
  },
};

export default financeService;
