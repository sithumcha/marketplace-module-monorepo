import React from 'react';
import { Search, Bell, ShieldCheck, RefreshCw, Sun, Moon } from 'lucide-react';

export default function Header({ title, onRefresh, theme, setTheme }) {
  return (
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

        <button className="glass-btn" style={{ position: 'relative', padding: '8px 10px' }}>
          <Bell size={16} color="#9CA3AF" />
          <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
        </button>
      </div>
    </header>
  );
}
