import React, { useState } from 'react';
import { Star, Trash2, MessageSquare } from 'lucide-react';

export default function ReviewModeration() {
  const [reviews, setReviews] = useState([]);

  const handleDelete = (id) => {
    setReviews(prev => prev.filter(r => r._id !== id));
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Review Moderation</h2>
        <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Monitor merchant and user reviews for inappropriate content</p>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Business Target</th>
            <th>Reviewer</th>
            <th>Rating</th>
            <th>Review Content</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(rev => (
            <tr key={rev._id}>
              <td style={{ fontWeight: 700, color: '#818CF8' }}>{rev.businessName}</td>
              <td style={{ color: '#fff' }}>{rev.userName}</td>
              <td>
                <div style={{ display: 'flex', gap: '2px', color: '#FBBF24' }}>
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} size={12} fill="#FBBF24" />
                  ))}
                </div>
              </td>
              <td style={{ color: '#D1D5DB', maxWidth: '350px', fontSize: '13px' }}>"{rev.text}"</td>
              <td style={{ color: '#9CA3AF', fontSize: '12px' }}>{rev.createdAt}</td>
              <td>
                <button className="glass-btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(rev._id)}>
                  <Trash2 size={14} /> Remove
                </button>
              </td>
            </tr>
          ))}

          {reviews.length === 0 && (
            <tr>
              <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                No customer reviews in database yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
