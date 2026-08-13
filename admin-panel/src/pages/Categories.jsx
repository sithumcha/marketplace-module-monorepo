import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [isBizCat, setIsBizCat] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch(() => setCategories([]));
  }, []);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const newCat = {
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      icon: 'Tag',
      isBusinessCategory: isBizCat,
      itemCount: 0
    };

    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat)
      });
      const data = await res.json();
      if (data.success && data.category) {
        setCategories(prev => [...prev, data.category]);
      } else {
        setCategories(prev => [...prev, { ...newCat, _id: `cat_${Date.now()}` }]);
      }
    } catch (e) {
      setCategories(prev => [...prev, { ...newCat, _id: `cat_${Date.now()}` }]);
    }
    setNewCatName('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Category Management</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Slug</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id}>
                <td style={{ fontWeight: 700, color: '#fff' }}>{cat.name}</td>
                <td style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>/{cat.slug}</td>
                <td>
                  <span className={`badge ${cat.isBusinessCategory ? 'badge-pending' : 'badge-verified'}`}>
                    {cat.isBusinessCategory ? 'Business Directory' : 'Standard Item'}
                  </span>
                </td>
                <td>
                  <button className="glass-btn" onClick={() => setCategories(prev => prev.filter(c => c._id !== cat._id))}>
                    <Trash2 size={14} color="#EF4444" />
                  </button>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                  No categories found in MongoDB database. Create one using the form on the right.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Add New Category</h3>
        <div>
          <label style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>Category Title</label>
          <input
            type="text"
            placeholder="e.g. Sports & Fitness"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              marginTop: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="bizCatToggle"
            checked={isBizCat}
            onChange={e => setIsBizCat(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <label htmlFor="bizCatToggle" style={{ fontSize: '13px', color: '#D1D5DB' }}>
            Flag as Business Directory Category
          </label>
        </div>

        <button className="glass-btn btn-primary" onClick={handleAddCategory} style={{ marginTop: '8px', justifyContent: 'center' }}>
          <Plus size={16} /> Create Category
        </button>
      </div>
    </div>
  );
}
