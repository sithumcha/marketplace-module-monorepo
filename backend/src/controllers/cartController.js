const Cart = require('../models/Cart');

// Fetch user cart from MongoDB
const getCart = async (req, res) => {
  try {
    const { email } = req.query;
    const userEmail = email || 'sithum@marketplace.lk';
    
    let cart = await Cart.findOne({ userEmail });
    if (!cart) {
      cart = await Cart.create({ userEmail, items: [] });
    }
    
    return res.json({ success: true, cart: cart.items, userEmail: cart.userEmail });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Sync / Update entire cart in MongoDB
const syncCart = async (req, res) => {
  try {
    const { userEmail, items } = req.body;
    const email = userEmail || 'sithum@marketplace.lk';

    const cart = await Cart.findOneAndUpdate(
      { userEmail: email },
      { items, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    console.log(`🛒 MongoDB Cart updated for ${email}: ${cart.items.length} items saved`);
    return res.json({ success: true, cart: cart.items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Clear cart in MongoDB
const clearCart = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const email = userEmail || 'sithum@marketplace.lk';

    await Cart.findOneAndUpdate(
      { userEmail: email },
      { items: [], updatedAt: new Date() },
      { new: true, upsert: true }
    );

    console.log(`🧹 MongoDB Cart cleared for ${email}`);
    return res.json({ success: true, message: 'Cart cleared in database' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCart, syncCart, clearCart };
