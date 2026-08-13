const express = require('express');
const router = express.Router();
const { getListings, getListingById, createListing, updateListingStatus, updateListingStock } = require('../controllers/listingController');

router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', createListing);
router.patch('/:id/status', updateListingStatus);
router.patch('/:id/stock', updateListingStock);

module.exports = router;
