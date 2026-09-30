import React from 'react';
import { X, Trash2, ShoppingBag, Heart, ExternalLink } from 'lucide-react';

export default function WishlistDrawer({ 
  isOpen, 
  onClose, 
  favorites, 
  listings, 
  onToggleFavorite, 
  onAddToCart, 
  onSelectProduct 
}) {
  if (!isOpen) return null;

  // Resolve full listing objects for favorite IDs
  const favoriteItems = (favorites || [])
    .map(id => listings.find(l => String(l._id || l.id) === String(id)))
    .filter(Boolean);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Backdrop click to close */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        background: '#ffffff',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10000,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#fce7f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Heart size={20} color="#ec4899" fill="#ec4899" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>My Wishlist</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{favoriteItems.length} saved items</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {favoriteItems.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '1rem',
              color: '#94a3b8'
            }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: '#fce7f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Heart size={36} color="#ec4899" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.3rem 0' }}>Your Wishlist is Empty</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Tap the heart icon on any product to save it for later.</p>
              </div>
              <button 
                onClick={onClose}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {favoriteItems.map((item) => {
                const itemId = String(item._id || item.id);
                const itemImg = (item.images && item.images.length > 0 && item.images[0]) 
                  ? item.images[0] 
                  : (item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80');

                return (
                  <div 
                    key={itemId}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '0.9rem',
                      background: '#f8fafc',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img 
                      src={itemImg} 
                      alt={item.title}
                      style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        background: '#ffffff'
                      }}
                      onClick={() => { if (onSelectProduct) { onSelectProduct(item); onClose(); } }}
                    />
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div>
                          <span style={{ 
                            fontSize: '0.68rem', 
                            fontWeight: '700', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.5px',
                            color: '#6366f1',
                            background: '#e0e7ff',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginBottom: '0.3rem'
                          }}>
                            {item.category || 'Item'}
                          </span>
                          <h4 
                            onClick={() => { if (onSelectProduct) { onSelectProduct(item); onClose(); } }}
                            style={{ 
                              fontSize: '0.92rem', 
                              fontWeight: '700', 
                              color: '#0f172a', 
                              margin: 0, 
                              lineHeight: 1.3,
                              cursor: 'pointer'
                            }}
                          >
                            {item.title}
                          </h4>
                        </div>

                        <button 
                          onClick={() => onToggleFavorite(itemId)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.2rem'
                          }}
                          title="Remove from Wishlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a' }}>
                          LKR {Number(item.price || 0).toLocaleString()}
                        </span>

                        <button 
                          onClick={() => {
                            if (onAddToCart) onAddToCart(item);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem 0.8rem',
                            borderRadius: '8px',
                            background: '#4f46e5',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(79,70,229,0.2)'
                          }}
                        >
                          <ShoppingBag size={13} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
