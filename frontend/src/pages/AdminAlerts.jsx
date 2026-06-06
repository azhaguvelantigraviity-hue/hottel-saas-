import React, { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { getRenewalAlerts } from '../services/adminService';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await getRenewalAlerts();
      if (res.data) setAlerts(res.data);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'var(--rose)';
      case 'warning': return 'var(--amber)';
      case 'upcoming': return 'var(--blue)';
      default: return 'var(--text3)';
    }
  };

  const formatDaysLeft = (daysLeft, type) => {
    if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)} days ago`;
    if (daysLeft === 0) return 'Expires Today';
    return `Expires in ${daysLeft} days`;
  };

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>Renewal Alerts</h2>
        <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Monitor trial expirations and upcoming subscription renewals.</div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text3)', fontSize: '14px' }}>
          <div style={{ width: '24px', height: '24px', border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          Loading alerts...
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : alerts.length === 0 ? (
        <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text3)', fontSize: '14px', background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Icon name="check" size={48} color="var(--green)" />
          <div style={{ marginTop: '16px', fontWeight: '500', color: 'var(--text)' }}>All Clear!</div>
          <div style={{ marginTop: '4px' }}>There are no upcoming renewals or trial expirations.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {alerts.map((alert) => (
            <div key={alert._id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: getAlertColor(alert.type) }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>{alert.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{alert.owner?.email || 'No owner assigned'}</div>
                </div>
                <Badge color={alert.type === 'critical' ? 'rose' : alert.type === 'warning' ? 'amber' : 'blue'}>
                  {alert.planStatus === 'trial' ? 'Trial' : 'Active'}
                </Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Current Plan</div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', textTransform: 'capitalize' }}>{alert.plan}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Time Remaining</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: getAlertColor(alert.type) }}>
                    {formatDaysLeft(alert.daysLeft, alert.type)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button onClick={() => alert('Reminder email sent (Mock)')} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Icon name="bell" size={14} /> Send Reminder
                </button>
                <button onClick={() => window.location.href='/admin/subscriptions'} style={{ padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--gold)', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAlerts;
