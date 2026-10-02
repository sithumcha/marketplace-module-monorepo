import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, MessageSquare, Send, User, ThumbsUp } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ReviewsSection({ listingId, user }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 5.0 });
  const [loading, setLoading] = useState(true);

  // New Review Form State
  const [newRating, setNewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    if (!listingId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${listingId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setStats(data.stats || { totalReviews: 0, avgRating: 5.0 });
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          buyerEmail: user ? user.email : 'customer@marketplace.lk',
          buyerName: user ? user.name : 'Verified Customer',
          rating: newRating,
          reviewText: reviewText.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Review Posted! ⭐',
          text: 'Thank you for sharing your verified product feedback.',
          timer: 2000,
          showConfirmButton: false
        });
        setReviewText('');
        setNewRating(5);
        fetchReviews();
      } else {
        alert(data.message || 'Could not submit review.');
      }
    } catch (err) {
      alert('Error submitting review: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
      
      {/* Reviews Summary Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            Customer Reviews & Star Ratings
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Verified buyer feedback & ratings from real product owners</span>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>{stats.avgRating}</div>
          <div>
            <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', marginBottom: '2px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={16} fill={star <= Math.round(stats.avgRating) ? '#fbbf24' : 'none'} color="#fbbf24" />
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Based on {stats.totalReviews} verified reviews</span>
          </div>
        </div>
      </div>

      {/* Write a Review Box */}
      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>Write a Customer Review</h4>
        
        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#475569' }}>Select Star Rating:</span>
            <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={22} 
                  fill={star <= newRating ? '#fbbf24' : 'none'} 
                  color={star <= newRating ? '#fbbf24' : '#cbd5e1'}
                  onClick={() => setNewRating(star)} 
                />
              ))}
            </div>
          </div>

          <textarea 
            rows="3"
            placeholder="Write your honest review about product quality, delivery speed, seller service..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.75rem', borderRadius: '10px', fontSize: '0.88rem', color: '#0f172a', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary" 
              style={{ padding: '0.6rem 1.4rem', fontSize: '0.88rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Send size={15} /> {isSubmitting ? 'Posting...' : 'Submit Verified Review'}
            </button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div style={{ text: 'center', color: '#64748b', padding: '2rem' }}>Loading verified customer reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <MessageSquare size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: '700', color: '#0f172a' }}>No Customer Reviews Yet</div>
          <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Be the first to purchase and submit a review for this product!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((rev) => (
            <div key={rev._id} style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                    {rev.buyerName ? rev.buyerName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {rev.buyerName}
                      {rev.isVerifiedBuyer && (
                        <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 7px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle size={10} /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} fill={star <= rev.rating ? '#fbbf24' : 'none'} color="#fbbf24" />
                  ))}
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                {rev.reviewText}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
