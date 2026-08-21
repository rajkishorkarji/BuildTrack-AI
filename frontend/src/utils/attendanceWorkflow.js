/**
 * Attendance Workflow & Duration Category Utility
 * 
 * Workflow:
 * 1. Worker Check-in -> Attendance Session OPEN
 * 2. Work continues
 * 3. Worker Check-out -> Calculate worked duration
 * 4. 3-way duration classification:
 *    - < 8 hours  => Early Leave / Short Hours
 *    - = 8 hours  => Full Day Completed
 *    - > 8 hours  => Overtime Calculated
 */

export function calculateWorkedHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return 0;
  const diffMs = end - start;
  const hours = diffMs / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100;
}

export function getAttendanceWorkflowCategory(record) {
  if (!record) {
    return {
      key: 'UNKNOWN',
      label: '—',
      badgeBg: 'rgba(148,163,184,0.12)',
      badgeColor: 'var(--muted)',
      badgeBorder: 'rgba(148,163,184,0.25)',
      hoursText: '—',
      otHours: 0,
      isSessionOpen: false,
    };
  }

  // If check-out is missing or session is open
  if (!record.checkOut) {
    return {
      key: 'SESSION_OPEN',
      label: 'Session OPEN (Active On Site)',
      badgeBg: 'rgba(37,99,235,0.12)',
      badgeColor: 'var(--blue)',
      badgeBorder: 'rgba(37,99,235,0.25)',
      hoursText: 'Active',
      otHours: 0,
      isSessionOpen: true,
    };
  }

  let hours = record.hoursWorked != null ? Number(record.hoursWorked) : null;
  if (hours == null && record.checkIn && record.checkOut) {
    hours = calculateWorkedHours(record.checkIn, record.checkOut);
  }
  const h = hours != null ? Number(hours) : 0;

  // > 8 hours: Overtime Calculated
  if (h > 8.0) {
    const ot = Math.round((h - 8.0) * 100) / 100;
    return {
      key: 'OVERTIME',
      label: `Overtime Calculated (+${ot} hrs OT)`,
      badgeBg: 'rgba(168,85,247,0.12)',
      badgeColor: 'var(--purple)',
      badgeBorder: 'rgba(168,85,247,0.25)',
      hoursText: `${h} hrs`,
      otHours: ot,
      isSessionOpen: false,
    };
  }

  // = 8 hours: Full Day Completed (accepting rounding 7.95 to 8.05)
  if (h >= 7.95 && h <= 8.05) {
    return {
      key: 'FULL_DAY',
      label: `Full Day Completed (${h.toFixed(1)} hrs)`,
      badgeBg: 'rgba(34,197,94,0.12)',
      badgeColor: 'var(--green)',
      badgeBorder: 'rgba(34,197,94,0.25)',
      hoursText: `${h} hrs`,
      otHours: 0,
      isSessionOpen: false,
    };
  }

  // < 8 hours: Early Leave / Short Hours
  return {
    key: 'EARLY_LEAVE',
    label: `Early Leave / Short Hours (${h} hrs)`,
    badgeBg: 'rgba(245,158,11,0.12)',
    badgeColor: 'var(--orange)',
    badgeBorder: 'rgba(245,158,11,0.25)',
    hoursText: `${h} hrs`,
    otHours: 0,
    isSessionOpen: false,
  };
}
