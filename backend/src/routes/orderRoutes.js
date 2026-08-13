const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, updateOrderStatus, cancelOrder } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getUserOrders);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
