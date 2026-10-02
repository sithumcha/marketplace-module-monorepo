import React, { useState, useEffect } from 'react';
import { Package, RefreshCw, UserCheck, Lock, FileText, Truck } from 'lucide-react';
import Swal from 'sweetalert2';
import { downloadOrderInvoice } from '../utils/invoiceGenerator';
import TrackingModal from './TrackingModal';

export default function OrdersTab({ user, onNavigateToProfile }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);

  const fetchUserOrders = async () => {
    if (!user || !user.email) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: 'Are you sure you want to cancel this order? Item stock will be automatically restored.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Cancel Order!',
      cancelButtonText: 'Keep Order'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/cancel`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Order Cancelled!',
          text: 'Order cancelled successfully and stock restored in MongoDB.',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUserOrders();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Cancellation Failed',
          text: data.message || 'Could not cancel order.'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message
      });
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <Lock size={32} color="#b45309" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            Please Sign In to View Your Orders
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            You must be logged in to access your order history, delivery status, and tracking information.
          </p>
          <button onClick={onNavigateToProfile} className="btn-primary" style={{ padding: '0.75rem 1.6rem' }}>
            <UserCheck size={18} /> Sign In / Register Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>My Customer Orders</h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Displaying live orders from MongoDB for logged-in user: <strong style={{ color: '#4f46e5' }}>{user.email}</strong>
          </p>
        </div>

        <button onClick={fetchUserOrders} className="btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}>
          <RefreshCw size={15} /> Refresh Orders
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Fetching your orders from MongoDB Database...</div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Package size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>No Active Orders Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>You have not placed any orders yet. Add items from the marketplace to check out!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <img 
                  src={order.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'} 
                  alt={order.itemTitle} 
                  style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#4f46e5', letterSpacing: '0.5px' }}>{order.orderId}</span>
                    <span className={`badge ${order.status === 'Cancelled' ? 'badge-amber' : order.status === 'Delivered' ? 'badge-emerald' : 'badge-indigo'}`}>
                      {order.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{order.itemTitle}</h4>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Buyer: {order.buyerName} ({order.shippingAddress})</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>TOTAL AMOUNT</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#047857' }}>LKR {(order.price * order.quantity).toLocaleString()}</span>
                </div>

                <button 
                  onClick={() => setSelectedTrackingOrder(order)} 
                  className="btn-primary" 
                  style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem', background: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Truck size={15} /> Track Courier
                </button>

                <button 
                  onClick={() => downloadOrderInvoice(order)} 
                  className="btn-secondary" 
                  style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem', color: '#4f46e5', borderColor: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <FileText size={15} /> Bill
                </button>

                {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                  <button onClick={() => handleCancel(order._id)} className="btn-secondary" style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}>
                    Cancel Order
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Tracking Modal */}
      <TrackingModal 
        isOpen={!!selectedTrackingOrder} 
        onClose={() => setSelectedTrackingOrder(null)} 
        order={selectedTrackingOrder} 
      />

    </div>
  );
}
