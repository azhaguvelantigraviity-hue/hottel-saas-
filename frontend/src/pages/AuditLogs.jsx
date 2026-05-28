import React, { useState } from 'react';
import Badge from '../components/Badge';
import Icon from '../components/Icon';

const MOCK_LOGS = [
  { id: 'AL-1045', action: 'Login Success', user: 'Platform Admin', email: 'admin@stayos.com', ip: '192.168.1.45', date: '2026-05-27 10:15 AM', status: 'success' },
  { id: 'AL-1044', action: 'Created Hotel', target: 'The Royal Palace', user: 'Platform Admin', email: 'admin@stayos.com', ip: '192.168.1.45', date: '2026-05-27 09:30 AM', status: 'success' },
  { id: 'AL-1043', action: 'Failed Login', user: 'Unknown', email: 'admin@stayos.com', ip: '10.0.0.8', date: '2026-05-26 11:22 PM', status: 'failed' },
  { id: 'AL-1042', action: 'Updated Plan', target: 'Azure Boutique', details: 'Professional → Enterprise', user: 'Billing System', email: 'system@stayos.com', ip: '127.0.0.1', date: '2026-05-26 04:10 PM', status: 'success' },
  { id: 'AL-1041', action: 'Suspended Hotel', target: 'Desert Bloom Hotel', details: 'Payment Overdue', user: 'Platform Admin', email: 'admin@stayos.com', ip: '192.168.1.45', date: '2026-05-25 02:45 PM', status: 'warning' },
  { id: 'AL-1040', action: 'Modified Settings', details: 'Changed Tax Rate to 18%', user: 'Platform Admin', email: 'admin@stayos.com', ip: '192.168.1.45', date: '2026-05-25 09:12 AM', status: 'success' },
  { id: 'AL-1039', action: 'Exported Data', details: 'Exported Revenue Report Q1', user: 'Platform Admin', email: 'admin@stayos.com', ip: '192.168.1.45', date: '2026-05-24 11:05 AM', status: 'success' },
  { id: 'AL-1038', action: 'Deleted User', target: 'John Doe', user: 'Platform Admin', email: 'admin@stayos.com', ip: '192.168.1.45', date: '2026-05-23 10:15 AM', status: 'success' },
];

const thStyle = { padding: '16px 20px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', background: 'var(--surface)' };
const tdStyle = { padding: '16px 20px', fontSize: '13px', color: 'var(--text2)', borderBottom: '1px solid var(--border)' };

const AuditLogs = () => {
  const [filter, setFilter] = useState('all');
  
  const filteredLogs = filter === 'all' 
    ? MOCK_LOGS 
    : MOCK_LOGS.filter(log => log.status === filter);

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px', fontFamily: 'Poppins, sans-serif' }}>System Audit Logs</h2>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Track and monitor all administrative actions and security events across the platform.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'success', 'warning', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: '1px solid',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
                background: filter === f ? 'var(--gold)' : 'transparent',
                borderColor: filter === f ? 'var(--gold)' : 'var(--border)',
                color: filter === f ? '#000' : 'var(--text2)',
                transition: 'all 0.2s',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Event ID</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>User & IP</th>
                <th style={thStyle}>Date & Time</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} onMouseEnter={e => e.currentTarget.style.background='var(--surface)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} style={{ transition: 'background 0.15s' }}>
                  <td style={{ ...tdStyle, fontFamily: 'DM Mono,monospace', color: 'var(--gold)', fontWeight: '500' }}>{log.id}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{log.action}</div>
                    {(log.target || log.details) && (
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                        {log.target && <span style={{ color: 'var(--text2)' }}>{log.target}</span>}
                        {log.target && log.details && ' · '}
                        {log.details}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '500', color: 'var(--text)', marginBottom: '2px' }}>{log.user}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono,monospace' }}>{log.ip}</div>
                  </td>
                  <td style={tdStyle}>{log.date}</td>
                  <td style={tdStyle}>
                    <Badge color={log.status === 'success' ? 'green' : log.status === 'warning' ? 'amber' : 'rose'}>
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text3)', fontSize: '14px' }}>
            <Icon name="shield" size={48} color="var(--border)" />
            <div style={{ marginTop: '16px' }}>No logs found for the selected filter.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
