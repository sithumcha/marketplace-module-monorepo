import React, { useState, useEffect } from 'react';
import { Building2, Check, X, FileText, Phone, Mail, MapPin } from 'lucide-react';

export default function BusinessVerification() {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/businesses')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.businesses)) {
          setBusinesses(data.businesses);
        }
      })
      .catch(() => setBusinesses([]));
  }, []);

  const toggleVerify = async (id, status) => {
    setBusinesses(prev => prev.map(b => b._id === id ? { ...b, isVerified: status } : b));
    try {
      await fetch(`http://localhost:5000/api/admin/businesses/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: status })
      });
    } catch (e) {}
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Business Verification Queue</h2>
        <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Review merchant license filings and issue verified business badges</p>
      </div>

      {businesses.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
          <Building2 size={36} color="#818CF8" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>No Registered Local Businesses Found</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Showing live database records only. Real businesses will appear here upon registration.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {businesses.map(biz => (
            <div key={biz._id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <img src={biz.logo || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200'} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} alt={biz.businessName} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{biz.businessName}</h3>
                    <span className={`badge ${biz.isVerified ? 'badge-verified' : 'badge-pending'}`}>
                      {biz.isVerified ? 'Verified Business' : 'Pending Verification'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#818CF8', fontWeight: 600, marginTop: '2px' }}>{biz.category}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={12} /> {biz.location?.address || 'Local Hub'}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#D1D5DB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={12} color="#9CA3AF" /> {biz.contactPhone || 'No contact phone'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={12} color="#9CA3AF" /> {biz.contactEmail || 'No contact email'}</div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                {!biz.isVerified ? (
                  <button className="glass-btn btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toggleVerify(biz._id, true)}>
                    <Check size={16} /> Verify Business
                  </button>
                ) : (
                  <button className="glass-btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toggleVerify(biz._id, false)}>
                    <X size={16} /> Revoke Verification
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
