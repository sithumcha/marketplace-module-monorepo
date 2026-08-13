const express = require('express');
const router = express.Router();
const {
  createEscrowPayment,
  releaseEscrowPayment,
  withdrawWallet,
  getAiAssist,
  getDeliveryQuote,
  getDeliveryStatus,
  runOcrVerify
} = require('../controllers/paymentController');

router.post('/escrow/deposit', createEscrowPayment);
router.post('/escrow/:transactionId/release', releaseEscrowPayment);
router.post('/wallet/withdraw', withdrawWallet);

router.get('/ai-assist', getAiAssist);
router.get('/delivery/quote', getDeliveryQuote);
router.get('/delivery/tracking/:trackingCode?', getDeliveryStatus);
router.post('/ocr-verify', runOcrVerify);

module.exports = router;
