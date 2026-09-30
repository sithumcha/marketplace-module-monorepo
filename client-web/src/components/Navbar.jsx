import React from 'react';
import { ShoppingBag, Search, Store, User, Package, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  cartCount, 
  onOpenCart, 
  favoritesCount = 0,
  onOpenWishlist,
  searchQuery, 
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenChat,
  user
}) {
  const categories = ['All', 'Electronics', 'Fashion', 'Home & Living', 'Vehicles', 'Business Services'];

  return (
    <header className="glass-nav">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
        
        {/* Brand Logo - Matching Mobile App Design */}
        <div 
          onClick={() => setActiveTab('explore')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '14px', 
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #8B5CF6 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
          }}>
            <ShoppingBag size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <h1 style={{ 
                fontFamily: "'Plus Jakarta Sans', sans-serif", 
                fontSize: '1.25rem', 
                fontWeight: '900', 
                color: '#0F172A', 
                margin: 0, 
                lineHeight: 1.1,
                letterSpacing: '0.8px'
              }}>
                MARKETPLACE
              </h1>
              <span style={{ 
                background: 'linear-gradient(135deg, #10B981 0%, #0D9488 100%)', 
                color: '#ffffff', 
                fontSize: '9px', 
                fontWeight: '900', 
                padding: '2px 6px', 
                borderRadius: '5px',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
              }}>
                PRO
              </span>
            </div>
            <span style={{ 
              fontFamily: "'Plus Jakarta Sans', sans-serif", 
              fontSize: '10px', 
              color: '#64748B', 
              fontWeight: '500', 
              display: 'block', 
              marginTop: '1px' 
            }}>
              Discover & Buy Premium Products
            </span>
          </div>
        </div>

        {/* Search Bar & Category Filter */}
        <div style={{ flex: 1, maxWidth: '500px', position: 'relative', display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0.35rem 0.85rem' }}>
          <Search size={18} color="#64748b" style={{ marginRight: '0.6rem' }} />
          <input 
            type="text" 
            placeholder="Search items, categories, brands..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: 'none', 
              color: '#0f172a', 
              outline: 'none', 
              fontSize: '0.92rem',
              fontWeight: '500'
            }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          {/* Navigation Links */}
          <button 
            onClick={() => setActiveTab('explore')}
            className={activeTab === 'explore' ? 'category-pill active' : 'category-pill'}
          >
            <Store size={16} /> Explore
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={activeTab === 'orders' ? 'category-pill active' : 'category-pill'}
          >
            <Package size={16} /> Orders
          </button>

          <button 
            onClick={() => setActiveTab('businesses')}
            className={activeTab === 'businesses' ? 'category-pill active' : 'category-pill'}
          >
            <ShieldCheck size={16} /> Directory
          </button>

          {/* Profile Tab */}
          <button 
            onClick={() => setActiveTab('profile')}
            className={activeTab === 'profile' ? 'category-pill active' : 'category-pill'}
          >
            <User size={16} /> {user ? user.name.split(' ')[0] : 'Profile'}
          </button>

          {/* Chat Button */}
          <button 
            onClick={onOpenChat}
            style={{ 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              color: '#334155', 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
            title="Real-time Chat"
          >
            <MessageSquare size={18} color="#4f46e5" />
          </button>

          {/* Wishlist Button */}
          <button 
            onClick={onOpenWishlist}
            style={{ 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              color: '#0f172a', 
              padding: '0.5rem 0.85rem', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
            title="Wishlist"
          >
            <Heart size={18} color="#ec4899" fill={favoritesCount > 0 ? "#ec4899" : "transparent"} />
            <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>Wishlist</span>
            {favoritesCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-6px', 
                right: '-6px', 
                background: '#ec4899', 
                color: '#ffffff', 
                borderRadius: '50%', 
                width: '20px', 
                height: '20px', 
                fontSize: '0.75rem', 
                fontWeight: '800', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(236,72,153,0.4)'
              }}>
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Button */}
          <button 
            onClick={onOpenCart}
            style={{ 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              color: '#0f172a', 
              padding: '0.5rem 0.85rem', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <ShoppingBag size={18} color="#4f46e5" />
            <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>Cart</span>
            {cartCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-6px', 
                right: '-6px', 
                background: '#ec4899', 
                color: '#ffffff', 
                borderRadius: '50%', 
                width: '20px', 
                height: '20px', 
                fontSize: '0.75rem', 
                fontWeight: '800', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(236,72,153,0.4)'
              }}>
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
}
