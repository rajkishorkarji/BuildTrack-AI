import { useEffect, useState } from 'react';
import { Package, RefreshCw, CheckCircle2, AlertTriangle, Plus, Send, Check } from 'lucide-react';
import materialService from '../../services/materialService';
import { useData } from '../../context/DataContext';
import { realtimeBus } from '../../services/api';

export default function SEMaterials() {
  const { materials = [], projects = [], tasks = [], materialRequests = [], refresh } = useData();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [form, setForm] = useState({
    materialId: '',
    quantity: '',
    taskId: '',
    requiredDate: 'Today',
    reason: 'Site Work',
  });

  useEffect(() => {
    if (refresh) refresh();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => refresh && refresh());
    return () => unsub();
  }, []);

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!form.materialId || !form.quantity) return;
    setBusyId('submit');
    setError('');
    try {
      await materialService.createRequest({
        material: { id: Number(form.materialId) },
        quantity: Number(form.quantity),
        task: form.taskId ? { id: Number(form.taskId) } : null,
        requiredDate: form.requiredDate,
        reason: form.reason,
      });
      setNotice('Material request submitted to Contractor!');
      setShowRequestModal(false);
      setForm({ materialId: '', quantity: '', taskId: '', requiredDate: 'Today', reason: 'Site Work' });
      setTimeout(() => setNotice(''), 3000);
      if (refresh) refresh();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setBusyId(null);
    }
  };

  const confirmReceipt = async (reqId) => {
    setBusyId(reqId);
    try {
      await materialService.confirmRequest(reqId);
      setNotice('Confirmed material receipt on site!');
      setTimeout(() => setNotice(''), 3000);
      if (refresh) refresh();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to confirm receipt');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Package size={14} /> Site Engineer Materials
          </p>
          
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="primary-button" onClick={() => setShowRequestModal(true)}>
            <Plus size={16} /> Request Material
          </button>
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

      {/* Material Requests Track */}
      <div className="panel" style={{ marginTop: 20, padding: 20 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>Site Material Requests & Confirmations</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Material Requested', 'Qty', 'Task', 'Required Date', 'Reason', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materialRequests.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>No material requests submitted yet. Click "Request Material" to create one.</td></tr>
              ) : (
                materialRequests.map(r => {
                  const isWorkerReceived = r.status === 'WORKER_RECEIVED' || r.status === 'ISSUED';
                  const isConfirmed = r.status === 'CONFIRMED';
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
                    || '—';
                  const taskObj = (tasks || []).find(t => String(t.id) === String(r.taskId || r.task?.id));
                  const taskTitle = r.task?.title || r.task?.name || (r.taskTitle && r.taskTitle !== 'General Site Work' ? r.taskTitle : null) || taskObj?.title || taskObj?.name || r.taskTitle || 'Site Work';
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{matName}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800 }}>{r.quantity} {r.unit}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--blue)', fontWeight: 600 }}>{taskTitle}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>{r.requiredDate || 'Today'}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>{r.reason || 'Site Work'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: isConfirmed ? 'rgba(34,197,94,0.12)' : isWorkerReceived ? 'rgba(37,99,235,0.12)' : 'rgba(245,158,11,0.12)',
                          color: isConfirmed ? 'var(--green)' : isWorkerReceived ? 'var(--blue)' : 'var(--orange)',
                        }}>
                          {r.status === 'PENDING' ? 'Awaiting Contractor Approval' : r.status === 'ISSUED' ? 'Issued by Contractor' : r.status === 'WORKER_RECEIVED' ? 'Received by Worker' : r.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {isWorkerReceived && !isConfirmed && (
                          <button className="primary-button" style={{ fontSize: 11, padding: '4px 10px' }} disabled={busyId === r.id} onClick={() => confirmReceipt(r.id)}>
                            <Check size={12} /> Confirm Receipt
                          </button>
                        )}
                        {isConfirmed && <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 700 }}>Confirmed ✓</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Store Inventory */}
      <div className="panel" style={{ marginTop: 20, padding: 0, overflow: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
          Project Store Stock Availability
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Material</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Project</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Available Quantity</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No project store materials available.</td></tr>
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
              );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Request Material Modal */}
      {showRequestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 480, padding: 24, borderRadius: 16 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Request Site Material</h2>
            <form onSubmit={submitRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Select Material *</label>
                <select
                  required
                  value={form.materialId}
                  onChange={e => setForm({ ...form, materialId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="">Select Material from Store</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity} {m.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Requested Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 50"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Target Task</label>
                <select
                  value={form.taskId}
                  onChange={e => setForm({ ...form, taskId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="">Select Task (Optional)</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title || t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Required Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Today"
                    value={form.requiredDate}
                    onChange={e => setForm({ ...form, requiredDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Foundation Work"
                    value={form.reason}
                    onChange={e => setForm({ ...form, reason: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="secondary-button" onClick={() => setShowRequestModal(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={busyId === 'submit'}>
                  <Send size={14} /> {busyId === 'submit' ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
