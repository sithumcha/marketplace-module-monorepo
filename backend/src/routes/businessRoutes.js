const express = require('express');
const router = express.Router();
const { getBusinesses, getBusinessById, registerBusiness, addReview } = require('../controllers/businessController');

router.get('/', getBusinesses);
router.get('/:id', getBusinessById);
router.post('/', registerBusiness);
router.post('/reviews', addReview);

module.exports = router;
