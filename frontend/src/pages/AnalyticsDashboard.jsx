import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';

const MONTHLY = [
  { month: 'Jan', revenue: 450000, expenses: 280000, guests: 420 },
  { month: 'Feb', revenue: 520000, expenses: 290000, guests: 480 },
  { month: 'Mar', revenue: 610000, expenses: 310000, guests: 550 },
  { month: 'Apr', revenue: 580000, expenses: 305000, guests: 510 },
  { month: 'May', revenue: 720000, expenses: 340000, guests: 680 },
  { month: 'Jun', revenue: 850000, expenses: 380000, guests: 820 },
];

const OCCUPANCY = [62, 65, 68, 70, 75, 82, 85, 88, 86, 80, 78, 75, 72, 70, 68, 75, 80, 85, 90, 92, 88, 85, 82, 78, 75, 72, 70, 75, 80, 85, 88];

const DEPT_PROFIT = [
  { name: 'Rooms', pct: 65, color: 'var(--gold)' },
  { name: 'F&B', pct: 20, color: 'var(--teal)' },
  { name: 'Events', pct: 10, color: 'var(--violet)' },
  { name: 'Spa/Other', pct: 5, color: 'var(--rose)' }
];

const maxRev = MONTHLY.length > 0 ? Math.max(...MONTHLY.map(m => m.revenue)) : 1;
const maxOcc = 100;

const BarChart = () => (
  <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:160, padding:'0 8px' }}>
    {MONTHLY.map((m, i) => (
      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
        <div style={{ width:'100%', display:'flex', gap:2, alignItems:'flex-end', height:140 }}>
          <div style={{ flex:1, background:'var(--gold)', borderRadius:'4px 4px 0 0', height:`${(m.revenue/maxRev)*100}%`, transition:'height 0.5s', minHeight:4 }} title={`Revenue: ₹${m.revenue.toLocaleString()}`} />
          <div style={{ flex:1, background:'rgba(251,113,133,0.5)', borderRadius:'4px 4px 0 0', height:`${(m.expenses/maxRev)*100}%`, transition:'height 0.5s', minHeight:4 }} title={`Expenses: ₹${m.expenses.toLocaleString()}`} />
        </div>
        <div style={{ fontSize:10, color:'var(--text3)' }}>{m.month}</div>
      </div>
    ))}
  </div>
);

