const User = require('../models/User');
const Hospital = require('../models/Hospital');
const BloodInventory = require('../models/BloodInventory');
const BloodRequest = require('../models/BloodRequest');
const DonorResponse = require('../models/DonorResponse');
const { matchAndNotifyDonors } = require('../services/matchingService');

// Helper to get hospital by logged in user
const getHospitalByUser = async (userId) => {
  return await Hospital.findOne({ userId });
};

// GET /api/hospital/dashboard
const getDashboard = async (req, res) => {
  try {
    const hospital = await getHospitalByUser(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    // 1. Calculate total blood units
    const inventory = await BloodInventory.find({ hospitalId: hospital._id });
    const totalUnits = inventory.reduce((sum, item) => sum + (item.units || 0), 0);

    // 2. Active blood requests count
    const activeRequests = await BloodRequest.countDocuments({
      hospitalId: hospital._id,
      status: 'Open',
    });

    // 3. Pending donor responses count
    const pendingResponses = await DonorResponse.countDocuments({
      hospitalId: hospital._id,
      status: 'Pending',
    });

    // 4. Recent 3 requests for quick preview
    const recentRequests = await BloodRequest.find({ hospitalId: hospital._id })
      .sort({ createdAt: -1 })
      .limit(3);

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
    const hospital = await getHospitalByUser(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    let inventory = await BloodInventory.find({ hospitalId: hospital._id });

    // Ensure all 8 blood groups exist
    const inventoryMap = new Map(inventory.map((item) => [item.bloodGroup, item]));
    const completeInventory = [];

    for (const bg of bloodGroups) {
      if (inventoryMap.has(bg)) {
        completeInventory.push(inventoryMap.get(bg));
      } else {
        const newItem = await BloodInventory.create({
          hospitalId: hospital._id,
          bloodGroup: bg,
          units: 0,
          lastUpdated: new Date(),
        });
        completeInventory.push(newItem);
      }
    }

    res.json(completeInventory);
  } catch (error) {
    console.error('getInventory error:', error);
    res.status(500).json({ message: 'Error fetching blood inventory.' });
  }
};

// PUT /api/hospital/inventory
const updateInventory = async (req, res) => {
  try {
    const hospital = await getHospitalByUser(req.user.id);
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

    const updatedItem = await BloodInventory.findOneAndUpdate(
      { hospitalId: hospital._id, bloodGroup },
      { units: Math.max(0, Number(units)), lastUpdated: new Date() },
      { new: true, upsert: true }
    );

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
    const hospital = await getHospitalByUser(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    const { patientName, bloodGroup, units, urgency, requiredDate, notes } = req.body;

    if (!patientName || !bloodGroup || !units || !requiredDate) {
      return res.status(400).json({
        message: 'Patient name, blood group, units, and required date are required.',
      });
    }

    // 1. Create request record in MongoDB
    const newRequest = await BloodRequest.create({
      hospitalId: hospital._id,
      hospitalName: hospital.hospitalName,
      city: hospital.city,
      patientName: patientName.trim(),
      bloodGroup,
      units: Number(units),
      urgency: urgency || 'Normal',
      requiredDate,
      notes: notes ? notes.trim() : '',
      status: 'Open',
    });

    // 2. Automatic matching & notification in MongoDB
    // Finds donors matching bloodGroup, same city, availability=true, eligibility=Eligible
    const matchResult = await matchAndNotifyDonors(newRequest);

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
    const hospital = await getHospitalByUser(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    const requests = await BloodRequest.find({ hospitalId: hospital._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('getHospitalRequests error:', error);
    res.status(500).json({ message: 'Error fetching hospital requests.' });
  }
};

// GET /api/hospital/responses
const getDonorResponses = async (req, res) => {
  try {
    const hospital = await getHospitalByUser(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found.' });
    }

    const responses = await DonorResponse.find({ hospitalId: hospital._id })
      .populate('donorId')
      .populate('requestId')
      .sort({ createdAt: -1 });

    const formatted = responses.map((dr) => {
      const donor = dr.donorId;
      const bloodReq = dr.requestId;
      return {
        _id: dr._id,
        requestId: bloodReq ? bloodReq._id : dr.requestId,
        donorId: donor ? donor._id : dr.donorId,
        hospitalId: dr.hospitalId,
        status: dr.status,
        responseDate: dr.responseDate,
        createdAt: dr.createdAt,
        donorName: donor ? donor.fullName : 'Anonymous Donor',
        donorBloodGroup: donor ? donor.bloodGroup : 'N/A',
        donorCity: donor ? donor.city : 'N/A',
        donorPhone: donor ? donor.phone : 'N/A',
        request: bloodReq || null,
      };
    });

    res.json(formatted);
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
