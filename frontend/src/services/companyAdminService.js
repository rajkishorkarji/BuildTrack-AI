
import api from './api';

const companyAdminService = {
  async getOverview() {
    const { data } = await api.get('/company/overview');
    return data?.data;
  },

  async invitePersonnel(payload) {
    const { data } = await api.post(
      '/company/personnel/invitations',
      payload
    );

    return data;
  },

  async getPersonnelInvitations() {
    const { data } = await api.get(
      '/company/personnel/invitations'
    );

    return data;
  },
  async getPersonnelInvitations() {
  const { data } = await api.get(
    '/company/personnel/invitations'
  );

  return data;
},
};



export default companyAdminService;