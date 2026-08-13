const express = require('express');
const router = express.Router();
const { createAuction, placeBid, getAuctionDetails } = require('../controllers/auctionController');

router.post('/', createAuction);
router.post('/:auctionId/bid', placeBid);
router.get('/:auctionId', getAuctionDetails);

module.exports = router;
