import React from 'react';
import { Users, ShoppingBag, Building2, ShieldAlert, DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard({ stats = {}, onNavigate = () => {} }) {
  const safeStats = stats || {};
  const metricCards = [
    { title: 'Total Active Listings', value: safeStats.totalListings ?? 0, change: 'Live DB count', icon: ShoppingBag, color: '#6366F1' },
    { title: 'Registered Users', value: safeStats.totalUsers ?? 0, change: 'Live DB count', icon: Users, color: '#10B981' },
    { title: 'Local Businesses', value: safeStats.totalBusinesses ?? 0, change: 'Live DB count', icon: Building2, color: '#F59E0B' },
    { title: 'Est. Platform GMV', value: `$${safeStats.totalRevenue ? safeStats.totalRevenue.toLocaleString() : '0'}`, change: 'Live DB GMV', icon: DollarSign, color: '#EC4899' },
  ];

  const recentActivities = [
    { type: 'negotiation', text: 'Deal Confirmed: MacBook Pro 16" reserved for $1,700', time: '2 mins ago', icon: CheckCircle, color: '#10B981' },
    { type: 'report', text: 'New listing report filed for Vintage Leather Jacket', time: '14 mins ago', icon: ShieldAlert, color: '#EF4444' },
    { type: 'business', text: 'Urban Coffee & Tech Repair Hub requested verification', time: '1 hour ago', icon: Building2, color: '#F59E0B' },
    { type: 'user', text: 'New seller registered: Sarah Miller (NYC region)', time: '2 hours ago', icon: Users, color: '#6366F1' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{card.title}</span>
                <div style={{ background: `${card.color}20`, padding: '8px', borderRadius: '10px' }}>
                  <Icon size={20} color={card.color} />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-title)' }}>{card.value}</div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} /> {card.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Moderation Quick Queue & Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left: Priority Action Queue */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-title)' }}>Pending Moderation Queue</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Items requiring immediate admin attention</p>
            </div>
            <button className="glass-btn btn-primary" onClick={() => onNavigate('listings')}>
              View All Queue
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} alt="item" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)' }}>Apple MacBook Pro 16" M2 Max</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Category: Electronics • Price: $1,850</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="glass-btn btn-success" style={{ padding: '6px 12px', fontSize: '12px' }}>Approve</button>
                <button className="glass-btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>Flag</button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} alt="item" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)' }}>Vintage Designer Leather Jacket</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reported: Inaccurate Condition • By: Alex Johnson</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="glass-btn btn-success" style={{ padding: '6px 12px', fontSize: '12px' }}>Dismiss</button>
                <button className="glass-btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>Remove</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Activity Log */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-title)', marginBottom: '16px' }}>Live Activity Stream</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentActivities.map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: `${act.color}20`, padding: '6px', borderRadius: '8px', marginTop: '2px' }}>
                    <Icon size={14} color={act.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>{act.text}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Clock size={10} /> {act.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
