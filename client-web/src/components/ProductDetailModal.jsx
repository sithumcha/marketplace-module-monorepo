import React from 'react';
import { X, ShoppingBag, MessageSquare, ShieldCheck, Eye } from 'lucide-react';

export default function ProductDetailModal({ item, onClose, onAddToCart, onOpenOffer, onOpenChat }) {
  if (!item) return null;

  const imageUrl = item.images && item.images.length > 0 
    ? item.images[0] 
    : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: '16px', 
            right: '16px', 
            background: '#f1f5f9', 
            border: 'none', 
            color: '#64748b', 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer' 
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '0.5rem' }}>
          
          {/* Product Image Gallery */}
          <div>
            <div style={{ width: '100%', height: '340px', borderRadius: '16px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <img src={imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            {/* Thumbnail Preview strip */}
            {item.images && item.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', overflowX: 'auto' }}>
                {item.images.map((img, i) => (
                  <img key={i} src={img} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1', cursor: 'pointer' }} />
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Purchase Form */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span className="badge badge-indigo">{item.category || 'Product'}</span>
                <span className="badge badge-emerald">{item.condition ? item.condition.replace('_', ' ') : 'Good'}</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.6rem' }}>
                {item.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#4f46e5' }}>
                  LKR {item.price ? item.price.toLocaleString() : '0'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Eye size={15} color="#4f46e5" /> {item.views || 12} views
                </span>
              </div>

              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                {item.description || 'Verified item listed on Marketplace Module platform with real-time stock sync and price guarantee.'}
              </p>

              {/* Seller Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                    {item.sellerId?.name ? item.sellerId.name[0] : 'S'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {item.sellerId?.name || 'Verified Merchant'} <ShieldCheck size={16} color="#10b981" />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Stock: {item.stockQuantity} available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => { onAddToCart(item); onClose(); }} 
                className="btn-primary" 
                style={{ justifyContent: 'center', padding: '0.75rem', width: '100%' }}
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>

              <button 
                onClick={() => { onOpenChat(item); onClose(); }} 
                className="btn-secondary" 
                style={{ justifyContent: 'center', padding: '0.75rem', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <MessageSquare size={18} /> 💬 Ask Admin / Chat About This Item
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

