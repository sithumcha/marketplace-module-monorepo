const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  moderateListing, 
  verifyBusiness, 
  manageUserStatus, 
  getReports,
  getAdminItems,
  createAdminItem,
  updateAdminItem,
  deleteAdminItem
} = require('../controllers/adminController');

router.get('/dashboard-stats', getDashboardStats);
router.patch('/listings/:listingId/moderate', moderateListing);
router.patch('/businesses/:businessId/verify', verifyBusiness);
router.patch('/users/:userId/status', manageUserStatus);
router.get('/reports', getReports);

// Store Item Management routes
router.get('/items', getAdminItems);
router.post('/items', createAdminItem);
router.put('/items/:itemId', updateAdminItem);
router.delete('/items/:itemId', deleteAdminItem);

module.exports = router;
