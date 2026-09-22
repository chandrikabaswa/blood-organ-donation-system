const jwt = require('jsonwebtoken');
const mockStore = require('../services/mockStore');

const JWT_SECRET = process.env.JWT_SECRET || 'blood_donation_secret_key_student_project_2026';

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = mockStore.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    // Attach current user payload (without password)
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

module.exports = { requireAuth, JWT_SECRET };
