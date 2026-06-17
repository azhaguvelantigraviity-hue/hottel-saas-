import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const CATEGORIES = ['Breakfast', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages', 'Snacks', 'Custom'];

const ManualItemForm = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Main Course',
    description: '',
    available: true,
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        price: item.price || '',
        stock: item.stock || '',
        category: item.category || 'Main Course',
        description: item.description || '',
        available: item.available !== false,
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock) || 0 });
  };

  const inpStyle = { width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif' };
  const lblStyle = { fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px' }}>{item ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={20} color="var(--text3)" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={lblStyle}>ITEM NAME</label>
            <input required style={inpStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Garlic Naan" />
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={lblStyle}>PRICE (₹)</label>
              <input required type="number" min="0" style={inpStyle} value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={lblStyle}>STOCK</label>
              <input type="number" min="0" style={inpStyle} value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="Stock (0=∞)" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={lblStyle}>CATEGORY</label>
              <select style={inpStyle} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label style={lblStyle}>DESCRIPTION</label>
            <textarea style={{...inpStyle, minHeight: '80px', resize: 'vertical'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description..." />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input type="checkbox" id="available-check" checked={form.available} onChange={e => setForm({...form, available: e.target.checked})} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            <label htmlFor="available-check" style={{ fontSize: '13px', cursor: 'pointer' }}>Currently Available</label>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualItemForm;
