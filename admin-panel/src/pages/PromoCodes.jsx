import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle, XCircle, Sparkles, RefreshCw, Edit3, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PromoCodes() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for creating new promo code
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('LIMITED TIME OFFER');
  const [subtitle, setSubtitle] = useState('');
  const [discountAmount, setDiscountAmount] = useState('500');
  const [gradient, setGradient] = useState('linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for editing existing promo code
  const [editingPromo, setEditingPromo] = useState(null);
  const [editCode, setEditCode] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editDiscountAmount, setEditDiscountAmount] = useState('');
  const [editGradient, setEditGradient] = useState('');

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/promos');
      const data = await res.json();
      if (data.success && Array.isArray(data.promos)) {
        setPromos(data.promos);
      }
    } catch (e) {
      console.error('Error fetching promo codes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!code || !title || !discountAmount) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in required promo code details.'
      });
    }

    try {
      const res = await fetch('http://localhost:5000/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          title,
          tag,
          subtitle: subtitle || 'Special discount offer on selected items!',
          discountAmount: Number(discountAmount),
          discountType: 'FLAT',
          gradient
        })
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Promo Code Created!',
          text: `Discount Code "${code.toUpperCase()}" is now active live!`,
          timer: 2000,
          showConfirmButton: false
        });
        setCode('');
        setTitle('');
        setSubtitle('');
        setShowAddModal(false);
        fetchPromos();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: data.message || 'Failed to create promo code'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: err.message
      });
    }
  };

  const handleOpenEdit = (promo) => {
    setEditingPromo(promo);
    setEditCode(promo.code || '');
    setEditTitle(promo.title || '');
    setEditTag(promo.tag || 'PROMO CODE');
    setEditSubtitle(promo.subtitle || '');
    setEditDiscountAmount(String(promo.discountAmount || '500'));
    setEditGradient(promo.gradient || 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPromo) return;
    const targetId = editingPromo._id || editingPromo.code;
    try {
      const res = await fetch(`http://localhost:5000/api/promos/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editCode.trim().toUpperCase(),
          title: editTitle,
          tag: editTag,
          subtitle: editSubtitle,
          discountAmount: Number(editDiscountAmount),
          gradient: editGradient
        })
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Promo Code Updated!',
          text: `Changes to "${editCode.toUpperCase()}" saved successfully!`,
          timer: 2000,
          showConfirmButton: false
        });
        setEditingPromo(null);
        fetchPromos();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: data.message || 'Could not update promo code'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message
      });
    }
  };

  const handleDelete = async (id, codeStr) => {
    const targetId = id || codeStr;
    const result = await Swal.fire({
      title: 'Delete Promo Code?',
      text: `Are you sure you want to permanently delete promo code "${codeStr || targetId}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete Code!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`http://localhost:5000/api/promos/${targetId}`, { method: 'DELETE' });
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Promo code removed successfully.',
        timer: 1800,
        showConfirmButton: false
      });
      fetchPromos();
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not delete promo code.'
      });
    }
  };

  const handleToggle = async (id, codeStr) => {
    const targetId = id || codeStr;
    try {
      await fetch(`http://localhost:5000/api/promos/${targetId}/toggle`, { method: 'PATCH' });
      Swal.fire({
        icon: 'info',
        title: 'Status Toggled',
        text: 'Promo code active status updated.',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      fetchPromos();
    } catch (e) {
      console.error(e);
    }
  };

  const presetGradients = [
    { label: 'Indigo Pink (Default)', value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)' },
    { label: 'Emerald Ocean', value: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #3b82f6 100%)' },
    { label: 'Amber Flame', value: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #ef4444 100%)' },
    { label: 'Deep Purple Neon', value: 'linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #06b6d4 100%)' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag color="#818CF8" size={24} /> Admin Promo & Discount Code Manager
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
            Create, publish and manage promo discount codes shown on Hero Slider & Checkout
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="glass-btn" onClick={fetchPromos}>
            <RefreshCw size={14} /> Refresh
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'var(--primary-gradient)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            <Plus size={16} /> Add New Promo Code
          </button>
        </div>
      </div>

      {/* Grid of Active Promo Codes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {promos.map((p) => (
          <div 
            key={p._id || p.code} 
            style={{ 
              background: p.gradient || 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
              borderRadius: '20px', 
              padding: '20px', 
              color: '#fff', 
              position: 'relative',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              opacity: p.isActive === false ? 0.6 : 1
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, background: 'rgba(255,255,255,0.25)', padding: '3px 10px', borderRadius: '12px', letterSpacing: '0.5px' }}>
                {p.tag || 'PROMO CODE'}
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => handleOpenEdit(p)} 
                  style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}
                  title="Edit promo code"
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button 
                  onClick={() => handleToggle(p._id, p.code)} 
                  style={{ background: p.isActive === false ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                  title="Toggle active state"
                >
                  {p.isActive === false ? 'Disabled' : 'Active'}
                </button>
                <button 
                  onClick={() => handleDelete(p._id, p.code)} 
                  style={{ background: 'rgba(239, 68, 68, 0.4)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  title="Delete promo code"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '12px 0 4px 0' }}>{p.title}</h3>
            <p style={{ fontSize: '12px', opacity: 0.9, marginBottom: '14px' }}>{p.subtitle}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.25)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div>
                <span style={{ fontSize: '10px', opacity: 0.8, display: 'block' }}>PROMO CODE</span>
                <strong style={{ fontSize: '16px', letterSpacing: '1px', fontFamily: 'monospace' }}>{p.code}</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', opacity: 0.8, display: 'block' }}>DISCOUNT</span>
                <strong style={{ fontSize: '16px', color: '#fef08a' }}>LKR {p.discountAmount} OFF</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Promo Code Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', width: '90%', maxWidth: '520px', borderRadius: '24px', padding: '28px', color: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles color="#818CF8" /> Create New Promo Code
            </h3>

            <form onSubmit={handleCreatePromo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9CA3AF', marginBottom: '4px' }}>Promo Code (e.g. MEGA50)</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())} 
                  required 
                  placeholder="e.g. MEGA50" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px', textTransform: 'uppercase', fontWeight: 700 }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9CA3AF', marginBottom: '4px' }}>Promo Banner Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  placeholder="e.g. SPECIAL HOLIDAY OFFER 50% OFF" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9CA3AF', marginBottom: '4px' }}>Badge Tag / Label</label>
                <input 
                  type="text" 
                  value={tag} 
                  onChange={(e) => setTag(e.target.value)} 
                  placeholder="e.g. LIMITED TIME OFFER" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9CA3AF', marginBottom: '4px' }}>Subtitle Description</label>
                <input 
                  type="text" 
                  value={subtitle} 
                  onChange={(e) => setSubtitle(e.target.value)} 
                  placeholder="e.g. Get instant LKR 1000 discount on your order" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9CA3AF', marginBottom: '4px' }}>Discount Amount (LKR)</label>
                <input 
                  type="number" 
                  value={discountAmount} 
                  onChange={(e) => setDiscountAmount(e.target.value)} 
                  required 
                  placeholder="500" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px', fontWeight: 700 }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9CA3AF', marginBottom: '4px' }}>Banner Color Gradient Theme</label>
                <select 
                  value={gradient} 
                  onChange={(e) => setGradient(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px', fontWeight: 600 }}
                >
                  {presetGradients.map(g => (
                    <option key={g.label} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #475569', background: 'transparent', color: '#9CA3AF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--primary-gradient)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Publish Promo Code
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Edit Promo Code Modal */}
      {editingPromo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', width: '90%', maxWidth: '520px', borderRadius: '24px', padding: '28px', color: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 color="#818CF8" /> Edit Promo Code ({editingPromo.code})
              </h3>
              <X size={20} style={{ cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setEditingPromo(null)} />
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9CA3AF', marginBottom: '4px' }}>Promo Code</label>
                <input 
                  type="text" 
                  value={editCode} 
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px', textTransform: 'uppercase', fontWeight: 700 }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9CA3AF', marginBottom: '4px' }}>Promo Banner Title</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9CA3AF', marginBottom: '4px' }}>Badge Tag / Label</label>
                <input 
                  type="text" 
                  value={editTag} 
                  onChange={(e) => setEditTag(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9CA3AF', marginBottom: '4px' }}>Subtitle Description</label>
                <input 
                  type="text" 
                  value={editSubtitle} 
                  onChange={(e) => setEditSubtitle(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9CA3AF', marginBottom: '4px' }}>Discount Amount (LKR)</label>
                <input 
                  type="number" 
                  value={editDiscountAmount} 
                  onChange={(e) => setEditDiscountAmount(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px', fontWeight: 700 }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9CA3AF', marginBottom: '4px' }}>Banner Color Gradient Theme</label>
                <select 
                  value={editGradient} 
                  onChange={(e) => setEditGradient(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '14px', fontWeight: 600 }}
                >
                  {presetGradients.map(g => (
                    <option key={g.label} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingPromo(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #475569', background: 'transparent', color: '#9CA3AF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--primary-gradient)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
