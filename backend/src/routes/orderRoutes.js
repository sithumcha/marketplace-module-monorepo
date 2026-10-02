const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, updateOrderStatus, cancelOrder, deleteOrder, getOrderInvoice, getOrderTracking } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id/invoice', getOrderInvoice);
router.get('/:id/tracking', getOrderTracking);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);
router.delete('/:id', deleteOrder);

module.exports = router;
