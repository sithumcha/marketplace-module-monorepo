const express = require('express');
const router = express.Router();
const { login, register, getProfile, updateAddresses, updateBankPayout } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.get('/profile/:userId?', getProfile);
router.post('/addresses', updateAddresses);
router.post('/bank-payout', updateBankPayout);

module.exports = router;
