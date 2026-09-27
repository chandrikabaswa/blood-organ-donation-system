const User = require('../models/User');
const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');
const DonorResponse = require('../models/DonorResponse');
const DonationHistory = require('../models/DonationHistory');
const { calculateEligibility } = require('../services/eligibilityService');

// Helper to get donor by current logged in user
const getDonorByUser = async (userId) => {
  return await Donor.findOne({ userId });
};

// GET /api/donor/dashboard
const getDashboard = async (req, res) => {
  try {
    const donor = await getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    // Get count of pending requests for this donor
    const pendingCount = await DonorResponse.countDocuments({
      donorId: donor._id,
      status: 'Pending',
    });

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
    const donor = await getDonorByUser(req.user.id);
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
    const donor = await getDonorByUser(req.user.id);
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

    donor.fullName = fullName ? fullName.trim() : donor.fullName;
    if (dob) donor.dob = dob;
    if (gender) donor.gender = gender;
    donor.phone = phone ? phone.trim() : donor.phone;
    donor.city = city ? city.trim() : donor.city;

    donor.weight = healthData.weight;
    donor.lastDonationDate = healthData.lastDonationDate;
    donor.takingMedication = healthData.takingMedication;
    donor.chronicDisease = healthData.chronicDisease;
    donor.otherDiseaseName = healthData.otherDiseaseName;
    donor.recentSurgery = healthData.recentSurgery;
    donor.recentFever = healthData.recentFever;
    donor.eligibility = eligibility;

    const updatedDonor = await donor.save();

    // Also update User record name if changed
    if (fullName && fullName.trim() !== req.user.name) {
      await User.findByIdAndUpdate(req.user.id, { name: fullName.trim() });
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
    const donor = await getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    const { isAvailable } = req.body;
    const newStatus = typeof isAvailable === 'boolean' ? isAvailable : !donor.isAvailable;

    donor.isAvailable = newStatus;
    const updated = await donor.save();

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
    const donor = await getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    const responses = await DonorResponse.find({ donorId: donor._id })
      .populate('requestId')
      .sort({ createdAt: -1 });

    // Format for clean display
    const formatted = responses
      .filter((r) => r.requestId !== null)
      .map((r) => {
        const bloodReq = r.requestId;
        return {
          responseId: r._id,
          status: r.status,
          responseDate: r.responseDate,
          hospitalName: bloodReq ? bloodReq.hospitalName : 'Hospital',
          bloodGroup: bloodReq ? bloodReq.bloodGroup : donor.bloodGroup,
          units: bloodReq ? bloodReq.units : 1,
          city: bloodReq ? bloodReq.city : donor.city,
          urgency: bloodReq ? bloodReq.urgency : 'Normal',
          requiredDate: bloodReq ? bloodReq.requiredDate : null,
          notes: bloodReq ? bloodReq.notes : '',
          createdAt: r.createdAt,
        };
      });

    res.json(formatted);
  } catch (error) {
    console.error('getBloodRequests error:', error);
    res.status(500).json({ message: 'Error fetching donor blood requests.' });
  }
};

// PUT /api/donor/requests/:responseId/respond
const respondToRequest = async (req, res) => {
  try {
    const donor = await getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    const { responseId } = req.params;
    const { status } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Accepted or Rejected.' });
    }

    const updatedResponse = await DonorResponse.findOneAndUpdate(
      { _id: responseId, donorId: donor._id },
      { status, responseDate: new Date() },
      { new: true }
    );

    if (!updatedResponse) {
      return res.status(404).json({ message: 'Request response not found.' });
    }

    // If Accepted, also add a completed/accepted donation record to donation history
    if (status === 'Accepted') {
      const bloodReq = await BloodRequest.findById(updatedResponse.requestId);
      await DonationHistory.create({
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
    const donor = await getDonorByUser(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    const history = await DonationHistory.find({ donorId: donor._id }).sort({ date: -1 });
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
