import { useEffect, useState } from 'react';
import { Package, RefreshCw, CheckCircle2, AlertTriangle, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';
import materialService from '../../services/materialService';
import { realtimeBus } from '../../services/api';

export default function WorkerMaterials() {
  const { materials = [], projects = [], tasks = [], materialRequests = [], refresh } = useData();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (refresh) refresh();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => refresh && refresh());
    return () => unsub();
  }, []);

  const handleWorkerReceive = async (reqId) => {
    setBusyId(reqId);
    setError('');
    try {
      await materialService.workerReceiveRequest(reqId);
      setNotice('Received material on site!');
      setTimeout(() => setNotice(''), 3000);
      if (refresh) refresh();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to receive material');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Package size={14} /> Worker Materials & Allocations
          </p>
        
        </div>
        
      </section>

      {notice && (
        <div className="panel" style={{ marginTop: 16, padding: '12px 16px', color: 'var(--green)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {error && (
        <div className="panel" style={{ marginTop: 16, padding: '12px 16px', color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Issued Materials for Site Tasks */}
      <div className="panel" style={{ marginTop: 20, padding: 20 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>Issued Materials Assigned to Tasks</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Material', 'Quantity', 'Task', 'Requested By', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materialRequests.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>No material issues assigned to site tasks yet.</td></tr>
              ) : (
                materialRequests.map(r => {
                  const isIssued = r.status === 'ISSUED';
                  const isReceived = r.status === 'WORKER_RECEIVED' || r.status === 'CONFIRMED';
                  const matId = r.materialId || r.material?.id || r.material_id || (typeof r.material === 'number' || (typeof r.material === 'string' && !isNaN(r.material)) ? r.material : null);
                  const matchedMat = (materials || []).find(m => String(m.id) === String(matId));
                  const matName = (r.material && typeof r.material === 'object' && r.material.name && !/^[\s—\-_]+$/.test(r.material.name.trim()) ? r.material.name : null)
                    || (r.materialName && !/^[\s—\-_]+$/.test(r.materialName.trim()) ? r.materialName : null)
                    || (r.materialRequested && !/^[\s—\-_]+$/.test(r.materialRequested.trim()) ? r.materialRequested : null)
                    || (matchedMat?.name && !/^[\s—\-_]+$/.test(matchedMat.name.trim()) ? matchedMat.name : null)
                    || (matchedMat?.materialName && !/^[\s—\-_]+$/.test(matchedMat.materialName.trim()) ? matchedMat.materialName : null)
                    || (r.name && !/^[\s—\-_]+$/.test(r.name.trim()) ? r.name : null)
                    || (r.title && !/^[\s—\-_]+$/.test(r.title.trim()) ? r.title : null)
                    || (typeof r.material === 'string' && isNaN(r.material) && !/^[\s—\-_]+$/.test(r.material.trim()) ? r.material : null)
                    || (materials.length > 0 && matId ? (materials.find(m => String(m.id) === String(matId))?.name) : null)
                    || 'Material';
                  const taskObj = (tasks || []).find(t => String(t.id) === String(r.taskId || r.task?.id));
                  const taskTitle = r.task?.title || r.task?.name || (r.taskTitle && r.taskTitle !== 'General Site Work' ? r.taskTitle : null) || taskObj?.title || taskObj?.name || r.taskTitle || 'Site Task';
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{matName}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800 }}>{r.quantity} {r.unit}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--blue)', fontWeight: 600 }}>{taskTitle}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>{r.requestedByName || 'Site Engineer'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: isReceived ? 'rgba(34,197,94,0.12)' : isIssued ? 'rgba(37,99,235,0.12)' : 'rgba(245,158,11,0.12)',
                          color: isReceived ? 'var(--green)' : isIssued ? 'var(--blue)' : 'var(--orange)',
                        }}>
                          {r.status === 'ISSUED' ? 'Ready for Receipt' : r.status === 'WORKER_RECEIVED' ? 'Received on Site' : r.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {isIssued && (
                          <button
                            className="primary-button"
                            style={{ fontSize: 11, padding: '4px 10px' }}
                            disabled={busyId === r.id}
                            onClick={() => handleWorkerReceive(r.id)}
                          >
                            <Check size={12} /> Receive Material
                          </button>
                        )}
                        {isReceived && <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 700 }}>Received ✓</span>}
                        {r.status === 'PENDING' && <span style={{ color: 'var(--muted)', fontSize: 12 }}>Awaiting Issue</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Store Stock List */}
      <div className="panel" style={{ marginTop: 20, padding: 0, overflow: 'auto' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
          Project Store Stock List
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Material</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Project Site</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Stock Quantity</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No site materials recorded yet.</td></tr>
            ) : (
              materials.map(m => {
                const projId = m.projectId || m.project?.id || m.project_id || (typeof m.project === 'number' || (typeof m.project === 'string' && !isNaN(m.project)) ? m.project : null);
                const matchedProj = (projects || []).find(p => String(p.id) === String(projId) || String(p.code) === String(projId));
                const projName = (m.project && typeof m.project === 'object' && m.project.name && !/^[\s—\-_]+$/.test(m.project.name.trim()) ? m.project.name : null)
                  || (m.projectName && !/^[\s—\-_]+$/.test(m.projectName.trim()) ? m.projectName : null)
                  || (matchedProj?.name && !/^[\s—\-_]+$/.test(matchedProj.name.trim()) ? matchedProj.name : null)
                  || (typeof m.project === 'string' && isNaN(m.project) && !/^[\s—\-_]+$/.test(m.project.trim()) ? m.project : null)
                  || (projects.length === 1 && projects[0]?.name ? projects[0].name : null)
                  || (projects.length > 0 && projId ? (projects.find(p => String(p.id) === String(projId))?.name) : null)
                  || '—';
                const matName = (m.name && !/^[\s—\-_]+$/.test(String(m.name).trim()) ? m.name : null) || (m.materialName && !/^[\s—\-_]+$/.test(String(m.materialName).trim()) ? m.materialName : null) || m.name || '—';
                return (
                  <tr key={m.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{matName}</td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{projName}</td>
                  <td style={{ padding: 14, fontWeight: 800 }}>{m.quantity} {m.unit}</td>
                  <td style={{ padding: 14 }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: String(m.status).includes('LOW') ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                      color: String(m.status).includes('LOW') ? 'var(--orange)' : 'var(--green)',
                    }}>
                      {String(m.status || 'AVAILABLE').replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ); })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
