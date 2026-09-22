const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getProfile,
  updateProfile,
  toggleAvailability,
  getBloodRequests,
  respondToRequest,
  getDonationHistory,
} = require('../controllers/donorController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All routes here require authentication and 'donor' role
router.use(requireAuth);
router.use(requireRole('donor'));

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/availability', toggleAvailability);
router.get('/requests', getBloodRequests);
router.put('/requests/:responseId/respond', respondToRequest);
router.get('/history', getDonationHistory);

module.exports = router;
