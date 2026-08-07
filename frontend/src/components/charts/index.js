import React from 'react';

export const ChartContainer = ({ title, children }) => (
  <div className="panel" style={{ padding: '24px' }}>
    {title && <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>{title}</h3>}
    {children}
  </div>
);
