import api from './api';

let projects = [
  { id: 1, name: 'Metro Tower Complex', code: 'MTC-01', location: 'Mumbai Central', progress: 66, status: 'Active', leader: 'Divya Krishnan' },
  { id: 2, name: 'Riverside Apartments', code: 'RSA-02', location: 'Pune Sector 4', progress: 82, status: 'Active', leader: 'Vikram Nair' },
  { id: 3, name: 'Skyline Commercial Mall', code: 'SCM-03', location: 'Bengaluru Tech Park', progress: 54, status: 'Active', leader: 'Robert Fox' },
];

export const projectService = {
  async getProjects() {
    try {
      const res = await api.get('/projects');
      return res.data?.data || projects;
    } catch {
      return projects;
    }
  },

  async createProject(projectData) {
    const newProj = {
      id: Date.now(),
      name: projectData.name,
      code: projectData.code || 'PRJ-' + Math.floor(Math.random() * 1000),
      location: projectData.location || 'Site Alpha',
      progress: 0,
      status: 'Active',
      leader: projectData.leader || 'Rajkishor Karji',
    };
    projects = [newProj, ...projects];
    return newProj;
  },
};

export default projectService;
