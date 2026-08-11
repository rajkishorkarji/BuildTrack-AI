import { useEffect, useMemo, useState } from 'react';
import { QrCode, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';
import projectService from '../../services/projectService';

export default function WorkerAttendance() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [attendance, projectData] = await Promise.all([attendanceService.list(), projectService.getProjects()]);
      setRows(attendance); setProjects(projectData || []);
    } catch (e) { setError(e.response?.data?.message || 'Unable to load attendance.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const active = useMemo(() => rows.find((r) => !r.checkOut), [rows]);
  const projectId = active?.projectId || projects[0]?.id;

  const toggle = async () => {
    try {
      setError('');
      if (active) {
        await attendanceService.checkOut(active.id);
        setNotice('Checked out successfully.');
      } else {
        if (!projectId) throw new Error('No assigned project is available for attendance.');
        await attendanceService.checkIn({ projectId });
        setNotice('Checked in successfully.');
      }
      await load();
      window.setTimeout(() => setNotice(''), 3000);
    } catch (e) { setError(e.response?.data?.message || e.message || 'Attendance action failed.'); }
  };

  return <div className="dashboard-page">
    <section className="hero-row"><div><p className="eyebrow" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--blue)', fontWeight:700 }}><UserCheck size={14}/> Attendance</p><h1>My Attendance</h1><p>Real attendance records linked to your worker profile and assigned project.</p></div></section>
    {notice && <div className="panel" style={{ marginTop:16, padding:12, color:'var(--green)' }}>{notice}</div>}
    {error && <div className="panel" style={{ marginTop:16, padding:12, color:'var(--red, #dc2626)' }}>{error}</div>}
    <div style={{ display:'grid', gridTemplateColumns:'minmax(280px,360px) 1fr', gap:20, marginTop:20 }}>
      <div className="panel" style={{ padding:28, textAlign:'center' }}>
        <div style={{ width:64,height:64,borderRadius:'50%',background:'rgba(37,99,235,.12)',color:'var(--blue)',display:'grid',placeItems:'center',margin:'0 auto 14px' }}><QrCode size={32}/></div>
        <h3>Daily Attendance</h3><p style={{fontSize:12,color:'var(--muted)'}}>Your attendance is visible to authorized project staff in real time.</p>
        <button className="primary-button" disabled={loading} onClick={toggle} style={{width:'100%',marginTop:16,background:active?'#dc2626':'var(--blue)'}}>{active?'Check Out':'Check In'}</button>
      </div>
      <div className="panel" style={{padding:0,overflow:'hidden'}}><div style={{padding:'16px 20px',fontWeight:700,borderBottom:'1px solid var(--border)'}}>Attendance History</div>
        <div style={{overflowX:'auto'}}><table className="data-table"><thead><tr><th>Date</th><th>Project</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th><th>Verification</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="7">Loading…</td></tr> : rows.length ? rows.map(r => <tr key={r.id}><td>{r.checkIn ? new Date(r.checkIn).toLocaleDateString() : '—'}</td><td>{r.projectName || '—'}</td><td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '—'}</td><td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : 'Active'}</td><td>{r.hoursWorked ?? '—'}</td><td>{String(r.status || '').replaceAll('_',' ')}</td><td>{r.verificationStatus || 'PENDING'}</td></tr>) : <tr><td colSpan="7">No attendance recorded yet.</td></tr>}
        </tbody></table></div>
      </div>
    </div>
  </div>;
}
