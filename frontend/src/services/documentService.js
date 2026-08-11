import api from './api';

const documentService = {
  list: async () => {
    const response = await api.get('/documents');
    return response.data.data || [];
  },

  upload: async (projectId, file) => {
    const form = new FormData();
    form.append('file', file);
    form.append('projectId', projectId);

    const response = await api.post('/documents', form, {
      params: { projectId },
      headers: {
        'Content-Type': undefined,
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