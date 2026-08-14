import { useEffect, useState, useMemo } from 'react';
import { CheckSquare, Plus, Search, RefreshCw, AlertTriangle, Users, X } from 'lucide-react';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import api, { realtimeBus } from '../../services/api';

const PRIORITY_META = {
  LOW: { label: 'Low', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  MEDIUM: { label: 'Medium', color: 'var(--blue)', bg: 'rgba(37,99,235,0.12)' },
  HIGH: { label: 'High', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
  CRITICAL: { label: 'Critical', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
};

const STATUS_META = {
  TODO: { label: 'To Do', color: 'var(--muted)', bg: 'var(--panel-soft)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--blue)', bg: 'rgba(37,99,235,0.12)' },
  REVIEW: { label: 'In Review', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
  COMPLETED: { label: 'Completed', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
};

const emptyForm = {
  projectId: '',
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
  assigneeUserId: '',
};

export default function ContractorTasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tList, pList] = await Promise.all([
        taskService.list(),
        projectService.list(),
      ]);
      setTasks(tList || []);
      setProjects(pList || []);
      if (pList.length > 0 && !form.projectId) {
        setForm(f => ({ ...f, projectId: String(pList[0].id) }));
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', loadData);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!form.projectId) {
      setProjectMembers([]);
      return;
    }
    projectService.assignments(form.projectId)
      .then(members => setProjectMembers(members || []))
      .catch(() => setProjectMembers([]));
  }, [form.projectId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || [t.title, t.projectName, t.assigneeName, t.description].some(v => String(v || '').toLowerCase().includes(q));
      const matchStatus = !statusFilter || String(t.status || '').toUpperCase() === statusFilter.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [tasks, search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.projectId) return;
    setBusy(true);
    setError('');
    try {
      const payload = {
        projectId: Number(form.projectId),
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate || null,
        assigneeUserId: form.assigneeUserId ? Number(form.assigneeUserId) : null,
      };
      await taskService.create(payload);
      setShowModal(false);
      setForm(f => ({ ...emptyForm, projectId: f.projectId }));
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create task.');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      await taskService.updateProgress(taskId, { status: nextStatus });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update status.');
    }
  };

  const handleAssigneeChange = async (taskId, assigneeUserId) => {
    try {
      await taskService.assign(taskId, assigneeUserId ? Number(assigneeUserId) : null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reassign task.');
    }
  };

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => String(t.status || '').toUpperCase() === 'COMPLETED').length;
  const inProgressCount = tasks.filter(t => String(t.status || '').toUpperCase() === 'IN_PROGRESS').length;
  const todoCount = tasks.filter(t => String(t.status || '').toUpperCase() === 'TODO' || !t.status).length;

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    projectId: '',
    invoiceNumber: '',
    vendorName: '',
    category: 'Material & Labor',
    amount: '',
    gstAmount: '',
    dueDate: '',
  });
  const [invoiceSuccess, setInvoiceSuccess] = useState('');

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceForm.projectId || !invoiceForm.amount) return;
    setBusy(true);
    setError('');
    try {
      const amt = parseFloat(invoiceForm.amount) || 0;
      const gst = invoiceForm.gstAmount ? parseFloat(invoiceForm.gstAmount) : amt * 0.18;
      await api.post('/finance/invoices', {
        projectId: Number(invoiceForm.projectId),
        invoiceNumber: invoiceForm.invoiceNumber || `INV-${Date.now() % 1000000}`,
        vendorName: invoiceForm.vendorName || 'Contractor',
        category: invoiceForm.category || 'Material & Labor',
        amount: amt,
        gstAmount: gst,
        status: 'PENDING',
        dueDate: invoiceForm.dueDate || null,
      });
      setShowInvoiceModal(false);
      setInvoiceSuccess('Invoice / Bill submitted successfully! Sent to Company Admin for real-time payment approval.');
      setTimeout(() => setInvoiceSuccess(''), 4000);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit invoice.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <CheckSquare size={14} /> Contractor Tasks
          </p>
          <h1>Contractor Task & Expense Management</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="secondary-button" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
          </button>
          <button type="button" className="secondary-button" onClick={() => setShowInvoiceModal(true)} style={{ color: 'var(--green)', borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)' }}>
            <Plus size={16} /> Submit Invoice / Bill
          </button>
          <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Task
          </button>
        </div>
      </section>

      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginTop: 18 }}>
        {[
          { label: 'Total Tasks', value: totalCount, color: 'var(--blue)' },
          { label: 'In Progress', value: inProgressCount, color: 'var(--orange)' },
          { label: 'To Do', value: todoCount, color: 'var(--purple)' },
          { label: 'Completed', value: completedCount, color: 'var(--green)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: 18 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: 24, color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h2>
          </div>
        ))}
      </div>

      {/* Filter Row */}
      <div className="panel" style={{ marginTop: 16, padding: '12px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Search tasks, project, assigned worker..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">In Review</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Task Table */}
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Task Title', 'Project Site', 'Assigned Worker / Personnel', 'Priority', 'Progress', 'Status', 'Due Date'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading tasks in real time...</td></tr>
              )}
              {!loading && filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                    <CheckSquare size={36} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.4 }} />
                    No contractor tasks found. Click "Create Task" above to assign work to a worker.
                  </td>
                </tr>
              )}
              {!loading && filteredTasks.map(t => {
                const priorityKey = String(t.priority || 'MEDIUM').toUpperCase();
                const prio = PRIORITY_META[priorityKey] || PRIORITY_META.MEDIUM;
                const statusKey = String(t.status || 'TODO').toUpperCase();

                return (
                  <tr key={t.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <strong style={{ color: 'var(--text)' }}>{t.title}</strong>
                      {t.description && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{t.description}</div>}
                    </td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{t.projectName || '—'}</td>
                    <td style={{ padding: 14 }}>
                      <select
                        value={t.assigneeUserId || ''}
                        onChange={e => handleAssigneeChange(t.id, e.target.value)}
                        style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', cursor: 'pointer' }}
                      >
                        <option value="">Unassigned</option>
                        {projectMembers.map(m => (
                          <option key={m.userId} value={m.userId}>{m.fullName} ({m.role.replace(/_/g, ' ')})</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: 14 }}>
                      <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: prio.bg, color: prio.color }}>
                        {prio.label}
                      </span>
                    </td>
                    <td style={{ padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: 'var(--panel-soft)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(t.completionPercentage || 0, 100)}%`, height: '100%', background: 'var(--blue)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{t.completionPercentage || 0}%</span>
                      </div>
                    </td>
                    <td style={{ padding: 14 }}>
                      <select
                        value={statusKey}
                        onChange={e => handleStatusChange(t.id, e.target.value)}
                        style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', cursor: 'pointer' }}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">In Review</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                    <td style={{ padding: 14, color: 'var(--muted)', fontSize: 12 }}>
                      {t.dueDate || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 540, padding: 26, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, margin: 0 }}>Create & Assign Task to Worker</h2>
              <button className="secondary-button" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Project Site *</label>
                <select
                  required
                  value={form.projectId}
                  onChange={e => setForm({ ...form, projectId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="">Select an assigned project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Task Title *</label>
                <input
                  required
                  placeholder="e.g. Masonry bricklaying for North Wing"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Work instructions, technical specs, or safety guidelines"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Assign To Particular Worker</label>
                <select
                  value={form.assigneeUserId}
                  onChange={e => setForm({ ...form, assigneeUserId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map(m => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName} ({m.role.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={busy}>
                  {busy ? 'Creating & Assigning...' : 'Create & Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Submit Invoice Modal */}
      {showInvoiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 500, padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Submit Contractor Invoice / Expense Bill</h2>
              <button type="button" className="secondary-button" onClick={() => setShowInvoiceModal(false)} style={{ padding: 6 }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleInvoiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Project Site *</label>
                <select
                  value={invoiceForm.projectId}
                  onChange={e => setInvoiceForm({ ...invoiceForm, projectId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="">Select Project Site</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code || 'SITE'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Vendor / Contractor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sahil Karji"
                    value={invoiceForm.vendorName}
                    onChange={e => setInvoiceForm({ ...invoiceForm, vendorName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Category</label>
                  <select
                    value={invoiceForm.category}
                    onChange={e => setInvoiceForm({ ...invoiceForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  >
                    <option value="Material & Labor">Material & Labor</option>
                    <option value="Labor Supply">Labor Supply</option>
                    <option value="Equipment Rental">Equipment Rental</option>
                    <option value="Subcontract Work">Contract Work</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Invoice Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={invoiceForm.amount}
                    onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    required
                    min="1"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>GST Amount (₹ 18%)</label>
                  <input
                    type="number"
                    placeholder="Auto (18%)"
                    value={invoiceForm.gstAmount}
                    onChange={e => setInvoiceForm({ ...invoiceForm, gstAmount: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="secondary-button" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={busy}>
                  {busy ? 'Submitting Invoice...' : 'Submit Invoice / Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
