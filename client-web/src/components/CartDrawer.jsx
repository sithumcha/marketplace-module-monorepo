import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Sparkles } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cart, updateQuantity, removeFromCart, clearCart, onOpenCheckout }) {
  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeShippingThreshold = 10000;
  const progressPercent = Math.min(100, (totalAmount / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalAmount);

  const handleProceedToCheckout = () => {
    onClose();
    if (onOpenCheckout) {
      onOpenCheckout();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '480px', 
          width: '100%', 
          height: '100vh', 
          borderRadius: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          justify: 'space-between',
          background: '#ffffff',
          borderLeft: '1px solid #e2e8f0',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.12)',
          animation: 'slideLeft 0.25s ease-out'
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
              <ShoppingBag color="#ffffff" size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Shopping Cart</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                {cart.reduce((sum, i) => sum + i.quantity, 0)} items selected
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#e2e8f0', border: 'none', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Free Express Shipping Progress Bar Banner */}
        {cart.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 100%)', padding: '0.85rem 1.5rem', borderBottom: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '800', color: '#3730a3', marginBottom: '0.4rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Truck size={16} color="#4f46e5" />
                {remainingForFreeShipping === 0 ? (
                  <span style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={14} color="#10b981" /> UNLOCKED FREE EXPRESS SHIPPING! 🎉
                  </span>
                ) : (
                  `Add LKR ${remainingForFreeShipping.toLocaleString()} for FREE Express Shipping!`
                )}
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>

            <div style={{ height: '6px', background: '#cbd5e1', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #4f46e5, #10b981)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}

        {/* Drawer Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
              <ShoppingBag size={54} style={{ marginBottom: '1rem', opacity: 0.35 }} color="#4f46e5" />
              <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Your cart is empty</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.3rem', color: '#64748b' }}>Explore store products and add items to your cart</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => (
                <div key={item._id || item.id} style={{ display: 'flex', gap: '1rem', padding: '0.9rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <img 
                    src={(item.images && item.images.length > 0) ? item.images[0] : (item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300')} 
                    alt={item.title}
                    style={{ width: '72px', height: '72px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{item.title}</h4>
                      <button onClick={() => removeFromCart(item._id || item.id || item.listingId)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#047857' }}>LKR {(item.price * item.quantity).toLocaleString()}</span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '8px' }}>
                        <button onClick={() => updateQuantity(item._id || item.id || item.listingId, item.quantity - 1)} style={{ background: 'transparent', border: 'none', color: '#0f172a', cursor: 'pointer' }}><Minus size={13} /></button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', minWidth: '18px', textAlign: 'center', color: '#0f172a' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id || item.id || item.listingId, item.quantity + 1)} style={{ background: 'transparent', border: 'none', color: '#0f172a', cursor: 'pointer' }}><Plus size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#64748b' }}>Subtotal Amount:</span>
              <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#047857' }}>LKR {totalAmount.toLocaleString()}</span>
            </div>

            <button 
              onClick={handleProceedToCheckout}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1.05rem', fontWeight: '800', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
            >
              Proceed to Fast Checkout <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
