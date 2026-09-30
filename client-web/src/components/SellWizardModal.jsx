import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Upload, CheckCircle2, Tag, DollarSign, Package, MapPin } from 'lucide-react';

export default function SellWizardModal({ isOpen, onClose, onListingCreated }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    condition: 'like_new',
    price: '',
    stockQuantity: '1',
    description: '',
    address: 'Colombo, Sri Lanka',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
    isNegotiable: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = ['Electronics', 'Fashion', 'Home & Living', 'Vehicles', 'Groceries', 'Business Services'];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          condition: formData.condition,
          price: Number(formData.price) || 0,
          stockQuantity: Number(formData.stockQuantity) || 1,
          description: formData.description,
          location: { address: formData.address },
          images: formData.images,
          isNegotiable: formData.isNegotiable,
          status: 'active'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('🎉 Success! Product listed on Marketplace MongoDB.');
        onListingCreated();
        onClose();
        setStep(1);
      } else {
        alert('Failed to list item: ' + data.message);
      }
    } catch (err) {
      alert('Error creating listing: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ec4899', letterSpacing: '0.5px' }}>STEP {step} OF 4</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', margin: 0 }}>
              {step === 1 && 'Basic Item Information'}
              {step === 2 && 'Pricing & Stock Quantity'}
              {step === 3 && 'Images & Description'}
              {step === 4 && 'Review & Publish Listing'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div style={{ width: `${(step / 4) * 100}%`, height: '100%', background: 'linear-gradient(to right, #6366f1, #ec4899)', transition: 'width 0.3s ease' }} />
        </div>

        {/* Step Forms */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.4rem' }}>Product Title *</label>
              <input 
                type="text"
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '0.92rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.4rem' }}>Category *</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', background: '#131b2e', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '0.92rem' }}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.4rem' }}>Condition *</label>
                <select 
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  style={{ width: '100%', background: '#131b2e', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '0.92rem' }}
                >
                  <option value="new">Brand New (Unopened)</option>
                  <option value="like_new">Like New / Mint</option>
                  <option value="good">Used - Good Condition</option>
                  <option value="fair">Used - Fair Condition</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.4rem' }}>Price (LKR) *</label>
                <input 
                  type="number"
                  placeholder="e.g. 45000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.4rem' }}>Stock Quantity *</label>
                <input 
                  type="number"
                  placeholder="e.g. 5"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.04)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <input 
                type="checkbox"
                id="isNegotiable"
                checked={formData.isNegotiable}
                onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <label htmlFor="isNegotiable" style={{ fontSize: '0.9rem', color: '#cbd5e1', cursor: 'pointer', fontWeight: '500' }}>
                Allow buyers to submit counter-offers / price negotiations
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.4rem' }}>Image URL *</label>
              <input 
                type="text"
                value={formData.images[0]}
                onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.4rem' }}>Product Description</label>
              <textarea 
                rows={4}
                placeholder="Describe features, warranty status, accessories included..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '0.92rem' }}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{formData.title || 'Untitled Product'}</h4>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>
              <span>Category: <strong style={{ color: '#fff' }}>{formData.category}</strong></span>
              <span>Price: <strong style={{ color: '#38bdf8' }}>LKR {Number(formData.price).toLocaleString()}</strong></span>
              <span>Stock: <strong style={{ color: '#10b981' }}>{formData.stockQuantity} units</strong></span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>{formData.description || 'No detailed description provided.'}</p>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button 
              onClick={() => {
                if (!formData.title && step === 1) return alert('Please enter product title');
                if (!formData.price && step === 2) return alert('Please enter product price');
                setStep(step + 1);
              }} 
              className="btn-primary"
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-accent">
              {isSubmitting ? 'Publishing...' : 'Confirm & Publish Listing'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
