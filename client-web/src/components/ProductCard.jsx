import React from 'react';
import { ShoppingBag, Heart, MessageSquare, Star, MapPin, ShieldCheck, Zap } from 'lucide-react';

export default function ProductCard({ item, onSelect, onAddToCart, onOpenOffer, isFavorite, onToggleFavorite }) {
  const imageUrl = item.images && item.images.length > 0 
    ? item.images[0] 
    : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

  const isSoldOut = item.stockQuantity === 0 || item.status === 'sold';

  return (
    <div 
      onClick={() => onSelect(item)}
      className="glass-card" 
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      
      {/* Product Image Box */}
      <div style={{ position: 'relative', width: '100%', height: '220px', background: '#f1f5f9', overflow: 'hidden' }}>
        <img 
          src={imageUrl} 
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        
        {/* Category Badge */}
        <span className="badge badge-indigo" style={{ position: 'absolute', top: '12px', left: '12px', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {item.category || 'General'}
        </span>

        {/* Condition Badge */}
        <span className="badge badge-emerald" style={{ position: 'absolute', top: '12px', right: '48px', backdropFilter: 'blur(8px)' }}>
          {item.condition ? item.condition.replace('_', ' ') : 'Good'}
        </span>

        {/* Favorite Toggle Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(item._id || item.id); }}
          style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            background: 'rgba(255,255,255,0.9)', 
            border: 'none', 
            borderRadius: '50%', 
            width: '34px', 
            height: '34px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            transition: 'all 0.2s'
          }}
        >
          <Heart size={17} color={isFavorite ? '#ec4899' : '#64748b'} fill={isFavorite ? '#ec4899' : 'transparent'} />
        </button>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#ffffff', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', background: '#ef4444', padding: '0.45rem 1.2rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}>
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <MapPin size={13} color="#4f46e5" /> {item.location?.address || 'Colombo, LK'}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '800', background: '#fef3c7', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Star size={12} fill="#f59e0b" color="#f59e0b" /> 4.9 (12)
            </span>
          </div>

          <h3 
            style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0.4rem 0 0.6rem 0', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {item.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#047857', letterSpacing: '-0.02em' }}>
              LKR {item.price ? item.price.toLocaleString() : '0'}
            </span>
            {item.isNegotiable && (
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                <Zap size={10} /> Negotiable
              </span>
            )}
          </div>
        </div>

        {/* Stock & Quick Add Button */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: item.stockQuantity > 0 ? '#64748b' : '#ef4444', marginBottom: '0.75rem', fontWeight: '600' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className={item.stockQuantity > 0 ? "pulse-dot" : ""} style={{ background: item.stockQuantity > 0 ? '#10b981' : '#ef4444' }}></span>
              {item.stockQuantity > 0 ? `${item.stockQuantity} in stock` : 'Out of Stock'}
            </span>
            <span style={{ color: '#4f46e5', fontWeight: '700' }}>Official Merchant</span>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
            disabled={isSoldOut}
            className="btn-primary"
            style={{ width: '100%', padding: '0.65rem', fontSize: '0.88rem', justifyContent: 'center', borderRadius: '12px', opacity: isSoldOut ? 0.5 : 1 }}
          >
            <ShoppingBag size={15} /> Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
}
