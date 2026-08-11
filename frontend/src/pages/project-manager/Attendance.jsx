import { useEffect, useState } from 'react';
import attendanceService from '../../services/attendanceService';

export default function PMAttendance() {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  const load=async()=>{try{setError('');setRows(await attendanceService.list())}catch(e){setError(e.response?.data?.message||'Unable to load attendance.')}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);
  const verify=async(id,verified)=>{try{await attendanceService.verify(id,verified);await load()}catch(e){setError(e.response?.data?.message||'Verification failed.')}};
  return <div className="page-content"><div className="page-header"><div><h1>Attendance</h1><p>Attendance for projects assigned to you.</p></div></div>{error&&<div className="panel" style={{padding:12,color:'#dc2626',marginBottom:16}}>{error}</div>}<div className="panel"><table className="data-table"><thead><tr><th>Worker</th><th>Project</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th><th>Verification</th><th>Action</th></tr></thead><tbody>{loading?<tr><td colSpan="8">Loading…</td></tr>:rows.length?rows.map(r=><tr key={r.id}><td>{r.workerName||'—'}</td><td>{r.projectName||'—'}</td><td>{r.checkIn?new Date(r.checkIn).toLocaleString():'—'}</td><td>{r.checkOut?new Date(r.checkOut).toLocaleString():'Active'}</td><td>{r.hoursWorked??'—'}</td><td>{r.status||'—'}</td><td>{r.verificationStatus||'PENDING'}</td><td>{r.verificationStatus==='PENDING'?<><button className="primary-button" onClick={()=>verify(r.id,true)}>Verify</button>{' '}<button className="secondary-button" onClick={()=>verify(r.id,false)}>Reject</button></>:<span>Completed</span>}</td></tr>):<tr><td colSpan="8">No attendance records.</td></tr>}</tbody></table></div></div>;
}
