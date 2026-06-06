import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import * as api from '../services/hotelService';

const STATUS_COLORS = {
  Paid: 'green',
  Pending: 'amber',
  Unpaid: 'rose',
};

const PayrollPage = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [localPayouts, setLocalPayouts] = useState(() => {
    try {
      const stored = localStorage.getItem('stayos_payroll');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try { } catch {}
  }, [localPayouts]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empRes, attRes] = await Promise.all([
          api.getEmployees(),
          api.getAttendance()
        ]);
        setEmployees(empRes.data || []);
        setAttendance(attRes.data || []);
      } catch (err) {
        console.error("Failed to load payroll data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  // Compute Days in Month (excluding future days if it's the current month)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const elapsedDays = isCurrentMonth ? today.getDate() : daysInMonth;

  const payrollData = useMemo(() => {
    return employees.map(emp => {
      // Filter attendance for this month
      const monthAtt = attendance.filter(a => {
        if (!a.employee) return false;
        const empId = typeof a.employee === 'object' ? a.employee._id : a.employee;
        if (empId !== emp._id) return false;
        const d = new Date(a.date);
        return d.getFullYear() === year && d.getMonth() === month;
      });

      const present = monthAtt.filter(a => a.status === 'present').length;
      const late = monthAtt.filter(a => a.status === 'late').length;
      const leave = monthAtt.filter(a => a.status === 'leave').length;
      const absent = monthAtt.filter(a => a.status === 'absent').length;

      // Unmarked days default to present conceptually if they haven't been marked absent, 
      // but for strict payroll, we might only pay for marked "present" or "leave".
      // Assuming a simple formula: Paid Days = Present + Late + Leave
      const paidDays = present + late + leave;
      
      const baseSalary = emp.salary || 0;
      // Pro-rata calculation
      const calculatedNet = elapsedDays > 0 ? (baseSalary / daysInMonth) * paidDays : 0;
      const netSalary = Math.round(calculatedNet);

      const statusKey = `${emp._id}_${currentMonth}`;
      const status = localPayouts[statusKey] ? 'Paid' : 'Pending';

      return {
        ...emp,
        paidDays,
        absent,
        baseSalary,
        netSalary,
        status,
        statusKey
      };
    });
  }, [employees, attendance, year, month, elapsedDays, daysInMonth, localPayouts, currentMonth]);

  const totalPayroll = payrollData.reduce((sum, e) => sum + e.netSalary, 0);
  const totalPaid = payrollData.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.netSalary, 0);
  const pendingAmount = totalPayroll - totalPaid;

  const markAsPaid = (empId, statusKey) => {
    if (!window.confirm("Confirm payment processing for this employee?")) return;
    setLocalPayouts(prev => ({ ...prev, [statusKey]: true }));
  };

  const markAllPaid = () => {
    if (!window.confirm("Process payroll for all pending employees?")) return;
    const newPayouts = { ...localPayouts };
    payrollData.forEach(e => {
      if (e.status === 'Pending' && e.netSalary > 0) {
        newPayouts[e.statusKey] = true;
      }
    });
    setLocalPayouts(newPayouts);
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text2)' }}>Loading payroll data...</div>;
  }

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontFamily: 'Poppins, sans-serif' }}>Payroll Management</h1>
          <div style={{ color: 'var(--text3)', fontSize: '13px' }}>Dynamically calculated from Employee Salaries & Attendance</div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            type="month" 
            value={currentMonth} 
            onChange={e => setCurrentMonth(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
          />
          <button 
            onClick={markAllPaid}
            disabled={pendingAmount === 0}
            style={{ 
              padding: '10px 16px', background: pendingAmount === 0 ? 'var(--surface)' : 'linear-gradient(135deg, var(--gold), #8A6F2E)', 
              color: pendingAmount === 0 ? 'var(--text3)' : '#fff', border: 'none', borderRadius: '8px', 
              fontWeight: '600', cursor: pendingAmount === 0 ? 'not-allowed' : 'pointer' 
            }}
          >
            Process All Pending
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', fontWeight: '600' }}>TOTAL PAYROLL</div>
          <div style={{ fontSize: '28px', color: 'var(--text)', fontWeight: '700', fontFamily: 'DM Mono, monospace' }}>₹{totalPayroll.toLocaleString()}</div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', fontWeight: '600' }}>PROCESSED (PAID)</div>
          <div style={{ fontSize: '28px', color: 'var(--green)', fontWeight: '700', fontFamily: 'DM Mono, monospace' }}>₹{totalPaid.toLocaleString()}</div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', fontWeight: '600' }}>PENDING</div>
          <div style={{ fontSize: '28px', color: 'var(--amber)', fontWeight: '700', fontFamily: 'DM Mono, monospace' }}>₹{pendingAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* Payroll Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text3)', fontWeight: '600' }}>EMPLOYEE</th>
                <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text3)', fontWeight: '600' }}>ROLE</th>
                <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text3)', fontWeight: '600' }}>BASE SALARY</th>
                <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text3)', fontWeight: '600' }}>PAID DAYS</th>
                <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text3)', fontWeight: '600' }}>NET SALARY</th>
                <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text3)', fontWeight: '600' }}>STATUS</th>
                <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text3)', fontWeight: '600' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)' }}>No employees found.</td>
                </tr>
              ) : (
                payrollData.map((emp) => (
                  <tr key={emp._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar initials={emp.name.substring(0, 2).toUpperCase()} size={36} color="var(--teal)" />
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>{emp.name}</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text2)' }}>{emp.role}</td>
                    <td style={{ padding: '16px', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>₹{emp.baseSalary.toLocaleString()}</td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text2)' }}>
                      <span style={{ color: 'var(--green)', fontWeight: '600' }}>{emp.paidDays}</span> / {daysInMonth}
                      {emp.absent > 0 && <span style={{ marginLeft: '6px', color: 'var(--rose)', fontSize: '11px' }}>({emp.absent} abs)</span>}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}>
                      ₹{emp.netSalary.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Badge color={STATUS_COLORS[emp.status]}>{emp.status}</Badge>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {emp.status === 'Pending' && emp.netSalary > 0 ? (
                        <button 
                          onClick={() => markAsPaid(emp._id, emp.statusKey)}
                          style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text3)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PayrollPage;
