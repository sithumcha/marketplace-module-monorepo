import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, XCircle, Clock, MapPin, CreditCard, User } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = () => {
    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
    try {
      await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === filterStatus.toLowerCase());

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Customer Orders & Sales Queue</h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>View and process live purchases placed by mobile app shoppers</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => {
              if (orders.length === 0) return alert('No orders available to export');
              const headers = ['OrderId', 'ItemTitle', 'BuyerName', 'BuyerEmail', 'Price', 'Quantity', 'Status', 'PaymentMethod', 'Address'];
              const rows = orders.map(o => [
                o.orderId || '',
                `"${(o.itemTitle || '').replace(/"/g, '""')}"`,
                `"${(o.buyerName || '').replace(/"/g, '""')}"`,
                o.buyerEmail || '',
                o.price || 0,
                o.quantity || 1,
                o.status || '',
                o.paymentMethod || '',
                `"${(o.shippingAddress || '').replace(/"/g, '""')}"`
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `marketplace_orders_report_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="glass-btn"
            style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34D399', borderColor: 'rgba(52, 211, 153, 0.4)', fontWeight: 700 }}
          >
            📥 Export CSV Report
          </button>
          {['all', 'processing', 'dispatched', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="glass-btn"
              style={{
                textTransform: 'capitalize',
                background: filterStatus === status ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                borderColor: filterStatus === status ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Order Details</th>
            <th>Customer & Address</th>
            <th>Total Amount</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Management Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(order => (
            <tr key={order._id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={order.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                    style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                    alt={order.itemTitle}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{order.itemTitle}</div>
                    <div style={{ fontSize: '12px', color: '#818CF8', fontWeight: 600 }}>ID: {order.orderId} • Qty: {order.quantity || 1}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just Now'}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={12} color="#818CF8" /> {order.buyerName || 'Sithum Nethsara'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} color="#9CA3AF" /> {order.shippingAddress || 'No. 45, Galle Road, Colombo 03'}
                  </div>
                </div>
              </td>
              <td style={{ fontWeight: 800, color: '#34D399', fontSize: '15px' }}>
                ${(order.price || 0).toFixed(2)}
              </td>
              <td>
                <span className="badge badge-verified" style={{ textTransform: 'uppercase' }}>
                  <CreditCard size={10} style={{ marginRight: '4px' }} />
                  {order.paymentMethod || 'CARD'}
                </span>
              </td>
              <td>
                <span className={`badge badge-${order.status === 'Processing' ? 'pending' : order.status === 'Delivered' ? 'active' : 'flagged'}`}>
                  {order.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {order.status === 'Processing' && (
                    <button className="glass-btn" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8' }} onClick={() => handleUpdateStatus(order._id, 'Dispatched')}>
                      <Truck size={14} /> Dispatch
                    </button>
                  )}
                  {order.status === 'Dispatched' && (
                    <button className="glass-btn" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA' }} onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}>
                      <Truck size={14} /> Out for Delivery
                    </button>
                  )}
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <button className="glass-btn btn-success" onClick={() => handleUpdateStatus(order._id, 'Delivered')}>
                      <CheckCircle2 size={14} /> Deliver
                    </button>
                  )}
                  {order.status !== 'Cancelled' && (
                    <button className="glass-btn btn-danger" onClick={() => handleUpdateStatus(order._id, 'Cancelled')}>
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                <Package size={36} color="#818CF8" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>No Orders Found Matching Filter "{filterStatus}"</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Real customer purchases placed from the mobile app will automatically appear here.</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
