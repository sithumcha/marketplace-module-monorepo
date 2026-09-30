const Cart = require('../models/Cart');

// Fetch user cart from MongoDB
const getCart = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.json({ success: true, cart: [] });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    
    let cart = await Cart.findOne({ userEmail: cleanEmail });
    if (!cart) {
      cart = await Cart.create({ userEmail: cleanEmail, items: [] });
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
    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'userEmail required to sync cart' });
    }
    const cleanEmail = String(userEmail).trim().toLowerCase();

    const cart = await Cart.findOneAndUpdate(
      { userEmail: cleanEmail },
      { items: items || [], updatedAt: new Date() },
      { new: true, upsert: true }
    );

    console.log(`🛒 MongoDB Cart updated for ${cleanEmail}: ${cart.items.length} items saved`);

    const io = req.app ? req.app.get('io') : null;
    if (io) {
      io.emit('cart_updated', { userEmail: cleanEmail, cart: cart.items });
    }

    return res.json({ success: true, cart: cart.items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Clear cart in MongoDB
const clearCart = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const email = userEmail || (req.user ? req.user.email : null);
    if (!email) {
      return res.status(400).json({ success: false, message: 'userEmail required to clear cart' });
    }
    const cleanEmail = String(email).trim().toLowerCase();

    await Cart.findOneAndUpdate(
      { userEmail: cleanEmail },
      { items: [], updatedAt: new Date() },
      { new: true, upsert: true }
    );

    console.log(`🧹 MongoDB Cart cleared for ${cleanEmail}`);

    const io = req.app ? req.app.get('io') : null;
    if (io) {
      io.emit('cart_updated', { userEmail: cleanEmail, cart: [] });
    }

    return res.json({ success: true, message: 'Cart cleared in database' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Merge guest local cart into logged-in user's MongoDB cart
const mergeCart = async (req, res) => {
  try {
    const { userEmail, localCart } = req.body;
    const email = userEmail || (req.user ? req.user.email : null);

    if (!email) {
      return res.status(400).json({ success: false, message: 'User email is required to merge cart' });
    }
    const cleanEmail = String(email).trim().toLowerCase();

    let cart = await Cart.findOne({ userEmail: cleanEmail });
    if (!cart) {
      cart = await Cart.create({ userEmail: cleanEmail, items: [] });
    }

    const mergedItems = [...cart.items];

    if (Array.isArray(localCart) && localCart.length > 0) {
      for (const localItem of localCart) {
        const itemLId = String(localItem.listingId || localItem._id || localItem.id);
        const existingIndex = mergedItems.findIndex(i => String(i.listingId) === itemLId);

        if (existingIndex !== -1) {
          mergedItems[existingIndex].quantity = (mergedItems[existingIndex].quantity || 1) + (localItem.quantity || 1);
        } else {
          mergedItems.push({
            listingId: itemLId,
            itemTitle: localItem.itemTitle || localItem.title || 'Product Item',
            price: Number(localItem.price) || 0,
            quantity: Number(localItem.quantity) || 1,
            image: localItem.image || (localItem.images && localItem.images.length > 0 ? localItem.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200')
          });
        }
      }

      cart.items = mergedItems;
      cart.updatedAt = new Date();
      await cart.save();
      console.log(`🔀 Merged Guest Cart with MongoDB Cart for ${cleanEmail}: ${cart.items.length} total items`);
    }

    const io = req.app ? req.app.get('io') : null;
    if (io) {
      io.emit('cart_updated', { userEmail: cleanEmail, cart: cart.items });
    }

    return res.json({ success: true, cart: cart.items });
  } catch (err) {
    console.error('Error merging cart:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCart, syncCart, clearCart, mergeCart };
