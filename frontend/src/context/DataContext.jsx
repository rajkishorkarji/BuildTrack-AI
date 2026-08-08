import { createContext, useCallback, useContext, useState, useEffect, useRef } from 'react';
import notificationService from '../services/notificationService';
import api, { realtimeBus } from '../services/api';
import { realtimeClient } from '../services/realtimeClient';
import { useAuth } from './AuthContext';


const DataContext = createContext(null);

const INITIAL_DATA = {
  companies: [
    { id: 'c1', name: 'Solviontech Infrastructure Ltd', code: 'SOLV-CO', gstNo: '21AAACS0000F1Z9', address: 'Bhubaneswar, Odisha', status: 'Active', plan: 'Professional', subscriptionStatus: 'ACTIVE' },
  ],
  projects: [
    {
      id: 101,
      name: 'Metro Tower Site A',
      companyName: 'Solviontech Infrastructure Ltd',
      location: 'Sector 5, Metro Zone',
      budget: 1500000,
      progress: 68,
      status: 'Active',
      startDate: '2026-01-15',
      deadline: '2026-12-31',
      pmName: 'Rajesh Verma (Project Manager)',
      seName: 'Amit Kumar (Site Engineer)',
      contractorName: 'BuildCorp Contractors',
      assignedWorkers: ['Ramesh Mason', 'Suresh Welder', 'Karan Loader'],
    },
    {
      id: 102,
      name: 'Highway Overpass Project',
      companyName: 'Solviontech Infrastructure Ltd',
      location: 'Outer Ring Road',
      budget: 2800000,
      progress: 42,
      status: 'Active',
      startDate: '2026-03-01',
      deadline: '2027-04-30',
      pmName: 'Rajesh Verma (Project Manager)',
      seName: 'Priya Singh (Site Engineer)',
      contractorName: 'Apex Foundations',
      assignedWorkers: ['Sunil Mason', 'Vikram Operator'],
    },
  ],
  usersList: [
    { id: 'u1', fullName: 'Rajkishor Karji', email: 'raj@buildtrack.ai', role: 'SUPER_ADMIN', companyName: 'BuildTrack AI Platform' },
    { id: 'u2', fullName: 'Solvion Admin', email: 'admin@solviontech.com', role: 'COMPANY_ADMIN', companyName: 'Solviontech Infrastructure Ltd' },
    { id: 'u3', fullName: 'Company Manager', email: 'manager@solviontech.com', role: 'COMPANY_MANAGER', companyName: 'Solviontech Infrastructure Ltd' },
    { id: 'u4', fullName: 'Rajesh Verma', email: 'pm@solviontech.com', role: 'PROJECT_MANAGER', companyName: 'Solviontech Infrastructure Ltd' },
    { id: 'u5', fullName: 'Amit Kumar', email: 'se@solviontech.com', role: 'SITE_ENGINEER', companyName: 'Solviontech Infrastructure Ltd' },
    { id: 'u6', fullName: 'BuildCorp Contractors', email: 'contractor@buildcorp.com', role: 'CONTRACTOR', companyName: 'Solviontech Infrastructure Ltd' },
    { id: 'u7', fullName: 'Ramesh Mason', email: 'worker@solviontech.com', role: 'WORKER', companyName: 'Solviontech Infrastructure Ltd' },
  ],
  workers: [
    { id: 'w1', fullName: 'Ramesh Mason', role: 'Mason', contractorName: 'BuildCorp Contractors', projectName: 'Metro Tower Site A', status: 'Active' },
    { id: 'w2', fullName: 'Suresh Welder', role: 'Welder', contractorName: 'BuildCorp Contractors', projectName: 'Metro Tower Site A', status: 'Active' },
    { id: 'w3', fullName: 'Karan Loader', role: 'Loader', contractorName: 'BuildCorp Contractors', projectName: 'Metro Tower Site A', status: 'Active' },
  ],
  tasks: [
    {
      id: 't1',
      title: 'Foundation Slab Concreting',
      project: 'Metro Tower Site A',
      createdBy: 'Rajesh Verma (Project Manager)',
      assignedSE: 'Amit Kumar (Site Engineer)',
      assignedContractor: 'BuildCorp Contractors',
      assignedWorker: 'Ramesh Mason',
      priority: 'High',
      status: 'In Progress',
      progress: 75,
      deadline: '2026-08-15',
    },
    {
      id: 't2',
      title: 'Steel Rebar Binding & Alignment',
      project: 'Metro Tower Site A',
      createdBy: 'Rajesh Verma (Project Manager)',
      assignedSE: 'Amit Kumar (Site Engineer)',
      assignedContractor: 'BuildCorp Contractors',
      assignedWorker: 'Suresh Welder',
      priority: 'Medium',
      status: 'Assigned',
      progress: 30,
      deadline: '2026-08-20',
    },
  ],
  attendanceLogs: [
    {
      id: 'att1',
      workerName: 'Ramesh Mason',
      workerRole: 'Mason',
      contractorName: 'BuildCorp Contractors',
      siteName: 'Metro Tower Site A',
      date: new Date().toISOString().split('T')[0],
      checkInTime: '08:30 AM',
      checkOutTime: '05:30 PM',
      status: 'Present',
      contractorMarked: true,
      seVerified: 'Verified',
      pmReviewed: 'Reviewed',
      caApproved: 'Approved',
    },
  ],
  equipment: [
    { id: 'eq1', name: 'Tower Crane TC-500', category: 'Heavy Machinery', status: 'Operational', operator: 'Vikram Operator', projectName: 'Metro Tower Site A' },
  ],
  finances: [
    { id: 'f1', invoiceNo: 'INV-9021', contractor: 'BuildCorp Contractors', projectName: 'Metro Tower Site A', amount: 45000, status: 'Paid' },
  ],
  materials: [
    { id: 'm1', name: 'Cement Bags (Grade 53)', stock: '500 Bags', consumed: '320 Bags', siteName: 'Metro Tower Site A', status: 'Available' },
  ],
  issues: [
    { id: 'is1', title: 'Hydraulic Hose Leakage on Excavator', severity: 'Medium', reportedBy: 'Amit Kumar', siteName: 'Metro Tower Site A', status: 'Open' },
  ],
  documents: [
    { id: 'd1', name: 'Metro Tower Structural Drawing v3.pdf', type: 'Contracts & Drawings', size: '12.4 MB', uploadedBy: 'Amit Kumar', status: 'Approved' },
  ],
  progressReports: [
    { id: 1, projectId: 101, projectName: 'Metro Tower Site A', workCompleted: 'Completed 240m³ concrete pouring on Column C4 with 2 boom pumps.', newTotalProgress: 68, submittedBy: 'Amit Kumar (Site Engineer)', date: '2026-08-05', weather: 'Sunny 28°C', photosCount: 4 },
    { id: 2, projectId: 101, projectName: 'Metro Tower Site A', workCompleted: 'Inspected 16mm rebar spacing on Floor 12 retaining wall. Passed QC audit.', newTotalProgress: 65, submittedBy: 'Amit Kumar (Site Engineer)', date: '2026-08-04', weather: 'Clear 30°C', photosCount: 6 },
  ],
  teamMembers: [
    { id: 'tm1', fullName: 'Rajesh Verma', email: 'pm@solviontech.com', role: 'Project Manager', phone: '+91 98765 00001', status: 'Active' },
    { id: 'tm2', fullName: 'Amit Kumar', email: 'se@solviontech.com', role: 'Site Engineer', phone: '+91 98765 00002', status: 'Active' },
    { id: 'tm3', fullName: 'BuildCorp Contractors', email: 'contractor@buildcorp.com', role: 'Contractor', phone: '+91 98765 00003', status: 'Active' },
  ],
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('buildtrack_app_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          companies: parsed.companies || INITIAL_DATA.companies,
          projects: parsed.projects || INITIAL_DATA.projects,
          usersList: parsed.usersList || INITIAL_DATA.usersList,
          workers: parsed.workers || INITIAL_DATA.workers,
          tasks: parsed.tasks || INITIAL_DATA.tasks,
          attendanceLogs: parsed.attendanceLogs || INITIAL_DATA.attendanceLogs,
          equipment: parsed.equipment || INITIAL_DATA.equipment,
          finances: parsed.finances || INITIAL_DATA.finances,
          materials: parsed.materials || INITIAL_DATA.materials,
          issues: parsed.issues || INITIAL_DATA.issues,
          documents: parsed.documents || INITIAL_DATA.documents,
          progressReports: parsed.progressReports || INITIAL_DATA.progressReports,
          teamMembers: parsed.teamMembers || INITIAL_DATA.teamMembers,
        };
      } catch (err) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('buildtrack_app_data', JSON.stringify(data));
  }, [data]);

  const [realtimeStatus, setRealtimeStatus] = useState({ connected: false, lastSyncedAt: null });
  const refreshInFlight = useRef(false);

  // Every role uses this shared mutation path. It updates the active screen immediately,
  // persists the offline fallback, and shares the same snapshot with other open tabs.
  const updateData = useCallback((updater, event = {}) => {
    setData((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      realtimeClient.emitUpdate({ ...event, snapshot: next });
      return next;
    });
  }, []);

  const refreshFromServer = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) return;

    if (refreshInFlight.current) return;
    refreshInFlight.current = true;

    try {
      const endpoints = ['/superadmin/companies/all', '/projects', '/workers', '/tasks', '/attendance', '/equipment', '/finance/invoices', '/documents', '/reports'];
      const responses = await Promise.allSettled(endpoints.map((url) => api.get(url)));
      const payload = (index) => responses[index].status === 'fulfilled' ? responses[index].value.data?.data : undefined;

      setData((current) => ({
      ...current,
      companies: Array.isArray(payload(0)) ? payload(0).map((company) => ({
        ...company,
        status: String(company.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'Active' : 'Suspended',
      })) : current.companies,
      projects: Array.isArray(payload(1)) ? payload(1).map((project) => ({
        ...project,
        progress: project.progressPercentage ?? project.progress ?? 0,
        deadline: project.estEndDate || project.deadline,
        companyName: project.company?.name || project.companyName,
      })) : current.projects,
      workers: Array.isArray(payload(2)) ? payload(2).map((worker) => ({
        ...worker,
        name: worker.fullName || worker.name,
        role: worker.skillTrade || worker.role || 'Worker',
        projectName: worker.assignedProject?.name || worker.projectName,
        assignedProject: worker.assignedProject?.name || worker.assignedProject,
        status: String(worker.status || 'ACTIVE').replace(/_/g, ' '),
      })) : current.workers,
      tasks: Array.isArray(payload(3)) ? payload(3).map((task) => ({
        ...task,
        project: task.project?.name || task.project,
        progress: task.completionPercentage ?? task.progress ?? 0,
        deadline: task.dueDate || task.deadline,
      })) : current.tasks,
      attendanceLogs: Array.isArray(payload(4)) ? payload(4).map((entry) => ({
        ...entry,
        workerName: entry.worker?.fullName || entry.workerName,
        siteName: entry.project?.name || entry.siteName,
        checkInTime: entry.checkIn ? new Date(entry.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : entry.checkInTime,
        checkOutTime: entry.checkOut ? new Date(entry.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : entry.checkOutTime || 'Active On Site',
      })) : current.attendanceLogs,
      equipment: Array.isArray(payload(5)) ? payload(5).map((item) => ({
        ...item,
        projectName: item.project?.name || item.projectName,
        status: String(item.status || 'OPERATIONAL').replace(/_/g, ' '),
      })) : current.equipment,
      finances: Array.isArray(payload(6)) ? payload(6).map((finance) => ({
        ...finance,
        invoiceNo: finance.invoiceNumber || finance.invoiceNo,
        contractor: finance.vendorName || finance.contractor,
        projectName: finance.project?.name || finance.projectName,
      })) : current.finances,
      documents: Array.isArray(payload(7)) ? payload(7).map((document) => ({
        ...document,
        name: document.title || document.name,
        type: document.fileType || document.type,
        projectName: document.project?.name || document.projectName,
      })) : current.documents,
        progressReports: Array.isArray(payload(8)) ? payload(8) : current.progressReports,
      }));
      setRealtimeStatus((status) => ({ ...status, lastSyncedAt: new Date().toISOString() }));
    } finally {
      refreshInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    let refreshTimer;
    const sync = (event) => {
      if (event?.source === 'tab' && event.snapshot) {
        setData(event.snapshot);
        setRealtimeStatus((status) => ({ ...status, lastSyncedAt: new Date().toISOString() }));
        return;
      }
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(refreshFromServer, 120);
    };
    realtimeClient.resume();
    sync();
    const unsubscribe = realtimeBus.subscribe('SERVER_UPDATE', sync);
    const unsubscribeStatus = realtimeBus.subscribe('REALTIME_STATUS', setRealtimeStatus);
    window.addEventListener('buildtrack:auth-changed', sync);
    return () => {
      window.clearTimeout(refreshTimer);
      unsubscribe();
      unsubscribeStatus();
      window.removeEventListener('buildtrack:auth-changed', sync);
    };
  }, [refreshFromServer]);

  // 1. User Creation Flow Actions
  const addUser = (newUser) => {
    const userObj = {
      id: Date.now().toString(),
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      companyName: newUser.companyName || user?.companyName || 'Solviontech Infrastructure Ltd',
      companyCode: newUser.companyCode || user?.companyCode || 'SOLV-CO',
      blocked: false,
      createdAt: new Date().toISOString(),
    };
    updateData(prev => ({ ...prev, usersList: [userObj, ...prev.usersList] }), { domain: 'users', action: 'created' });
    notificationService.pushAlert({
      title: 'User Created',
      message: `User ${userObj.fullName} (${userObj.role}) created successfully.`,
      type: 'SUCCESS',
    });
    return userObj;
  };

  // 2. Project Assignment Flow Actions
  const addProject = (proj) => {
    const managerEmailMatch = String(proj.pmName || '').match(/\(([^()\s]+@[^()\s]+)\)$/);
    const newProj = {
      id: Date.now(),
      name: proj.name,
      companyName: proj.companyName || user?.companyName || 'Solviontech Infrastructure Ltd',
      companyCode: proj.companyCode || user?.companyCode || 'SOLV-CO',
      location: proj.location || 'Metro Site Zone',
      budget: parseFloat(proj.budget) || 1000000,
      progress: 0,
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      deadline: proj.deadline || '2026-12-31',
      pmName: proj.pmName || 'Unassigned PM',
      assignedProjectManagerEmail: managerEmailMatch?.[1] || proj.assignedProjectManagerEmail || null,
      seName: proj.seName || 'Unassigned SE',
      contractorName: proj.contractorName || 'Unassigned Contractor',
      assignedWorkers: proj.assignedWorkers || [],
    };
    updateData(prev => ({ ...prev, projects: [newProj, ...prev.projects] }), { domain: 'projects', action: 'created' });
    api.post('/projects', {
      name: newProj.name,
      location: newProj.location,
      budget: newProj.budget,
      startDate: newProj.startDate,
      estEndDate: newProj.deadline,
      assignedProjectManagerEmail: newProj.assignedProjectManagerEmail,
    }).then(refreshFromServer).catch(() => undefined);
    return newProj;
  };

  const assignPMToProject = (projectId, pmName) => {
    updateData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, pmName } : p)
    }), { domain: 'projects', action: 'assigned' });
  };

  const assignSEToProject = (projectId, seName) => {
    updateData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, seName } : p)
    }), { domain: 'projects', action: 'assigned' });
  };

  const assignContractorToProject = (projectId, contractorName) => {
    updateData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, contractorName } : p)
    }), { domain: 'projects', action: 'assigned' });
  };

  const assignWorkersToProject = (projectId, workerNames) => {
    updateData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, assignedWorkers: workerNames } : p)
    }), { domain: 'projects', action: 'assigned' });
  };

  // 3. Task Assignment Flow Actions
  const addTask = (task) => {
    const newTask = {
      id: Date.now().toString(),
      title: task.title,
      project: task.project || 'Metro Tower Site A',
      createdBy: task.createdBy || 'Project Manager',
      assignedSE: task.assignedSE || 'Unassigned SE',
      assignedContractor: task.assignedContractor || 'Unassigned Contractor',
      assignedWorker: task.assignedWorker || 'Unassigned Worker',
      priority: task.priority || 'Medium',
      status: 'Assigned',
      progress: 0,
      deadline: task.deadline || '2026-09-01',
    };
    updateData(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }), { domain: 'tasks', action: 'created' });
    const project = data.projects.find((item) => String(item.id) === String(task.projectId) || item.name === newTask.project);
    if (project?.id) {
      api.post('/tasks', {
        title: newTask.title,
        priority: String(newTask.priority).toUpperCase(),
        status: 'TODO',
        completionPercentage: 0,
        dueDate: newTask.deadline,
        project: { id: project.id },
      }).then(refreshFromServer).catch(() => undefined);
    }
    return newTask;
  };

  const updateTaskStatus = (taskId, status, progress) => {
    updateData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status, progress: progress !== undefined ? progress : t.progress } : t)
    }), { domain: 'tasks', action: 'updated' });
    api.patch(`/tasks/${taskId}`, {
      status: String(status || '').toUpperCase().replace(/\s+/g, '_'),
      progress,
    }).then(refreshFromServer).catch(() => undefined);
  };

  // 4. Attendance Flow Actions
  const logWorkerCheckIn = (workerName, siteName) => {
    const today = new Date().toISOString().split('T')[0];
    const newLog = {
      id: Date.now().toString(),
      workerName,
      workerRole: 'Worker',
      contractorName: 'BuildCorp Contractors',
      siteName: siteName || 'Metro Tower Site A',
      date: today,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOutTime: 'Active On Site',
      status: 'Present',
      contractorMarked: true,
      seVerified: 'Pending',
      pmReviewed: 'Pending',
      caApproved: 'Pending',
    };
    updateData(prev => ({ ...prev, attendanceLogs: [newLog, ...prev.attendanceLogs] }), { domain: 'attendance', action: 'checked_in' });
    const worker = data.workers.find((item) => (item.fullName || item.name) === workerName);
    const project = data.projects.find((item) => item.name === (siteName || newLog.siteName));
    if (Number.isFinite(Number(worker?.id))) {
      api.post('/attendance/check-in', {
        worker: { id: Number(worker.id) },
        ...(Number.isFinite(Number(project?.id)) ? { project: { id: Number(project.id) } } : {}),
      }).then(refreshFromServer).catch(() => undefined);
    }
    return newLog;
  };

  const logWorkerCheckOut = (logId) => {
    const checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateData(prev => ({
      ...prev,
      attendanceLogs: prev.attendanceLogs.map((log) => String(log.id) === String(logId)
        ? { ...log, checkOutTime, checkOut: new Date().toISOString() }
        : log),
    }), { domain: 'attendance', action: 'checked_out' });
    if (Number.isFinite(Number(logId))) {
      api.patch(`/attendance/${logId}/check-out`).then(refreshFromServer).catch(() => undefined);
    }
  };

  const verifyAttendanceSE = (logId) => {
    updateData(prev => ({
      ...prev,
      attendanceLogs: prev.attendanceLogs.map(l => l.id === logId ? { ...l, seVerified: 'Verified' } : l)
    }), { domain: 'attendance', action: 'verified' });
    if (Number.isFinite(Number(logId))) {
      api.patch(`/attendance/${logId}/verification`, { verified: true }).then(refreshFromServer).catch(() => undefined);
    }
  };

  const reviewAttendancePM = (logId) => {
    updateData(prev => ({
      ...prev,
      attendanceLogs: prev.attendanceLogs.map(l => l.id === logId ? { ...l, pmReviewed: 'Reviewed' } : l)
    }), { domain: 'attendance', action: 'reviewed' });
  };

  const approveAttendanceCA = (logId) => {
    updateData(prev => ({
      ...prev,
      attendanceLogs: prev.attendanceLogs.map(l => l.id === logId ? { ...l, caApproved: 'Approved' } : l)
    }), { domain: 'attendance', action: 'approved' });
  };

  // Generic helpers
  const addWorker = (w) => {
    updateData(prev => ({ ...prev, workers: [w, ...prev.workers] }), { domain: 'workers', action: 'created' });
    api.post('/workers', {
      fullName: w.fullName || w.name,
      phone: w.phone,
      skillTrade: w.skillTrade || w.role || 'Worker',
      dailyWage: Number(w.dailyWage || 0),
      qrCodeToken: w.qrCodeToken || `QR-${Date.now()}`,
      status: String(w.status || 'ACTIVE').toUpperCase().replace(/\s+/g, '_'),
      contractorName: w.contractorName,
      siteEngineerName: w.siteEngineerName,
      assignmentType: w.workerAssignmentType || w.assignmentType || 'DIRECT_PROJECT',
    }).then(refreshFromServer).catch(() => undefined);
  };
  const addEquipment = (eq) => {
    updateData(prev => ({ ...prev, equipment: [eq, ...prev.equipment] }), { domain: 'equipment', action: 'created' });
    const project = data.projects.find((item) => item.name === eq.projectName);
    api.post('/equipment', {
      name: eq.name,
      category: eq.category || 'General',
      serialNumber: eq.equipmentId,
      status: String(eq.status || 'OPERATIONAL').toUpperCase().replace(/\s+/g, '_'),
      dailyCost: Number(eq.dailyCost || 0),
      ...(Number.isFinite(Number(project?.id)) ? { project: { id: Number(project.id) } } : {}),
    }).then(refreshFromServer).catch(() => undefined);
  };
  const deleteEquipment = (eqId) => updateData(prev => ({ ...prev, equipment: prev.equipment.filter(e => String(e.id) !== String(eqId)) }), { domain: 'equipment', action: 'deleted' });
  const updateEquipmentStatus = (eqId, newStatus) => {
    updateData(prev => ({ ...prev, equipment: prev.equipment.map(e => String(e.id) === String(eqId) ? { ...e, status: newStatus } : e) }), { domain: 'equipment', action: 'updated' });
    if (Number.isFinite(Number(eqId))) {
      api.patch(`/equipment/${eqId}/status`, { status: String(newStatus).toUpperCase().replace(/\s+/g, '_') })
        .then(refreshFromServer).catch(() => undefined);
    }
  };
  const addFinance = (f) => updateData(prev => ({ ...prev, finances: [f, ...prev.finances] }), { domain: 'finance', action: 'created' });
  const addMaterial = (m) => updateData(prev => ({ ...prev, materials: [m, ...prev.materials] }), { domain: 'materials', action: 'created' });
  const addIssue = (iss) => updateData(prev => ({ ...prev, issues: [iss, ...prev.issues] }), { domain: 'issues', action: 'created' });
  const addDocument = (doc) => updateData(prev => ({ ...prev, documents: [doc, ...prev.documents] }), { domain: 'documents', action: 'created' });
  const addCompany = (c) => {
    const company = { id: c.id || `company-${Date.now()}`, ...c, subscriptionStatus: c.subscriptionStatus || 'PENDING' };
    updateData(prev => ({ ...prev, companies: [company, ...prev.companies] }), { domain: 'companies', action: 'created' });
    api.post('/superadmin/companies', company).then(refreshFromServer).catch(() => undefined);
  };
  const deleteCompany = (cIdOrName) => {
    updateData(prev => ({ ...prev, companies: prev.companies.filter(c => String(c.id) !== String(cIdOrName) && c.name !== cIdOrName) }), { domain: 'companies', action: 'deleted' });
    if (Number.isFinite(Number(cIdOrName))) api.delete(`/superadmin/companies/${cIdOrName}`).then(refreshFromServer).catch(() => undefined);
  };
  const updateCompanyStatus = (cIdOrName, newStatus) => {
    updateData(prev => ({ ...prev, companies: prev.companies.map(c => (String(c.id) === String(cIdOrName) || c.name === cIdOrName) ? { ...c, status: newStatus } : c) }), { domain: 'companies', action: 'updated' });
    if (Number.isFinite(Number(cIdOrName))) api.patch(`/superadmin/companies/${cIdOrName}/status`, { status: newStatus }).then(refreshFromServer).catch(() => undefined);
  };
  const activateCompanySubscription = (companyCode) => {
    updateData(prev => ({
      ...prev,
      companies: prev.companies.map((company) => company.code === companyCode
        ? { ...company, subscriptionStatus: 'ACTIVE', subscriptionActivatedAt: new Date().toISOString() }
        : company),
    }), { domain: 'companies', action: 'subscription_activated' });
    api.post('/company/subscription/activate').then(refreshFromServer).catch(() => undefined);
  };

  const addProgressReport = (report) => {
    const newReport = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      ...report,
    };
    updateData(prev => {
      const updatedProjects = prev.projects.map(p => {
        if (String(p.id) === String(report.projectId) || p.name === report.projectName) {
          return { ...p, progress: report.newTotalProgress || p.progress };
        }
        return p;
      });
      return {
        ...prev,
        projects: updatedProjects,
        progressReports: [newReport, ...(prev.progressReports || [])],
      };
    }, { domain: 'reports', action: 'created' });
    api.post('/reports', newReport).then(refreshFromServer).catch(() => undefined);
    return newReport;
  };

  const addTeamMember = (tm) => updateData(prev => ({ ...prev, teamMembers: [tm, ...(prev.teamMembers || [])] }), { domain: 'team', action: 'created' });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const currentCompanyCode = user?.companyCode;
  const currentCompanyName = user?.companyName;
  const belongsToCurrentTenant = (item) => {
    if (isSuperAdmin) return true;
    if (!user) return true;
    return item.companyCode === currentCompanyCode || item.companyName === currentCompanyName || item.companyId === user.companyId ||
      item.company?.id === user.companyId || item.company?.code === currentCompanyCode;
  };
  const scopedData = {
    ...data,
    companies: isSuperAdmin ? data.companies : data.companies.filter((company) => company.code === currentCompanyCode),
    projects: data.projects.filter(belongsToCurrentTenant),
    usersList: data.usersList.filter(belongsToCurrentTenant),
    workers: data.workers.filter(belongsToCurrentTenant),
    tasks: data.tasks.filter((task) => isSuperAdmin || data.projects.some((project) => belongsToCurrentTenant(project) && project.name === task.project)),
  };

  return (
    <DataContext.Provider
      value={{
        ...scopedData,
        addUser,
        addProject,
        assignPMToProject,
        assignSEToProject,
        assignContractorToProject,
        assignWorkersToProject,
        addTask,
        updateTaskStatus,
        logWorkerCheckIn,
        logWorkerCheckOut,
        verifyAttendanceSE,
        reviewAttendancePM,
        approveAttendanceCA,
        addWorker,
        addEquipment,
        deleteEquipment,
        updateEquipmentStatus,
        addFinance,
        addMaterial,
        addIssue,
        addDocument,
        addCompany,
        deleteCompany,
        updateCompanyStatus,
        activateCompanySubscription,
        addProgressReport,
        addTeamMember,
        refreshFromServer,
        realtimeStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
