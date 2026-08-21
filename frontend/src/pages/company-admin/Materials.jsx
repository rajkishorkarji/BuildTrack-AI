import { useEffect, useState } from 'react';
import { Package, Plus, RefreshCw } from 'lucide-react';
import materialService from '../../services/materialService';
import projectService from '../../services/projectService';
import { useData } from '../../context/DataContext';
import { realtimeBus } from '../../services/api';

export default function CompanyAdminMaterials() {
  const { materials = [], refresh } = useData();
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', unit: 'Tons', quantity: '0', reorderLevel: '0', unitCost: '0', projectId: '' });

  const loadProjects = async () => {
    try {
      const p = await projectService.list();
      setProjects(p || []);
    } catch (e) {
      setProjects([]);
    }
  };

  useEffect(() => {
    loadProjects();
    if (refresh) refresh();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => refresh && refresh());
    return () => unsub();
  }, []);

  const create = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      await materialService.create({
        name: form.name,
        unit: form.unit,
        quantity: Number(form.quantity),
        reorderLevel: Number(form.reorderLevel),
        unitCost: Number(form.unitCost),
        project: { id: Number(form.projectId) },
      });
      setOpen(false);
      setForm({ name: '', unit: 'Tons', quantity: '0', reorderLevel: '0', unitCost: '0', projectId: '' });
      if (refresh) refresh();
    } finally {
      setBusy(false);
    }
  };

  const receive = async (id, unitCost) => {
    try {
      await materialService.receive(id, { quantity: 1, unitCost, notes: 'Manual receipt' });
      if (refresh) refresh();
    } catch (e) {
      console.error('Receive failed:', e);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Package size={14} /> Materials Inventory
          </p>
          <h1>Company Material Management</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="secondary-button" onClick={() => refresh && refresh()}>
            <RefreshCw size={14} /> Refresh Realtime
          </button>
          <button className="primary-button" onClick={() => setOpen(true)}>
            <Plus size={16} /> Add Material
          </button>
        </div>
      </section>

      <div className="panel" style={{ marginTop: 20, padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Material</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Project</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Stock</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Reorder Level</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No materials recorded.</td></tr>
            ) : (
              materials.map(m => {
                const projId = m.projectId || m.project?.id || m.project_id || (typeof m.project === 'number' || (typeof m.project === 'string' && !isNaN(m.project)) ? m.project : null);
                const matchedProj = (projects || []).find(p => String(p.id) === String(projId) || String(p.code) === String(projId));
                const projName = (m.project && typeof m.project === 'object' && m.project.name && !/^[\s—\-_]+$/.test(m.project.name.trim()) ? m.project.name : null)
                  || (m.projectName && !/^[\s—\-_]+$/.test(m.projectName.trim()) ? m.projectName : null)
                  || (matchedProj?.name && !/^[\s—\-_]+$/.test(matchedProj.name.trim()) ? matchedProj.name : null)
                  || (typeof m.project === 'string' && isNaN(m.project) && !/^[\s—\-_]+$/.test(m.project.trim()) ? m.project : null)
                  || (projects.length === 1 && projects[0]?.name ? projects[0].name : null)
                  || '—';
                const matName = (m.name && !/^[\s—\-_]+$/.test(String(m.name).trim()) ? m.name : null) || (m.materialName && !/^[\s—\-_]+$/.test(String(m.materialName).trim()) ? m.materialName : null) || m.name || '—';
                return (
                  <tr key={m.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{matName}</td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{projName}</td>
                    <td style={{ padding: 14, fontWeight: 800 }}>{m.quantity} {m.unit}</td>
                    <td style={{ padding: 14, color: 'var(--muted)' }}>{m.minRequired || m.reorderLevel || 10}</td>
                    <td style={{ padding: 14 }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: String(m.status).includes('LOW') ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                        color: String(m.status).includes('LOW') ? 'var(--orange)' : 'var(--green)',
                      }}>
                        {String(m.status || 'AVAILABLE').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: 14 }}>
                      <button className="secondary-button" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => receive(m.id, m.unitCost || 0)}>
                        +1 Stock
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form className="panel" onSubmit={create} style={{ width: 520, padding: 28, borderRadius: 16 }}>
            <h2 style={{ margin: '0 0 16px' }}>Add Material</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required placeholder="Material name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }} />
              <input placeholder="Unit (Tons, m³, Rolls, bags)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }} />
              <input type="number" min="0" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }} />
              <input type="number" min="0" placeholder="Reorder Level" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }} />
              <input type="number" min="0" step=".01" placeholder="Unit Cost" value={form.unitCost} onChange={e => setForm({ ...form, unitCost: e.target.value })} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }} />
              <select required value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}>
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" className="secondary-button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="primary-button" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
