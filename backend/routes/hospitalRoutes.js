const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getInventory,
  updateInventory,
  createBloodRequest,
  getHospitalRequests,
  getDonorResponses,
} = require('../controllers/hospitalController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All routes here require authentication and 'hospital' role
router.use(requireAuth);
router.use(requireRole('hospital'));

router.get('/dashboard', getDashboard);
router.get('/inventory', getInventory);
router.put('/inventory', updateInventory);
router.post('/requests', createBloodRequest);
router.get('/requests', getHospitalRequests);
router.get('/responses', getDonorResponses);

module.exports = router;
