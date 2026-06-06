import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import * as api from '../services/hotelService';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

const DailyRevenueReportPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, repRes] = await Promise.all([
          api.getRevenueDashboard(),
          api.getRevenueReport({ groupBy: 'day' })
        ]);
        setDashboard(dashRes.data);
        
        // Format report data for charts
        const formattedReport = (repRes.data?.report || []).map(item => ({
          name: item._id,
          Revenue: item.revenue,
          Collected: item.collected
        }));
        setReport(formattedReport);
      } catch (err) {
        console.error('Failed to fetch revenue data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>Loading revenue data...</div>;
  }

  if (!dashboard) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--rose)' }}>Failed to load revenue data.</div>;
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg)' }}>
      {/* Top Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <MetricCard 
          title="Today's Revenue" 
          amount={dashboard.today.revenue} 
          subtitle={`${dashboard.today.count} Invoices`}
          icon="chart" color="var(--green)" 
        />
        <MetricCard 
          title="Today's Collections" 
          amount={dashboard.today.collected} 
          subtitle={`Due: ${formatCurrency(dashboard.today.due)}`}
          icon="wallet" color="var(--teal)" 
        />
        <MetricCard 
          title="MTD Revenue" 
          amount={dashboard.month.revenue} 
          subtitle="Month to Date"
          icon="calendar" color="var(--gold)" 
        />
        <MetricCard 
          title="YTD Revenue" 
          amount={dashboard.year.revenue} 
          subtitle="Year to Date"
          icon="crown" color="var(--violet)" 
        />
      </div>

      {/* Main Chart area */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>Daily Revenue Trend</div>
        <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingTop: '20px' }}>
          {report.length === 0 ? (
            <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>No daily data available yet.</div>
          ) : (
            report.map((item, index) => {
              const maxRev = Math.max(...report.map(r => r.Revenue || 0), 1);
              const maxCol = Math.max(...report.map(r => r.Collected || 0), 1);
              const maxVal = Math.max(maxRev, maxCol);
              
              const revHeight = Math.max((item.Revenue / maxVal) * 250, 2);
              const colHeight = Math.max((item.Collected / maxVal) * 250, 2);
              
              return (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', group: 'true' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '250px', width: '100%', justifyContent: 'center' }}>
                    <div title={`Revenue: ${formatCurrency(item.Revenue)}`} style={{ width: '40%', maxWidth: '40px', height: `${revHeight}px`, background: 'var(--gold)', borderRadius: '4px 4px 0 0', cursor: 'pointer' }} />
                    <div title={`Collected: ${formatCurrency(item.Collected)}`} style={{ width: '40%', maxWidth: '40px', height: `${colHeight}px`, background: 'var(--green)', borderRadius: '4px 4px 0 0', cursor: 'pointer' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', transform: 'rotate(-45deg)', transformOrigin: 'top left', marginTop: '10px', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Secondary Data */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Payment Status Summary */}
        <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Invoice Status Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <StatusRow label="Paid" count={dashboard.counts.paid || 0} color="var(--green)" total={dashboard.total.count} />
            <StatusRow label="Partial" count={dashboard.counts.partial || 0} color="var(--teal)" total={dashboard.total.count} />
            <StatusRow label="Pending" count={dashboard.counts.pending || 0} color="var(--amber)" total={dashboard.total.count} />
            <StatusRow label="Refunded" count={dashboard.counts.refunded || 0} color="var(--rose)" total={dashboard.total.count} />
          </div>
        </div>
        
        {/* Quick Highlights */}
        <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Highlights</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <HighlightItem title="Total Pending Dues" value={formatCurrency(dashboard.total.due)} icon="alert" color="var(--amber)" />
            <HighlightItem title="Total Revenue (All Time)" value={formatCurrency(dashboard.total.revenue)} icon="chart" color="var(--blue)" />
            <HighlightItem title="Total Collected (All Time)" value={formatCurrency(dashboard.total.collected)} icon="wallet" color="var(--green)" />
          </div>
        </div>
      </div>

    </div>
  );
};

const MetricCard = ({ title, amount, subtitle, icon, color }) => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
      <Icon name={icon} size={24} />
    </div>
    <div style={{ overflow: 'hidden' }}>
      <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 600, marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', fontFamily: 'DM Mono, monospace', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {formatCurrency(amount)}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{subtitle}</div>
    </div>
  </div>
);

const StatusRow = ({ label, count, color, total }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '80px', fontSize: '13px', color: 'var(--text2)', fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, height: '8px', background: 'var(--surface)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '4px' }} />
      </div>
      <div style={{ width: '40px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', textAlign: 'right' }}>{count}</div>
    </div>
  );
};

const HighlightItem = ({ title, value, icon, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--surface)' }}>
    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
      <Icon name={icon} size={18} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 500, marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{value}</div>
    </div>
  </div>
);

export default DailyRevenueReportPage;
