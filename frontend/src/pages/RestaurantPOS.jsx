import React, { useState } from 'react';
import Badge from '../components/Badge';
import { useApi, useMutation } from '../hooks/useApi';
import { getMenuItems, getPOSOrders, createPOSOrder, updatePOSOrder } from '../services/operationsService';
import { RESTAURANT_ORDERS, MENU_ITEMS } from '../data/mockData';

const statusColor = { pending: 'amber', preparing: 'violet', delivered: 'green', cancelled: 'rose' };
const categories = ['All', 'Breakfast', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages', 'Snacks'];

const RestaurantPOS = () => {
  const [cart, setCart] = useState([]);
  const [tableNo, setTableNo] = useState('');
  const [orderType, setOrderType] = useState('dine-in');
  const [catFilter, setCatFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('pos');
  const [localOrders, setLocalOrders] = useState(RESTAURANT_ORDERS);

  const { data: apiMenu } = useApi(() => getMenuItems().catch(() => ({ data: null })), []);
  const { data: apiOrders, refetch: refetchOrders } = useApi(() => getPOSOrders().catch(() => ({ data: null })), []);
  const { mutate: placeOrderApi } = useMutation(createPOSOrder);
  const { mutate: updateOrderApi } = useMutation(updatePOSOrder);

  const menuItems = Array.isArray(apiMenu) ? apiMenu : MENU_ITEMS;
  const orders = Array.isArray(apiOrders) ? apiOrders : localOrders;

  const menuFiltered = catFilter === 'All' ? menuItems.filter(m => m.available) : menuItems.filter(m => m.category === catFilter && m.available);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id || c._id === item._id);
      const key = item.id || item._id;
      if (existing) return prev.map(c => (c.id === key || c._id === key) ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, id: item.id || item._id, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0));

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = Math.round(cartTotal * 0.05);

  const placeOrder = async () => {
    if (!cart.length || !tableNo) return;
    try {
      await placeOrderApi({
        table: tableNo,
        type: orderType,
        items: cart.map(c => ({ menuItem: c._id, name: c.name, qty: c.qty, price: c.price })),
      });
      setCart([]);
      setTableNo('');
      refetchOrders();
    } catch {
      const newOrder = {
        id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
        table: tableNo,
        items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
        total: cartTotal + tax,
        status: 'pending',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        type: orderType,
      };
      setLocalOrders(prev => [newOrder, ...prev]);
      setCart([]);
      setTableNo('');
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await updateOrderApi(id, { status });
      refetchOrders();
    } catch {
      setLocalOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const inputStyle = { padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ padding: '16px 32px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0' }}>
        {[['pos', 'New Order'], ['orders', 'Active Orders'], ['history', 'Order History']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === id ? 'var(--gold)' : 'transparent'}`, color: activeTab === id ? 'var(--gold)' : 'var(--text3)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'pos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', flex: 1, overflow: 'hidden' }}>
          {/* Menu */}
          <div style={{ padding: '24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {categories.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', background: catFilter === c ? 'var(--gold)' : 'transparent', borderColor: catFilter === c ? 'var(--gold)' : 'var(--border)', color: catFilter === c ? '#000' : 'var(--text2)' }}>{c}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '12px' }}>
              {menuFiltered.map(item => {
                const itemKey = item.id || item._id;
                const inCart = cart.find(c => c.id === itemKey);
                return (
                  <div key={itemKey} onClick={() => addToCart(item)} style={{ background: 'var(--card)', border: `1px solid ${inCart ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '14px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = inCart ? 'var(--gold)' : 'var(--border)'}>
                    {inCart && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#000' }}>{inCart.qty}</div>}
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                      {item.category === 'Beverages' ? '🥤' : item.category === 'Breakfast' ? '🍳' : item.category === 'Desserts' ? '🍰' : item.category === 'Starters' ? '🥗' : '🍽️'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '6px' }}>{item.category}</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--gold)', fontFamily: 'DM Mono,monospace' }}>₹{item.price}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart */}
          <div style={{ borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--void)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Current Order</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {['dine-in', 'room-service', 'takeaway'].map(t => (
                  <button key={t} onClick={() => setOrderType(t)} style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid', fontSize: '10px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', background: orderType === t ? 'var(--gold)' : 'transparent', borderColor: orderType === t ? 'var(--gold)' : 'var(--border)', color: orderType === t ? '#000' : 'var(--text2)' }}>
                    {t.replace('-', ' ')}
                  </button>
                ))}
              </div>
              <input value={tableNo} onChange={e => setTableNo(e.target.value)} placeholder={orderType === 'room-service' ? 'Room number' : 'Table number'} style={{ ...inputStyle, width: '100%' }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '13px', marginTop: '40px' }}>No items added yet</div>
              ) : cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '10px', background: 'var(--card)', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>₹{item.price} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => removeFromCart(item.id)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text2)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => addToCart(item)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold)', border: 'none', cursor: 'pointer', color: '#000', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'DM Mono,monospace', minWidth: '60px', textAlign: 'right' }}>₹{(item.price * item.qty).toLocaleString()}</div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
                  <span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '8px' }}>
                  <span>GST (5%)</span><span>₹{tax.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: 'var(--gold)', marginBottom: '14px' }}>
                  <span>Total</span><span>₹{(cartTotal + tax).toLocaleString()}</span>
                </div>
                <button onClick={placeOrder} disabled={!tableNo} style={{ width: '100%', padding: '12px', background: tableNo ? 'linear-gradient(135deg,#C9A84C,#8A6F2E)' : 'var(--border)', border: 'none', borderRadius: '8px', color: tableNo ? '#fff' : 'var(--text3)', cursor: tableNo ? 'pointer' : 'not-allowed', fontWeight: '600', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {(activeTab === 'orders' || activeTab === 'history') && (
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '14px' }}>
             {orders.filter(o => activeTab === 'orders' ? ['pending', 'preparing'].includes(o.status) : ['delivered', 'cancelled'].includes(o.status)).map(order => {
              const orderKey = order.id || order.orderId || order._id;
              const orderIdDisplay = order.id || order.orderId || orderKey?.slice(-6);
              return (
              <div key={orderKey} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>{orderIdDisplay}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{order.table} · {order.time || new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {order.type.replace('-', ' ')}</div>
                  </div>
                  <Badge color={statusColor[order.status]}>{order.status}</Badge>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text2)', marginBottom: '3px' }}>
                      <span>{item.qty}× {item.name}</span>
                      <span>₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gold)', fontFamily: 'DM Mono,monospace' }}>₹{order.total.toLocaleString()}</span>
                  {order.status === 'pending' && <button onClick={() => updateOrderStatus(orderKey, 'preparing')} style={{ padding: '6px 12px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '6px', color: 'var(--violet)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Start Preparing</button>}
                  {order.status === 'preparing' && <button onClick={() => updateOrderStatus(orderKey, 'delivered')} style={{ padding: '6px 12px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '6px', color: 'var(--green)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Mark Delivered</button>}
                </div>
              </div>);
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPOS;
