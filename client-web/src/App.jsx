import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import ProductDetailPage from './components/ProductDetailPage';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import WishlistDrawer from './components/WishlistDrawer';
import OfferModal from './components/OfferModal';
import ChatModal from './components/ChatModal';
import OrdersTab from './components/OrdersTab';
import BusinessDirectoryTab from './components/BusinessDirectoryTab';
import ProfileTab from './components/ProfileTab';
import { io } from 'socket.io-client';
import { MessageSquare } from 'lucide-react';

export default function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // User Auth & JWT Token State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('marketplace_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('marketplace_token') || '';
  });

  const handleLogin = async (userData, userToken) => {
    setUser(userData);
    localStorage.setItem('marketplace_user', JSON.stringify(userData));
    if (userToken) {
      setToken(userToken);
      localStorage.setItem('marketplace_token', userToken);
    }

    // Merge Guest Local Cart with MongoDB Cart upon login ONLY if guest cart has items
    if (cart && cart.length > 0) {
      try {
        const res = await fetch('http://localhost:5000/api/cart/merge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(userToken || token ? { 'Authorization': `Bearer ${userToken || token}` } : {})
          },
          body: JSON.stringify({ userEmail: userData.email, localCart: cart })
        });
        const data = await res.json();
        if (data.success && data.cart) {
          const formatted = data.cart.map(item => {
            const matched = listings.find(l => String(l._id || l.id) === String(item.listingId));
            if (matched) return { ...matched, quantity: item.quantity };
            return {
              _id: item.listingId,
              id: item.listingId,
              title: item.itemTitle,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              images: [getCleanImage(item.image)]
            };
          });
          setCart(formatted);
        }
      } catch (err) {
        console.error('Error merging cart on login:', err);
      }
    } else {
      // Fetch user's actual cart from MongoDB if guest cart was empty
      try {
        const cartRes = await fetch(`http://localhost:5000/api/cart?email=${encodeURIComponent(userData.email)}`);
        const cartData = await cartRes.json();
        if (cartData.success && Array.isArray(cartData.cart)) {
          const formatted = cartData.cart.map(item => {
            const matched = listings.find(l => String(l._id || l.id) === String(item.listingId));
            if (matched) return { ...matched, quantity: item.quantity };
            return {
              _id: item.listingId,
              id: item.listingId,
              title: item.itemTitle,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              images: [getCleanImage(item.image)]
            };
          });
          setCart(formatted);
        } else {
          setCart([]);
        }
      } catch (e) {
        setCart([]);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setCart([]);
    setFavorites([]);
    localStorage.removeItem('marketplace_user');
    localStorage.removeItem('marketplace_token');
    localStorage.removeItem('marketplace_cart');
    localStorage.removeItem('marketplace_favs');
    localStorage.removeItem('marketplace_addresses');
    localStorage.removeItem('marketplace_bank_details');
  };

  // Modals & Drawers state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [itemForOffer, setItemForOffer] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [itemForChat, setItemForChat] = useState(null);

  const lastCartMutationRef = React.useRef(0);
  const lastFavMutationRef = React.useRef(0);

  // Helper to ensure valid image string
  const getCleanImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80';
    return img;
  };

  // Cart & Favorites state with localStorage persistence
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('marketplace_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('marketplace_favs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Save cart & favs to local storage safely
  useEffect(() => {
    try {
      localStorage.setItem('marketplace_cart', JSON.stringify(cart));
    } catch (err) {
      console.warn('Could not save cart to localStorage:', err.message);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('marketplace_favs', JSON.stringify(favorites));
    } catch (err) {
      console.warn('Could not save favs to localStorage:', err.message);
    }
  }, [favorites]);

  // Sync Cart to MongoDB whenever cart state changes for logged-in user
  const syncCartToDb = async (newCart, email) => {
    const userEmail = email || (user ? user.email : null);
    if (!userEmail) return;
    try {
      const items = newCart.map(item => ({
        listingId: String(item._id || item.id || item.listingId || Date.now()),
        itemTitle: item.title || item.itemTitle || 'Product Item',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: (item.images && item.images.length > 0 && item.images[0]) ? item.images[0] : (item.image || '')
      }));
      await fetch('http://localhost:5000/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userEmail, items })
      });
    } catch (err) {
      console.error('Error syncing cart to MongoDB:', err);
    }
  };

  // Real-time Socket.io & 2-second auto-poll for Wishlist & Cart from MongoDB for logged-in user
  useEffect(() => {
    if (!user || !user.email) return;
    const activeEmail = user.email;
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const formatCartItems = (cartItems) => {
      if (!Array.isArray(cartItems)) return [];
      return cartItems.map(item => {
        const matched = listings.find(l => String(l._id || l.id) === String(item.listingId));
        if (matched) {
          return { ...matched, quantity: item.quantity };
        }
        return {
          _id: item.listingId,
          id: item.listingId,
          title: item.itemTitle,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          images: [item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80']
        };
      });
    };

    // Socket.io Real-Time Listener
    let socket;
    try {
      socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
      socket.on('cart_updated', (data) => {
        if (data && data.userEmail && String(data.userEmail).trim().toLowerCase() === String(activeEmail).trim().toLowerCase()) {
          if (Date.now() - lastCartMutationRef.current >= 1500) {
            setCart(formatCartItems(data.cart || []));
          }
        }
      });
    } catch (e) {
      console.warn('Socket connection error:', e);
    }

    const fetchUserDbState = async () => {
      // 1. Fetch Wishlist
      if (Date.now() - lastFavMutationRef.current >= 3000) {
        try {
          const wishRes = await fetch(`http://localhost:5000/api/wishlist?email=${encodeURIComponent(activeEmail)}`, { headers });
          const wishData = await wishRes.json();
          if (wishData.success && wishData.favorites) {
            setFavorites(wishData.favorites);
          }
        } catch (e) {}
      }

      // 2. Fetch Cart
      if (Date.now() - lastCartMutationRef.current >= 2000) {
        try {
          const cartRes = await fetch(`http://localhost:5000/api/cart?email=${encodeURIComponent(activeEmail)}`, { headers });
          const cartData = await cartRes.json();
          if (cartData.success && Array.isArray(cartData.cart)) {
            setCart(formatCartItems(cartData.cart));
          }
        } catch (e) {}
      }
    };

    fetchUserDbState();
    const pollTimer = setInterval(fetchUserDbState, 2000);

    return () => {
      clearInterval(pollTimer);
      if (socket) socket.disconnect();
    };
  }, [user, token, listings]);

  // Fetch listings from Express/MongoDB Backend
  const fetchListings = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/listings';
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, searchQuery]);

  // Cart Handler methods with MongoDB Sync & Real Item Details
  const handleAddToCart = (product) => {
    if (!product) return;
    lastCartMutationRef.current = Date.now();
    const pId = String(product._id || product.id || product.listingId || Date.now());
    const pTitle = product.title || product.itemTitle || 'Marketplace Item';
    const pPrice = Number(product.price) || 0;
    const pImage = (product.images && product.images.length > 0 && product.images[0]) 
      ? product.images[0] 
      : (product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80');

    setCart((prev) => {
      const existing = prev.find(item => String(item._id || item.id) === pId);
      let updated;
      if (existing) {
        updated = prev.map(item => String(item._id || item.id) === pId ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        updated = [...prev, { 
          _id: pId, 
          id: pId, 
          listingId: pId, 
          title: pTitle, 
          price: pPrice, 
          quantity: 1, 
          images: [pImage], 
          image: pImage 
        }];
      }
      if (user && user.email) {
        syncCartToDb(updated, user.email);
      }
      return updated;
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id, newQty) => {
    lastCartMutationRef.current = Date.now();
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    const cleanId = String(id);
    setCart(prev => {
      const updated = prev.map(item => String(item._id || item.id || item.listingId) === cleanId ? { ...item, quantity: newQty } : item);
      if (user && user.email) {
        syncCartToDb(updated, user.email);
      }
      return updated;
    });
  };

  const removeFromCart = (id) => {
    lastCartMutationRef.current = Date.now();
    const cleanId = String(id);
    setCart(prev => {
      const updated = prev.filter(item => String(item._id || item.id || item.listingId) !== cleanId);
      if (user && user.email) {
        syncCartToDb(updated, user.email);
      }
      return updated;
    });
  };

  const clearCart = () => {
    lastCartMutationRef.current = Date.now();
    setCart([]);
    if (user && user.email) {
      fetch('http://localhost:5000/api/cart/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email })
      }).catch(err => console.error('Error clearing cart in DB:', err));
    }
  };

  const toggleFavorite = async (id) => {
    lastFavMutationRef.current = Date.now();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

    if (user && user.email) {
      try {
        const res = await fetch('http://localhost:5000/api/wishlist/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, listingId: id })
        });
        const data = await res.json();
        if (data.success && data.favorites) {
          setFavorites(data.favorites);
        }
      } catch (err) {
        console.error('Error toggling MongoDB wishlist:', err);
      }
    }
  };

  const openOfferModal = (product) => {
    setItemForOffer(product);
    setIsOfferModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      
      {/* Top Header Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        favoritesCount={favorites.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenChat={() => setIsChatModalOpen(true)}
        user={user}
      />

      {/* Main Tab Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'explore' && (
          <>
            <HeroBanner 
              totalListings={listings.length}
            />

            <div style={{ maxWidth: '1280px', margin: '0 auto 3rem auto', padding: '0 1.5rem' }}>
              
              {/* Category Pills Bar - Right above items list */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                {['All', 'Electronics', 'Fashion', 'Home & Living', 'Vehicles', 'Business Services'].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                    style={{ fontSize: '0.88rem', padding: '0.5rem 1.1rem', borderRadius: '12px', fontWeight: '700' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
                  {selectedCategory === 'All' ? '🔥 Featured Products & Listings' : `Category: ${selectedCategory}`}
                </h2>
                <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: '600' }}>
                  Showing {listings.length} items
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                  Connecting to Backend MongoDB API...
                </div>
              ) : listings.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <p style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '700' }}>No products found matching your search.</p>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>Try clearing your search query or selecting a different category.</p>
                </div>
              ) : (
                <div className="grid-responsive">
                  {listings.map((item) => (
                    <ProductCard 
                      key={item._id}
                      item={item}
                      onSelect={(p) => { setSelectedProduct(p); setActiveTab('product_detail'); }}
                      onAddToCart={handleAddToCart}
                      onOpenOffer={openOfferModal}
                      isFavorite={favorites.includes(item._id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'product_detail' && (
          <ProductDetailPage
            item={selectedProduct}
            user={user}
            onBack={() => setActiveTab('explore')}
            onAddToCart={handleAddToCart}
            onBuyNow={(item) => { handleAddToCart(item); setIsCheckoutOpen(true); }}
            onOpenOffer={openOfferModal}
            onOpenChat={(item) => { setItemForChat(item); setIsChatModalOpen(true); }}
            isFavorite={selectedProduct ? favorites.includes(selectedProduct._id) : false}
            onToggleFavorite={toggleFavorite}
            relatedProducts={
              (() => {
                const cat = (selectedProduct?.category || '').toLowerCase().trim();
                const currentId = String(selectedProduct?._id || selectedProduct?.id || '');
                const inSameCat = listings.filter(l => 
                  String(l._id || l.id) !== currentId && 
                  (l.category || '').toLowerCase().trim() === cat
                );
                return inSameCat.length > 0 
                  ? inSameCat 
                  : listings.filter(l => String(l._id || l.id) !== currentId);
              })()
            }
            onSelectRelated={(p) => { setSelectedProduct(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab 
            user={user} 
            onNavigateToProfile={() => setActiveTab('profile')} 
          />
        )}

        {activeTab === 'businesses' && <BusinessDirectoryTab />}

        {activeTab === 'profile' && (
          <ProfileTab 
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            ordersCount={0}
            favoritesCount={favorites.length}
            onNavigateToOrders={() => setActiveTab('orders')}
          />
        )}
      </main>

      {/* Modals & Overlays */}

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        updateQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        refreshListings={fetchListings}
        user={user}
        onOrderSuccess={() => setActiveTab('orders')}
      />

      <WishlistDrawer 
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        favorites={favorites}
        listings={listings}
        onToggleFavorite={toggleFavorite}
        onAddToCart={handleAddToCart}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <OfferModal 
        isOpen={isOfferModalOpen}
        item={itemForOffer}
        onClose={() => setIsOfferModalOpen(false)}
      />

      <ChatModal 
        isOpen={isChatModalOpen}
        onClose={() => { setIsChatModalOpen(false); setItemForChat(null); }}
        user={user}
        item={itemForChat}
        onOpenAuth={() => setActiveTab('profile')}
      />

      {/* Floating Live Support Chat Widget Launcher */}
      <button
        onClick={() => setIsChatModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '800',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        title="Open Live Support & Product Inquiry Chat"
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <MessageSquare size={20} color="#fff" />
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', border: '2px solid #fff' }} />
        </div>
        <span>Support Chat</span>
      </button>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '2rem 1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
        <p>© 2026 Marketplace Platform. Light Mode Client Web Hub.</p>
      </footer>
    </div>
  );
}

