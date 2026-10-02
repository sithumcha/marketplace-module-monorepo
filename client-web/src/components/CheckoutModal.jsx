import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Banknote, 
  Wallet, 
  Zap, 
  CheckCircle2, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Cpu, 
  Lock,
  User,
  MapPin,
  Phone,
  Mail,
  Tag,
  FileText,
  Download
} from 'lucide-react';
import { downloadOrderInvoice } from '../utils/invoiceGenerator';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cart = [], 
  updateQuantity,
  removeFromCart,
  clearCart, 
  refreshListings, 
  user, 
  onOrderSuccess 
}) {
  const [buyerName, setBuyerName] = useState(user ? user.name : '');
  const [buyerEmail, setBuyerEmail] = useState(user ? user.email : '');
  const [buyerPhone, setBuyerPhone] = useState(user ? (user.phone || '') : '');
  const [shippingAddress, setShippingAddress] = useState('No. 45, Galle Road, Colombo 03');
  
  // Shipping Method selection ('standard' | 'express')
  const [shippingOption, setShippingOption] = useState('standard');
  
  // Payment Method selection ('CARD' | 'CASH_ON_DELIVERY' | 'WALLET')
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  
  // Card details state
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('892');
  const [cardHolder, setCardHolder] = useState(user ? user.name.toUpperCase() : 'CARD HOLDER');
  const [saveCard, setSaveCard] = useState(true);

  // Promo Code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      setBuyerName(user.name);
      setBuyerEmail(user.email);
    }
  }, [user]);

  if (!isOpen) return null;

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = cart.length === 0 ? 0 : (shippingOption === 'express' ? 1500 : 500);
  const discountAmount = appliedPromo ? appliedPromo.amount : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const cleanCode = promoInput.trim().toUpperCase();
    if (['SAVE10', 'PROMO10', 'MARKETPLACE', 'PROMO2026'].includes(cleanCode)) {
      const disc = Math.min(subtotal, 500);
      setAppliedPromo({ code: cleanCode, amount: disc });
      setPromoMessage({ type: 'success', text: `🎉 Promo Code ${cleanCode} Applied! Saved LKR ${disc.toLocaleString()}` });
    } else {
      setPromoMessage({ type: 'error', text: '❌ Invalid Promo Code. Try SAVE10' });
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    try {
      const createdOrders = [];
      const orderGroupId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      for (const item of cart) {
        const res = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderGroupId,
            listingId: item._id || item.id || item.listingId,
            itemTitle: item.title || item.itemTitle,
            price: item.price,
            quantity: item.quantity,
            image: (item.images && item.images.length > 0 ? item.images[0] : item.image) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
            status: 'Processing',
            buyerName,
            buyerEmail,
            buyerPhone,
            shippingAddress,
            shippingMethod: shippingOption === 'express' ? 'Express Courier (1-2 Days)' : 'Standard Delivery (3-5 Days)',
            paymentMethod,
            totalPaid: item.price * item.quantity
          })
        });
        const data = await res.json();
        if (data.success) {
          createdOrders.push(data.order);
        }
      }

      setCompletedOrder({
        orderId: orderGroupId,
        total: grandTotal,
        itemCount: cart.length,
        items: cart.map(i => ({ title: i.title || i.itemTitle, price: i.price, quantity: i.quantity })),
        buyerName,
        buyerEmail,
        buyerPhone,
        shippingAddress,
        shippingMethod: shippingOption === 'express' ? 'Express Courier (1-2 Days)' : 'Standard Delivery (3-5 Days)',
        paymentMethod: paymentMethod === 'CARD' ? 'Credit/Debit Card' : (paymentMethod === 'WALLET' ? 'Marketplace Wallet' : 'Cash on Delivery'),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      if (clearCart) clearCart();
      if (refreshListings) refreshListings();
      if (onOrderSuccess) onOrderSuccess();
    } catch (err) {
      alert('Checkout Failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '860px', 
          width: '95%', 
          maxHeight: '92vh',
          background: '#ffffff', 
          borderRadius: '24px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '0.6rem', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}>
              <ShieldCheck color="#fff" size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Checkout & Fast Delivery</h3>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '500' }}>Review your items, shipping speed & payment options</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#e2e8f0', border: 'none', color: '#475569', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {completedOrder ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)' }}>
                <CheckCircle2 size={52} />
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Order Confirmed! 🎉</h3>
              <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.75rem' }}>
                Order ID: <strong style={{ color: '#4f46e5', fontWeight: '800' }}>#{completedOrder.orderId}</strong> • Total Paid: <strong style={{ color: '#047857' }}>LKR {completedOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </p>
              
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', maxWidth: '460px', margin: '0 auto 2rem auto', textAlign: 'left', fontSize: '0.9rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Shipping Address:</span>
                  <strong style={{ color: '#0f172a' }}>{shippingAddress}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Delivery Speed:</span>
                  <strong style={{ color: '#4f46e5' }}>{completedOrder.shippingMethod}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Method:</span>
                  <strong style={{ color: '#059669' }}>{completedOrder.paymentMethod}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => downloadOrderInvoice(completedOrder)} 
                  className="btn-secondary" 
                  style={{ padding: '0.9rem 1.8rem', fontSize: '0.95rem', borderRadius: '12px', border: '2px solid #4f46e5', color: '#4f46e5', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <FileText size={18} /> Download Bill / Invoice
                </button>
                <button onClick={() => { setCompletedOrder(null); onClose(); }} className="btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '0.95rem', borderRadius: '12px' }}>
                  Done & Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
              
              {/* Left Side: Input Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                
                {/* 1. Delivery & Customer Address Section */}
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <MapPin size={18} color="#4f46e5" /> 1. Shipping Address & Contact
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                          type="text" 
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          required
                          style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.65rem 0.85rem 0.65rem 2.2rem', borderRadius: '10px', color: '#0f172a', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Phone Number</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                          type="text" 
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                          required
                          style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.65rem 0.85rem 0.65rem 2.2rem', borderRadius: '10px', color: '#0f172a', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                          type="email" 
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          required
                          style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.65rem 0.85rem 0.65rem 2.2rem', borderRadius: '10px', color: '#0f172a', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Delivery Address</label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                          type="text" 
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          required
                          style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.65rem 0.85rem 0.65rem 2.2rem', borderRadius: '10px', color: '#0f172a', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Delivery Speed / Shipping Method Section */}
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Truck size={18} color="#4f46e5" /> 2. Delivery Speed & Courier Options
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    {/* Standard Delivery Card */}
                    <div 
                      onClick={() => setShippingOption('standard')}
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        border: shippingOption === 'standard' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        background: shippingOption === 'standard' ? '#eef2ff' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ background: shippingOption === 'standard' ? '#4f46e5' : '#cbd5e1', padding: '0.5rem', borderRadius: '10px', color: '#fff' }}>
                        <Truck size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>Standard Delivery</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>3-5 Days • LKR 500</div>
                      </div>
                    </div>

                    {/* Express Courier Card */}
                    <div 
                      onClick={() => setShippingOption('express')}
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        border: shippingOption === 'express' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        background: shippingOption === 'express' ? '#eef2ff' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ background: shippingOption === 'express' ? '#4f46e5' : '#cbd5e1', padding: '0.5rem', borderRadius: '10px', color: '#fff' }}>
                        <Zap size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>Express Courier</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>1-2 Days • LKR 1,500</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method Section */}
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <CreditCard size={18} color="#4f46e5" /> 3. Payment Method
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      style={{ 
                        padding: '0.75rem 0.5rem', 
                        borderRadius: '12px', 
                        border: paymentMethod === 'CARD' ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                        background: paymentMethod === 'CARD' ? '#eef2ff' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        color: paymentMethod === 'CARD' ? '#4f46e5' : '#475569'
                      }}
                    >
                      <CreditCard size={20} /> Card Payment
                    </button>

                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                      style={{ 
                        padding: '0.75rem 0.5rem', 
                        borderRadius: '12px', 
                        border: paymentMethod === 'CASH_ON_DELIVERY' ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                        background: paymentMethod === 'CASH_ON_DELIVERY' ? '#eef2ff' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        color: paymentMethod === 'CASH_ON_DELIVERY' ? '#4f46e5' : '#475569'
                      }}
                    >
                      <Banknote size={20} /> Cash on Delivery
                    </button>

                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('WALLET')}
                      style={{ 
                        padding: '0.75rem 0.5rem', 
                        borderRadius: '12px', 
                        border: paymentMethod === 'WALLET' ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                        background: paymentMethod === 'WALLET' ? '#eef2ff' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        color: paymentMethod === 'WALLET' ? '#4f46e5' : '#475569'
                      }}
                    >
                      <Wallet size={20} /> Wallet Balance
                    </button>
                  </div>

                  {/* Interactive Visual Credit Card Graphic Form */}
                  {paymentMethod === 'CARD' && (
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      
                      {/* Visual Card Banner */}
                      <div style={{ 
                        background: 'linear-gradient(135deg, #3730a3, #4f46e5, #7c3aed)', 
                        padding: '1.25rem', 
                        borderRadius: '14px', 
                        color: '#ffffff', 
                        boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        height: '150px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Cpu color="#fbbf24" size={28} />
                          <span style={{ fontSize: '1.1rem', fontWeight: '900', fontStyle: 'italic', letterSpacing: '1px' }}>VISA</span>
                        </div>

                        <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: '800', letterSpacing: '2px' }}>
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <div>
                            <div style={{ opacity: 0.7, fontSize: '0.65rem', fontWeight: '700' }}>CARD HOLDER</div>
                            <div style={{ fontWeight: '800', textTransform: 'uppercase' }}>{cardHolder || 'SITHUM NETHSARA'}</div>
                          </div>
                          <div>
                            <div style={{ opacity: 0.7, fontSize: '0.65rem', fontWeight: '700' }}>EXPIRES</div>
                            <div style={{ fontWeight: '800' }}>{cardExpiry || '12/28'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Card Input Fields */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>Card Number</label>
                          <input 
                            type="text" 
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.88rem', color: '#0f172a' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>Expiry Date</label>
                            <input 
                              type="text" 
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.88rem', color: '#0f172a' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>CVV / CVC</label>
                            <input 
                              type="password" 
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.88rem', color: '#0f172a' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>Cardholder Name</label>
                          <input 
                            type="text" 
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.88rem', color: '#0f172a' }}
                          />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', cursor: 'pointer', marginTop: '0.25rem' }}>
                          <input 
                            type="checkbox" 
                            checked={saveCard} 
                            onChange={(e) => setSaveCard(e.target.checked)} 
                            style={{ accentColor: '#4f46e5' }}
                          />
                          Save card securely for future fast checkout
                        </label>
                      </div>

                    </div>
                  )}

                  {paymentMethod === 'WALLET' && (
                    <div style={{ background: '#ecfdf5', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.88rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Wallet size={24} color="#059669" />
                      <div>
                        <div>Available Wallet Balance: <strong>LKR 375,000.00</strong></div>
                        <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '500' }}>Instant 1-click checkout from your marketplace account balance.</div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Side: Order Items, Promo Code & Payment Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content', position: 'sticky', top: 0 }}>
                
                {/* Order Items Preview */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShoppingBag size={18} color="#4f46e5" /> Order Items ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                    {cart.map((item) => (
                      <div key={item._id || item.id} style={{ display: 'flex', gap: '0.75rem', background: '#ffffff', padding: '0.65rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <img 
                          src={(item.images && item.images[0]) || item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100'} 
                          alt={item.title}
                          style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#4f46e5' }}>LKR {(item.price * item.quantity).toLocaleString()}</span>
                            
                            {updateQuantity && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                                <button type="button" onClick={() => updateQuantity(item._id || item.id || item.listingId, item.quantity - 1)} style={{ background: 'transparent', border: 'none', color: '#0f172a', cursor: 'pointer', padding: 0 }}><Minus size={11} /></button>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', minWidth: '12px', textAlign: 'center' }}>{item.quantity}</span>
                                <button type="button" onClick={() => updateQuantity(item._id || item.id || item.listingId, item.quantity + 1)} style={{ background: 'transparent', border: 'none', color: '#0f172a', cursor: 'pointer', padding: 0 }}><Plus size={11} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code Input Box */}
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Tag size={16} color="#4f46e5" /> Enter Promo / Voucher Code
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. SAVE10"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      style={{ flex: 1, background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', textTransform: 'uppercase', fontWeight: '700' }}
                    />
                    <button 
                      type="button" 
                      onClick={handleApplyPromo}
                      style={{ background: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <div style={{ fontSize: '0.78rem', marginTop: '0.4rem', color: promoMessage.type === 'success' ? '#059669' : '#dc2626', fontWeight: '700' }}>
                      {promoMessage.text}
                    </div>
                  )}
                </div>

                {/* Unified Payment Summary Box */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={18} color="#4f46e5" /> Payment Summary
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Item Price ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>LKR {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Shipping Fee</span>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>LKR {shippingFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '700' }}>
                      <span>Promo Discount</span>
                      <span>-LKR {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>Grand Total</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#047857' }}>LKR {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || cart.length === 0}
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem', fontWeight: '800', borderRadius: '12px', marginTop: '0.5rem', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Lock size={18} /> {isSubmitting ? 'Processing Order...' : `Confirm & Pay LKR ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </button>
                </div>

              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
