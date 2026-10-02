import React, { useState, useEffect } from 'react';
import { X, Truck, MapPin, CheckCircle, Clock, User, Phone, ShieldCheck, Navigation } from 'lucide-react';

export default function TrackingModal({ isOpen, onClose, order }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order && isOpen) {
      setLoading(true);
      fetch(`http://localhost:5000/api/orders/${order._id || order.id || order.orderId}/tracking`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTracking(data.tracking);
          } else {
            // Fallback tracking info
            setTracking({
              orderId: order.orderId || 'ORD-98212',
              status: order.status || 'Processing',
              courier: 'Marketplace Express Courier',
              driverName: 'Kamal Perera',
              driverPhone: '+94 71 889 2200',
              vehicleNo: 'WP CAD-4521',
              estimatedDelivery: 'Tomorrow by 4:00 PM',
              currentLocationName: 'In Transit - Colombo Hub',
              checkpoints: [
                { title: 'Order Placed & Payment Verified', time: '10:15 AM', completed: true },
                { title: 'Picked up by Courier Dispatch', time: '02:30 PM', completed: true },
                { title: 'In Transit to Regional Distribution Hub', time: '05:45 PM', completed: order.status !== 'Processing' },
                { title: 'Out for Final Delivery to Address', time: 'Expected 09:00 AM', completed: order.status === 'Delivered' },
                { title: 'Delivered & Signed', time: 'Expected 04:00 PM', completed: order.status === 'Delivered' }
              ]
            });
          }
        })
        .catch(() => {
          setTracking({
            orderId: order.orderId || 'ORD-98212',
            status: order.status || 'Processing',
            courier: 'Marketplace Express Courier',
            driverName: 'Kamal Perera',
            driverPhone: '+94 71 889 2200',
            vehicleNo: 'WP CAD-4521',
            estimatedDelivery: 'Tomorrow by 4:00 PM',
            currentLocationName: 'In Transit - Colombo Hub',
            checkpoints: [
              { title: 'Order Placed & Payment Verified', time: '10:15 AM', completed: true },
              { title: 'Picked up by Courier Dispatch', time: '02:30 PM', completed: true },
              { title: 'In Transit to Regional Distribution Hub', time: '05:45 PM', completed: order.status !== 'Processing' },
              { title: 'Out for Final Delivery to Address', time: 'Expected 09:00 AM', completed: order.status === 'Delivered' },
              { title: 'Delivered & Signed', time: 'Expected 04:00 PM', completed: order.status === 'Delivered' }
            ]
          });
        })
        .finally(() => setLoading(false));
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '680px', 
          width: '95%', 
          maxHeight: '90vh',
          background: '#ffffff', 
          borderRadius: '24px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.6rem', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
              <Truck color="#fff" size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Live Courier Package Tracking</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Order ID: <strong style={{ color: '#4f46e5' }}>#{order.orderId || order.id}</strong></span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#e2e8f0', border: 'none', color: '#475569', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Connecting to Courier GPS Network...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Simulated Animated GPS Route Card */}
              <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: '16px', padding: '1.5rem', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '1px' }}>COURIER PARTNER</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#38bdf8' }}>{tracking.courier}</div>
                  </div>
                  <div style={{ background: '#10b981', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Navigation size={14} className="animate-spin" /> LIVE GPS ACTIVE
                  </div>
                </div>

                {/* Animated Progress Route Line */}
                <div style={{ position: 'relative', height: '8px', background: '#334155', borderRadius: '4px', margin: '1.5rem 0' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: tracking.status === 'Delivered' ? '100%' : tracking.status === 'Dispatched' ? '65%' : '30%', background: 'linear-gradient(90deg, #38bdf8, #10b981)', borderRadius: '4px', transition: 'width 1s ease' }}></div>
                  <div style={{ position: 'absolute', left: tracking.status === 'Delivered' ? '98%' : tracking.status === 'Dispatched' ? '63%' : '28%', top: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', border: '3px solid #ffffff', boxShadow: '0 0 12px #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={12} color="#fff" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Est. Delivery Time</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fbbf24' }}>{tracking.estimatedDelivery}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Courier Driver</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>{tracking.driverName} ({tracking.vehicleNo})</div>
                  </div>
                </div>
              </div>

              {/* Delivery Checkpoints List */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#4f46e5" /> Delivery Progress Milestones
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {tracking.checkpoints.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step.completed ? '#ecfdf5' : '#f1f5f9', color: step.completed ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', border: step.completed ? '2px solid #10b981' : '1px solid #cbd5e1', flexShrink: 0 }}>
                        {step.completed ? <CheckCircle size={16} /> : idx + 1}
                      </div>
                      <div style={{ flex: 1, paddingTop: '2px' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: step.completed ? '#0f172a' : '#64748b' }}>{step.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{step.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
