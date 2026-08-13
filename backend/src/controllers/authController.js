const User = require('../models/User');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      // Create user on the fly for demo if needed
      user = await User.create({
        name: email.split('@')[0] || 'Demo User',
        email,
        phone: '+1 555-0192',
        password: password || 'password123',
        role: email.includes('admin') ? 'admin' : 'user',
        isVerified: true
      });
    }
    return res.json({
      success: true,
      token: 'jwt_mock_token_abc123',
      user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      existing.name = name || existing.name;
      if (phone) existing.phone = phone;
      if (role) existing.role = role;
      await existing.save();
      console.log('✅ Updated existing User in MongoDB:', existing._id, existing.email);
      return res.status(200).json({ success: true, user: existing });
    }
    const user = await User.create({
      name: name || 'New User',
      email,
      phone: phone || '+94 77 000 0000',
      password: password || 'password123',
      role: role || 'user',
      isVerified: true
    });
    console.log('✅ Registered New User in MongoDB:', user._id, user.name, user.email);
    return res.status(201).json({ success: true, user });
  } catch (err) {
    console.error('❌ User Registration Error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId || 'demo_user_1');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { login, register, getProfile };
