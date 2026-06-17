import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useApi, useMutation } from '../hooks/useApi';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/operationsService';
import ManualItemList from '../components/ManualItemList';
import ManualItemForm from '../components/ManualItemForm';
import BulkImportModal from '../components/BulkImportModal';
import Icon from '../components/Icon';
import * as XLSX from 'xlsx';

const CATEGORIES = ['All', 'Breakfast', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages', 'Snacks', 'Custom'];

const ManualItemPage = ({ role, hotelDetails }) => {
  const { data: initialItems, refetch, loading } = useApi(getMenuItems);
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { mutate: createApi } = useMutation(createMenuItem);
  const { mutate: updateApi } = useMutation(updateMenuItem);
  const { mutate: deleteApi } = useMutation(deleteMenuItem);

  useEffect(() => {
    if (initialItems) setItems(initialItems);
  }, [initialItems]);

  // Real-time integration
  useEffect(() => {
    if (!hotelDetails) return;
    
    const socket = io('http://localhost:5000');
    socket.emit('joinHotel', hotelDetails._id || hotelDetails.id);

    socket.on('manualItemChanged', ({ action, item, id }) => {
      setItems(prev => {
        if (action === 'create') {
          if (prev.find(i => i._id === item._id)) return prev;
          return [...prev, item].sort((a,b) => a.name.localeCompare(b.name));
        }
        if (action === 'update') return prev.map(i => i._id === item._id ? item : i);
        if (action === 'delete') return prev.filter(i => i._id !== id);
        return prev;
      });
    });

    return () => socket.disconnect();
  }, [hotelDetails]);

  const canManage = role === 'admin' || role === 'manager' || role === 'platform_admin' || role === 'hotel_admin';

  const handleSave = async (formData) => {
    try {
      if (editItem) {
        await updateApi(editItem._id, formData);
      } else {
        await createApi(formData);
      }
      refetch();
      setShowForm(false);
      setEditItem(null);
    } catch (err) {
      alert(err.message || 'Error saving item');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteApi(id);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert('Error deleting item');
    }
  };

  const exportToExcel = () => {
    if (!items || items.length === 0) {
      alert('No items to export!');
      return;
    }
    const data = items.map(i => ({
      'Item Name': i.name,
      'Category': i.category,
      'Price': i.price,
      'Stock': i.stock || 0,
      'Description': i.description || '',
      'Status': i.available !== false ? 'Available' : 'Unavailable',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Menu Items');
    XLSX.writeFile(wb, `Menu_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Poppins,sans-serif', marginBottom: '4px' }}>Menu Items</h2>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Manage your restaurant menu items and prices</p>
        </div>
        
        {canManage && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={exportToExcel}
              style={{ 
                padding: '10px 20px', background: 'var(--surface)', 
                border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <Icon name="download" size={16} color="var(--gold)" /> Export Excel
            </button>
            <button 
              onClick={() => setShowBulkImport(true)}
              style={{ 
                padding: '10px 20px', background: 'var(--surface)', 
                border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <Icon name="upload" size={16} color="var(--gold)" /> Upload Excel
            </button>
            <button 
              onClick={() => { setEditItem(null); setShowForm(true); }}
              style={{ 
                padding: '10px 20px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', 
                border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(201,168,76,0.2)'
              }}
            >
              <Icon name="plus" size={16} color="#fff" /> Add New Item
            </button>
          </div>
        )}
      </div>

      {loading && !items.length ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>Loading menu items...</div>
      ) : (
        <ManualItemList 
          items={items} 
          categories={CATEGORIES} 
          onEdit={(item) => { setEditItem(item); setShowForm(true); }}
          onDelete={handleDelete}
          role={role}
        />
      )}

      {showForm && (
        <ManualItemForm 
          item={editItem} 
          onClose={() => { setShowForm(false); setEditItem(null); }} 
          onSave={handleSave} 
        />
      )}

      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onComplete={(result) => {
            if (result && result.items) {
              setItems(prev => [...result.items, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
            } else {
              refetch();
            }
          }}
        />
      )}
    </div>
  );
};

export default ManualItemPage;
