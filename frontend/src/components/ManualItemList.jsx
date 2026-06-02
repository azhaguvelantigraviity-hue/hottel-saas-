import React, { useState, useCallback } from 'react';
import Badge from './Badge';
import Icon from './Icon';

const ManualItemList = ({ items, categories, onEdit, onDelete, role }) => {
  const [filter, setFilter] = useState('All');
  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = useCallback((id) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  }, []);

  const filteredItems = filter === 'All' 
    ? items 
    : items.filter(i => i.category === filter);

  const canManage = role === 'admin' || role === 'manager' || role === 'platform_admin' || role === 'hotel_admin';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Category Filter */}
      <div style={{ padding: '16px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
        {categories.map(c => (
          <button 
            key={c} 
            onClick={() => setFilter(c)}
            style={{ 
              padding: '6px 14px', borderRadius: '20px', border: '1px solid', 
              fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              background: filter === c ? 'var(--gold)' : 'transparent', 
              borderColor: filter === c ? 'var(--gold)' : 'var(--border)', 
              color: filter === c ? '#000' : 'var(--text2)' 
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {filteredItems.map(item => {
            const imgFailed = imgErrors[item._id];
            return (
            <div key={item._id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {item.image && !imgFailed ? (
                <div style={{ width: '100%', height: '160px', overflow: 'hidden' }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => handleImgError(item._id)}
                  />
                </div>
              ) : (
                <div style={{ width: '100%', height: '160px', background: 'linear-gradient(135deg, var(--gold), #8A6F2E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', opacity: 0.7 }}>
                  {item.category === 'Beverages' ? '🥤' : item.category === 'Breakfast' ? '🍳' : item.category === 'Desserts' ? '🍰' : item.category === 'Starters' ? '🥗' : item.category === 'Breads' ? '🍞' : item.category === 'Snacks' ? '🍿' : item.category === 'Custom' ? '📦' : '🍽️'}
                </div>
              )}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{item.category}</div>
                  </div>
                  <Badge color={item.available ? 'green' : 'gray'}>
                    {item.available ? 'Available' : 'Out of Stock'}
                  </Badge>
                </div>
                
                {item.description && (
                  <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '16px', flex: 1 }}>
                    {item.description}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: item.description ? 0 : 'auto' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--gold)', fontFamily: 'DM Mono,monospace' }}>
                    ₹{item.price.toLocaleString()}
                  </div>
                  
                  {canManage && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => onEdit(item)}
                        style={{ padding: '6px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text2)', cursor: 'pointer' }}
                        title="Edit Item"
                      >
                        <Icon name="edit" size={14} color="currentColor" />
                      </button>
                      <button 
                        onClick={() => onDelete(item._id, item.name)}
                        style={{ padding: '6px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: '#EF4444', cursor: 'pointer' }}
                        title="Delete Item"
                      >
                        <Icon name="trash" size={14} color="#EF4444" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );})}
          {filteredItems.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>
              No items found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualItemList;
