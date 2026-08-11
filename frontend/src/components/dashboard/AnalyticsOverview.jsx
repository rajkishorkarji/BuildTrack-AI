import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';

export default function AnalyticsOverview() {
  const [analytics, setAnalytics] = useState([]);
  useEffect(() => { dashboardService.getAnalytics().then(setAnalytics).catch(() => setAnalytics([])); }, []);
  const rows = Array.isArray(analytics) ? analytics : Object.entries(analytics).map(([label,value])=>({label,value}));
  return <section className="analytics-section"><div className="analytics-header"><h3>Analytics Overview</h3><div className="range-tabs"><button type="button">7D</button><button type="button" className="active">30D</button><button type="button">90D</button><button type="button">1Y</button></div></div><div className="analytics-grid">{rows.map((item,i)=><article key={item.label||i} className="analytics-card"><div className="analytics-card-head"><span>{item.label}</span><small>{item.trend || ''}</small></div><strong>{item.value ?? '—'}</strong><div className="sparkline"/></article>)}</div></section>;
}
