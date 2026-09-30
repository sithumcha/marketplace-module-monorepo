import React, { useState, useEffect } from 'react';
import { Zap, Truck, Flame, ArrowRight, Tag, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

export default function HeroBanner({ totalListings }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [claimedCode, setClaimedCode] = useState(null);
  const [offers, setOffers] = useState([
    {
      id: 1,
      tag: 'LIMITED TIME OFFER',
      title: 'MEGA SALE - UP TO 40% OFF',
      subtitle: 'Discount on Electronics & Gadgets this week!',
      code: 'TECH40',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
      shadow: 'rgba(79, 70, 229, 0.35)',
      icon: Zap
    },
    {
      id: 2,
      tag: 'EXPRESS DELIVERY',
      title: 'FREE SHIPPING ON ORDERS',
      subtitle: 'Fast 2-day delivery guaranteed islandwide',
      code: 'FREESHIP',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #3b82f6 100%)',
      shadow: 'rgba(16, 185, 129, 0.35)',
      icon: Truck
    },
    {
      id: 3,
      tag: 'STORE SPOTLIGHT',
      title: 'NEW ARRIVALS 2026',
      subtitle: 'Verified items from official store sellers added daily',
      code: 'STORE2026',
      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #ef4444 100%)',
      shadow: 'rgba(245, 158, 11, 0.35)',
      icon: Flame
    }
  ]);

  // Fetch live promo codes from MongoDB backend API
  useEffect(() => {
    fetch('http://localhost:5000/api/promos')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.promos) && data.promos.length > 0) {
          const formatted = data.promos.filter(p => p.isActive !== false).map((p, idx) => ({
            id: p._id || p.code || idx,
            tag: p.tag || 'SPECIAL OFFER',
            title: p.title || 'DISCOUNT OFFER',
            subtitle: p.subtitle || 'Available now for a limited time',
            code: p.code,
            gradient: p.gradient || (idx % 3 === 0 
              ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)' 
              : idx % 3 === 1 
              ? 'linear-gradient(135deg, #059669 0%, #10b981 50%, #3b82f6 100%)' 
              : 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #ef4444 100%)'),
            shadow: 'rgba(79, 70, 229, 0.35)',
            icon: idx % 3 === 0 ? Zap : idx % 3 === 1 ? Truck : Flame
          }));
          if (formatted.length > 0) setOffers(formatted);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-slide carousel every 4 seconds
  useEffect(() => {
    if (offers.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [offers.length]);

  const handleClaim = (code) => {
    setClaimedCode(code);
    navigator.clipboard?.writeText(code);
    Swal.fire({
      icon: 'success',
      title: '🎉 Code Claimed!',
      text: `Promo Code "${code}" copied to clipboard!`,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
    setTimeout(() => setClaimedCode(null), 3000);
  };

  const current = offers[activeSlide] || offers[0];
  const IconComponent = current.icon || Zap;

  return (
    <div style={{ maxWidth: '1280px', margin: '1.5rem auto', padding: '0 1.5rem' }}>
      <div 
        style={{ 
          background: current.gradient,
          borderRadius: '28px',
          padding: '2.75rem',
          position: 'relative',
          overflow: 'hidden',
          color: '#ffffff',
          boxShadow: `0 20px 40px -12px ${current.shadow}`,
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          minHeight: '230px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        {/* Animated Glow Blobs */}
        <div style={{
          position: 'absolute',
          right: '-50px',
          top: '-50px',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)',
          pointerEvents: 'none',
          animation: 'pulse 6s infinite ease-in-out'
        }} />

        <div style={{
          position: 'absolute',
          left: '20%',
          bottom: '-60px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 1 }}>
          
          <div style={{ maxWidth: '700px' }}>
            {/* Tag Badge with Glassmorphism */}
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'rgba(255, 255, 255, 0.22)', 
              backdropFilter: 'blur(12px)', 
              WebkitBackdropFilter: 'blur(12px)',
              padding: '0.4rem 0.95rem', 
              borderRadius: '24px', 
              marginBottom: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <Sparkles size={15} color="#fef08a" />
              <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#ffffff', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                {current.tag}
              </span>
            </div>

            {/* Title */}
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: 1.15, marginBottom: '0.65rem', letterSpacing: '-0.6px', textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
              {current.title}
            </h2>

            {/* Subtitle */}
            <p style={{ color: 'rgba(255,255,255,0.94)', fontSize: '1.08rem', fontWeight: '500', marginBottom: '1.6rem', maxWidth: '600px', lineHeight: 1.4 }}>
              {current.subtitle}
            </p>

            {/* Promo Code & Action Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.28)', 
                backdropFilter: 'blur(10px)',
                padding: '0.6rem 1.15rem', 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                <Tag size={16} color="#fef08a" />
                <span style={{ fontSize: '0.92rem', fontWeight: '900', color: '#fef08a', fontFamily: 'monospace', letterSpacing: '1px' }}>
                  CODE: {current.code}
                </span>
              </div>

              <button 
                onClick={() => handleClaim(current.code)}
                style={{ 
                  padding: '0.75rem 1.6rem', 
                  fontSize: '0.95rem', 
                  background: '#ffffff', 
                  color: '#0f172a', 
                  fontWeight: '800', 
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {claimedCode === current.code ? (
                  <>
                    <CheckCircle2 size={18} color="#10b981" /> Promo Code Claimed!
                  </>
                ) : (
                  <>
                    Claim Discount <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', minWidth: '230px' }}>
            <div style={{ padding: '1.1rem 1.4rem', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: '800', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="#fef08a" /> STORE PRODUCTS
              </span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff', margin: '0.2rem 0 0 0', letterSpacing: '-0.5px' }}>{totalListings || 24}+ Available</h3>
            </div>

            <div style={{ padding: '1.1rem 1.4rem', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: '800', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <IconComponent size={14} color="#fef08a" /> REAL-TIME SYNC
              </span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fef08a', margin: '0.2rem 0 0 0', letterSpacing: '-0.5px' }}>Active Offer</h3>
            </div>
          </div>

        </div>

        {/* Carousel Indicators / Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.8rem', position: 'relative', zIndex: 1 }}>
          {offers.map((offer, idx) => (
            <button
              key={offer.id || idx}
              onClick={() => setActiveSlide(idx)}
              style={{
                width: activeSlide === idx ? '32px' : '9px',
                height: '9px',
                borderRadius: '5px',
                background: activeSlide === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s ease'
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
