import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cart, updateQuantity, removeFromCart, clearCart, onOpenCheckout }) {
  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
          maxWidth: '460px', 
          width: '100%', 
          height: '100vh', 
          borderRadius: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          background: '#ffffff',
          borderLeft: '1px solid #e2e8f0',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
          animation: 'slideLeft 0.25s ease-out'
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag color="#4f46e5" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Your Shopping Cart</h3>
            <span style={{ fontSize: '0.8rem', background: '#e0e7ff', color: '#4338ca', fontWeight: '700', padding: '0.15rem 0.6rem', borderRadius: '12px' }}>
              {cart.reduce((sum, i) => sum + i.quantity, 0)} items
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
              <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p style={{ fontSize: '1rem', fontWeight: '600' }}>Your cart is empty</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>Add items from the marketplace to get started</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => (
                <div key={item._id || item.id} style={{ display: 'flex', gap: '1rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <img 
                    src={(item.images && item.images.length > 0) ? item.images[0] : (item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300')} 
                    alt={item.title}
                    style={{ width: '68px', height: '68px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{item.title}</h4>
                      <button onClick={() => removeFromCart(item._id || item.id || item.listingId)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#4f46e5' }}>LKR {(item.price * item.quantity).toLocaleString()}</span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        <button onClick={() => updateQuantity(item._id || item.id || item.listingId, item.quantity - 1)} style={{ background: 'transparent', border: 'none', color: '#0f172a', cursor: 'pointer' }}><Minus size={13} /></button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '16px', textAlign: 'center', color: '#0f172a' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id || item.id || item.listingId, item.quantity + 1)} style={{ background: 'transparent', border: 'none', color: '#0f172a', cursor: 'pointer' }}><Plus size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer with Proceed to Checkout Button */}
        {cart.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#64748b' }}>Subtotal Amount:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#047857' }}>LKR {totalAmount.toLocaleString()}</span>
            </div>

            <button 
              onClick={handleProceedToCheckout}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
            >
              Proceed to Checkout <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
