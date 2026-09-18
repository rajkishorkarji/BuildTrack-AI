import { useEffect, useState } from 'react';
import { CheckSquare, Search, Play, ShieldCheck, MapPin } from 'lucide-react';
import taskService from '../../services/taskService';
import { getCurrentGpsCoordinates } from '../../utils/geo';

export default function WorkerTasks() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = () => {
    setLoading(true);
    taskService.list()
      .then(setTasks)
      .catch(e => setError(e.response?.data?.message || 'Unable to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const start = async (id) => {
    try {
      const coords = await getCurrentGpsCoordinates();
      const updated = await taskService.updateProgress(id, {
        progress: 1,
        status: 'IN_PROGRESS',
        latitude: coords?.latitude,
        longitude: coords?.longitude
      });
      setTasks(v => v.map(t => (t.id === id ? updated : t)));
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to update task');
    }
  };

  const filtered = tasks.filter(t =>
    (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.projectName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow"><CheckSquare size={14}/> My Tasks</p>
          <h1>Assigned Tasks</h1>
        </div>
      </section>
      {error && <div className="panel" style={{ marginTop: 16, color: 'var(--red)' }}>{error}</div>}
      <div className="panel" style={{ marginTop: 16, padding: 14 }}>
        <div className="search-box" style={{ width: 320 }}>
          <Search size={14}/>
          <input placeholder="Search task or project..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 16, padding: 0, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 30, textAlign: 'center' }}>Loading tasks…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Progress</th>
                <th>Status</th>
                <th>GPS Verified</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>No tasks found</td></tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.title}</strong></td>
                    <td>{t.projectName || '—'}</td>
                    <td><span style={{ fontSize: 12 }}>{t.priority}</span></td>
                    <td>{t.completionPercentage ?? t.progress ?? 0}%</td>
                    <td><span style={{ fontSize: 12, fontWeight: 600 }}>{t.status}</span></td>
                    <td>
                      {t.locationVerified === true ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>
                          <ShieldCheck size={14} /> On-Site
                        </span>
                      ) : t.locationVerified === false ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--red)', fontSize: 12 }}>
                          <MapPin size={14} /> Remote / Flagged
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>Standard</span>
                      )}
                    </td>
                    <td>
                      {t.status === 'TODO' && (
                        <button className="primary-button" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => start(t.id)}>
                          <Play size={13}/> Start
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
