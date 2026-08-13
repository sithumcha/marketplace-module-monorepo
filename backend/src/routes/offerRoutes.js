const express = require('express');
const router = express.Router();
const { createOffer, respondToOffer } = require('../controllers/offerController');

router.post('/', createOffer);
router.post('/:offerId/respond', respondToOffer);

module.exports = router;
