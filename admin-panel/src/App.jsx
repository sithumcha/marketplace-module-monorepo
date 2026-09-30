import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ListingModeration from './pages/ListingModeration';
import BusinessVerification from './pages/BusinessVerification';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import ReviewModeration from './pages/ReviewModeration';
import Analytics from './pages/Analytics';

import ItemManagement from './pages/ItemManagement';
import Orders from './pages/Orders';
import SupportChat from './pages/SupportChat';
import PromoCodes from './pages/PromoCodes';

export default function App() {
  const [activeTab, setActiveTab] = useState('orders');
  const [theme, setTheme] = useState('light');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalBusinesses: 0,
    totalRevenue: 0
  });

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/dashboard-stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.log('Backend sync offline, using local admin state');
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const titleMap = {
    dashboard: 'Dashboard Overview',
    orders: 'Customer Orders & Sales Queue',
    promos: 'Admin Promo & Discount Codes Manager',
    inventory: 'Store Inventory & Product Management',
    support: 'Live Customer Support & Multi-Device Chat',
    listings: 'Listing Moderation Queue',
    businesses: 'Business Verification Queue',
    users: 'User Account Management',
    categories: 'Categories & Directory Taxonomy',
    reports: 'Reports & Dispute Resolution',
    reviews: 'Review Moderation',
    analytics: 'Analytics & Platform Insights'
  };

  return (
    <div className={theme === 'light' ? 'light-mode' : ''} style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
      <Header title={titleMap[activeTab] || 'Admin Panel'} onRefresh={fetchStats} theme={theme} setTheme={setTheme} />
      
      <main style={{ marginLeft: '260px', padding: '32px' }}>
        {activeTab === 'dashboard' && <Dashboard stats={stats} onNavigate={setActiveTab} />}
        {activeTab === 'orders' && <Orders />}
        {activeTab === 'promos' && <PromoCodes />}
        {activeTab === 'inventory' && <ItemManagement />}
        {activeTab === 'support' && <SupportChat />}
        {activeTab === 'listings' && <ListingModeration />}
        {activeTab === 'businesses' && <BusinessVerification />}
        {activeTab === 'users' && <Users />}
        {activeTab === 'categories' && <Categories />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'reviews' && <ReviewModeration />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
    </div>
  );
}
