import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

import notificationService from '../services/notificationService';
import api, { realtimeBus } from '../services/api';
import { realtimeClient } from '../services/realtimeClient';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

const EMPTY_DATA = {
  companies: [],
  projects: [],
  usersList: [],
  workers: [],
  tasks: [],
  attendanceLogs: [],
  equipment: [],
  finances: [],
  materials: [],
  issues: [],
  documents: [],
  progressReports: [],
  teamMembers: [],
};

export function DataProvider({ children }) {
  const { user } = useAuth();

  // ============================================================
  // DATA STATE
  // ============================================================

  const [data, setData] = useState(EMPTY_DATA);

  // ============================================================
  // REALTIME STATE
  // ============================================================

  const [realtimeStatus, setRealtimeStatus] = useState({
    connected: false,
    lastSyncedAt: null,
  });

  const refreshInFlight = useRef(false);


  // ============================================================
  // SHARED DATA UPDATE
  // ============================================================

  const updateData = useCallback(
    (updater, event = {}) => {
      setData((current) => {
        const next =
          typeof updater === 'function'
            ? updater(current)
            : updater;

        return next;
      });
    },
    []
  );


  // ============================================================
  // REFRESH DATA FROM BACKEND
  // ============================================================

  const refreshFromServer = useCallback(async () => {
    const accessToken =
      localStorage.getItem('accessToken');

    if (!accessToken) {
      return;
    }

    if (refreshInFlight.current) {
      return;
    }

    refreshInFlight.current = true;

    try {
      const endpoints = [
        '/superadmin/companies/all',
        '/projects',
        '/workers',
        '/tasks',
        '/attendance',
        '/equipment',
        '/finance/invoices',
        '/documents',
        '/reports',
        '/daily-logs',
        '/issues',
        '/workforce',
      ];

      const responses =
        await Promise.allSettled(
          endpoints.map((url) => api.get(url))
        );

      const payload = (index) => {
        const response = responses[index];

        if (response.status !== 'fulfilled') {
          return undefined;
        }

        return response.value?.data?.data;
      };


      setData((current) => ({
        ...current,

        // ------------------------------------------------------
        // COMPANIES
        // ------------------------------------------------------

        companies: Array.isArray(payload(0))
          ? payload(0).map((company) => ({
              ...company,

              status:
                String(
                  company.status || 'ACTIVE'
                ).toUpperCase() === 'ACTIVE'
                  ? 'Active'
                  : 'Suspended',
            }))
          : current.companies,


        // ------------------------------------------------------
        // PROJECTS
        // ------------------------------------------------------

        projects: Array.isArray(payload(1))
          ? payload(1).map((project) => ({
              ...project,

              progress:
                project.progressPercentage ??
                project.progress ??
                0,

              deadline:
                project.estEndDate ||
                project.deadline,

              companyName:
                project.company?.name ||
                project.companyName,
            }))
          : current.projects,


        // ------------------------------------------------------
        // WORKERS
        // ------------------------------------------------------

        workers: (() => {
          const rawWorkers = Array.isArray(payload(2)) ? payload(2) : [];
          const rawWorkforce = Array.isArray(payload(11)) ? payload(11) : [];

          const formattedWorkers = rawWorkers.map((worker) => ({
            ...worker,
            id: worker.id || worker.workerId,
            name: worker.fullName || worker.name,
            role: worker.skillTrade || worker.role || 'Worker',
            projectName: worker.assignedProject?.name || worker.projectName,
            assignedProject: worker.assignedProject?.name || worker.assignedProject,
            status: String(worker.status || 'ACTIVE').replace(/_/g, ' '),
            enabled: worker.enabled !== false,
          }));

          const formattedWorkforce = rawWorkforce.map((member) => ({
            ...member,
            id: member.userId || member.id,
            name: member.fullName || member.name,
            role: member.role || 'Personnel',
            enabled: member.enabled !== false,
            status: member.enabled !== false ? 'Active' : 'Suspended',
          }));

          const combined = [...formattedWorkforce];
          for (const w of formattedWorkers) {
            if (!combined.some((c) => String(c.id || c.email) === String(w.id || w.email))) {
              combined.push(w);
            }
          }
          return combined.length > 0 ? combined : current.workers;
        })(),


        // ------------------------------------------------------
        // TASKS
        // ------------------------------------------------------

        tasks: Array.isArray(payload(3))
          ? payload(3).map((task) => ({
              ...task,

              project:
                task.project?.name ||
                task.project,

              progress:
                task.completionPercentage ??
                task.progress ??
                0,

              deadline:
                task.dueDate ||
                task.deadline,
            }))
          : current.tasks,


        // ------------------------------------------------------
        // ATTENDANCE
        // ------------------------------------------------------

        attendanceLogs: Array.isArray(payload(4))
          ? payload(4).map((entry) => ({
              ...entry,

              workerName:
                entry.worker?.fullName ||
                entry.workerName,

              siteName:
                entry.project?.name ||
                entry.siteName,

              checkInTime:
                entry.checkIn
                  ? new Date(
                      entry.checkIn
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : entry.checkInTime,

              checkOutTime:
                entry.checkOut
                  ? new Date(
                      entry.checkOut
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : entry.checkOutTime ||
                    'Active On Site',
            }))
          : current.attendanceLogs,


        // ------------------------------------------------------
        // EQUIPMENT
        // ------------------------------------------------------

        equipment: Array.isArray(payload(5))
          ? payload(5).map((item) => ({
              ...item,

              projectName:
                item.project?.name ||
                item.projectName,

              status:
                String(
                  item.status ||
                    'OPERATIONAL'
                ).replace(/_/g, ' '),
            }))
          : current.equipment,


        // ------------------------------------------------------
        // FINANCE
        // ------------------------------------------------------

        finances: Array.isArray(payload(6))
          ? payload(6).map((finance) => ({
              ...finance,

              invoiceNo:
                finance.invoiceNumber ||
                finance.invoiceNo,

              contractor:
                finance.vendorName ||
                finance.contractor,

              projectName:
                finance.project?.name ||
                finance.projectName,
            }))
          : current.finances,


        // ------------------------------------------------------
        // DOCUMENTS
        // ------------------------------------------------------

        documents: Array.isArray(payload(7))
          ? payload(7).map((document) => ({
              ...document,

              name:
                document.title ||
                document.name,

              type:
                document.fileType ||
                document.type,

              projectName:
                document.project?.name ||
                document.projectName,
            }))
          : current.documents,


        // ------------------------------------------------------
        // REPORTS
        // ------------------------------------------------------

        progressReports: Array.isArray(payload(9))
          ? payload(9).map((log) => ({ ...log, projectName: log.projectName, workCompleted: log.workSummary, newTotalProgress: log.progressPercentage, submittedBy: log.createdBy, date: log.logDate }))
          : current.progressReports,

        // ------------------------------------------------------
        // SITE ISSUES
        // ------------------------------------------------------

        issues: Array.isArray(payload(10))
          ? payload(10).map((issue) => ({
              ...issue,
              projectName: issue.projectName,
              status: String(issue.status || 'OPEN').replace(/_/g, ' '),
              severity: String(issue.severity || 'HIGH').replace(/_/g, ' '),
            }))
          : current.issues,
      }));


      setRealtimeStatus((status) => ({
        ...status,
        lastSyncedAt:
          new Date().toISOString(),
      }));

    } catch (error) {
      console.error(
        'Failed to refresh BuildTrack data:',
        error
      );
    } finally {
      refreshInFlight.current = false;
    }
  }, []);


  // ============================================================
  // REALTIME SYNC
  // ============================================================

  useEffect(() => {
    let refreshTimer;

    const sync = (event) => {
      if (
        event?.source === 'tab' &&
        event.snapshot
      ) {
        setData(event.snapshot);

        setRealtimeStatus((status) => ({
          ...status,
          lastSyncedAt:
            new Date().toISOString(),
        }));

        return;
      }

      window.clearTimeout(refreshTimer);

      refreshTimer = window.setTimeout(
        refreshFromServer,
        120
      );
    };


    realtimeClient.resume();

    sync();


    const unsubscribe =
      realtimeBus.subscribe(
        'SERVER_UPDATE',
        sync
      );


    const unsubscribeStatus =
      realtimeBus.subscribe(
        'REALTIME_STATUS',
        setRealtimeStatus
      );


    window.addEventListener(
      'buildtrack:auth-changed',
      sync
    );


    return () => {
      window.clearTimeout(refreshTimer);

      unsubscribe();
      unsubscribeStatus();

      window.removeEventListener(
        'buildtrack:auth-changed',
        sync
      );
    };
  }, [refreshFromServer]);


  // ============================================================
  // USER CREATION
  // ============================================================

  const addUser = (newUser) => {
    const userObj = {
      id: Date.now().toString(),

      fullName: newUser.fullName,

      email: newUser.email,

      role: newUser.role,

      companyName:
        newUser.companyName ||
        user?.companyName ||
        '',

      companyCode:
        newUser.companyCode ||
        user?.companyCode ||
        '',

      blocked: false,

      createdAt:
        new Date().toISOString(),
    };


    updateData(
      (prev) => ({
        ...prev,

        usersList: [
          userObj,
          ...prev.usersList,
        ],
      }),
      {
        domain: 'users',
        action: 'created',
      }
    );


    notificationService.pushAlert({
      title: 'User Created',

      message:
        `User ${userObj.fullName} ` +
        `(${userObj.role}) created successfully.`,

      type: 'SUCCESS',
    });


    return userObj;
  };


  // ============================================================
  // PROJECT
  // ============================================================

  const addProject = (proj) => {
    const managerEmailMatch =
      String(proj.pmName || '').match(
        /\(([^()\s]+@[^()\s]+)\)$/
      );


    const newProj = {
      id: Date.now(),

      name: proj.name,

      companyName:
        proj.companyName ||
        user?.companyName ||
        '',

      companyCode:
        proj.companyCode ||
        user?.companyCode ||
        '',

      location:
        proj.location ||
        'Metro Site Zone',

      budget:
        parseFloat(proj.budget) ||
        1000000,

      progress: 0,

      status: 'Active',

      startDate:
        new Date()
          .toISOString()
          .split('T')[0],

      deadline:
        proj.deadline ||
        '2026-12-31',

      pmName:
        proj.pmName ||
        'Unassigned PM',

      assignedProjectManagerEmail:
        managerEmailMatch?.[1] ||
        proj.assignedProjectManagerEmail ||
        null,

      seName:
        proj.seName ||
        'Unassigned SE',

      contractorName:
        proj.contractorName ||
        'Unassigned Contractor',

      assignedWorkers:
        proj.assignedWorkers ||
        [],
    };


    updateData(
      (prev) => ({
        ...prev,

        projects: [
          newProj,
          ...prev.projects,
        ],
      }),
      {
        domain: 'projects',
        action: 'created',
      }
    );


    api.post('/projects', {
      name: newProj.name,
      location: newProj.location,
      budget: newProj.budget,
      startDate: newProj.startDate,
      estEndDate: newProj.deadline,
      assignedProjectManagerEmail:
        newProj.assignedProjectManagerEmail,
    })
      .then(refreshFromServer)
      .catch((error) => {
        console.error(
          'Failed to create project:',
          error
        );
      });


    return newProj;
  };


  const assignPMToProject = (
    projectId,
    pmName
  ) => {
    updateData(
      (prev) => ({
        ...prev,

        projects: prev.projects.map(
          (project) =>
            project.id === projectId
              ? {
                  ...project,
                  pmName,
                }
              : project
        ),
      }),
      {
        domain: 'projects',
        action: 'assigned',
      }
    );
  };


  const assignSEToProject = (
    projectId,
    seName
  ) => {
    updateData(
      (prev) => ({
        ...prev,

        projects: prev.projects.map(
          (project) =>
            project.id === projectId
              ? {
                  ...project,
                  seName,
                }
              : project
        ),
      }),
      {
        domain: 'projects',
        action: 'assigned',
      }
    );
  };


  const assignContractorToProject = (
    projectId,
    contractorName
  ) => {
    updateData(
      (prev) => ({
        ...prev,

        projects: prev.projects.map(
          (project) =>
            project.id === projectId
              ? {
                  ...project,
                  contractorName,
                }
              : project
        ),
      }),
      {
        domain: 'projects',
        action: 'assigned',
      }
    );
  };


  const assignWorkersToProject = (
    projectId,
    workerNames
  ) => {
    updateData(
      (prev) => ({
        ...prev,

        projects: prev.projects.map(
          (project) =>
            project.id === projectId
              ? {
                  ...project,
                  assignedWorkers:
                    workerNames,
                }
              : project
        ),
      }),
      {
        domain: 'projects',
        action: 'assigned',
      }
    );
  };


  // ============================================================
  // TASK
  // ============================================================

  const addTask = (task) => {
    const newTask = {
      id: Date.now().toString(),

      title: task.title,

      project:
        task.project ||
        '',

      createdBy:
        task.createdBy ||
        'Project Manager',

      assignedSE:
        task.assignedSE ||
        'Unassigned SE',

      assignedContractor:
        task.assignedContractor ||
        'Unassigned Contractor',

      assignedWorker:
        task.assignedWorker ||
        'Unassigned Worker',

      priority:
        task.priority ||
        'Medium',

      status: 'Assigned',

      progress: 0,

      deadline:
        task.deadline ||
        '2026-09-01',
    };


    updateData(
      (prev) => ({
        ...prev,

        tasks: [
          newTask,
          ...prev.tasks,
        ],
      }),
      {
        domain: 'tasks',
        action: 'created',
      }
    );


    const project =
      data.projects.find(
        (item) =>
          String(item.id) ===
            String(task.projectId) ||
          item.name === newTask.project
      );


    if (project?.id) {
      api.post('/tasks', {
        title: newTask.title,

        priority:
          String(
            newTask.priority
          ).toUpperCase(),

        status: 'TODO',

        completionPercentage: 0,

        dueDate: newTask.deadline,

        project: {
          id: project.id,
        },
      })
        .then(refreshFromServer)
        .catch((error) => {
          console.error(
            'Failed to create task:',
            error
          );
        });
    }


    return newTask;
  };


  const updateTaskStatus = (
    taskId,
    status,
    progress
  ) => {
    updateData(
      (prev) => ({
        ...prev,

        tasks: prev.tasks.map(
          (task) =>
            task.id === taskId
              ? {
                  ...task,
                  status,

                  progress:
                    progress !== undefined
                      ? progress
                      : task.progress,
                }
              : task
        ),
      }),
      {
        domain: 'tasks',
        action: 'updated',
      }
    );


    api.patch(
      `/tasks/${taskId}`,
      {
        status:
          String(status || '')
            .toUpperCase()
            .replace(/\s+/g, '_'),

        progress,
      }
    )
      .then(refreshFromServer)
      .catch((error) => {
        console.error(
          'Failed to update task:',
          error
        );
      });
  };


  // ============================================================
  // ATTENDANCE
  // ============================================================

  const logWorkerCheckIn = async (
    workerName,
    siteName
  ) => {
    const today =
      new Date()
        .toISOString()
        .split('T')[0];

    const worker = data.workers.find(
      (item) => (item.fullName || item.name) === workerName
    );
    const project = data.projects.find(
      (item) => item.name === siteName
    ) || data.projects[0];
    if (!worker?.id) throw new Error('Your workforce profile is not available.');
    if (!project?.id) throw new Error('No project is assigned to you.');

    const newLog = {
      id: Date.now().toString(),

      workerName,

      workerRole: 'Worker',

      contractorName: '',

      siteName: siteName || '',

      date: today,

      checkInTime:
        new Date().toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        ),

      checkOutTime:
        'Active On Site',

      status: 'Present',

      contractorMarked: true,

      seVerified: 'Pending',

      pmReviewed: 'Pending',

      caApproved: 'Pending',
    };


    updateData(
      (prev) => ({
        ...prev,

        attendanceLogs: [
          newLog,
          ...prev.attendanceLogs,
        ],
      }),
      {
        domain: 'attendance',
        action: 'checked_in',
      }
    );
    const response = await api.post('/attendance/check-in', {
      worker: { id: Number(worker.id) },
      project: { id: Number(project.id) },
    });
    await refreshFromServer();
    return response.data?.data || newLog;
  };


  const logWorkerCheckOut = async (
    logId
  ) => {
    const checkOutTime =
      new Date().toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      );


    updateData(
      (prev) => ({
        ...prev,

        attendanceLogs:
          prev.attendanceLogs.map(
            (log) =>
              String(log.id) ===
              String(logId)
                ? {
                    ...log,
                    checkOutTime,

                    checkOut:
                      new Date().toISOString(),
                  }
                : log
          ),
      }),
      {
        domain: 'attendance',
        action: 'checked_out',
      }
    );


    if (
      Number.isFinite(Number(logId))
    ) {
      await api.patch(`/attendance/${logId}/check-out`);
      await refreshFromServer();
    }
  };


  const verifyAttendanceSE = (
    logId
  ) => {
    updateData(
      (prev) => ({
        ...prev,

        attendanceLogs:
          prev.attendanceLogs.map(
            (log) =>
              log.id === logId
                ? {
                    ...log,
                    seVerified:
                      'Verified',
                  }
                : log
          ),
      }),
      {
        domain: 'attendance',
        action: 'verified',
      }
    );


    if (
      Number.isFinite(Number(logId))
    ) {
      api.patch(
        `/attendance/${logId}/verification`,
        {
          verified: true,
        }
      )
        .then(refreshFromServer)
        .catch((error) => {
          console.error(
            'Failed to verify attendance:',
            error
          );
        });
    }
  };


  const reviewAttendancePM = (
    logId
  ) => {
    updateData(
      (prev) => ({
        ...prev,

        attendanceLogs:
          prev.attendanceLogs.map(
            (log) =>
              log.id === logId
                ? {
                    ...log,
                    pmReviewed:
                      'Reviewed',
                  }
                : log
          ),
      }),
      {
        domain: 'attendance',
        action: 'reviewed',
      }
    );
  };


  const approveAttendanceCA = (
    logId
  ) => {
    updateData(
      (prev) => ({
        ...prev,

        attendanceLogs:
          prev.attendanceLogs.map(
            (log) =>
              log.id === logId
                ? {
                    ...log,
                    caApproved:
                      'Approved',
                  }
                : log
          ),
      }),
      {
        domain: 'attendance',
        action: 'approved',
      }
    );
  };


  // ============================================================
  // WORKERS
  // ============================================================

  const addWorker = (worker) => {
    updateData(
      (prev) => ({
        ...prev,

        workers: [
          worker,
          ...prev.workers,
        ],
      }),
      {
        domain: 'workers',
        action: 'created',
      }
    );


    api.post('/workers', {
      fullName:
        worker.fullName ||
        worker.name,

      phone: worker.phone,

      skillTrade:
        worker.skillTrade ||
        worker.role ||
        'Worker',

      dailyWage:
        Number(worker.dailyWage || 0),

      qrCodeToken:
        worker.qrCodeToken ||
        `QR-${Date.now()}`,

      status:
        String(
          worker.status ||
            'ACTIVE'
        )
          .toUpperCase()
          .replace(/\s+/g, '_'),

      contractorName:
        worker.contractorName,

      siteEngineerName:
        worker.siteEngineerName,

      assignmentType:
        worker.workerAssignmentType ||
        worker.assignmentType ||
        'DIRECT_PROJECT',
    })
      .then(refreshFromServer)
      .catch((error) => {
        console.error(
          'Failed to create worker:',
          error
        );
      });
  };


  // ============================================================
  // EQUIPMENT
  // ============================================================

  const addEquipment = (
    equipment
  ) => {
    updateData(
      (prev) => ({
        ...prev,

        equipment: [
          equipment,
          ...prev.equipment,
        ],
      }),
      {
        domain: 'equipment',
        action: 'created',
      }
    );


    const project =
      data.projects.find(
        (item) =>
          item.name ===
          equipment.projectName
      );


    api.post('/equipment', {
      name: equipment.name,

      category:
        equipment.category ||
        'General',

      serialNumber:
        equipment.equipmentId,

      status:
        String(
          equipment.status ||
            'OPERATIONAL'
        )
          .toUpperCase()
          .replace(/\s+/g, '_'),

      dailyCost:
        Number(
          equipment.dailyCost || 0
        ),

      ...(Number.isFinite(
        Number(project?.id)
      )
        ? {
            project: {
              id: Number(
                project.id
              ),
            },
          }
        : {}),
    })
      .then(refreshFromServer)
      .catch((error) => {
        console.error(
          'Failed to create equipment:',
          error
        );
      });
  };


  const deleteEquipment = (
    equipmentId
  ) => {
    updateData(
      (prev) => ({
        ...prev,

        equipment:
          prev.equipment.filter(
            (equipment) =>
              String(equipment.id) !==
              String(equipmentId)
          ),
      }),
      {
        domain: 'equipment',
        action: 'deleted',
      }
    );
  };


  const updateEquipmentStatus = (
    equipmentId,
    newStatus
  ) => {
    updateData(
      (prev) => ({
        ...prev,

        equipment:
          prev.equipment.map(
            (equipment) =>
              String(equipment.id) ===
              String(equipmentId)
                ? {
                    ...equipment,
                    status: newStatus,
                  }
                : equipment
          ),
      }),
      {
        domain: 'equipment',
        action: 'updated',
      }
    );


    if (
      Number.isFinite(
        Number(equipmentId)
      )
    ) {
      api.patch(
        `/equipment/${equipmentId}/status`,
        {
          status:
            String(newStatus)
              .toUpperCase()
              .replace(/\s+/g, '_'),
        }
      )
        .then(refreshFromServer)
        .catch((error) => {
          console.error(
            'Failed to update equipment:',
            error
          );
        });
    }
  };


  // ============================================================
  // OTHER DATA
  // ============================================================



  // ============================================================
  // COMPANY
  // ============================================================

  const addCompany = async (companyData) => {
    try {
      const response = await api.post(
        '/superadmin/companies',
        companyData
      );

      const rawData = response.data?.data || (response.data?.id ? response.data : null);

      if (!rawData) {
        throw new Error(
          response.data?.message ||
          response.data?.error ||
          'Failed to create company.'
        );
      }

      const createdCompany = rawData.company || rawData;

      setData((prev) => ({
        ...prev,
        companies: [
          {
            ...createdCompany,
            status:
              String(
                createdCompany.status || 'ACTIVE'
              ).toUpperCase() === 'ACTIVE'
                ? 'Active'
                : 'Pending',
          },
          ...prev.companies,
        ],
      }));

      return rawData;
    } catch (error) {
      console.error('Failed to create company:', error);
      throw error;
    }
  };

  // ============================================================
  // PROGRESS REPORT
  // ============================================================

  const addProgressReport = (
    report
  ) => {
    const newReport = {
      id: Date.now(),

      date:
        new Date()
          .toISOString()
          .slice(0, 10),

      ...report,
    };


    updateData(
      (prev) => {
        const updatedProjects =
          prev.projects.map(
            (project) => {
              if (
                String(project.id) ===
                  String(
                    report.projectId
                  ) ||
                project.name ===
                  report.projectName
              ) {
                return {
                  ...project,

                  progress:
                    report.newTotalProgress ??
                    project.progress,
                };
              }

              return project;
            }
          );


        return {
          ...prev,

          projects:
            updatedProjects,

          progressReports: [
            newReport,
            ...(prev.progressReports || []),
          ],
        };
      },
      {
        domain: 'reports',
        action: 'created',
      }
    );


    api.post(
      '/reports',
      newReport
    )
      .then(refreshFromServer)
      .catch((error) => {
        console.error(
          'Failed to create progress report:',
          error
        );
      });


    return newReport;
  };


  // ============================================================
  // TEAM
  // ============================================================


  // ============================================================
  // TENANT / ROLE SCOPING
  // ============================================================

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN';

  const currentCompanyCode =
    user?.companyCode;

  const currentCompanyName =
    user?.companyName;


  const belongsToCurrentTenant = (
    item
  ) => {
    if (isSuperAdmin) {
      return true;
    }

    if (!user) {
      return true;
    }

    return (
      item.companyCode ===
        currentCompanyCode ||

      item.companyName ===
        currentCompanyName ||

      item.companyId ===
        user.companyId ||

      item.company?.id ===
        user.companyId ||

      item.company?.code ===
        currentCompanyCode
    );
  };


  // ============================================================
  // SCOPED DATA
  // ============================================================

  const scopedData = {
    ...data,

    companies: isSuperAdmin
      ? data.companies
      : data.companies.filter(
          (company) =>
            company.code ===
            currentCompanyCode
        ),

    projects:
      data.projects.filter(
        belongsToCurrentTenant
      ),

    usersList:
      data.usersList.filter(
        belongsToCurrentTenant
      ),

    workers:
      data.workers.filter(
        belongsToCurrentTenant
      ),

    tasks:
      data.tasks.filter(
        (task) =>
          isSuperAdmin ||
          data.projects.some(
            (project) =>
              belongsToCurrentTenant(
                project
              ) &&
              project.name ===
                task.project
          )
      ),
  };

  const deleteCompany = async (companyId) => {
  try {
    await api.delete(`/superadmin/companies/${companyId}`);

    setData((prev) => ({
      ...prev,
      companies: prev.companies.filter(
        (company) => String(company.id) !== String(companyId)
      ),
    }));

    return true;
  } catch (error) {
    console.error('Failed to delete company:', error);
    throw error;
  }
};

const updateCompanyStatus = async (
  companyId,
  newStatus
) => {
  try {
    await api.patch(
      `/superadmin/companies/${companyId}/status`,
      {
        status: newStatus.toUpperCase(),
      }
    );

    setData((prev) => ({
      ...prev,
      companies: prev.companies.map((company) =>
        String(company.id) === String(companyId)
          ? {
              ...company,
              status: newStatus,
            }
          : company
      ),
    }));

    return true;
  } catch (error) {
    console.error(
      'Failed to update company status:',
      error
    );

    throw error;
  }
};

  // ============================================================
  // PROVIDER
  // ============================================================

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


        addCompany,

        deleteCompany,

        addProgressReport,


        refreshFromServer,

        realtimeStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}


// ============================================================
// HOOK
// ============================================================

export function useData() {
  const context =
    useContext(DataContext);

  if (!context) {
    throw new Error(
      'useData must be used within a DataProvider'
    );
  }

  return context;
}