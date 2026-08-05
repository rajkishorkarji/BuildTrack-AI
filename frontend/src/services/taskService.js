import api, { realtimeBus } from './api';

let initialTasks = [
  { id: 1, code: '02120', title: 'Diamond Saw Cutting', engineer: 'Divya Krishnan', status: 'In Progress', progress: 66, priority: 'High', daysLeft: 4 },
  { id: 2, code: '02190', title: 'Core Drilling', engineer: 'Divya Krishnan', status: 'In Progress', progress: 80, priority: 'High', daysLeft: 9 },
  { id: 3, code: '02298', title: 'Mass Excavation', engineer: 'Vikram Nair', status: 'Completed', progress: 100, priority: 'Critical', daysLeft: 0 },
  { id: 4, code: '03100', title: 'Rebar Structural Mesh', engineer: 'Divya Krishnan', status: 'Pending', progress: 15, priority: 'Medium', daysLeft: 14 },
];

export const taskService = {
  async getTasks() {
    try {
      const res = await api.get('/tasks');
      return res.data?.data || initialTasks;
    } catch {
      return initialTasks;
    }
  },

  async createTask(taskData) {
    const newTask = {
      id: Date.now(),
      code: taskData.code || '03200',
      title: taskData.title,
      engineer: taskData.engineer || 'Divya Krishnan',
      status: taskData.status || 'Pending',
      progress: taskData.progress || 0,
      priority: taskData.priority || 'Medium',
      daysLeft: taskData.daysLeft || 10,
    };
    try {
      await api.post('/tasks', newTask);
    } catch {
      initialTasks = [newTask, ...initialTasks];
      realtimeBus.emit('TASK_UPDATE', initialTasks);
    }
    return newTask;
  },

  async updateTaskProgress(id, progress) {
    try {
      await api.patch(`/tasks/${id}`, { progress });
    } catch {
      initialTasks = initialTasks.map((t) => (t.id === id ? { ...t, progress, status: progress === 100 ? 'Completed' : 'In Progress' } : t));
      realtimeBus.emit('TASK_UPDATE', initialTasks);
    }
    return initialTasks;
  },

  subscribeToTasks(callback) {
    callback(initialTasks);
    return realtimeBus.subscribe('TASK_UPDATE', callback);
  },
};

export default taskService;
