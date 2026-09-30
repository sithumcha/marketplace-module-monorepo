const express = require('express');
const router = express.Router();
const { getCart, syncCart, clearCart, mergeCart } = require('../controllers/cartController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', getCart);
router.post('/sync', syncCart);
router.post('/clear', clearCart);
router.post('/merge', mergeCart);

module.exports = router;
