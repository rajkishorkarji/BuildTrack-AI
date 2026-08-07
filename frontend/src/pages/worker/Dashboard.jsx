import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CheckSquare, Clock, ShieldCheck, Bell, Camera, MapPin, ArrowRight } from 'lucide-react';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { tasks = [], attendanceLogs = [], equipment = [], logWorkerCheckIn, logWorkerCheckOut, projects = [] } = useData();
  const workerName = user?.fullName || 'Worker';
  const activeAttendance = attendanceLogs.find((entry) => (entry.workerName === workerName || !entry.workerName) && !entry.checkOut && entry.checkOutTime === 'Active On Site');
  const checkedIn = Boolean(activeAttendance);
  const assignedTasks = tasks.filter((task) => !task.assignedWorker || task.assignedWorker === workerName);
  const openTasks = assignedTasks.filter((task) => !String(task.status).toUpperCase().includes('COMPLETED'));
  const workerEquipment = equipment.filter((item) => !item.operator || item.operator === workerName);

  const toggleAttendance = () => {
    if (checkedIn) logWorkerCheckOut(activeAttendance.id);
    else logWorkerCheckIn(workerName, projects[0]?.name);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <CheckSquare size={14} /> Dashboard
          </p>
        </div>
        <button
          type="button"
          className="primary-button"
          style={{ background: checkedIn ? 'var(--green)' : 'var(--blue)' }}
          onClick={toggleAttendance}
        >
          <Clock size={16} /> {checkedIn ? 'Checked In (08:00 AM)' : 'Check In Now'}
        </button>
      </section>

      {/* 4 Quick Actions & Today's Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: "Today's Tasks", value: `${openTasks.length} Pending`, color: 'var(--blue)', sub: projects[0]?.name || 'No project assigned' },
          { label: 'Attendance Status', value: checkedIn ? 'Present' : 'Not Checked In', color: checkedIn ? 'var(--green)' : 'var(--orange)', sub: 'Shift: Day (08:00 - 17:00)' },
          { label: 'Work Progress', value: assignedTasks.length ? `${Math.round(assignedTasks.reduce((sum, task) => sum + Number(task.progress ?? task.completionPercentage ?? 0), 0) / assignedTasks.length)}%` : '—', color: 'var(--purple)', sub: `${assignedTasks.length} assigned items` },
          { label: 'Assigned Equipment', value: `${workerEquipment.length} asset${workerEquipment.length === 1 ? '' : 's'}`, color: 'var(--orange)', sub: workerEquipment[0]?.name || 'No equipment assigned' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="panel" style={{ padding: '20px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: '22px', color, margin: '4px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
      </div>

      {/* Today's Tasks & Work Instructions */}
      <div className="panel" style={{ marginTop: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={18} style={{ color: 'var(--blue)' }} /> Today's Assigned Tasks
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(assignedTasks.length ? assignedTasks : [{ id: 'empty', title: 'No tasks assigned yet', project: projects[0]?.name || 'Awaiting assignment', status: 'Pending' }]).map((t) => (
            <div key={t.id} style={{ padding: '14px 16px', background: 'var(--panel-soft)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text)' }}>{t.title}</strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{t.project || projects[0]?.name || 'Project site'}</span>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: t.status === 'Completed' ? 'rgba(34,197,94,0.12)' : 'rgba(26,115,232,0.12)', color: t.status === 'Completed' ? 'var(--green)' : 'var(--blue)' }}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
