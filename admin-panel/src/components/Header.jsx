import React, { useState, useEffect } from 'react';
import { Search, Bell, ShieldCheck, RefreshCw, Sun, Moon, Volume2, X } from 'lucide-react';

export default function Header({ title, onRefresh, theme, setTheme }) {
  const [toast, setToast] = useState(null);

  // Play audio chime notification sound
  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio alert fallback', e);
    }
  };

  const triggerLiveAlert = (msg, type = 'order') => {
    playAlertSound();
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // Simulate real-time Socket.io live incoming alert notification after 6s
    const timer = setTimeout(() => {
      triggerLiveAlert('🛒 New Customer Order #ORD-9842 received!');
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Real-time Admin Toast Notification Overlay */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '32px',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #6366F1',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fff',
          backdropFilter: 'blur(12px)',
          animation: 'slideIn 0.3s ease'
        }}>
          <Volume2 size={18} color="#818CF8" />
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{toast.msg}</div>
          <X size={14} color="#9CA3AF" style={{ cursor: 'pointer', marginLeft: '8px' }} onClick={() => setToast(null)} />
        </div>
      )}

      <header style={{ 
        marginLeft: '260px', 
        height: '70px', 
        borderBottom: '1px solid var(--border-color)', 
        background: 'var(--bg-main)', 
        backdropFilter: 'blur(12px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h1>
          <span className="badge badge-verified">
            <ShieldCheck size={12} /> Live Backend
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#6B7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search records, users, listings..." 
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* Dark / Light Theme Toggle Button */}
          <button
            className="glass-btn"
            onClick={() => setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Dark / Light Mode"
          >
            {theme === 'light' ? <Sun size={14} color="#F59E0B" /> : <Moon size={14} color="#818CF8" />}
            <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
          </button>

          {/* Action buttons */}
          <button className="glass-btn" onClick={onRefresh} title="Sync Live Data">
            <RefreshCw size={14} /> Refresh
          </button>

          <button 
            className="glass-btn" 
            style={{ position: 'relative', padding: '8px 10px' }}
            onClick={() => triggerLiveAlert('🔔 Platform Alert: 2 new store seller verification applications pending review.')}
            title="Live Notifications"
          >
            <Bell size={16} color="#9CA3AF" />
            <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
          </button>
        </div>
      </header>
    </>
  );
}
