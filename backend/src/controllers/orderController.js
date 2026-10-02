const Order = require('../models/Order');
const Listing = require('../models/Listing');

const createOrder = async (req, res) => {
  try {
    const { orderId, itemTitle, price, quantity, image, status, buyerName, buyerEmail, shippingAddress, paymentMethod, listingId } = req.body;
    
    const orderedQty = Number(quantity) || 1;

    const newOrder = await Order.create({
      orderId: orderId || `ORD-${Date.now().toString().substring(5)}`,
      itemTitle: itemTitle || 'Marketplace Product',
      price: Number(price) || 0,
      quantity: orderedQty,
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      status: status || 'Processing',
      buyerName: buyerName || 'Customer',
      buyerEmail: buyerEmail || 'user@marketplace.lk',
      shippingAddress: shippingAddress || 'No. 45, Galle Road, Colombo 03',
      paymentMethod: paymentMethod || 'CARD'
    });

    // Automatically deduct stock in MongoDB for matching Listing
    try {
      let listing;
      const mongoose = require('mongoose');
      if (listingId && mongoose.Types.ObjectId.isValid(listingId)) {
        listing = await Listing.findById(listingId);
      }
      if (!listing && itemTitle) {
        listing = await Listing.findOne({ title: { $regex: new RegExp(itemTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } });
      }
      if (!listing) {
        listing = await Listing.findOne();
      }

      if (listing) {
        const currentStock = listing.stockQuantity || 10;
        const newStock = Math.max(0, currentStock - orderedQty);
        listing.stockQuantity = newStock;
        if (newStock === 0) listing.status = 'sold';
        await listing.save();
        console.log(`📉 Auto-decreased Stock for "${listing.title}": ${newStock} units remaining in MongoDB`);
      }
    } catch (stockErr) {
      console.error('⚠️ Could not update stock:', stockErr.message);
    }

    // Send automated order receipt email
    const { sendOrderReceiptEmail } = require('../services/emailService');
    sendOrderReceiptEmail(newOrder);

    console.log('✅ New MongoDB Order Created:', newOrder.orderId, newOrder.itemTitle);
    return res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error('❌ Error creating order:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};
    if (email) {
      query.buyerEmail = { $regex: new RegExp(email.trim(), 'i') };
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (err) {
    console.error('❌ Error fetching orders:', err.message);
    return res.status(500).json({ success: false, message: err.message, orders: [] });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let order;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    order.status = 'Cancelled';
    await order.save();

    // Restore Stock in MongoDB for the matching listing
    try {
      let listing;
      if (order.listingId && mongoose.Types.ObjectId.isValid(order.listingId)) {
        listing = await Listing.findById(order.listingId);
      }
      if (!listing && order.itemTitle) {
        listing = await Listing.findOne({ title: { $regex: new RegExp(order.itemTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } });
      }

      if (listing) {
        const restoreQty = order.quantity || 1;
        listing.stockQuantity += restoreQty;
        if (listing.status === 'sold') listing.status = 'active';
        await listing.save();
        console.log(`♻️ Restored Stock for "${listing.title}": ${listing.stockQuantity} units in MongoDB`);
      }
    } catch (stockErr) {
      console.error('⚠️ Could not restore stock:', stockErr.message);
    }

    console.log(`🚫 Order Cancelled: ${order.orderId}`);
    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let deleted;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Order.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Order.findOneAndDelete({ orderId: id });
    }
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    console.log(`🗑️ Order Deleted from MongoDB: ${id}`);
    return res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let order;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order invoice not found' });
    }

    const invoiceData = {
      invoiceNo: order.orderId,
      issueDate: order.createdAt || new Date(),
      status: order.status,
      buyer: {
        name: order.buyerName,
        email: order.buyerEmail,
        address: order.shippingAddress
      },
      payment: {
        method: order.paymentMethod,
        currency: 'LKR'
      },
      items: [
        {
          title: order.itemTitle,
          quantity: order.quantity || 1,
          unitPrice: order.price,
          totalPrice: order.price * (order.quantity || 1)
        }
      ],
      subtotal: order.price * (order.quantity || 1),
      shippingFee: 500,
      grandTotal: (order.price * (order.quantity || 1)) + 500
    };

const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let order;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Dynamic Live Tracking Status & Map Checkpoints
    const status = order.status || 'Processing';
    const trackingInfo = {
      orderId: order.orderId,
      status,
      courier: 'Marketplace Express Logistics',
      driverName: 'Kamal Perera',
      driverPhone: '+94 71 889 2200',
      vehicleNo: 'WP CAD-4521',
      estimatedDelivery: 'Tomorrow by 4:00 PM',
      currentLocationName: status === 'Delivered' ? 'Delivered to Customer' : status === 'Dispatched' ? 'In Transit - Kandy Road Hub' : 'Sorting Facility - Colombo 03',
      coordinates: {
        lat: 6.9271,
        lng: 79.8612
      },
      checkpoints: [
        { title: 'Order Placed & Confirmed', time: '10:15 AM', completed: true },
        { title: 'Picked up by Courier', time: '02:30 PM', completed: status !== 'Processing' },
        { title: 'In Transit to Regional Distribution Hub', time: '05:45 PM', completed: status === 'Dispatched' || status === 'Delivered' },
        { title: 'Out for Final Delivery', time: 'Expected 09:00 AM', completed: status === 'Delivered' },
        { title: 'Delivered & Handed to Recipient', time: 'Expected 04:00 PM', completed: status === 'Delivered' }
      ]
    };

    return res.json({ success: true, tracking: trackingInfo });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getOrderInvoice,
  getOrderTracking
};
