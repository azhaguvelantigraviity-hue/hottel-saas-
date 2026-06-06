import React, { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { getAuditLogs } from '../services/adminService';

const thStyle = { padding: '16px 20px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', background: 'var(--surface)' };
const tdStyle = { padding: '16px 20px', fontSize: '13px', color: 'var(--text2)', borderBottom: '1px solid var(--border)' };

const AuditLogs = () => {
  const [filter, setFilter] = useState('all');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await getAuditLogs();
      if (res.data) setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.status === filter);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
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
                <tr key={log._id} onMouseEnter={e => e.currentTarget.style.background='var(--surface)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} style={{ transition: 'background 0.15s' }}>
                  <td style={{ ...tdStyle, fontFamily: 'DM Mono,monospace', color: 'var(--gold)', fontWeight: '500' }}>{log._id.slice(-6).toUpperCase()}</td>
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
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono,monospace' }}>{log.ip || 'Unknown IP'}</div>
                  </td>
                  <td style={tdStyle}>{formatDate(log.createdAt)}</td>
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
        
        {!loading && filteredLogs.length === 0 && (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text3)', fontSize: '14px' }}>
            <Icon name="shield" size={48} color="var(--border)" />
            <div style={{ marginTop: '16px' }}>No logs found for the selected filter.</div>
          </div>
        )}
        
        {loading && (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text3)', fontSize: '14px' }}>
            <div style={{ width: '24px', height: '24px', border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            Loading audit logs...
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
