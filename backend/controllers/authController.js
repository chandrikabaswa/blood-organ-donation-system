const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const { calculateEligibility } = require('../services/eligibilityService');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Register new user (Donor or Hospital)
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    if (!['donor', 'hospital'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be either donor or hospital.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Role-specific validation before creating records
    if (role === 'donor') {
      const { bloodGroup, city, phone } = req.body;
      if (!bloodGroup || !city || !phone) {
        return res.status(400).json({ message: 'Blood group, phone, and city are required for donor registration.' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    let profile = null;

    if (role === 'donor') {
      const {
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
      } = req.body;

      const initialHealth = {
        weight: weight ? Number(weight) : 55,
        lastDonationDate: null,
        takingMedication: takingMedication || 'No',
        chronicDisease: chronicDisease || 'None',
        otherDiseaseName: otherDiseaseName || '',
        recentSurgery: recentSurgery || 'No',
        recentFever: recentFever || 'No',
      };

      const eligibility = calculateEligibility(initialHealth);

      profile = await Donor.create({
        userId: user._id,
        fullName: name.trim(),
        dob: dob || new Date('2000-01-01'),
        gender: gender || 'Male',
        bloodGroup,
        phone: phone.trim(),
        city: city.trim(),
        isAvailable: true,
        ...initialHealth,
        eligibility,
      });
    } else if (role === 'hospital') {
      const { registrationNumber, phone, city, address } = req.body;

      profile = await Hospital.create({
        userId: user._id,
        hospitalName: name.trim(),
        registrationNumber: registrationNumber ? registrationNumber.trim() : `REG-${Date.now().toString().slice(-4)}`,
        phone: phone ? phone.trim() : 'N/A',
        city: city ? city.trim() : 'Hyderabad',
        address: address ? address.trim() : 'Hospital Main Address',
      });
    }

    // Sign JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
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
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'Registration failed. Server error.' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    let profile = null;
    if (user.role === 'donor') {
      profile = await Donor.findOne({ userId: user._id });
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({ userId: user._id });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
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
    res.status(500).json({ message: 'Login failed. Server error.' });
  }
};

// Get current authenticated user profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'donor') {
      profile = await Donor.findOne({ userId: user._id });
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({ userId: user._id });
    }

    res.json({
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
    res.status(500).json({ message: 'Failed to retrieve user profile.' });
  }
};

module.exports = { register, login, getMe };
