const express = require('express');
const router = express.Router();
const { addReview, getListingReviews } = require('../controllers/reviewController');

router.post('/', addReview);
router.get('/:listingId', getListingReviews);

module.exports = router;
