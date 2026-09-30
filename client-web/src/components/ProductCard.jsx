import React from 'react';
import { ShoppingBag, Heart, MessageSquare, Star, MapPin } from 'lucide-react';

export default function ProductCard({ item, onSelect, onAddToCart, onOpenOffer, isFavorite, onToggleFavorite }) {
  const imageUrl = item.images && item.images.length > 0 
    ? item.images[0] 
    : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

  const isSoldOut = item.stockQuantity === 0 || item.status === 'sold';

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Product Image Box */}
      <div style={{ position: 'relative', width: '100%', height: '210px', background: '#f1f5f9', overflow: 'hidden' }}>
        <img 
          src={imageUrl} 
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        
        {/* Category Tag */}
        <span className="badge badge-indigo" style={{ position: 'absolute', top: '12px', left: '12px' }}>
          {item.category || 'General'}
        </span>

        {/* Condition Tag */}
        <span className="badge badge-emerald" style={{ position: 'absolute', top: '12px', right: '48px' }}>
          {item.condition ? item.condition.replace('_', ' ') : 'Good'}
        </span>

        {/* Favorite Toggle Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(item._id); }}
          style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            background: 'rgba(255,255,255,0.85)', 
            border: 'none', 
            borderRadius: '50%', 
            width: '32px', 
            height: '32px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Heart size={16} color={isFavorite ? '#ec4899' : '#64748b'} fill={isFavorite ? '#ec4899' : 'transparent'} />
        </button>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#ffffff', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', background: '#ef4444', padding: '0.4rem 1rem', borderRadius: '8px' }}>
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <MapPin size={13} color="#4f46e5" /> {item.location?.address || 'Colombo, LK'}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Star size={13} fill="#f59e0b" color="#f59e0b" /> 4.9
            </span>
          </div>

          <h3 
            onClick={() => onSelect(item)}
            style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0.3rem 0 0.6rem 0', cursor: 'pointer', lineHeight: 1.35 }}
          >
            {item.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#047857' }}>
              LKR {item.price ? item.price.toLocaleString() : '0'}
            </span>
            {item.isNegotiable && (
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                Negotiable
              </span>
            )}
          </div>
        </div>

        {/* Stock & Quick Action Buttons */}
        <div>
          <div style={{ fontSize: '0.78rem', color: item.stockQuantity > 0 ? '#64748b' : '#ef4444', marginBottom: '0.8rem', fontWeight: '600' }}>
            {item.stockQuantity > 0 ? `${item.stockQuantity} units in stock` : 'Out of Stock'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button 
              onClick={() => onAddToCart(item)}
              disabled={isSoldOut}
              className="btn-primary"
              style={{ padding: '0.55rem', fontSize: '0.82rem', justifyContent: 'center', opacity: isSoldOut ? 0.5 : 1 }}
            >
              <ShoppingBag size={14} /> Add Cart
            </button>

            <button 
              onClick={() => onOpenOffer(item)}
              disabled={isSoldOut}
              className="btn-secondary"
              style={{ padding: '0.55rem', fontSize: '0.82rem', justifyContent: 'center' }}
            >
              <MessageSquare size={14} color="#ec4899" /> Offer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
