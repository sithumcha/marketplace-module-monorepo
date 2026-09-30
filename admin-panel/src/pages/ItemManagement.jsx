import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit3, Trash2, Package, Tag, CheckCircle2, AlertCircle, X, Image as ImageIcon, DollarSign, Layers, Upload } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ItemManagement() {
  const [items, setItems] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'electronics',
    price: '',
    stockQuantity: '1',
    condition: 'new',
    isNegotiable: false,
    imageUrl: '',
    description: '',
    address: 'Store Main Hub'
  });

  // Save to localStorage whenever items change (safely handled for giant base64 images)
  useEffect(() => {
    try {
      if (!Array.isArray(items)) return;
      const sanitized = items.map(item => {
        if (!item || !item.images) return item;
        const cleanedImages = item.images.map(img => {
          if (img && typeof img === 'string' && img.startsWith('data:image') && img.length > 50000) {
            return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
          }
          return img;
        });
        return { ...item, images: cleanedImages };
      });
      localStorage.setItem('admin_store_items', JSON.stringify(sanitized));
    } catch (e) {
      console.warn('LocalStorage save skipped due to quota or storage restrictions:', e);
    }
  }, [items]);

  // Fetch items from backend API & clean old cached fake data from localStorage
  useEffect(() => {
    const fakeKeywords = ['Apple iPhone 15', 'Sony WH-1000XM5', 'Nike Air Jordan', 'Modern Ergonomic Office Chair'];

    const isFake = (item) => {
      if (!item || !item.title) return true;
      return fakeKeywords.some(keyword => item.title.toLowerCase().includes(keyword.toLowerCase()));
    };

    try {
      const saved = localStorage.getItem('admin_store_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(item => !isFake(item));
          localStorage.setItem('admin_store_items', JSON.stringify(cleaned));
          setItems(cleaned);
        }
      }
    } catch (e) {}

    fetch('http://localhost:5000/api/admin/items')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.items)) {
          const realItems = data.items.filter(item => !isFake(item));
          setItems(realItems);
          try {
            localStorage.setItem('admin_store_items', JSON.stringify(realItems));
          } catch (e) {}
        }
      })
      .catch(() => console.log('Using local state for Admin Item Management'));
  }, []);

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'electronics',
      price: '',
      stockQuantity: '1',
      condition: 'new',
      isNegotiable: false,
      imageUrl: '',
      description: '',
      address: 'Store Main Hub'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      price: item.price,
      stockQuantity: item.stockQuantity || 1,
      condition: item.condition || 'new',
      isNegotiable: !!item.isNegotiable,
      imageUrl: item.images && item.images[0] ? item.images[0] : '',
      description: item.description || '',
      address: item.location?.address || 'Store Main Hub'
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      category: formData.category,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      condition: formData.condition,
      isNegotiable: formData.isNegotiable,
      images: formData.imageUrl ? [formData.imageUrl] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
      description: formData.description,
      location: { address: formData.address, type: 'Point', coordinates: [0, 0] },
      status: Number(formData.stockQuantity) > 0 ? 'active' : 'sold_out',
      isStoreItem: true,
      storeBadge: 'Official Store'
    };

    if (editingItem) {
      // Update local state
      const updatedList = items.map(it => it._id === editingItem._id ? { ...it, ...payload } : it);
      setItems(updatedList);

      // Try updating via API
      try {
        await fetch(`http://localhost:5000/api/admin/items/${editingItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}
    } else {
      // Create new item
      const newItem = {
        ...payload,
        _id: `item_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setItems([newItem, ...items]);

      // Try creating via API
      try {
        const res = await fetch('http://localhost:5000/api/admin/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success && data.item) {
          setItems(prev => prev.map(it => it._id === newItem._id ? data.item : it));
        }
      } catch (err) {}
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = async (id) => {
    const result = await Swal.fire({
      title: 'Remove Item?',
      text: 'Are you sure you want to remove this item from the store?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Remove Item!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    const updatedList = items.filter(it => it._id !== id && String(it._id) !== String(id));
    setItems(updatedList);
    try {
      localStorage.setItem('admin_store_items', JSON.stringify(updatedList));
    } catch (e) {}
    try {
      await fetch(`http://localhost:5000/api/admin/items/${id}`, { method: 'DELETE' });
      Swal.fire({
        icon: 'success',
        title: 'Item Removed!',
        text: 'Item has been deleted from store inventory.',
        timer: 1800,
        showConfirmButton: false
      });
    } catch (e) {}
  };

  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems = safeItems.filter(item => {
    if (!item) return false;
    const title = item.title || '';
    const description = item.description || '';
    const category = item.category || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const totalStock = safeItems.reduce((acc, curr) => acc + (Number(curr?.stockQuantity) || 1), 0);
  const activeCount = safeItems.filter(i => i && i.status === 'active').length;

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Store Inventory & Product Management</h1>
          <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Create, edit, and manage products sold directly on the Buyer Mobile App.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          style={{
            background: 'var(--primary-gradient)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Plus size={18} /> Add New Store Item
        </button>
      </div>

      {/* Overview Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '12px', borderRadius: '10px' }}>
            <Package size={22} color="#818CF8" />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>{safeItems.length}</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Total Products</div>
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '10px' }}>
            <CheckCircle2 size={22} color="#34D399" />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>{activeCount}</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Active on App</div>
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '12px', borderRadius: '10px' }}>
            <Tag size={22} color="#FBBF24" />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>{totalStock}</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Total Units Stock</div>
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '12px', borderRadius: '10px' }}>
            <DollarSign size={22} color="#F472B6" />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>
              ${safeItems.reduce((acc, i) => acc + ((Number(i?.price) || 0) * (Number(i?.stockQuantity) || 1)), 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Inventory Valuation</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search items by title, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: '#0F172A',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 12px 10px 38px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="#9CA3AF" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              background: '#0F172A',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="groceries">Groceries</option>
            <option value="furniture">Furniture</option>
            <option value="vehicles">Vehicles</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '14px 20px', fontSize: '12px', color: '#9CA3AF', fontWeight: 700 }}>PRODUCT</th>
              <th style={{ padding: '14px 20px', fontSize: '12px', color: '#9CA3AF', fontWeight: 700 }}>CATEGORY</th>
              <th style={{ padding: '14px 20px', fontSize: '12px', color: '#9CA3AF', fontWeight: 700 }}>PRICE</th>
              <th style={{ padding: '14px 20px', fontSize: '12px', color: '#9CA3AF', fontWeight: 700 }}>STOCK</th>
              <th style={{ padding: '14px 20px', fontSize: '12px', color: '#9CA3AF', fontWeight: 700 }}>STATUS</th>
              <th style={{ padding: '14px 20px', fontSize: '12px', color: '#9CA3AF', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                      alt={item.title}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.location?.address || 'Store HQ'} • {item.condition}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', fontWeight: 600, textTransform: 'capitalize' }}>
                    {item.category}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '15px', fontWeight: 800, color: '#34D399' }}>
                  ${item.price.toLocaleString()}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: item.stockQuantity > 0 ? '#FBBF24' : '#F87171' }}>
                    {item.stockQuantity > 0 ? `${item.stockQuantity} Units` : 'Out of Stock'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    background: item.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: item.status === 'active' ? '#34D399' : '#F87171'
                  }}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    style={{ background: 'rgba(99, 102, 241, 0.15)', border: 'none', borderRadius: '6px', padding: '8px', color: '#818CF8', cursor: 'pointer', marginRight: '8px' }}
                    title="Edit Item"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: '6px', padding: '8px', color: '#F87171', cursor: 'pointer' }}
                    title="Delete Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                  No store items found matching criteria. Click "Add New Store Item" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1E293B', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                {editingItem ? 'Edit Store Item' : 'Add New Item to Store'}
              </h2>
              <X size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 700, display: 'block', marginBottom: '6px' }}>ITEM TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple MacBook Pro 16 M3 Max"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 700, display: 'block', marginBottom: '6px' }}>CATEGORY *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', background: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="groceries">Groceries</option>
                    <option value="furniture">Furniture</option>
                    <option value="vehicles">Vehicles</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 700, display: 'block', marginBottom: '6px' }}>PRICE ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 299"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', background: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 700, display: 'block', marginBottom: '6px' }}>STOCK QUANTITY *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 10"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    style={{ width: '100%', background: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 700, display: 'block', marginBottom: '6px' }}>CONDITION</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    style={{ width: '100%', background: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="new">Brand New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 700, display: 'block', marginBottom: '6px' }}>PRODUCT IMAGE UPLOAD / URL *</label>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                  <label
                    style={{
                      flex: 1,
                      background: '#0F172A',
                      border: '2px dashed #4F46E5',
                      borderRadius: '10px',
                      padding: '14px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#818CF8',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Upload size={20} color="#818CF8" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Click to Upload File from Computer</span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Supports PNG, JPG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {formData.imageUrl && (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={formData.imageUrl}
                        alt="Uploaded Preview"
                        style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #818CF8' }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Remove Image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Or paste Image URL (https://...)"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    style={{ width: '100%', background: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 700, display: 'block', marginBottom: '6px' }}>DESCRIPTION</label>
                <textarea
                  rows="3"
                  placeholder="Provide product details, specifications, warranty..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 18px', color: '#9CA3AF', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: 'var(--primary-gradient)', border: 'none', borderRadius: '8px', padding: '10px 24px', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                >
                  {editingItem ? 'Update Store Item' : 'Publish Item to Store App'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
