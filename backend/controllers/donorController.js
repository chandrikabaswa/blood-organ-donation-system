const mockStore = require('../services/mockStore');
const { calculateEligibility } = require('../services/eligibilityService');

// Helper to get donor by current logged in user
const getDonorByUser = (userId) => {
  return mockStore.findDonorByUserId(userId);
};

// GET /api/donor/dashboard
const getDashboard = async (req, res) => {
  try {
    const donor = getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    // Get all responses to count pending requests
    const responses = mockStore.getResponsesForDonor(donor._id);
    const pendingCount = responses.filter((r) => r.status === 'Pending').length;

    res.json({
      donorName: donor.fullName,
      bloodGroup: donor.bloodGroup,
      eligibility: donor.eligibility,
      isAvailable: donor.isAvailable,
      pendingRequestsCount: pendingCount,
      lastDonationDate: donor.lastDonationDate,
      city: donor.city,
    });
  } catch (error) {
    console.error('getDashboard error:', error);
    res.status(500).json({ message: 'Error fetching donor dashboard.' });
  }
};

// GET /api/donor/profile
const getProfile = async (req, res) => {
  try {
    const donor = getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    res.json({ donor, email: req.user.email });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: 'Error fetching donor profile.' });
  }
};

// PUT /api/donor/profile
const updateProfile = async (req, res) => {
  try {
    const donor = getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    const {
      fullName,
      dob,
      gender,
      phone,
      city,
      weight,
      lastDonationDate,
      takingMedication,
      chronicDisease,
      otherDiseaseName,
      recentSurgery,
      recentFever,
    } = req.body;

    // RULE: Blood Group is STRICTLY READ-ONLY and cannot be changed after registration.
    // Notice we do NOT accept or update bloodGroup here!

    const healthData = {
      weight: weight !== undefined ? Number(weight) : donor.weight,
      lastDonationDate: lastDonationDate !== undefined ? lastDonationDate : donor.lastDonationDate,
      takingMedication: takingMedication || donor.takingMedication,
      chronicDisease: chronicDisease || donor.chronicDisease,
      otherDiseaseName: otherDiseaseName !== undefined ? otherDiseaseName : donor.otherDiseaseName,
      recentSurgery: recentSurgery || donor.recentSurgery,
      recentFever: recentFever || donor.recentFever,
    };

    // Recalculate simplified eligibility automatically
    const eligibility = calculateEligibility(healthData);

    const updates = {
      fullName: fullName ? fullName.trim() : donor.fullName,
      dob: dob || donor.dob,
      gender: gender || donor.gender,
      phone: phone ? phone.trim() : donor.phone,
      city: city ? city.trim() : donor.city,
      ...healthData,
      eligibility,
    };

    const updatedDonor = mockStore.updateDonor(donor._id, updates);

    // Also update User record name if changed
    if (fullName && fullName.trim() !== req.user.name) {
      const user = mockStore.findUserById(req.user.id);
      if (user) user.name = fullName.trim();
    }

    res.json({
      message: 'Profile updated successfully',
      donor: updatedDonor,
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Error updating donor profile.' });
  }
};

// PUT /api/donor/availability
const toggleAvailability = async (req, res) => {
  try {
    const donor = getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    const { isAvailable } = req.body;
    const newStatus = typeof isAvailable === 'boolean' ? isAvailable : !donor.isAvailable;

    const updated = mockStore.updateDonor(donor._id, { isAvailable: newStatus });

    res.json({
      message: `Availability updated to ${newStatus ? 'ON' : 'OFF'}`,
      isAvailable: updated.isAvailable,
    });
  } catch (error) {
    console.error('toggleAvailability error:', error);
    res.status(500).json({ message: 'Error updating availability.' });
  }
};

// GET /api/donor/requests
const getBloodRequests = async (req, res) => {
  try {
    const donor = getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    const responses = mockStore.getResponsesForDonor(donor._id);

    // Format for clean display
    const formatted = responses.map((r) => ({
      responseId: r._id,
      status: r.status,
      responseDate: r.responseDate,
      hospitalName: r.request ? r.request.hospitalName : 'Hospital',
      bloodGroup: r.request ? r.request.bloodGroup : donor.bloodGroup,
      units: r.request ? r.request.units : 1,
      city: r.request ? r.request.city : donor.city,
      urgency: r.request ? r.request.urgency : 'Normal',
      requiredDate: r.request ? r.request.requiredDate : null,
      notes: r.request ? r.request.notes : '',
      createdAt: r.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('getBloodRequests error:', error);
    res.status(500).json({ message: 'Error fetching donor blood requests.' });
  }
};

// PUT /api/donor/requests/:responseId/respond
const respondToRequest = async (req, res) => {
  try {
    const donor = getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    const { responseId } = req.params;
    const { status } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Accepted or Rejected.' });
    }

    const updatedResponse = mockStore.updateDonorResponse(responseId, status);
    if (!updatedResponse) {
      return res.status(404).json({ message: 'Request response not found.' });
    }

    // If Accepted, also add a completed/accepted donation record to donation history
    if (status === 'Accepted') {
      const bloodReq = mockStore.getRequestById(updatedResponse.requestId);
      mockStore.addDonationHistory({
        donorId: donor._id,
        hospitalName: bloodReq ? bloodReq.hospitalName : 'General Hospital',
        date: new Date(),
        bloodGroup: donor.bloodGroup,
        units: bloodReq ? bloodReq.units : 1,
        status: 'Accepted',
      });
    }

    res.json({
      message: `Request successfully marked as ${status}`,
      response: updatedResponse,
    });
  } catch (error) {
    console.error('respondToRequest error:', error);
    res.status(500).json({ message: 'Error responding to blood request.' });
  }
};

// GET /api/donor/history
const getDonationHistory = async (req, res) => {
  try {
    const donor = getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    const history = mockStore.getHistoryForDonor(donor._id);
    res.json(history);
  } catch (error) {
    console.error('getDonationHistory error:', error);
    res.status(500).json({ message: 'Error fetching donation history.' });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  toggleAvailability,
  getBloodRequests,
  respondToRequest,
  getDonationHistory,
};
