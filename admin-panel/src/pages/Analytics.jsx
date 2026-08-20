import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, ShoppingBag, ArrowUpRight, PieChart } from 'lucide-react';

export default function Analytics() {
  const categoryStats = [
    { name: 'Electronics', percentage: '38%', count: 48, color: '#6366F1' },
    { name: 'Fashion & Apparel', percentage: '28%', count: 35, color: '#EC4899' },
    { name: 'Groceries & Produce', percentage: '18%', count: 22, color: '#10B981' },
    { name: 'Furniture & Decor', percentage: '16%', count: 20, color: '#F59E0B' },
  ];

  const monthlyGmvData = [
    { month: 'Jan', gmv: 12500 },
    { month: 'Feb', gmv: 18200 },
    { month: 'Mar', gmv: 24100 },
    { month: 'Apr', gmv: 31000 },
    { month: 'May', gmv: 29500 },
    { month: 'Jun', gmv: 42800 },
    { month: 'Jul', gmv: 54300 },
    { month: 'Aug', gmv: 68900 },
  ];

  const userGrowthData = [
    { day: 'Mon', users: 140 },
    { day: 'Tue', users: 210 },
    { day: 'Wed', users: 380 },
    { day: 'Thu', users: 490 },
    { day: 'Fri', users: 620 },
    { day: 'Sat', users: 810 },
    { day: 'Sun', users: 950 },
  ];

  const maxGmv = Math.max(...monthlyGmvData.map(d => d.gmv));
  const maxUsers = Math.max(...userGrowthData.map(d => d.users));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 600 }}>Negotiation Conversion Rate</div>
            <TrendingUp size={18} color="#34D399" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#34D399', marginTop: '8px' }}>64.2%</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Offers resulting in accepted purchases</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 600 }}>Avg. In-Chat Response Time</div>
            <BarChart3 size={18} color="#818CF8" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#818CF8', marginTop: '8px' }}>8.4 mins</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Sellers responding to initial buyer inquiry</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 600 }}>Verified Store Ratio</div>
            <Users size={18} color="#FBBF24" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#FBBF24', marginTop: '8px' }}>82.5%</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Verified store badges granted</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* 📈 Monthly GMV Revenue Area Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>📈 Monthly GMV Revenue Trend</h3>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Gross Merchandise Value in USD</div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#34D399', background: 'rgba(52, 211, 153, 0.15)', padding: '4px 10px', borderRadius: '8px' }}>
              +28.4% YoY
            </span>
          </div>

          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0 20px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {monthlyGmvData.map((item, idx) => {
              const heightPct = (item.gmv / maxGmv) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#818CF8' }}>${(item.gmv / 1000).toFixed(1)}k</div>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #6366F1 0%, rgba(99, 102, 241, 0.2) 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>{item.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🍕 Category Distribution */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <PieChart size={18} color="#EC4899" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Category Distribution</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryStats.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                  <span style={{ color: '#fff' }}>{item.name}</span>
                  <span style={{ color: item.color }}>{item.percentage}</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                  <div style={{ width: item.percentage, height: '100%', background: item.color, borderRadius: '9999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 📊 Daily Active Users Bar Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>📊 Weekly Active User Engagement</h3>
        <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
          {userGrowthData.map((item, idx) => {
            const heightPct = (item.users / maxUsers) * 100;
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}>
                <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 700 }}>{item.users}</div>
                <div
                  style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    background: 'linear-gradient(180deg, #10B981 0%, rgba(16, 185, 129, 0.2) 100%)',
                    borderRadius: '4px',
                  }}
                />
                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>{item.day}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
