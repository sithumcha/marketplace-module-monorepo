import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, CheckCircle2 } from 'lucide-react';

export default function ListingModeration() {
  const [listings, setListings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetch('http://localhost:5000/api/listings')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.listings)) {
          setListings(data.listings);
        }
      })
      .catch(() => setListings([]));
  }, []);

  const handleAction = async (id, newStatus) => {
    setListings(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
    try {
      await fetch(`http://localhost:5000/api/admin/listings/${id}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newStatus === 'active' ? 'approve' : newStatus === 'flagged' ? 'flag' : 'remove' })
      });
    } catch (e) {}
  };

  const filtered = filterStatus === 'all' 
    ? listings 
    : listings.filter(l => l.status === filterStatus);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Listing Moderation</h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Approve, review, or flag item listings across all marketplace categories</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'active', 'flagged', 'pending', 'removed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="glass-btn"
              style={{
                textTransform: 'capitalize',
                background: filterStatus === status ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                borderColor: filterStatus === status ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Item Details</th>
            <th>Category</th>
            <th>Price</th>
            <th>Seller</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(item => (
            <tr key={item._id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src={item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} alt={item.title} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>ID: {item._id} • Added {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today'}</div>
                  </div>
                </div>
              </td>
              <td><span className="badge badge-verified">{item.category}</span></td>
              <td style={{ fontWeight: 800, color: '#34D399' }}>${item.price}</td>
              <td style={{ color: '#D1D5DB' }}>{item.sellerName || item.sellerId?.name || 'Store Seller'}</td>
              <td>
                <span className={`badge badge-${item.status}`}>
                  {item.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {item.status !== 'active' && (
                    <button className="glass-btn btn-success" onClick={() => handleAction(item._id, 'active')} title="Approve Listing">
                      <CheckCircle2 size={14} /> Approve
                    </button>
                  )}
                  {item.status !== 'flagged' && (
                    <button className="glass-btn btn-danger" onClick={() => handleAction(item._id, 'flagged')} title="Flag Listing">
                      <ShieldAlert size={14} /> Flag
                    </button>
                  )}
                  {item.status !== 'removed' && (
                    <button className="glass-btn" onClick={() => handleAction(item._id, 'removed')} title="Remove">
                      <Trash2 size={14} color="#EF4444" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                No database listings found in moderation queue matching filter "{filterStatus}".
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
