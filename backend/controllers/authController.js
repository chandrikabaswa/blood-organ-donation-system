const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodInventory = require('../models/BloodInventory');

const { calculateEligibility } = require('../services/eligibilityService');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// =====================================================
// REGISTER
// =====================================================
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,

      // Donor fields
      bloodGroup,
      dob,
      gender,
      phone,
      city,
      weight,
      takingMedication,
      chronicDisease,
      otherDiseaseName,
      recentSurgery,
      recentFever,

      // Hospital fields
      registrationNumber,
      address,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Name, email, password, and role are required.',
      });
    }

    if (!['donor', 'hospital'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be either donor or hospital.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check MongoDB
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    let profile = null;

    // =================================================
    // DONOR REGISTRATION
    // =================================================
    if (role === 'donor') {
      if (!bloodGroup || !city || !phone) {
        // Remove user if donor data is invalid
        await User.findByIdAndDelete(user._id);

        return res.status(400).json({
          message:
            'Blood group, phone, and city are required for donor registration.',
        });
      }

      const healthData = {
        weight: weight !== undefined ? Number(weight) : 55,
        lastDonationDate: null,
        takingMedication: takingMedication || 'No',
        chronicDisease: chronicDisease || 'None',
        otherDiseaseName: otherDiseaseName || '',
        recentSurgery: recentSurgery || 'No',
        recentFever: recentFever || 'No',
      };

      const eligibility = calculateEligibility(healthData);

      profile = await Donor.create({
        userId: user._id,
        fullName: name.trim(),
        dob: dob || '2000-01-01',
        gender: gender || 'Other',
        bloodGroup,
        phone: phone.trim(),
        city: city.trim(),
        isAvailable: true,
        ...healthData,
        eligibility,
      });
    }

    // =================================================
    // HOSPITAL REGISTRATION
    // =================================================
    if (role === 'hospital') {
      profile = await Hospital.create({
        userId: user._id,
        hospitalName: name.trim(),
        registrationNumber:
          registrationNumber ||
          `REG-${Date.now().toString().slice(-4)}`,
        phone: phone ? phone.trim() : 'N/A',
        city: city ? city.trim() : 'Hyderabad',
        address: address ? address.trim() : 'Hospital Main Address',
      });

      // Initialize zero inventory for all 8 blood groups in MongoDB
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const initialInventories = bloodGroups.map((bg) => ({
        hospitalId: profile._id,
        bloodGroup: bg,
        units: 0,
        lastUpdated: new Date(),
      }));
      await BloodInventory.insertMany(initialInventories);
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'An account with this email already exists.',
      });
    }

    return res.status(500).json({
      message: 'Registration failed. Server error.',
    });
  }
};

// =====================================================
// LOGIN
// =====================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user in MongoDB
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    // Get profile
    let profile = null;

    if (user.role === 'donor') {
      profile = await Donor.findOne({
        userId: user._id,
      });
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({
        userId: user._id,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Login failed. Server error.',
    });
  }
};

// =====================================================
// GET CURRENT USER
// =====================================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    let profile = null;

    if (user.role === 'donor') {
      profile = await Donor.findOne({
        userId: user._id,
      });
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({
        userId: user._id,
      });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    console.error('getMe error:', error);

    return res.status(500).json({
      message: 'Failed to retrieve user profile.',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};