const OccupancyChart = () => {
  const pts = OCCUPANCY.slice(0, 31);
  const w = 600, h = 120, pad = 10;
  const xStep = (w - pad*2) / (pts.length - 1);
  const yScale = (v) => h - pad - ((v - 60) / 40) * (h - pad*2);
  const pathD = pts.map((v, i) => `${i===0?'M':'L'}${pad + i*xStep},${yScale(v)}`).join(' ');
  const areaD = `${pathD} L${pad+(pts.length-1)*xStep},${h-pad} L${pad},${h-pad} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height:120 }}>
      <defs><linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--teal)" stopOpacity="0.3"/><stop offset="100%" stopColor="var(--teal)" stopOpacity="0"/></linearGradient></defs>
      <path d={areaD} fill="url(#occGrad)" />
      <path d={pathD} fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((v, i) => v === Math.max(...pts) || v === Math.min(...pts) ? <circle key={i} cx={pad+i*xStep} cy={yScale(v)} r="4" fill={v===Math.max(...pts)?'var(--green)':'var(--rose)'} /> : null)}
    </svg>
  );
};

const DonutChart = () => {
  let cumulative = 0;
  const r = 60, cx = 80, cy = 80, strokeW = 24;
  const circumference = 2 * Math.PI * r;
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {DEPT_PROFIT.map((d, i) => {
        const dashArray = (d.pct / 100) * circumference;
        const dashOffset = -cumulative / 100 * circumference;
        cumulative += d.pct;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={strokeW} strokeDasharray={`${dashArray} ${circumference}`} strokeDashoffset={dashOffset} style={{ transform:'rotate(-90deg)', transformOrigin:'80px 80px' }} />;
      })}
      <text x={cx} y={cy-6} textAnchor="middle" fill="var(--text)" fontSize="18" fontWeight="700" fontFamily="DM Mono,monospace">38%</text>
      <text x={cx} y={cy+12} textAnchor="middle" fill="var(--text3)" fontSize="10" fontFamily="Inter, sans-serif">MARGIN</text>
    </svg>
  );
};

const HeatmapChart = () => {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const hours = Array.from({length:24},(_,i)=>i);
  const data = days.map(() => hours.map(() => Math.floor(Math.random()*10)));
  return (
    <div style={{ overflowX:'auto' }}>
      <div style={{ display:'flex', gap:2, marginBottom:4 }}>
        <div style={{ width:32 }} />
        {hours.filter(h=>h%3===0).map(h => <div key={h} style={{ flex:1, fontSize:9, color:'var(--text3)', textAlign:'center', minWidth:16 }}>{h}h</div>)}
      </div>
      {days.map((day, di) => (
        <div key={day} style={{ display:'flex', gap:2, marginBottom:2, alignItems:'center' }}>
          <div style={{ width:32, fontSize:10, color:'var(--text3)', flexShrink:0 }}>{day}</div>
          {hours.map((h, hi) => (
            <div key={hi} style={{ flex:1, height:16, borderRadius:2, background:`rgba(201,168,76,${data[di][hi]/10})`, minWidth:8 }} title={`${day} ${h}:00 — ${data[di][hi]} bookings`} />
          ))}
        </div>
      ))}
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [tab, setTab] = useState(0);
  const [aiStats, setAiStats] = useState(null);
  const TABS = ['Revenue', 'Occupancy', 'Customer Growth', 'Profit Margin', 'Peak Times', 'AI Allocations'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiModule = await import('../services/api').then(m => m.default || m);
        const res = await apiModule.get('/hotel/allocations/analytics');
        if (res.data) setAiStats(res.data);
      } catch (err) {
        console.error('Failed to load AI stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap:16, marginBottom:24 }}>
        <StatCard title="RevPAR" value="₹3,315" icon="dollar" color="var(--gold)" />
        <StatCard title="ADR" value="₹4,250" icon="trending" color="var(--teal)" />
        <StatCard title="GOPPAR" value="₹1,420" icon="chart" color="var(--violet)" />
        <StatCard title="NPS Score" value="72" icon="star" color="var(--green)" />
      </div>
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--card)', borderRadius:10, padding:4, border:'1px solid var(--border)' }}>
        {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ flex:1, padding:'9px 8px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:500, background:tab===i?'var(--surface)':'transparent', color:tab===i?'var(--gold)':'var(--text2)' }}>{t}</button>)}
      </div>

      {tab === 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap:16 }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Monthly Revenue vs Expenses</div>
            <div style={{ display:'flex', gap:16, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text3)' }}><div style={{ width:12, height:12, borderRadius:2, background:'var(--gold)' }} />Revenue</div>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text3)' }}><div style={{ width:12, height:12, borderRadius:2, background:'rgba(251,113,133,0.5)' }} />Expenses</div>
            </div>
            <BarChart />
          </div>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Monthly Breakdown</div>
            {MONTHLY.map(m => (
              <div key={m.month} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:13, color:'var(--text2)' }}>{m.month}</span>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, color:'var(--gold)' }}>₹{m.revenue.toLocaleString()}</span>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, color:'var(--rose)' }}>₹{m.expenses.toLocaleString()}</span>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, color:'var(--green)' }}>₹{(m.revenue-m.expenses).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 1 && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>Daily Occupancy Rate</div>
            <div style={{ display:'flex', gap:16 }}>
              <div style={{ fontSize:13, color:'var(--green)' }}>Peak: 92%</div>
              <div style={{ fontSize:13, color:'var(--rose)' }}>Low: 62%</div>
              <div style={{ fontSize:13, color:'var(--text2)' }}>Avg: 78%</div>
            </div>
          </div>
          <OccupancyChart />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            {[1,8,15,22,29,31].map(d => <span key={d} style={{ fontSize:10, color:'var(--text3)' }}>{d}</span>)}
          </div>
        </div>
      )}

      {tab === 2 && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:20 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:16 }}>New vs Returning Guests</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:180 }}>
            {MONTHLY.map((m, i) => {
              const newG = Math.round(m.guests * 0.4);
              const retG = m.guests - newG;
              const maxG = Math.max(...MONTHLY.map(x=>x.guests));
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'stretch', height:150, justifyContent:'flex-end' }}>
                    <div style={{ background:'var(--violet)', borderRadius:'4px 4px 0 0', height:`${(newG/maxG)*100}%`, minHeight:4 }} title={`New: ${newG}`} />
                    <div style={{ background:'var(--teal)', height:`${(retG/maxG)*100}%`, minHeight:4 }} title={`Returning: ${retG}`} />
                  </div>
                  <div style={{ fontSize:10, color:'var(--text3)' }}>{m.month}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display:'flex', gap:16, marginTop:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text3)' }}><div style={{ width:12, height:12, borderRadius:2, background:'var(--violet)' }} />New Guests</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text3)' }}><div style={{ width:12, height:12, borderRadius:2, background:'var(--teal)' }} />Returning Guests</div>
          </div>
        </div>
      )}

      {tab === 3 && (
        <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:24, alignItems:'center' }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:20, display:'flex', flexDirection:'column', alignItems:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Profit by Department</div>
            <DonutChart />
          </div>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Department Breakdown</div>
            {DEPT_PROFIT.map(d => (
              <div key={d.name} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13, color:'var(--text2)' }}>{d.name}</span>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, color:d.color, fontWeight:600 }}>{d.pct}%</span>
                </div>
                <div style={{ height:8, background:'var(--surface)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${d.pct}%`, background:d.color, borderRadius:4, transition:'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 4 && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:20 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Peak Booking Times Heatmap</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16 }}>Booking density by day and hour</div>
          <HeatmapChart />
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12 }}>
            <span style={{ fontSize:11, color:'var(--text3)' }}>Low</span>
            {[0.1,0.3,0.5,0.7,0.9].map(o => <div key={o} style={{ width:20, height:12, borderRadius:2, background:`rgba(201,168,76,${o})` }} />)}
            <span style={{ fontSize:11, color:'var(--text3)' }}>High</span>
          </div>
        </div>
      )}
      {tab === 5 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap:16 }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Smart Room Allocation Today</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13, color:'var(--text2)' }}>AI Assigned Rooms</span>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:18, color:'var(--gold)', fontWeight:700 }}>{aiStats?.aiAllocationsToday || 0}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13, color:'var(--text2)' }}>Manually Assigned</span>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:18, color:'var(--text)', fontWeight:700 }}>{aiStats?.manualAllocationsToday || 0}</span>
              </div>
              <div style={{ width:'100%', height:8, background:'var(--surface)', borderRadius:4, overflow:'hidden', marginTop:8 }}>
                {aiStats && (aiStats.aiAllocationsToday + aiStats.manualAllocationsToday > 0) && (
                  <div style={{ height:'100%', width:`${(aiStats.aiAllocationsToday / (aiStats.aiAllocationsToday + aiStats.manualAllocationsToday)) * 100}%`, background:'var(--gold)' }} />
                )}
              </div>
            </div>
          </div>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:20, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:16 }}>AI Recommendation Accuracy</div>
            <div style={{ position:'relative', width:120, height:120 }}>
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--green)" strokeWidth="10" strokeDasharray={`${((aiStats?.aiRecommendationAccuracy || 0)/100) * 251.2} 251.2`} strokeLinecap="round" style={{ transform:'rotate(-90deg)', transformOrigin:'50px 50px', transition:'stroke-dasharray 1s' }} />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                <span style={{ fontSize:24, fontWeight:700, color:'var(--text)' }}>{aiStats?.aiRecommendationAccuracy || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
