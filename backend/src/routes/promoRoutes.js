const express = require('express');
const router = express.Router();
const { getPromoCodes, createPromoCode, deletePromoCode, togglePromoStatus, updatePromoCode } = require('../controllers/promoController');

router.get('/', getPromoCodes);
router.post('/', createPromoCode);
router.put('/:id', updatePromoCode);
router.patch('/:id', updatePromoCode);
router.delete('/:id', deletePromoCode);
router.patch('/:id/toggle', togglePromoStatus);

module.exports = router;

