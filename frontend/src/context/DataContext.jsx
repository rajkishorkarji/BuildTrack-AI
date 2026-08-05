import { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

const DataContext = createContext(null);

const INITIAL_DATA = {
  companies: [],
  projects: [],
  workers: [],
  equipment: [],
  finances: [],
  tasks: [],
  issues: [],
  materials: [],
  progressReports: [],
  usersList: [],
  teamMembers: [],
  documents: [],
  attendanceLogs: [],
  subscriptions: [],
  auditLogs: [],
};

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('buildtrack_app_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          companies: parsed.companies || [],
          projects: parsed.projects || [],
          workers: parsed.workers || [],
          equipment: parsed.equipment || [],
          finances: parsed.finances || [],
          tasks: parsed.tasks || [],
          issues: parsed.issues || [],
          materials: parsed.materials || [],
          progressReports: parsed.progressReports || [],
          usersList: parsed.usersList || [],
          teamMembers: parsed.teamMembers || [],
          documents: parsed.documents || [],
          attendanceLogs: parsed.attendanceLogs || [],
          subscriptions: parsed.subscriptions || [],
          auditLogs: parsed.auditLogs || [],
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

  // Company Actions
  const addCompany = (company) => {
    const newCompany = {
      id: Date.now(),
      name: company.name || 'New Infrastructure Co',
      code: company.code || `${(company.name || 'CO').substring(0, 4).toUpperCase()}-CO`,
      gstNo: company.gstNo || '21AAACS0000F1Z9',
      address: company.address || 'Bhubaneswar, Odisha',
      adminName: company.adminName || 'Company Admin',
      adminEmail: company.adminEmail || 'admin@co.com',
      shiftTemplate: company.shiftTemplate || '2 Shifts (Day & Night)',
      status: 'Active',
      projectsCount: 0,
      workersCount: 0,
      createdAt: new Date().toISOString(),
      ...company,
    };
    setData((prev) => ({
      ...prev,
      companies: [newCompany, ...prev.companies],
    }));

    notificationService.pushAlert({
      title: 'New Tenant Onboarded',
      message: `Tenant company "${newCompany.name}" registered in platform.`,
      type: 'INFO',
    });

    return newCompany;
  };

  // Project Actions
  const addProject = (project) => {
    const newProject = {
      id: Date.now(),
      name: project.name || 'New Construction Site',
      companyName: project.companyName || 'Solviontech Infrastructure Ltd',
      location: project.location || 'Site Location',
      budget: parseFloat(project.budget) || 0,
      progress: parseInt(project.progress, 10) || 0,
      status: project.status || 'Active',
      startDate: project.startDate || new Date().toISOString().split('T')[0],
      pmName: project.pmName || 'Unassigned',
      createdAt: new Date().toISOString(),
      ...project,
    };

    setData((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
    }));

    notificationService.pushAlert({
      title: 'New Project Launched',
      message: `Project "${newProject.name}" created under ${newProject.companyName}.`,
      type: 'SUCCESS',
    });

    return newProject;
  };

  const updateProject = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)),
    }));
  };

  const deleteProject = (id) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  // Worker Actions
  const addWorker = (worker) => {
    const newWorker = {
      id: Date.now(),
      fullName: worker.fullName || 'Field Worker',
      role: worker.role || 'Mason',
      trade: worker.trade || 'Masonry',
      companyName: worker.companyName || 'Solviontech Infrastructure Ltd',
      projectName: worker.projectName || 'Metro Tower Site',
      phone: worker.phone || '+91 9876543210',
      dailyWage: worker.dailyWage || '$45/day',
      status: 'Active',
      attendanceRate: '100%',
      ...worker,
    };
    setData((prev) => ({
      ...prev,
      workers: [newWorker, ...prev.workers],
    }));

    notificationService.pushAlert({
      title: 'Worker Onboarded',
      message: `${newWorker.fullName} (${newWorker.trade}) onboarded to ${newWorker.companyName}.`,
      type: 'INFO',
    });

    return newWorker;
  };

  const deleteWorker = (id) => {
    setData((prev) => ({
      ...prev,
      workers: prev.workers.filter((w) => w.id !== id),
    }));
  };

  // Equipment Actions
  const addEquipment = (equip) => {
    const newEquip = {
      id: Date.now(),
      name: equip.name || 'Heavy Equipment Asset',
      type: equip.type || 'Lifting / Machinery',
      code: equip.code || `EQP-${Date.now().toString().slice(-4)}`,
      status: equip.status || 'Operational',
      companyName: equip.companyName || 'Solviontech Infrastructure Ltd',
      projectName: equip.projectName || 'Metro Tower Site',
      operator: equip.operator || 'Assigned Driver',
      ...equip,
    };
    setData((prev) => ({
      ...prev,
      equipment: [newEquip, ...prev.equipment],
    }));

    notificationService.pushAlert({
      title: 'Machinery Registered',
      message: `${newEquip.name} deployed to ${newEquip.projectName}.`,
      type: 'INFO',
    });

    return newEquip;
  };

  // Finance Actions
  const addFinance = (fin) => {
    const newFin = {
      id: Date.now(),
      invoiceNo: fin.invoiceNo || `INV-${Date.now().toString().slice(-4)}`,
      amount: parseFloat(fin.amount) || 0,
      companyName: fin.companyName || 'Solviontech Infrastructure Ltd',
      projectName: fin.projectName || 'Metro Tower Site',
      contractor: fin.contractor || 'Prime Subcontractor',
      status: fin.status || 'Paid',
      date: new Date().toISOString().split('T')[0],
      ...fin,
    };
    setData((prev) => ({
      ...prev,
      finances: [newFin, ...prev.finances],
    }));

    notificationService.pushAlert({
      title: 'Invoice Logged',
      message: `Invoice #${newFin.invoiceNo} ($${newFin.amount.toLocaleString()}) approved and paid.`,
      type: 'SUCCESS',
    });

    return newFin;
  };

  // Task Actions
  const addTask = (task) => {
    const newTask = {
      id: Date.now(),
      title: task.title || 'Construction Site Task',
      projectName: task.projectName || 'Metro Tower Site',
      assignedTo: task.assignedTo || 'Site Worker',
      priority: task.priority || 'Medium',
      status: task.status || 'In Progress',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      ...task,
    };
    setData((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));

    notificationService.pushAlert({
      title: 'Task Assigned',
      message: `Task "${newTask.title}" assigned to ${newTask.assignedTo}.`,
      type: 'INFO',
    });

    return newTask;
  };

  // Issue / Hazard Actions
  const addIssue = (issue) => {
    const newIssue = {
      id: Date.now(),
      title: issue.title || 'Site Hazard Alert',
      severity: issue.severity || 'Medium',
      status: 'Open',
      projectName: issue.projectName || 'Metro Tower Site',
      reportedBy: issue.reportedBy || 'Site Engineer',
      date: new Date().toISOString().split('T')[0],
      ...issue,
    };
    setData((prev) => ({
      ...prev,
      issues: [newIssue, ...prev.issues],
    }));

    notificationService.pushAlert({
      title: 'Safety Hazard Alert',
      message: `Hazard ticket "${newIssue.title}" reported by ${newIssue.reportedBy}.`,
      type: 'WARNING',
    });

    return newIssue;
  };

  // Material Actions
  const addMaterial = (material) => {
    const newMat = {
      id: Date.now(),
      name: material.name || 'Construction Raw Material',
      quantity: material.quantity || '100 Bags',
      unit: material.unit || 'Bags',
      status: material.status || 'In Stock',
      projectName: material.projectName || 'Metro Tower Site',
      ...material,
    };
    setData((prev) => ({
      ...prev,
      materials: [newMat, ...prev.materials],
    }));

    notificationService.pushAlert({
      title: 'Material Delivery Logged',
      message: `${newMat.quantity} of ${newMat.name} received at site.`,
      type: 'INFO',
    });

    return newMat;
  };

  // Daily Progress Log Action
  const addProgressReport = (report) => {
    const newReport = {
      id: Date.now(),
      projectName: report.projectName || 'Metro Tower Site',
      workCompleted: report.workCompleted || 'Rebar Pouring',
      percentageDelta: parseInt(report.percentageDelta, 10) || 5,
      submittedBy: report.submittedBy || 'Site Engineer',
      date: new Date().toISOString().split('T')[0],
      ...report,
    };

    if (report.projectId) {
      updateProject(report.projectId, { progress: Math.min(100, Math.max(0, parseInt(report.newTotalProgress, 10) || 50)) });
    }

    setData((prev) => ({
      ...prev,
      progressReports: [newReport, ...prev.progressReports],
    }));

    notificationService.pushAlert({
      title: 'Daily Progress Submitted',
      message: `${newReport.projectName} progress updated to ${newReport.newTotalProgress || 50}%.`,
      type: 'SUCCESS',
    });

    return newReport;
  };

  // Users List Actions
  const addUser = (usr) => {
    const newUser = {
      id: Date.now(),
      fullName: usr.fullName || 'System User',
      email: usr.email || 'user@buildtrack.ai',
      role: usr.role || 'COMPANY_ADMIN',
      companyName: usr.companyName || 'Solviontech Infrastructure Ltd',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      ...usr,
    };
    setData((prev) => ({
      ...prev,
      usersList: [newUser, ...prev.usersList],
    }));

    notificationService.pushAlert({
      title: 'System Account Created',
      message: `User account created for ${newUser.fullName} (${newUser.role}).`,
      type: 'INFO',
    });

    return newUser;
  };

  // Team Members Actions
  const addTeamMember = (member) => {
    const newMem = {
      id: Date.now(),
      fullName: member.fullName || 'Team Member',
      role: member.role || 'Site Supervisor',
      email: member.email || 'member@buildtrack.ai',
      companyName: member.companyName || 'Solviontech Infrastructure Ltd',
      phone: member.phone || '+91 9876543210',
      ...member,
    };
    setData((prev) => ({
      ...prev,
      teamMembers: [newMem, ...prev.teamMembers],
    }));

    notificationService.pushAlert({
      title: 'Team Member Added',
      message: `${newMem.fullName} added as ${newMem.role}.`,
      type: 'INFO',
    });

    return newMem;
  };

  // Document Actions
  const addDocument = (doc) => {
    const newDoc = {
      id: Date.now(),
      name: doc.name || 'Blueprint_Plan.pdf',
      type: doc.type || 'Blueprint',
      size: doc.size || '2.4 MB',
      uploadedBy: doc.uploadedBy || 'Site Engineer',
      date: new Date().toISOString().split('T')[0],
      ...doc,
    };
    setData((prev) => ({
      ...prev,
      documents: [newDoc, ...prev.documents],
    }));

    notificationService.pushAlert({
      title: 'Document Uploaded',
      message: `Document "${newDoc.name}" uploaded to vault.`,
      type: 'INFO',
    });

    return newDoc;
  };

  // Attendance Log Action
  const recordAttendance = (log) => {
    const newLog = {
      id: Date.now(),
      workerName: log.workerName || 'Field Worker',
      timeIn: log.timeIn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Present',
      station: log.station || 'QR Station 1',
      date: new Date().toISOString().split('T')[0],
      ...log,
    };
    setData((prev) => ({
      ...prev,
      attendanceLogs: [newLog, ...prev.attendanceLogs],
    }));

    notificationService.pushAlert({
      title: 'Shift Clock-In Verified',
      message: `${newLog.workerName} clocked in at ${newLog.timeIn}.`,
      type: 'SUCCESS',
    });

    return newLog;
  };

  // Subscription Actions
  const addSubscription = (sub) => {
    const newSub = {
      id: Date.now(),
      companyName: sub.companyName || 'Tenant Company',
      plan: sub.plan || 'Enterprise SaaS ($4,999/mo)',
      status: 'Active',
      renewalDate: sub.renewalDate || '2027-01-01',
      ...sub,
    };
    setData((prev) => ({
      ...prev,
      subscriptions: [newSub, ...prev.subscriptions],
    }));
    return newSub;
  };

  // Audit Log Action
  const addAuditLog = (log) => {
    const newLog = {
      id: Date.now(),
      action: log.action || 'System Action Logged',
      performedBy: log.performedBy || 'Super Admin',
      timestamp: new Date().toLocaleTimeString(),
      ...log,
    };
    setData((prev) => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs],
    }));
    return newLog;
  };

  return (
    <DataContext.Provider
      value={{
        companies: data.companies,
        projects: data.projects,
        workers: data.workers,
        equipment: data.equipment,
        finances: data.finances,
        tasks: data.tasks,
        issues: data.issues,
        materials: data.materials,
        progressReports: data.progressReports,
        usersList: data.usersList,
        teamMembers: data.teamMembers,
        documents: data.documents,
        attendanceLogs: data.attendanceLogs,
        subscriptions: data.subscriptions,
        auditLogs: data.auditLogs,
        addCompany,
        addProject,
        updateProject,
        deleteProject,
        addWorker,
        deleteWorker,
        addEquipment,
        addFinance,
        addTask,
        addIssue,
        addMaterial,
        addProgressReport,
        addUser,
        addTeamMember,
        addDocument,
        recordAttendance,
        addSubscription,
        addAuditLog,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}
