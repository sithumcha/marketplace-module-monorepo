import React, { useState, useEffect } from 'react';
import { User, Ban, CheckCircle, Star } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);

  const fetchUsers = () => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      })
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = async (id, newStatus) => {
    setUsers(prev => prev.map(u => u._id === id ? { ...u, status: newStatus } : u));
    try {
      await fetch(`http://localhost:5000/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>User Management</h2>
        <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Manage registered platform buyers, sellers, and business account permissions</p>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Rating</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>
                <div style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} color="#818CF8" /> {u.name}
                </div>
              </td>
              <td style={{ color: '#9CA3AF' }}>{u.email}</td>
              <td><span className="badge badge-verified" style={{ textTransform: 'capitalize' }}>{(u.role || 'user').replace('_', ' ')}</span></td>
              <td style={{ fontWeight: 700, color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={12} fill="#FBBF24" /> {u.rating || 5.0}
              </td>
              <td>
                <span className={`badge ${u.status === 'active' ? 'badge-active' : 'badge-flagged'}`}>
                  {u.status || 'active'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {u.status !== 'suspended' ? (
                    <button className="glass-btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => toggleStatus(u._id, 'suspended')}>
                      <Ban size={12} /> Suspend
                    </button>
                  ) : (
                    <button className="glass-btn btn-success" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => toggleStatus(u._id, 'active')}>
                      <CheckCircle size={12} /> Reinstate
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                No database users registered yet. Accounts created in app/web will appear here.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
