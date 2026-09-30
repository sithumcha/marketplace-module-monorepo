import React, { useState } from 'react';
import { X, DollarSign, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function OfferModal({ item, isOpen, onClose, onOfferSubmitted }) {
  const [offerPrice, setOfferPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(offerPrice);
    if (!amount || amount <= 0) return alert('Please enter a valid price offer');

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: item._id,
          offeredAmount: amount,
          originalPrice: item.price
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`🎉 Offer of LKR ${amount.toLocaleString()} sent to seller! Real-time offer created.`);
        if (onOfferSubmitted) onOfferSubmitted(data.offer);
        onClose();
        setOfferPrice('');
      } else {
        alert('Failed to send offer: ' + data.message);
      }
    } catch (err) {
      alert('Error sending offer: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: 0 }}>Make a Price Offer</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem', display: 'flex', gap: '0.85rem' }}>
          <img 
            src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80'} 
            alt={item.title} 
            style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', margin: 0 }}>{item.title}</h4>
            <span style={{ fontSize: '0.88rem', color: '#38bdf8', fontWeight: '700' }}>Listed Price: LKR {item.price ? item.price.toLocaleString() : '0'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.5rem' }}>Your Offer Amount (LKR) *</label>
            <input 
              type="number"
              placeholder={`e.g. ${Math.round(item.price * 0.9)}`}
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              required
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}
            />
          </div>

          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.4 }}>
            💡 The seller will receive a notification and can choose to Accept, Reject, or Counter-Offer via real-time Socket.io chat.
          </p>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn-accent" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem' }}
          >
            <Send size={16} /> {isSubmitting ? 'Sending Offer...' : 'Send Offer to Seller'}
          </button>
        </form>

      </div>
    </div>
  );
}
