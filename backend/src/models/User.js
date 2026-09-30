const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
  role: { type: String, enum: ['user', 'buyer', 'seller', 'business_owner', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  location: {
    address: { type: String, default: 'New York, NY' },
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [-73.985130, 40.748817] } // [lng, lat]
  },
  walletBalance: { type: Number, default: 150.00 },
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  savedAddresses: [{
    id: { type: String },
    label: { type: String },
    fullName: { type: String },
    addressLine: { type: String },
    city: { type: String },
    phone: { type: String }
  }],
  bankPayoutDetails: {
    bankName: { type: String, default: 'Bank of Ceylon (BOC)' },
    accountHolder: { type: String, default: 'Account Holder' },
    accountNumber: { type: String, default: '884920194821' },
    branch: { type: String, default: 'Colombo Main Branch' },
    swiftCode: { type: String, default: 'BCEYLKLX' }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
