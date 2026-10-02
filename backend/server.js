const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const env = require('./src/config/env');
const chatSocketHandler = require('./src/sockets/chatSocket');

const authRoutes = require('./src/routes/authRoutes');
const listingRoutes = require('./src/routes/listingRoutes');
const businessRoutes = require('./src/routes/businessRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const offerRoutes = require('./src/routes/offerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const auctionRoutes = require('./src/routes/auctionRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const promoRoutes = require('./src/routes/promoRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io initialization
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});

chatSocketHandler(io);
app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

const { getUsers } = require('./src/controllers/adminController');

// API Endpoints
app.use('/api/auth', authRoutes);
app.get('/api/users', getUsers);
app.use('/api/listings', listingRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    module: 'MARKETPLACE_MODULE_BACKEND',
    services: {
      database: 'connected',
      socket: 'active'
    }
  });
});

const PORT = env.PORT;
server.listen(PORT, () => {
  console.log(`🚀 Marketplace Backend Server running on port ${PORT}`);
});
