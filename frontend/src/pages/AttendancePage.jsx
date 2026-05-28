import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import { ATTENDANCE, EMPLOYEES } from '../data/mockData';

const statusColor = { present: 'green', absent: 'rose', leave: 'amber', late: 'violet' };

const AttendancePage = () => {
  const [attendance, setAttendance] = useState(ATTENDANCE);
  const [selectedDate, setSelectedDate] = useState('2025-07-14');
  const [activeTab, setActiveTab] = useState('today');

  const todayRecords = attendance.filter(a => a.date === selectedDate);
  const allDates = [...new Set(attendance.map(a => a.date))].sort().reverse();

  const stats = [
    { label: 'Present', count: todayRecords.filter(a => a.status === 'present').length, color: 'var(--green)' },
    { label: 'Absent', count: todayRecords.filter(a => a.status === 'absent').length, color: 'var(--rose)' },
    { label: 'On Leave', count: todayRecords.filter(a => a.status === 'leave').length, color: 'var(--amber)' },
    { label: 'Total Hours', count: todayRecords.reduce((s, a) => s + (a.hours || 0), 0).toFixed(1) + 'h', color: 'var(--teal)' },
  ];

  const markAttendance = (empId, status) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    setAttendance(prev => {
      const existing = prev.find(a => a.employeeId === empId && a.date === selectedDate);
      if (existing) {
        return prev.map(a => a.employeeId === empId && a.date === selectedDate
          ? { ...a, status, checkIn: status === 'present' ? (a.checkIn || timeStr) : null }
          : a
        );
      }
      const emp = EMPLOYEES.find(e => e.id === empId);
      return [...prev, { id: prev.length + 1, employeeId: empId, name: emp?.name || '', date: selectedDate, checkIn: status === 'present' ? timeStr : null, checkOut: null, status, hours: null, overtime: 0 }];
    });
  };

  const checkOut = (empId) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    setAttendance(prev => prev.map(a => {
      if (a.employeeId === empId && a.date === selectedDate && a.checkIn && !a.checkOut) {
        const [inH, inM] = a.checkIn.split(':').map(Number);
        const [outH, outM] = timeStr.split(':').map(Number);
        const hours = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 10) / 10;
        const overtime = Math.max(0, hours - 8);
        return { ...a, checkOut: timeStr, hours, overtime };
      }
      return a;
    }));
  };

  // Monthly summary per employee
  const monthlySummary = EMPLOYEES.map(emp => {
    const empRecords = attendance.filter(a => a.employeeId === emp.id);
    return {
      ...emp,
      present: empRecords.filter(a => a.status === 'present').length,
      absent: empRecords.filter(a => a.status === 'absent').length,
      leave: empRecords.filter(a => a.status === 'leave').length,
      totalHours: empRecords.reduce((s, a) => s + (a.hours || 0), 0).toFixed(1),
      overtime: empRecords.reduce((s, a) => s + (a.overtime || 0), 0).toFixed(1),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '16px 32px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0' }}>
        {[['today', 'Daily Attendance'], ['monthly', 'Monthly Summary'], ['report', 'Attendance Report']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === id ? 'var(--gold)' : 'transparent'}`, color: activeTab === id ? 'var(--gold)' : 'var(--text3)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1 }}>
        {activeTab === 'today' && (
          <>
            {/* Date Selector + Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>SELECT DATE</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {stats.map(s => (
                  <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 18px', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'Poppins,sans-serif', color: s.color }}>{s.count}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Table */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                    {['Employee', 'Department', 'Shift', 'Check-in', 'Check-out', 'Hours', 'OT', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EMPLOYEES.map(emp => {
                    const rec = todayRecords.find(a => a.employeeId === emp.id);
                    return (
                      <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Avatar initials={emp.avatar} color={rec?.status === 'present' ? 'var(--green)' : rec?.status === 'absent' ? 'var(--rose)' : 'var(--text3)'} size={32} />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600' }}>{emp.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{emp.role}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text2)' }}>{emp.dept}</td>
                        <td style={{ padding: '12px' }}><Badge color="gray">{emp.shift}</Badge></td>
                        <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace', color: 'var(--teal)' }}>{rec?.checkIn || '—'}</td>
                        <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace', color: 'var(--text2)' }}>{rec?.checkOut || '—'}</td>
                        <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace' }}>{rec?.hours ? `${rec.hours}h` : '—'}</td>
                        <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace', color: rec?.overtime > 0 ? 'var(--amber)' : 'var(--text3)' }}>{rec?.overtime > 0 ? `+${rec.overtime}h` : '—'}</td>
                        <td style={{ padding: '12px' }}>
                          {rec ? <Badge color={statusColor[rec.status]}>{rec.status}</Badge> : <Badge color="gray">Not Marked</Badge>}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {(!rec || rec.status !== 'present') && (
                              <button onClick={() => markAttendance(emp.id, 'present')} style={{ padding: '4px 8px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '5px', color: 'var(--green)', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>In</button>
                            )}
                            {rec?.status === 'present' && !rec.checkOut && (
                              <button onClick={() => checkOut(emp.id)} style={{ padding: '4px 8px', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '5px', color: 'var(--gold)', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Out</button>
                            )}
                            {(!rec || rec.status !== 'absent') && (
                              <button onClick={() => markAttendance(emp.id, 'absent')} style={{ padding: '4px 8px', background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: '5px', color: 'var(--rose)', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Abs</button>
                            )}
                            {(!rec || rec.status !== 'leave') && (
                              <button onClick={() => markAttendance(emp.id, 'leave')} style={{ padding: '4px 8px', background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.3)', borderRadius: '5px', color: 'var(--amber)', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Leave</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'monthly' && (
          <>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Monthly Attendance Summary — July 2025</div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                    {['Employee', 'Dept', 'Present', 'Absent', 'Leave', 'Total Hours', 'Overtime', 'Attendance %'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.map(emp => {
                    const total = emp.present + emp.absent + emp.leave;
                    const pct = total > 0 ? Math.round((emp.present / total) * 100) : 0;
                    return (
                      <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Avatar initials={emp.avatar} color="var(--gold)" size={30} />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600' }}>{emp.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{emp.role}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text2)' }}>{emp.dept}</td>
                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700', color: 'var(--green)' }}>{emp.present}</td>
                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700', color: 'var(--rose)' }}>{emp.absent}</td>
                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700', color: 'var(--amber)' }}>{emp.leave}</td>
                        <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace' }}>{emp.totalHours}h</td>
                        <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace', color: +emp.overtime > 0 ? 'var(--amber)' : 'var(--text3)' }}>{+emp.overtime > 0 ? `+${emp.overtime}h` : '—'}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '4px', background: 'var(--surface)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? 'var(--green)' : pct >= 75 ? 'var(--amber)' : 'var(--rose)', borderRadius: '2px' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: pct >= 90 ? 'var(--green)' : pct >= 75 ? 'var(--amber)' : 'var(--rose)' }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'report' && (
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Attendance History</div>
            {allDates.map(date => {
              const dayRecords = attendance.filter(a => a.date === date);
              const presentCount = dayRecords.filter(a => a.status === 'present').length;
              return (
                <div key={date} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Badge color="green">{presentCount} Present</Badge>
                      <Badge color="rose">{dayRecords.filter(a => a.status === 'absent').length} Absent</Badge>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {dayRecords.map(rec => (
                      <div key={rec.id} style={{ background: 'var(--surface)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px' }}>
                        <span style={{ fontWeight: '600' }}>{rec.name.split(' ')[0]}</span>
                        <span style={{ color: 'var(--text3)', marginLeft: '4px' }}>{rec.checkIn || '—'} → {rec.checkOut || '—'}</span>
                        {rec.hours && <span style={{ color: 'var(--teal)', marginLeft: '4px' }}>{rec.hours}h</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
