export default function DashboardStats() {
  const pmCards = [
    { label: 'Assigned Project', value: 'Metro Tower Complex', note: 'Tower A • Floor 14', tone: 'blue' },
    { label: 'Project Progress', value: '66%', note: 'On Schedule (Est. Dec 2025)', tone: 'green' },
    { label: 'Total Tasks', value: '48 Tasks', note: 'Sprint 14 Active', tone: 'purple' },
    { label: 'Pending Tasks', value: '16 Tasks', note: '4 In Review', tone: 'orange' },
    { label: 'Completed Tasks', value: '32 Tasks', note: '66.7% Completion', tone: 'green' },
    { label: 'Team Members', value: '18 Personnel', note: '2 Site Engineers, 1 Contractor', tone: 'blue' },
    { label: 'Today\'s Attendance', value: '96% Present', note: '17 of 18 Clocked In', tone: 'green' },
    { label: 'Budget Utilization', value: '₹1.8M / ₹2.5M', note: '72% Cap Utilized', tone: 'purple' },
    { label: 'Equipment Status', value: '8 Heavy Machines', note: '1 Tower Crane, 2 Excavators', tone: 'orange' },
    { label: 'Material Requests', value: '3 Pending', note: 'Cement & Rebar Orders', tone: 'blue' },
    { label: 'Upcoming Deadlines', value: 'Floor 14 Pouring', note: 'Due in 2 Days (Aug 05)', tone: 'red' },
    { label: 'Unread Alerts', value: '4 Notifications', note: 'Quality & Weather Updates', tone: 'orange' },
  ];

  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
      {pmCards.map((c, idx) => (
        <article key={idx} className="panel" style={{ padding: '16px 18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{c.label}</span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px', color: `var(--${c.tone})` }}>{c.value}</h2>
          <small style={{ color: c.tone === 'red' ? 'var(--red)' : c.tone === 'green' ? 'var(--green)' : 'var(--muted)', fontSize: '12px' }}>
            {c.note}
          </small>
        </article>
      ))}
    </section>
  );
}