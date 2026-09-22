// Enforces strict role boundaries: 'donor' or 'hospital'
const requireRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        message: `Access denied. This endpoint is strictly reserved for ${allowedRole}s. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = { requireRole };
