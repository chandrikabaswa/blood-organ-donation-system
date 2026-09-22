const mockStore = require('../services/mockStore');
const { matchAndNotifyDonors } = require('../services/matchingService');

// Helper to get hospital by logged in user
const getHospitalByUser = (userId) => {
  return mockStore.findHospitalByUserId(userId);
};

// GET /api/hospital/dashboard
const getDashboard = async (req, res) => {
  try {
    const hospital = getHospitalByUser(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    // 1. Calculate total blood units
    const inventory = mockStore.getInventory(hospital._id);
    const totalUnits = inventory.reduce((sum, item) => sum + (item.units || 0), 0);

    // 2. Active blood requests count
    const requests = mockStore.getRequestsByHospital(hospital._id);
    const activeRequests = requests.filter((r) => r.status === 'Open').length;

    // 3. Pending donor responses count
    const responses = mockStore.getResponsesForHospital(hospital._id);
    const pendingResponses = responses.filter((r) => r.status === 'Pending').length;

    // 4. Recent 3 requests for quick preview
    const recentRequests = requests.slice(0, 3);

    res.json({
      hospitalName: hospital.hospitalName,
      city: hospital.city,
      totalUnits,
      activeRequests,
      pendingResponses,
      recentRequests,
    });
  } catch (error) {
    console.error('getDashboard error:', error);
    res.status(500).json({ message: 'Error fetching hospital dashboard.' });
  }
};

// GET /api/hospital/inventory
const getInventory = async (req, res) => {
  try {
    const hospital = getHospitalByUser(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    let inventory = mockStore.getInventory(hospital._id);

    // Ensure all 8 blood groups exist
    const inventoryMap = new Map(inventory.map((item) => [item.bloodGroup, item]));
    const completeInventory = bloodGroups.map((bg) => {
      if (inventoryMap.has(bg)) {
        return inventoryMap.get(bg);
      }
      return mockStore.updateInventoryUnit(hospital._id, bg, 0);
    });

    res.json(completeInventory);
  } catch (error) {
    console.error('getInventory error:', error);
    res.status(500).json({ message: 'Error fetching blood inventory.' });
  }
};

// PUT /api/hospital/inventory
const updateInventory = async (req, res) => {
  try {
    const hospital = getHospitalByUser(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    const { bloodGroup, units } = req.body;

    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({ message: 'Invalid blood group.' });
    }

    if (units === undefined || isNaN(Number(units)) || Number(units) < 0) {
      return res.status(400).json({ message: 'Units must be a non-negative number.' });
    }

    const updatedItem = mockStore.updateInventoryUnit(hospital._id, bloodGroup, units);

    res.json({
      message: `Inventory updated for ${bloodGroup}`,
      item: updatedItem,
    });
  } catch (error) {
    console.error('updateInventory error:', error);
    res.status(500).json({ message: 'Error updating blood inventory.' });
  }
};

// POST /api/hospital/requests
const createBloodRequest = async (req, res) => {
  try {
    const hospital = getHospitalByUser(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    const { patientName, bloodGroup, units, urgency, requiredDate, notes } = req.body;

    if (!patientName || !bloodGroup || !units || !requiredDate) {
      return res.status(400).json({
        message: 'Patient name, blood group, units, and required date are required.',
      });
    }

    // 1. Create request record
    const newRequest = mockStore.createRequest({
      hospitalId: hospital._id,
      hospitalName: hospital.hospitalName,
      city: hospital.city,
      patientName: patientName.trim(),
      bloodGroup,
      units: Number(units),
      urgency: urgency || 'Normal',
      requiredDate,
      notes: notes ? notes.trim() : '',
    });

    // 2. Automatic matching & notification
    // Finds donors matching bloodGroup, same city, availability=ON, eligibility=Eligible
    const matchResult = matchAndNotifyDonors(newRequest);

    res.status(201).json({
      message: `Request created successfully. Matched ${matchResult.matchedCount} eligible donor(s) in ${hospital.city}.`,
      request: newRequest,
      matchedDonorsCount: matchResult.matchedCount,
    });
  } catch (error) {
    console.error('createBloodRequest error:', error);
    res.status(500).json({ message: 'Error creating blood request.' });
  }
};

// GET /api/hospital/requests
const getHospitalRequests = async (req, res) => {
  try {
    const hospital = getHospitalByUser(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    const requests = mockStore.getRequestsByHospital(hospital._id);
    res.json(requests);
  } catch (error) {
    console.error('getHospitalRequests error:', error);
    res.status(500).json({ message: 'Error fetching hospital requests.' });
  }
};

// GET /api/hospital/responses
const getDonorResponses = async (req, res) => {
  try {
    const hospital = getHospitalByUser(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    const responses = mockStore.getResponsesForHospital(hospital._id);
    res.json(responses);
  } catch (error) {
    console.error('getDonorResponses error:', error);
    res.status(500).json({ message: 'Error fetching donor responses.' });
  }
};

module.exports = {
  getDashboard,
  getInventory,
  updateInventory,
  createBloodRequest,
  getHospitalRequests,
  getDonorResponses,
};
