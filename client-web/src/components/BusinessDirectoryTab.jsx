import React from 'react';
import { ShieldCheck, Star, MapPin, Phone, ExternalLink, CheckCircle } from 'lucide-react';

export default function BusinessDirectoryTab() {
  const businesses = [
    {
      id: 1,
      name: 'TechZone Electronics Ltd.',
      category: 'Consumer Electronics & Gadgets',
      location: 'No. 120, Liberty Plaza, Colombo 03',
      rating: 4.9,
      reviews: 142,
      isVerified: true,
      phone: '+94 11 234 5678',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
      description: 'Authorized dealer for premium laptops, smartphones, noise-canceling audio gear, and gaming monitors.'
    },
    {
      id: 2,
      name: 'Urban Threads Fashion House',
      category: 'Apparel & Designer Wear',
      location: 'One Galle Face Mall, Colombo 02',
      rating: 4.8,
      reviews: 98,
      isVerified: true,
      phone: '+94 11 987 6543',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
      description: 'Sustainable fashion brand specializing in premium linen clothing, streetwear, and handcrafted accessories.'
    },
    {
      id: 3,
      name: 'Apex Auto Spare Parts',
      category: 'Automobile Components & Accessories',
      location: 'Panchikawatte Road, Colombo 10',
      rating: 4.7,
      reviews: 64,
      isVerified: true,
      phone: '+94 11 555 4321',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
      description: 'Genuine OEM Japanese and European spare parts, alloys, synthetic engine oils, and detailing kits.'
    }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.75rem' }}>
          <ShieldCheck size={16} /> VERIFIED SELLER NETWORK
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>Official Business & Store Directory</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Browse verified merchants with business permits and admin moderation approval badges.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {businesses.map((biz) => (
          <div key={biz.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '180px', width: '100%', position: 'relative' }}>
              <img src={biz.image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {biz.isVerified && (
                <span className="badge badge-emerald" style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={14} /> Verified Business
                </span>
              )}
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#ec4899', fontWeight: '700', letterSpacing: '0.5px' }}>{biz.category}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: '0.3rem 0 0.5rem 0' }}>{biz.name}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <span style={{ color: '#fbbf24', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Star size={14} fill="#fbbf24" /> {biz.rating} ({biz.reviews} reviews)
                  </span>
                  <span><MapPin size={13} color="#6366f1" /> {biz.location.split(',')[1] || 'Colombo'}</span>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>{biz.description}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Phone size={13} /> {biz.phone}
                </span>
                <button className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                  Visit Store <ExternalLink size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
