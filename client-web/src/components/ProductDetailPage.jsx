import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, MessageSquare, Heart, ShieldCheck, Eye, Star, MapPin, Truck, Award, Lock, Tag, Share2 } from 'lucide-react';
import ProductCard from './ProductCard';
import ReviewsSection from './ReviewsSection';

export default function ProductDetailPage({ 
  item, 
  user,
  onBack, 
  onAddToCart, 
  onBuyNow,
  onOpenOffer, 
  onOpenChat, 
  isFavorite, 
  onToggleFavorite,
  relatedProducts = [],
  onSelectRelated
}) {
  if (!item) {
    return (
      <div style={{ maxWidth: '1280px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <h2>No Product Selected</h2>
        <button onClick={onBack} className="btn-primary" style={{ marginTop: '1rem' }}>
          ← Back to Explore Products
        </button>
      </div>
    );
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const imagesList = item.images && item.images.length > 0 
    ? item.images 
    : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'];

  const currentMainImage = imagesList[activeImageIndex] || imagesList[0];
  const isSoldOut = item.stockQuantity === 0 || item.status === 'sold';

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '2rem 1.5rem 4rem 1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Navigation Breadcrumb Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button 
            onClick={onBack}
            style={{ 
              background: '#ffffff', 
              border: '1px solid #cbd5e1', 
              borderRadius: '12px', 
              padding: '8px 18px', 
              color: '#1e293b', 
              fontSize: '0.9rem', 
              fontWeight: '700', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
          >
            <ArrowLeft size={18} /> Back to Products
          </button>

          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
            <span onClick={onBack} style={{ cursor: 'pointer' }}>Explore</span> &gt; <span style={{ color: '#4f46e5' }}>{item.category || 'General'}</span> &gt; <span style={{ color: '#0f172a', fontWeight: '700' }}>{item.title}</span>
          </div>
        </div>

        {/* Full Page 2-Column Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2.5rem', marginBottom: '3.5rem' }}>
          
          {/* Left Column: Image Gallery & Seller Profile Card */}
          <div>
            
            {/* Hero Main Image Viewer */}
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              height: '460px', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              background: '#ffffff', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px -5px rgba(0,0,0,0.06)'
            }}>
              <img 
                src={currentMainImage} 
                alt={item.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />

              {/* Category Badge Overlay */}
              <span className="badge badge-indigo" style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '0.82rem', padding: '6px 14px' }}>
                {item.category || 'General'}
              </span>

              {/* Condition Badge Overlay */}
              <span className="badge badge-emerald" style={{ position: 'absolute', top: '16px', right: '64px', fontSize: '0.82rem', padding: '6px 14px' }}>
                {item.condition ? item.condition.replace('_', ' ') : 'Brand New'}
              </span>

              {/* Wishlist Button */}
              <button 
                onClick={() => onToggleFavorite(item._id)}
                style={{ 
                  position: 'absolute', 
                  top: '14px', 
                  right: '14px', 
                  background: 'rgba(255,255,255,0.9)', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '38px', 
                  height: '38px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                }}
              >
                <Heart size={18} color={isFavorite ? '#ec4899' : '#64748b'} fill={isFavorite ? '#ec4899' : 'transparent'} />
              </button>

              {isSoldOut && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#ffffff', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', background: '#ef4444', padding: '0.6rem 1.6rem', borderRadius: '10px', fontSize: '1.2rem' }}>
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery Strip */}
            {imagesList.length > 1 && (
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', overflowX: 'auto' }}>
                {imagesList.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{ 
                      width: '76px', 
                      height: '76px', 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      border: activeImageIndex === idx ? '3px solid #4f46e5' : '1px solid #cbd5e1', 
                      cursor: 'pointer',
                      opacity: activeImageIndex === idx ? 1 : 0.7,
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Verified Merchant & Store Guarantee Card */}
            <div style={{ 
              marginTop: '1.5rem', 
              background: '#ffffff', 
              padding: '1.25rem', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
                    color: '#ffffff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: '900',
                    fontSize: '1.1rem'
                  }}>
                    {item.sellerId?.name ? item.sellerId.name[0] : 'S'}
                  </div>
                  <div>
                    <h5 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {item.sellerId?.name || 'Official Verified Merchant'} <ShieldCheck size={17} color="#10b981" />
                    </h5>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Store Badge: Official Marketplace Seller</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#10b981' }}>99.4% Positive</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified Merchant</div>
                </div>
              </div>

              {/* Trust Badges Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569', fontWeight: '600' }}>
                  <Lock size={15} color="#4f46e5" /> Secure Checkout
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569', fontWeight: '600' }}>
                  <Truck size={15} color="#10b981" /> Express Shipping
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569', fontWeight: '600' }}>
                  <Award size={15} color="#f59e0b" /> Quality Guarantee
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Title, Pricing, Specs & Purchase Form */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              
              {/* Category & Rating */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                  <MapPin size={15} color="#4f46e5" /> {item.locationAddress || 'Colombo, Sri Lanka'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.88rem', color: '#d97706', fontWeight: '800', background: '#fef3c7', padding: '4px 10px', borderRadius: '8px' }}>
                  <Star size={15} fill="#f59e0b" color="#f59e0b" /> 4.9 (24 Reviews)
                </div>
              </div>

              {/* Title */}
              <h1 style={{ fontSize: '2.1rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem', lineHeight: 1.25, letterSpacing: '-0.5px' }}>
                {item.title}
              </h1>

              {/* Price Banner Box */}
              <div style={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)', 
                padding: '1.25rem 1.5rem', 
                borderRadius: '16px', 
                border: '1px solid #e2e8f0', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Listing Price:
                  </span>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#047857', marginTop: '2px' }}>
                    LKR {item.price ? item.price.toLocaleString() : '0'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {item.isNegotiable && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.82rem', padding: '6px 12px', marginBottom: '4px' }}>
                      Price Negotiable
                    </span>
                  )}
                  <div style={{ fontSize: '0.82rem', color: item.stockQuantity > 0 ? '#10b981' : '#ef4444', fontWeight: '800', marginTop: '4px' }}>
                    {item.stockQuantity > 0 ? `● In Stock (${item.stockQuantity} available)` : '❌ Out of Stock'}
                  </div>
                </div>
              </div>

              {/* Description Box */}
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.6rem 0' }}>
                  Product Details & Features:
                </h4>
                <p style={{ color: '#334155', fontSize: '0.94rem', lineHeight: 1.65, margin: 0 }}>
                  {item.description || 'Verified item listed on Marketplace Module platform with real-time stock sync and price guarantee.'}
                </p>
              </div>

            </div>

            {/* Action Buttons Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              {/* Action Buttons: Buy Now & Add to Cart */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <button 
                  onClick={() => onBuyNow ? onBuyNow(item) : onAddToCart(item)}
                  disabled={isSoldOut}
                  style={{ 
                    width: '100%',
                    justifyContent: 'center', 
                    padding: '1rem', 
                    fontSize: '1.05rem', 
                    fontWeight: '800',
                    borderRadius: '14px',
                    border: 'none',
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
                    cursor: isSoldOut ? 'not-allowed' : 'pointer',
                    opacity: isSoldOut ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  ⚡ Buy Now - LKR {item.price ? item.price.toLocaleString() : '0'}
                </button>

                <button 
                  onClick={() => onAddToCart(item)}
                  disabled={isSoldOut}
                  className="btn-primary"
                  style={{ 
                    justifyContent: 'center', 
                    padding: '0.85rem', 
                    fontSize: '0.95rem', 
                    fontWeight: '700',
                    borderRadius: '14px',
                    opacity: isSoldOut ? 0.5 : 1
                  }}
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>
              </div>

              <button 
                onClick={() => onOpenChat(item)}
                style={{ 
                  width: '100%',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '14px', 
                  padding: '0.85rem', 
                  fontWeight: '800', 
                  fontSize: '0.92rem', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                }}
              >
                <MessageSquare size={18} /> 💬 Ask Admin / Chat
              </button>

            </div>

          </div>

        </div>

        {/* Customer Reviews & Star Rating System Section */}
        <ReviewsSection listingId={item._id || item.id} user={user} />

        {/* Related Products Showcase Section */}
        {relatedProducts.length > 0 && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem', marginTop: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  More Products in {item.category || 'This Category'}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Explore other items available in the same category
                </p>
              </div>
              <span style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: '700', padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.82rem' }}>
                📁 {item.category || 'Category'}
              </span>
            </div>
            <div className="grid-responsive">
              {relatedProducts.slice(0, 8).map((relItem) => (
                <ProductCard 
                  key={relItem._id || relItem.id}
                  item={relItem}
                  onSelect={onSelectRelated}
                  onAddToCart={onAddToCart}
                  isFavorite={false}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
