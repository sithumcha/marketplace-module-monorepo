const Category = require('../models/Category');

const defaultCategories = [
  { name: 'Electronics', slug: 'electronics', icon: 'cpu', isBusinessCategory: false, itemCount: 42 },
  { name: 'Fashion & Clothing', slug: 'fashion', icon: 'shopping-bag', isBusinessCategory: false, itemCount: 28 },
  { name: 'Groceries & Fresh', slug: 'groceries', icon: 'apple', isBusinessCategory: false, itemCount: 35 },
  { name: 'Furniture & Living', slug: 'furniture', icon: 'sofa', isBusinessCategory: false, itemCount: 19 },
  { name: 'Vehicles & Motors', slug: 'vehicles', icon: 'car', isBusinessCategory: false, itemCount: 14 },
  { name: 'Business Services & Hubs', slug: 'business-services', icon: 'building', isBusinessCategory: true, itemCount: 22 },
  { name: 'Sports & Outdoors', slug: 'sports', icon: 'activity', isBusinessCategory: false, itemCount: 16 }
];

const getCategories = async (req, res) => {
  try {
    let categories = await Category.find().sort({ createdAt: -1 });
    if (categories.length === 0) {
      // Seed initial default categories into MongoDB
      categories = await Category.insertMany(defaultCategories);
      console.log('🌱 Seeded Default Categories into MongoDB');
    }
    return res.json({ success: true, categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, categories: defaultCategories });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, icon, isBusinessCategory } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const cleanSlug = (slug || name).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    let existing = await Category.findOne({ slug: cleanSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this slug already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: cleanSlug,
      icon: icon || 'Tag',
      isBusinessCategory: Boolean(isBusinessCategory),
      itemCount: 0
    });

    console.log(`✅ New Category Created in MongoDB: ${category.name}`);
    return res.status(201).json({ success: true, category });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, isBusinessCategory } = req.body;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    if (name) category.name = name.trim();
    if (slug) category.slug = slug.toLowerCase().trim();
    if (icon) category.icon = icon;
    if (isBusinessCategory !== undefined) category.isBusinessCategory = Boolean(isBusinessCategory);

    await category.save();
    return res.json({ success: true, category });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let deleted;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Category.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Category.findOneAndDelete({ slug: id });
    }
    console.log(`🗑️ Category Deleted from MongoDB: ${id}`);
    return res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
