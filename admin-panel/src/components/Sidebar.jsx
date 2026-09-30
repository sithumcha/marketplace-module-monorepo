import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Building2, 
  Layers, 
  AlertTriangle, 
  Star, 
  BarChart3, 
  ShoppingBag,
  Package,
  MessageSquare,
  Tag,
  LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, stats = {} }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Customer Orders', icon: Package, badge: `${stats.pendingOrders ?? 0} New` },
    { id: 'promos', label: 'Promo / Discounts', icon: Tag, badge: 'Offers' },
    { id: 'inventory', label: 'Store Inventory', icon: ShoppingBag, badge: `${stats.storeItemsCount ?? 0} Items` },
    { id: 'support', label: 'Live Support Chat', icon: MessageSquare, badge: 'Live Sync' },
    { id: 'listings', label: 'Listing Moderation', icon: ShieldAlert, badge: `${stats.flaggedListings ?? 0} Flagged` },
    { id: 'businesses', label: 'Business Verification', icon: Building2, badge: `${stats.pendingVerifications ?? 0} New` },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'reports', label: 'Reports & Disputes', icon: AlertTriangle, badge: `${stats.pendingReports ?? 0} Pending` },
    { id: 'reviews', label: 'Review Moderation', icon: Star },
    { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
  ];
  return (
    <aside style={{ width: '260px', borderRight: '1px solid var(--border-color)', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-sidebar)', position: 'fixed', left: 0, top: 0, zIndex: 50 }}>
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ background: 'var(--primary-gradient)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-title)', letterSpacing: '-0.02em' }}>MARKETPLACE</h2>
          <span style={{ fontSize: '11px', color: '#6366F1', fontWeight: 700, letterSpacing: '0.05em' }}>ADMIN PORTAL v1.0</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#6366F1' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 500,
                fontSize: '14px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? '#6366F1' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: item.badge.includes('Flagged') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                  color: item.badge.includes('Flagged') ? '#EF4444' : '#6366F1'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Profile Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: '#fff' }}>
            AD
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-title)' }}>Admin System</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Super Moderator</div>
          </div>
        </div>
        <LogOut size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
      </div>
    </aside>
  );
}
