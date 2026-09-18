import { useEffect, useMemo, useState } from 'react';
import { QrCode, UserCheck, RefreshCw, CheckCircle2, Clock, ShieldCheck, AlertTriangle, Award, CheckCheck, MapPin, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';
import projectService from '../../services/projectService';
import { realtimeBus } from '../../services/api';
import { getAttendanceWorkflowCategory } from '../../utils/attendanceWorkflow';
import { getCurrentGpsCoordinates, calculateHaversineDistance, formatDistance } from '../../utils/geo';

export default function WorkerAttendance() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [deviceGps, setDeviceGps] = useState({ lat: null, lon: null, accuracy: null, loading: false, error: null });

  // Capture device hardware GPS
  const acquireGps = async () => {
    setDeviceGps(prev => ({ ...prev, loading: true, error: null }));
    try {
      const gps = await getCurrentGpsCoordinates();
      if (gps.success) {
        setDeviceGps({ lat: gps.latitude, lon: gps.longitude, accuracy: gps.accuracy, loading: false, error: null });
        return { lat: gps.latitude, lon: gps.longitude, accuracy: gps.accuracy };
      } else {
        setDeviceGps({ lat: null, lon: null, accuracy: null, loading: false, error: gps.error });
        return null;
      }
    } catch {
      setDeviceGps({ lat: null, lon: null, accuracy: null, loading: false, error: 'Failed to access device GPS' });
      return null;
    }
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [attendance, projectData] = await Promise.all([
        attendanceService.list(),
        projectService.getProjects(),
      ]);
      const validRows = Array.isArray(attendance) ? attendance.filter(Boolean) : [];
      const validProjects = Array.isArray(projectData) ? projectData.filter(Boolean) : [];
      setRows(validRows);
      setProjects(validProjects);

      // Auto-select project: prefer active session project, or first project with GPS, or first project
      const openSession = validRows.find(r => !r.checkOut);
      if (openSession?.projectId) {
        setSelectedProjectId(String(openSession.projectId));
      } else if (validProjects.length > 0) {
        const withGps = validProjects.find(p => p.latitude != null && p.longitude != null);
        setSelectedProjectId(String(withGps?.id || validProjects[0].id));
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load attendance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    acquireGps();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => load());
    return () => unsub();
  }, []);

  const active = useMemo(() => rows.find(r => !r.checkOut), [rows]);

  // Selected project object
  const activeProject = useMemo(() => {
    const id = active ? active.projectId : selectedProjectId;
    return projects.find(p => String(p.id) === String(id)) || projects[0] || null;
  }, [projects, selectedProjectId, active]);

  // Real-time Geofence calculation
  const geofenceInfo = useMemo(() => {
    if (!activeProject) return { configured: false };
    const hasCoords = activeProject.latitude != null && activeProject.longitude != null;
    if (!hasCoords) return { configured: false, name: activeProject.name };

    const allowedRadius = Number(activeProject.geofenceRadiusMeters) || 150;
    if (deviceGps.lat == null || deviceGps.lon == null) {
      return { configured: true, name: activeProject.name, allowedRadius, needGps: true };
    }

    const distance = calculateHaversineDistance(
      deviceGps.lat, deviceGps.lon,
      activeProject.latitude, activeProject.longitude
    );
    const isInside = distance <= allowedRadius;

    return {
      configured: true,
      name: activeProject.name,
      allowedRadius,
      distance,
      isInside,
      verified: isInside,
    };
  }, [activeProject, deviceGps]);

  const toggle = async () => {
    try {
      setError('');
      setLocating(true);

      // Refresh GPS coordinates on action
      let coords = { lat: deviceGps.lat, lon: deviceGps.lon, accuracy: deviceGps.accuracy };
      if (coords.lat == null || coords.lon == null) {
        coords = await acquireGps();
      }

      if (active) {
        // Checking out
        await attendanceService.checkOut(active.id || 0, {
          latitude: coords?.lat != null ? coords.lat : undefined,
          longitude: coords?.lon != null ? coords.lon : undefined,
        });
        setNotice('Checked out successfully! Worked duration & shift category calculated.');
      } else {
        // Checking in — enforce physical presence
        const targetProjectId = Number(selectedProjectId || activeProject?.id);
        if (!targetProjectId) throw new Error('Please select an assigned project site for attendance.');

        if (geofenceInfo.configured) {
          if (!coords || coords.lat == null || coords.lon == null) {
            throw new Error(`Device GPS required: Project "${activeProject?.name}" enforces on-site verification. Please turn on GPS location.`);
          }
          const dist = calculateHaversineDistance(coords.lat, coords.lon, activeProject.latitude, activeProject.longitude);
          if (dist > geofenceInfo.allowedRadius) {
            throw new Error(`Location Verification Blocked: You are ${formatDistance(dist)} away from ${activeProject.name} (Allowed radius: ${geofenceInfo.allowedRadius}m). You must be physically at the site to check in.`);
          }
        }

        await attendanceService.checkIn({
          projectId: targetProjectId,
          latitude: coords?.lat != null ? coords.lat : undefined,
          longitude: coords?.lon != null ? coords.lon : undefined,
          accuracy: coords?.accuracy != null ? coords.accuracy : undefined,
        });
        setNotice(`Checked in successfully! Physical presence verified on-site at ${activeProject?.name || 'project'}.`);
      }
      await load();
      setTimeout(() => setNotice(''), 4500);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Attendance action failed.');
    } finally {
      setLocating(false);
    }
  };

  const compId = user?.companyId || user?.company?.id || 1;
  const qrToken = `QRWRK${compId}${String(user?.id || 1).padStart(5, '0')}`;

  // Is check-in blocked by geofence?
  const isCheckInBlocked = !active && geofenceInfo.configured && deviceGps.lat != null && !geofenceInfo.isInside;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <UserCheck size={14} /> Worker Attendance & Daily Shift
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="secondary-button" onClick={acquireGps} disabled={deviceGps.loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Navigation size={13} style={deviceGps.loading ? { animation: 'spin 1s linear infinite' } : {}} />
            {deviceGps.loading ? 'Locating...' : 'Refresh GPS'}
          </button>
          <button type="button" className="secondary-button" onClick={load} disabled={loading}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
          </button>
        </div>
      </section>

      {notice && (
        <div className="panel" style={{ marginTop: 16, padding: '12px 16px', color: 'var(--green)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10 }}>
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {error && (
        <div className="panel" style={{ marginTop: 16, padding: '12px 16px', color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: 20, marginTop: 20 }}>
        {/* QR Badge & Check-in Control */}
        <div className="panel" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: active ? 'rgba(34,197,94,0.12)' : 'rgba(37,99,235,0.1)', color: active ? 'var(--green)' : 'var(--blue)', display: 'grid', placeItems: 'center', marginBottom: 12 }}>
            {active ? <Clock size={38} /> : <QrCode size={38} />}
          </div>
          <h3 style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 17 }}>Worker Attendance Pass</h3>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Token: <code style={{ background: 'var(--panel-soft)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{qrToken}</code></span>

          {/* Project Selection (Disabled if session open) */}
          <div style={{ width: '100%', marginTop: 16, textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
              Select Job Site Project
            </label>
            <select
              disabled={!!active}
              value={active ? String(active.projectId) : selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--panel-soft)',
                color: 'var(--text)', fontSize: 13, fontWeight: 600
              }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.latitude != null ? `(📍 Geofenced · ${Math.round(p.geofenceRadiusMeters || 150)}m)` : '(Standard)'}
                </option>
              ))}
            </select>
          </div>

          {/* Live Physical Geofence Banner */}
          <div style={{ width: '100%', marginTop: 12, textAlign: 'left' }}>
            {geofenceInfo.configured ? (
              deviceGps.loading ? (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--panel-soft)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Navigation size={13} style={{ animation: 'spin 1s linear infinite', color: 'var(--blue)' }} />
                  Acquiring device GPS coordinates...
                </div>
              ) : geofenceInfo.isInside ? (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <ShieldCheck size={15} style={{ flexShrink: 0 }} />
                  <span>On-Site Verified ({formatDistance(geofenceInfo.distance)} · Max {geofenceInfo.allowedRadius}m)</span>
                </div>
              ) : deviceGps.lat != null ? (
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>Outside Site Boundary</div>
                    <div style={{ fontSize: 11, marginTop: 2 }}>You are {formatDistance(geofenceInfo.distance)} away from {activeProject?.name}. Allowed radius: {geofenceInfo.allowedRadius}m.</div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', fontSize: 12, color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={14} /> GPS access needed for on-site check-in
                  </span>
                  <button type="button" onClick={acquireGps} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 700, fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>
                    Allow GPS
                  </button>
                </div>
              )
            ) : (
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--panel-soft)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={12} /> Standard project site (no GPS restriction set)
              </div>
            )}
          </div>

          {/* Live Session Status Pill */}
          <div style={{
            marginTop: 14,
            padding: '10px 14px',
            borderRadius: 10,
            width: '100%',
            boxSizing: 'border-box',
            background: active ? 'rgba(34,197,94,0.12)' : 'var(--panel-soft)',
            border: active ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
            color: active ? 'var(--green)' : 'var(--muted)',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}>
            {active ? (
              <>
                <CheckCircle2 size={15} /> Session OPEN (Check-In: {new Date(active.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </>
            ) : (
              <>
                <Clock size={15} /> Not Checked In Today
              </>
            )}
          </div>

          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.4 }}>
            {active
              ? 'Work is in progress on site. Click below when your shift finishes to record worked hours.'
              : isCheckInBlocked
                ? 'Check-in is locked. You must be physically inside the project site boundary to start your shift.'
                : 'Tap below to verify your physical presence and start your shift session.'}
          </p>

          <button
            className="primary-button"
            disabled={loading || locating || isCheckInBlocked || deviceGps.loading}
            onClick={toggle}
            style={{
              width: '100%', marginTop: 14,
              background: active
                ? 'var(--red)'
                : isCheckInBlocked
                  ? 'rgba(239, 68, 68, 0.4)'
                  : 'var(--blue)',
              cursor: isCheckInBlocked ? 'not-allowed' : 'pointer'
            }}
          >
            {locating
              ? 'Verifying Location...'
              : active
                ? 'Check Out (Calculate Duration)'
                : isCheckInBlocked
                  ? `Blocked: Outside Site (${formatDistance(geofenceInfo.distance)})`
                  : '1-Click Check In (Open Session)'}
          </button>
        </div>

        {/* History Table */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Attendance & Shift Duration History</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{rows.length} logs</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 840, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                  {['Date', 'Project Site', 'Location Verified', 'Check In', 'Check Out', 'Hours', 'Shift Category', 'Status', 'Verification'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={9} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>Loading attendance…</td></tr>}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No attendance recorded yet.</td></tr>
                )}
                {!loading && rows.map(r => {
                  const cat = getAttendanceWorkflowCategory(r);
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{r.checkIn ? new Date(r.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{r.projectName || '—'}</td>
                      <td style={{ padding: 14 }}>
                        {r.locationVerified ? (
                          <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(34,197,94,0.12)', color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <ShieldCheck size={12} /> Verified ({r.checkInDistanceMeters != null ? `${Math.round(r.checkInDistanceMeters)}m` : 'On Site'})
                          </span>
                        ) : (
                          <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(100,116,139,0.12)', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} /> Standard
                          </span>
                        )}
                      </td>
                      <td style={{ padding: 14, color: 'var(--green)', fontWeight: 600 }}>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td style={{ padding: 14, color: r.checkOut ? 'var(--muted)' : 'var(--blue)', fontWeight: 600 }}>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active On Site'}</td>
                      <td style={{ padding: 14, fontWeight: 700 }}>{r.hoursWorked != null ? `${r.hoursWorked} hrs` : (r.checkOut ? '—' : 'In Progress')}</td>
                      <td style={{ padding: 14 }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: cat.badgeBg,
                          color: cat.badgeColor,
                          border: `1px solid ${cat.badgeBorder}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          whiteSpace: 'nowrap'
                        }}>
                          {cat.label}
                        </span>
                      </td>
                      <td style={{ padding: 14 }}>
                        <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>
                          {r.status || 'PRESENT'}
                        </span>
                      </td>
                      <td style={{ padding: 14 }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: r.verificationStatus === 'VERIFIED' ? 'rgba(34,197,94,0.12)' : r.verificationStatus === 'REJECTED' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                          color: r.verificationStatus === 'VERIFIED' ? 'var(--green)' : r.verificationStatus === 'REJECTED' ? 'var(--red)' : 'var(--orange)',
                        }}>
                          {r.verificationStatus || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
