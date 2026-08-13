import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, ShoppingBag, ArrowUpRight } from 'lucide-react';

export default function Analytics() {
  const categoryStats = [
    { name: 'Electronics', percentage: '38%', count: 48, color: '#6366F1' },
    { name: 'Fashion & Apparel', percentage: '28%', count: 35, color: '#EC4899' },
    { name: 'Groceries & Produce', percentage: '18%', count: 22, color: '#10B981' },
    { name: 'Furniture & Decor', percentage: '16%', count: 20, color: '#F59E0B' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 600 }}>Negotiation Conversion Rate</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#34D399', marginTop: '8px' }}>64.2%</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Offers that result in accepted deals</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 600 }}>Avg. In-Chat Response Time</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#818CF8', marginTop: '8px' }}>8.4 mins</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Sellers responding to initial buyer inquiry</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 600 }}>Verified Business Directory Ratio</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#FBBF24', marginTop: '8px' }}>82.5%</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Verified local shops vs overall directory listings</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>Listings by Category Distribution</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categoryStats.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
                <span style={{ color: '#fff' }}>{item.name}</span>
                <span style={{ color: item.color }}>{item.percentage} ({item.count} items)</span>
              </div>
              <div style={{ width: '100%', height: '10px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                <div style={{ width: item.percentage, height: '100%', background: item.color, borderRadius: '9999px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
