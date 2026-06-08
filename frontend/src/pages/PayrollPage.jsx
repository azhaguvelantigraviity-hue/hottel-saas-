import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import * as api from '../services/hotelService';

const STATUS_COLORS = {
  Paid: 'green',
  Pending: 'amber',
};

const inp = {
  width: '100%', padding: '10px 12px', background: 'var(--surface)',
  border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
  fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box'
};

const lbl = {
  fontSize: '11px', color: 'var(--text3)', fontWeight: '600',
  letterSpacing: '0.06em', display: 'block', marginBottom: '5px',
};

const PayrollModal = ({ record, onClose, onSave }) => {
  const [form, setForm] = useState({
    workingDays: record.workingDays,
    paidDays: record.paidDays,
    overtime: record.overtime,
    bonus: record.bonus,
    deductions: record.deductions,
    advance: record.advance,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: Number(v) || 0 }));

  const calculateNet = () => {
    const baseFraction = form.workingDays > 0 ? (record.baseSalary / form.workingDays) * form.paidDays : 0;
    return Math.round(baseFraction + form.overtime + form.bonus - form.deductions - form.advance);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '18px', margin: 0 }}>Calculate Payroll</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={lbl}>WORKING DAYS (MONTH)</label>
              <input type="number" style={inp} value={form.workingDays} onChange={e => set('workingDays', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>PAID DAYS</label>
              <input type="number" style={inp} value={form.paidDays} onChange={e => set('paidDays', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>OVERTIME (₹)</label>
              <input type="number" style={inp} value={form.overtime} onChange={e => set('overtime', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>BONUS (₹)</label>
              <input type="number" style={inp} value={form.bonus} onChange={e => set('bonus', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>DEDUCTIONS (₹)</label>
              <input type="number" style={inp} value={form.deductions} onChange={e => set('deductions', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>ADVANCE SALARY (₹)</label>
              <input type="number" style={inp} value={form.advance} onChange={e => set('advance', e.target.value)} />
            </div>
          </div>
          <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text2)' }}>Base Salary</span>
              <span style={{ fontWeight: '600', fontFamily: 'DM Mono, monospace' }}>₹{record.baseSalary.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '15px' }}>
              <span style={{ color: 'var(--text)', fontWeight: '600' }}>Calculated Net Salary</span>
              <span style={{ fontWeight: '700', color: 'var(--gold)', fontFamily: 'DM Mono, monospace' }}>₹{calculateNet().toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Cancel</button>
          <button onClick={() => onSave(record._id, form)} style={{ padding: '8px 16px', background: 'var(--gold)', border: 'none', borderRadius: '6px', color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Save Payroll</button>
        </div>
      </div>
    </div>
  );
};

const PayslipModal = ({ data, onClose }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', width: '100%', maxWidth: '600px', color: '#111' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '18px', margin: 0 }}>Payslip - {data.month}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>
        <div style={{ padding: '32px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>STAYOS HOTEL</h1>
            <div style={{ fontSize: '13px', color: '#666' }}>Salary Slip for the month of {data.month}</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px', fontSize: '14px' }}>
            <div><strong style={{color:'#444'}}>Employee Name:</strong> {data.employeeName}</div>
            <div><strong style={{color:'#444'}}>Role:</strong> {data.role}</div>
            <div><strong style={{color:'#444'}}>Paid Days:</strong> {data.paidDays} / {data.workingDays}</div>
            <div><strong style={{color:'#444'}}>Paid On:</strong> {data.paidDate ? new Date(data.paidDate).toLocaleDateString() : 'N/A'}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Earnings</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Deductions</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', fontSize: '14px', borderRight: '1px solid #eee' }}>Basic Salary (Pro-rata)</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', borderRight: '1px solid #eee', fontFamily: 'DM Mono, monospace' }}>₹{Math.round(data.baseSalary / data.workingDays * data.paidDays).toLocaleString()}</td>
                <td style={{ padding: '12px', fontSize: '14px', borderRight: '1px solid #eee' }}>Other Deductions</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontFamily: 'DM Mono, monospace' }}>₹{data.deductions.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', fontSize: '14px', borderRight: '1px solid #eee' }}>Overtime</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', borderRight: '1px solid #eee', fontFamily: 'DM Mono, monospace' }}>₹{data.overtime.toLocaleString()}</td>
                <td style={{ padding: '12px', fontSize: '14px', borderRight: '1px solid #eee' }}>Advance Salary</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontFamily: 'DM Mono, monospace' }}>₹{data.advance.toLocaleString()}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontSize: '14px', borderRight: '1px solid #eee' }}>Bonus</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', borderRight: '1px solid #eee', fontFamily: 'DM Mono, monospace' }}>₹{data.bonus.toLocaleString()}</td>
                <td style={{ padding: '12px', fontSize: '14px', borderRight: '1px solid #eee' }}></td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}></td>
              </tr>
              <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '12px', fontWeight: '600', borderRight: '1px solid #eee' }}>Total Earnings</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid #eee', fontFamily: 'DM Mono, monospace' }}>
                  ₹{Math.round((data.baseSalary / data.workingDays * data.paidDays) + data.overtime + data.bonus).toLocaleString()}
                </td>
                <td style={{ padding: '12px', fontWeight: '600', borderRight: '1px solid #eee' }}>Total Deductions</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', fontFamily: 'DM Mono, monospace' }}>
                  ₹{(data.deductions + data.advance).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: '#e0f2fe', padding: '16px 24px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '13px', color: '#0369a1', fontWeight: '600', marginBottom: '4px' }}>NET SALARY</div>
              <div style={{ fontSize: '24px', color: '#0c4a6e', fontWeight: '700', fontFamily: 'DM Mono, monospace' }}>₹{data.netSalary.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PayrollPage = () => {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [editingRecord, setEditingRecord] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const fetchPayroll = async (month) => {
    setLoading(true);
    try {
      const res = await api.getPayrollRecords(month);
      if (res.data) setPayrollRecords(res.data);
    } catch (err) {
      console.error("Failed to load payroll data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll(currentMonth);
  }, [currentMonth]);

  const totalPayroll = payrollRecords.reduce((sum, e) => sum + e.netSalary, 0);
  const totalPaid = payrollRecords.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.netSalary, 0);
  const pendingAmount = totalPayroll - totalPaid;

  const handleSavePayroll = async (id, data) => {
    try {
      const res = await api.updatePayrollRecord(id, data);
      setPayrollRecords(prev => prev.map(p => p._id === id ? { ...p, ...res.data, employee: p.employee } : p));
      setEditingRecord(null);
    } catch (err) {
      console.error('Failed to update payroll', err);
      alert('Failed to update payroll.');
    }
  };

  const markAsPaid = async (id) => {
    if (!window.confirm("Confirm payment processing for this employee?")) return;
    try {
      const res = await api.markPayrollPaid(id);
      setPayrollRecords(prev => prev.map(p => p._id === id ? { ...p, ...res.data, employee: p.employee } : p));
    } catch (err) {
      console.error('Failed to mark paid', err);
    }
  };

  const markAllPaid = async () => {
    if (!window.confirm("Process payroll for all pending employees?")) return;
    try {
      await api.processAllPendingPayroll(currentMonth);
      fetchPayroll(currentMonth);
    } catch (err) {
      console.error('Failed to process all', err);
    }
  };

  const showPayslip = (record) => {
    if (record.status === 'Paid' && record.payslipData) {
      setPreviewData(record.payslipData);
    } else {
      // Generate ad-hoc preview
      setPreviewData({
        employeeName: record.employee.name,
        role: record.employee.role,
        month: record.month,
        baseSalary: record.baseSalary,
        workingDays: record.workingDays,
        paidDays: record.paidDays,
        overtime: record.overtime,
        bonus: record.bonus,
        deductions: record.deductions,
        advance: record.advance,
        netSalary: record.netSalary,
        paidDate: null
      });
    }
  };

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
            disabled={pendingAmount === 0 || loading}
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
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', minHeight: '300px' }}>
        {loading ? (
          <div style={{ padding: '40px', color: 'var(--text2)', textAlign: 'center' }}>Loading payroll data...</div>
        ) : (
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
                  <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text3)', fontWeight: '600', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)' }}>No employees found.</td>
                  </tr>
                ) : (
                  payrollRecords.map((record) => (
                    <tr key={record._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar initials={record.employee?.name?.substring(0, 2).toUpperCase() || 'E'} size={36} color="var(--teal)" />
                          <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>{record.employee?.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text2)' }}>{record.employee?.role}</td>
                      <td style={{ padding: '16px', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>₹{record.baseSalary.toLocaleString()}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text2)' }}>
                        <span style={{ color: 'var(--green)', fontWeight: '600' }}>{record.paidDays}</span> / {record.workingDays}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}>
                        ₹{record.netSalary.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Badge color={STATUS_COLORS[record.status]}>{record.status}</Badge>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => showPayslip(record)}
                            style={{ padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                          >
                            Payslip
                          </button>
                          {record.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => setEditingRecord(record)}
                                style={{ padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => markAsPaid(record._id)}
                                style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                              >
                                Mark Paid
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingRecord && (
        <PayrollModal 
          record={editingRecord} 
          onClose={() => setEditingRecord(null)} 
          onSave={handleSavePayroll} 
        />
      )}

      {previewData && (
        <PayslipModal 
          data={previewData} 
          onClose={() => setPreviewData(null)} 
        />
      )}

    </div>
  );
};

export default PayrollPage;
