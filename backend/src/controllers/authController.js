const User = require('../models/User');
const { generateToken } = require('../middlewares/authMiddleware');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found in database. Please register first.' });
    }

    if (user.password && user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let normalizedRole = 'user';
    if (role) {
      const r = String(role).toLowerCase();
      if (r.includes('buyer')) normalizedRole = 'buyer';
      else if (r.includes('seller')) normalizedRole = 'seller';
      else if (r.includes('business')) normalizedRole = 'business_owner';
      else if (r.includes('admin')) normalizedRole = 'admin';
      else if (['user', 'buyer', 'seller', 'business_owner', 'admin'].includes(r)) normalizedRole = r;
    }

    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      user.name = name || user.name;
      if (phone) user.phone = phone;
      user.role = normalizedRole;
      if (password) user.password = password;
      await user.save();
    } else {
      user = await User.create({
        name: name || 'New User',
        email: cleanEmail,
        phone: phone || '+94 77 000 0000',
        password: password || 'password123',
        role: normalizedRole,
        isVerified: true
      });
    }

    const token = generateToken(user);
    console.log('✅ Auth Token Issued for User:', user._id, user.email, 'Role:', user.role);

    return res.status(200).json({ success: true, token, user });
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

const updateAddresses = async (req, res) => {
  try {
    const { email, addresses } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOneAndUpdate(
      { email },
      { savedAddresses: addresses || [] },
      { new: true }
    );
    return res.json({ success: true, user, savedAddresses: user ? user.savedAddresses : [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateBankPayout = async (req, res) => {
  try {
    const { email, bankPayoutDetails } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOneAndUpdate(
      { email },
      { bankPayoutDetails },
      { new: true }
    );
    return res.json({ success: true, user, bankPayoutDetails: user ? user.bankPayoutDetails : {} });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { login, register, getProfile, updateAddresses, updateBankPayout };


