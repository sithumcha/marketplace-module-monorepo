import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, MapPin, CreditCard, LogOut, CheckCircle, Package, Heart, Star, Plus, Edit2, Lock, Trash2 } from 'lucide-react';

export default function ProfileTab({ user, onLogin, onLogout, ordersCount, favoritesCount, onNavigateToOrders }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('buyer');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  // Modals inside Profile
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  // Address state with localStorage & MongoDB persistence
  const [addresses, setAddresses] = useState(() => {
    try {
      if (user && user.savedAddresses && user.savedAddresses.length > 0) return user.savedAddresses;
      const saved = localStorage.getItem('marketplace_addresses');
      return saved ? JSON.parse(saved) : [
        { id: '1', label: 'Home Address (Default)', name: user ? user.name : 'Delivery Customer', address: 'No. 45, Galle Road, Colombo 03', phone: user ? (user.phone || '+94 77 123 4567') : '+94 77 123 4567' }
      ];
    } catch (e) {
      return [{ id: '1', label: 'Home Address (Default)', name: user ? user.name : 'Delivery Customer', address: 'No. 45, Galle Road, Colombo 03', phone: user ? (user.phone || '+94 77 123 4567') : '+94 77 123 4567' }];
    }
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Colombo');
  const [newAddrPhone, setNewAddrPhone] = useState('+94 77 123 4567');

  // Bank Payout state with localStorage & MongoDB persistence
  const [bankDetails, setBankDetails] = useState(() => {
    try {
      if (user && user.bankPayoutDetails && user.bankPayoutDetails.bankName) return user.bankPayoutDetails;
      const saved = localStorage.getItem('marketplace_bank_details');
      return saved ? JSON.parse(saved) : {
        bankName: 'Bank of Ceylon (BOC)',
        accountHolder: user ? user.name : 'Account Holder',
        accountNumber: '884920194821',
        branch: 'Colombo Main Branch',
        swiftCode: 'BCEYLKLX'
      };
    } catch (e) {
      return {
        bankName: 'Bank of Ceylon (BOC)',
        accountHolder: user ? user.name : 'Account Holder',
        accountNumber: '884920194821',
        branch: 'Colombo Main Branch',
        swiftCode: 'BCEYLKLX'
      };
    }
  });

  React.useEffect(() => {
    if (user) {
      if (user.savedAddresses && user.savedAddresses.length > 0) {
        setAddresses(user.savedAddresses);
      } else {
        setAddresses(prev => prev.map(a => ({ ...a, name: user.name, phone: user.phone || a.phone })));
      }
      if (user.bankPayoutDetails && user.bankPayoutDetails.bankName) {
        setBankDetails(user.bankPayoutDetails);
      } else {
        setBankDetails(prev => ({ ...prev, accountHolder: user.name }));
      }
    }
  }, [user]);

  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setNewAddrLabel('');
    setNewAddrLine('');
    setNewAddrCity('Colombo');
    setNewAddrPhone(user ? user.phone || '+94 77 123 4567' : '+94 77 123 4567');
    setShowAddressModal(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddressId(addr.id);
    setNewAddrLabel(addr.label || '');
    if (addr.address && addr.address.includes(',')) {
      const parts = addr.address.split(',');
      setNewAddrCity(parts.pop().trim());
      setNewAddrLine(parts.join(',').trim());
    } else {
      setNewAddrLine(addr.address || '');
      setNewAddrCity('Colombo');
    }
    setNewAddrPhone(addr.phone || '+94 77 123 4567');
    setShowAddressModal(true);
  };

  const handleAddOrUpdateAddress = async (e) => {
    e.preventDefault();
    if (!newAddrLine.trim()) return alert('Please enter street address line');

    let updated;
    if (editingAddressId) {
      updated = addresses.map((addr) => {
        if (addr.id === editingAddressId) {
          return {
            ...addr,
            label: newAddrLabel || 'Delivery Address',
            name: user ? user.name : addr.name || 'Customer',
            address: `${newAddrLine}, ${newAddrCity}`,
            phone: newAddrPhone
          };
        }
        return addr;
      });
    } else {
      const newAddr = {
        id: Date.now().toString(),
        label: newAddrLabel || 'New Delivery Address',
        name: user ? user.name : 'Customer',
        address: `${newAddrLine}, ${newAddrCity}`,
        phone: newAddrPhone
      };
      updated = [newAddr, ...addresses];
    }

    setAddresses(updated);
    localStorage.setItem('marketplace_addresses', JSON.stringify(updated));
    setNewAddrLine('');
    setShowAddressModal(false);
    const isEdit = !!editingAddressId;
    setEditingAddressId(null);

    if (user && user.email) {
      try {
        await fetch('http://localhost:5000/api/auth/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, addresses: updated })
        });
      } catch (err) {
        console.error('Error saving address to MongoDB:', err);
      }
    }
    alert(isEdit ? '📍 Delivery address updated successfully!' : '📍 New delivery address saved successfully!');
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery address?')) return;
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('marketplace_addresses', JSON.stringify(updated));

    if (user && user.email) {
      try {
        await fetch('http://localhost:5000/api/auth/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, addresses: updated })
        });
      } catch (err) {
        console.error('Error deleting address from MongoDB:', err);
      }
    }
  };

  const handleUpdateBank = async (e) => {
    e.preventDefault();
    localStorage.setItem('marketplace_bank_details', JSON.stringify(bankDetails));
    setShowBankModal(false);

    if (user && user.email) {
      try {
        await fetch('http://localhost:5000/api/auth/bank-payout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, bankPayoutDetails: bankDetails })
        });
      } catch (err) {
        console.error('Error saving bank payout to MongoDB:', err);
      }
    }
    alert('💳 Bank payout details saved successfully!');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user, data.token);
      } else {
        alert(data.message || 'Login failed. Please check your email and password.');
      }
    } catch (err) {
      alert('Unable to connect to authentication server. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regName || !regEmail) {
      setRegError('Please enter your full name and email address.');
      return;
    }
    if (!regPassword) {
      setRegError('Please enter a password for your account.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match! Please check again.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: regName, 
          email: regEmail, 
          phone: regPhone || '+94 77 123 4567', 
          password: regPassword, 
          role: regRole 
        })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user, data.token);
      } else {
        setRegError(data.message || 'Registration failed');
      }
    } catch (err) {
      onLogin({
        name: regName,
        email: regEmail,
        phone: regPhone || '+94 77 123 4567',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
        role: regRole === 'seller' ? 'Verified Store Seller' : (regRole === 'business_owner' ? 'Verified Business Owner' : 'Verified Buyer')
      }, 'jwt_fallback_token_123');
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <User size={30} color="#4f46e5" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
              {authMode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              {authMode === 'login' ? 'Sign in to access your orders, saved items, and profile.' : 'Register to start purchasing items on Marketplace Web.'}
            </p>
          </div>

          {/* Auth Switcher Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f1f5f9', padding: '0.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => setAuthMode('login')}
              style={{ padding: '0.55rem', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', background: authMode === 'login' ? '#ffffff' : 'transparent', color: authMode === 'login' ? '#4f46e5' : '#64748b', boxShadow: authMode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}
            >
              Sign In
            </button>
            <button 
              onClick={() => setAuthMode('register')}
              style={{ padding: '0.55rem', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', background: authMode === 'register' ? '#ffffff' : 'transparent', color: authMode === 'register' ? '#4f46e5' : '#64748b', boxShadow: authMode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}
            >
              Register
            </button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Email Address</label>
                <input 
                  type="email" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Password</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }} 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.8rem', marginTop: '0.5rem' }}>
                Sign In to Account
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {regError && (
                <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600' }}>
                  ⚠️ {regError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Full Name</label>
                <input type="text" placeholder="e.g. John Doe" value={regName} onChange={(e) => setRegName(e.target.value)} required style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Email Address</label>
                <input type="email" placeholder="e.g. user@marketplace.lk" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Phone Number</label>
                <input type="tel" placeholder="e.g. +94 77 123 4567" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Account Type & Role</label>
                <select 
                  value={regRole} 
                  onChange={(e) => setRegRole(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', background: '#ffffff', color: '#0f172a', fontWeight: '600' }}
                >
                  <option value="buyer">🛍️ Buyer / Shopper (Standard Account)</option>
                  <option value="seller">🏪 Verified Store Seller (Sell Products)</option>
                  <option value="business_owner">💼 Registered Business Owner (Business Directory)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Create Password</label>
                <input 
                  type="password" 
                  placeholder="Enter password (min. 6 characters)" 
                  value={regPassword} 
                  onChange={(e) => setRegPassword(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="Re-enter password" 
                  value={regConfirmPassword} 
                  onChange={(e) => setRegConfirmPassword(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }} 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.8rem', marginTop: '0.5rem' }}>
                Create Marketplace Account
              </button>
            </form>
          )}

        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '980px', margin: '2rem auto', padding: '0 1.5rem' }}>
      
      {/* Profile Header Card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img 
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'} 
            alt={user.name} 
            style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #4f46e5' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{user.name}</h2>
              <ShieldCheck size={20} color="#4f46e5" />
            </div>
            <span className="badge badge-indigo" style={{ marginBottom: '0.6rem', display: 'inline-block' }}>{user.role || 'Verified Pro Buyer'}</span>
            <div style={{ display: 'flex', gap: '1.2rem', color: '#64748b', fontSize: '0.88rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={14} /> {user.email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={14} /> {user.phone || '+94 77 123 4567'}</span>
            </div>
          </div>
        </div>

        <button onClick={onLogout} className="btn-secondary" style={{ color: '#ef4444', borderColor: '#fca5a5' }}>
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" onClick={onNavigateToOrders} style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} color="#4f46e5" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{ordersCount}</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>Orders Recorded</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={22} color="#f43f5e" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{favoritesCount}</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>Wishlist Saved</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={22} color="#f59e0b" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>4.9 ★</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>28 Store Reviews</span>
          </div>
        </div>
      </div>

      {/* Preferences & Details Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Saved Addresses Section */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#4f46e5" /> Saved Delivery Addresses
            </h3>
            <button onClick={handleOpenAddModal} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
              <Plus size={14} /> Add New
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {addresses.map((addr) => (
              <div key={addr.id} style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#4f46e5', display: 'block', marginBottom: '0.2rem' }}>{addr.label}</span>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{addr.name}</p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>{addr.address}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>{addr.phone}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button 
                    onClick={() => handleOpenEditModal(addr)} 
                    style={{ padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '700' }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(addr.id)} 
                    style={{ padding: '0.35rem 0.6rem', border: '1px solid #fca5a5', borderRadius: '6px', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '700' }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Payout Details Section */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="#10b981" /> Payment & Bank Payouts
            </h3>
            <button onClick={() => setShowBankModal(true)} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
              <Edit2 size={14} /> Edit
            </button>
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', display: 'block' }}>BANK NAME</span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{bankDetails.bankName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', display: 'block' }}>ACCOUNT HOLDER</span>
              <span style={{ fontSize: '0.88rem', color: '#334155', fontWeight: '600' }}>{bankDetails.accountHolder}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', display: 'block' }}>ACCOUNT NUMBER</span>
                <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '700' }}>{bankDetails.accountNumber}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', display: 'block' }}>BRANCH / SWIFT</span>
                <span style={{ fontSize: '0.82rem', color: '#475569' }}>{bankDetails.branch} ({bankDetails.swiftCode})</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add / Edit Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
              {editingAddressId ? 'Edit Delivery Address' : 'Add Delivery Address'}
            </h3>
            <form onSubmit={handleAddOrUpdateAddress} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <input type="text" placeholder="Address Label (e.g. Home / Work)" value={newAddrLabel} onChange={(e) => setNewAddrLabel(e.target.value)} required style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Street Address Line" value={newAddrLine} onChange={(e) => setNewAddrLine(e.target.value)} required style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="City / District" value={newAddrCity} onChange={(e) => setNewAddrCity(e.target.value)} required style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Phone Number" value={newAddrPhone} onChange={(e) => setNewAddrPhone(e.target.value)} required style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}>
                {editingAddressId ? 'Save Address Changes' : 'Save Delivery Address'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bank Details Modal */}
      {showBankModal && (
        <div className="modal-overlay" onClick={() => setShowBankModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>Edit Bank Payout Details</h3>
            <form onSubmit={handleUpdateBank} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <input type="text" placeholder="Bank Name" value={bankDetails.bankName} onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })} required style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Account Holder Name" value={bankDetails.accountHolder} onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })} required style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Account Number" value={bankDetails.accountNumber} onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} required style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Branch" value={bankDetails.branch} onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })} required style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="SWIFT Code" value={bankDetails.swiftCode} onChange={(e) => setBankDetails({ ...bankDetails, swiftCode: e.target.value })} required style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}>
                Save Payout Details
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
