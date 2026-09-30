import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, XCircle, Clock, MapPin, CreditCard, User, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

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
      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Status Updated!',
          text: `Order status updated to "${newStatus}"`,
          timer: 1800,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
      fetchOrders();
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update order status.'
      });
    }
  };

  const handleDeleteOrder = async (id, orderIdStr) => {
    const targetId = id || orderIdStr;
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete order ${orderIdStr || targetId} permanently?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete Order!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setOrders(prev => prev.filter(o => o._id !== targetId && o.orderId !== targetId));
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${targetId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Deleted Successfully!',
          text: `Order ${orderIdStr || targetId} has been removed.`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: data.message || 'Could not delete order.'
        });
      }
      fetchOrders();
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Server connection failed.'
      });
    }
  };

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === filterStatus.toLowerCase());

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-title)' }}>Customer Orders & Sales Queue</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>View, manage, and delete live purchases placed by shoppers</p>
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
            style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#059669', borderColor: 'rgba(52, 211, 153, 0.4)', fontWeight: 700 }}
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
                background: filterStatus === status ? 'var(--primary-gradient)' : 'var(--bg-input)',
                color: filterStatus === status ? '#fff' : 'var(--text-main)',
                borderColor: filterStatus === status ? 'transparent' : 'var(--border-color)'
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
            <tr key={order._id || order.orderId}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={order.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                    style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                    alt={order.itemTitle}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-title)' }}>{order.itemTitle}</div>
                    <div style={{ fontSize: '12px', color: '#6366F1', fontWeight: 600 }}>ID: {order.orderId} • Qty: {order.quantity || 1}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just Now'}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={12} color="#6366F1" /> {order.buyerName || 'Customer'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} color="var(--text-muted)" /> {order.shippingAddress || 'No. 45, Galle Road, Colombo 03'}
                  </div>
                </div>
              </td>
              <td style={{ fontWeight: 800, color: '#059669', fontSize: '15px' }}>
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
                    <button className="glass-btn" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' }} onClick={() => handleUpdateStatus(order._id, 'Dispatched')}>
                      <Truck size={14} /> Dispatch
                    </button>
                  )}
                  {order.status === 'Dispatched' && (
                    <button className="glass-btn" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }} onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}>
                      <Truck size={14} /> Out for Delivery
                    </button>
                  )}
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <button className="glass-btn btn-success" onClick={() => handleUpdateStatus(order._id, 'Delivered')}>
                      <CheckCircle2 size={14} /> Deliver
                    </button>
                  )}
                  {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                    <button className="glass-btn btn-danger" onClick={() => handleUpdateStatus(order._id, 'Cancelled')}>
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                  <button 
                    className="glass-btn btn-danger" 
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.4)' }} 
                    onClick={() => handleDeleteOrder(order._id, order.orderId)}
                    title="Delete order permanently"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Package size={36} color="#6366F1" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-title)' }}>No Orders Found Matching Filter "{filterStatus}"</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Real customer purchases placed from the mobile app will automatically appear here.</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
