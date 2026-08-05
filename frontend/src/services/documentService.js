import api from './api';

let documents = [
  { id: 1, name: 'Structural_Blueprint_TowerA_v4.pdf', category: 'Blueprint', size: '14.2 MB', uploader: 'Divya Krishnan', date: '2025-06-18' },
  { id: 2, name: 'Safety_Inspection_Report_Q2.pdf', category: 'Safety', size: '2.8 MB', uploader: 'Vikram Nair', date: '2025-06-20' },
  { id: 3, name: 'Concrete_Quality_Test_LabResults.pdf', category: 'Quality', size: '5.1 MB', uploader: 'Rajesh Patel', date: '2025-06-21' },
];

export const documentService = {
  async getDocuments() {
    try {
      const res = await api.get('/documents');
      return res.data?.data || documents;
    } catch {
      return documents;
    }
  },

  async uploadDocument(doc) {
    const newDoc = {
      id: Date.now(),
      name: doc.name,
      category: doc.category || 'General',
      size: '3.5 MB',
      uploader: doc.uploader || 'Current User',
      date: new Date().toISOString().split('T')[0],
    };
    documents = [newDoc, ...documents];
    return newDoc;
  },
};

export default documentService;
