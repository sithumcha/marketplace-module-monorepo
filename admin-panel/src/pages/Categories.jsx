import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Layers, Tag, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [isBizCat, setIsBizCat] = useState(false);

  const defaultCategories = [
    { _id: 'cat_1', name: 'Electronics', slug: 'electronics', icon: 'cpu', isBusinessCategory: false, itemCount: 42 },
    { _id: 'cat_2', name: 'Fashion & Clothing', slug: 'fashion', icon: 'shopping-bag', isBusinessCategory: false, itemCount: 28 },
    { _id: 'cat_3', name: 'Groceries & Fresh', slug: 'groceries', icon: 'apple', isBusinessCategory: false, itemCount: 35 },
    { _id: 'cat_4', name: 'Furniture & Living', slug: 'furniture', icon: 'sofa', isBusinessCategory: false, itemCount: 19 },
    { _id: 'cat_5', name: 'Vehicles & Motors', slug: 'vehicles', icon: 'car', isBusinessCategory: false, itemCount: 14 },
    { _id: 'cat_6', name: 'Business Services & Hubs', slug: 'business-services', icon: 'building', isBusinessCategory: true, itemCount: 22 },
    { _id: 'cat_7', name: 'Sports & Outdoors', slug: 'sports', icon: 'activity', isBusinessCategory: false, itemCount: 16 }
  ];

  const fetchCategories = () => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          setCategories(defaultCategories);
        }
      })
      .catch(() => setCategories(defaultCategories));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Name',
        text: 'Please enter a category title.'
      });
    }

    const newCat = {
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''),
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
        setCategories(prev => [data.category, ...prev]);
        Swal.fire({
          icon: 'success',
          title: 'Category Created!',
          text: `Category "${newCat.name}" added to MongoDB.`,
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        setCategories(prev => [{ ...newCat, _id: `cat_${Date.now()}` }, ...prev]);
        Swal.fire({
          icon: 'success',
          title: 'Category Created!',
          text: `Category "${newCat.name}" added.`,
          timer: 1800,
          showConfirmButton: false
        });
      }
    } catch (e) {
      setCategories(prev => [{ ...newCat, _id: `cat_${Date.now()}` }, ...prev]);
    }
    setNewCatName('');
  };

  const handleDeleteCategory = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Category?',
      text: `Are you sure you want to delete category "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setCategories(prev => prev.filter(c => c._id !== id && c.slug !== id));
    try {
      await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Category deleted successfully.',
        timer: 1800,
        showConfirmButton: false
      });
    } catch (e) {}
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-title)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} color="#6366F1" /> Category & Taxonomy Management
        </h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Slug</th>
              <th>Classification Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id || cat.slug}>
                <td style={{ fontWeight: 700, color: 'var(--text-title)' }}>{cat.name}</td>
                <td style={{ color: '#6366F1', fontFamily: 'monospace', fontWeight: 600 }}>/{cat.slug}</td>
                <td>
                  <span className={`badge ${cat.isBusinessCategory ? 'badge-pending' : 'badge-verified'}`}>
                    {cat.isBusinessCategory ? 'Business Directory' : 'Standard Item'}
                  </span>
                </td>
                <td>
                  <button 
                    className="glass-btn btn-danger" 
                    style={{ padding: '6px 10px' }}
                    onClick={() => handleDeleteCategory(cat._id || cat.slug, cat.name)}
                    title="Delete category"
                  >
                    <Trash2 size={14} color="#EF4444" /> Delete
                  </button>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No categories found. Create one using the form on the right.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-title)' }}>Add New Category</h3>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Category Title</label>
          <input
            type="text"
            placeholder="e.g. Health & Wellness"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-title)',
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
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="bizCatToggle" style={{ fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer' }}>
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
