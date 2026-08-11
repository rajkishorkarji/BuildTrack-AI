import api from './api';

const documentService = {
  list: async () => {
    const response = await api.get('/documents');
    return response.data.data || [];
  },

  upload: async (projectId, file) => {
    const form = new FormData();
    form.append('projectId', projectId);
    form.append('file', file);

    const response = await api.post('/documents', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  downloadUrl: (storedUrl) => storedUrl,

  remove: async (id) => {
    return api.delete(`/documents/${id}`);
  },
};

export default documentService;