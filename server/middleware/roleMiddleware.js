/**
 * Role-based access control middleware
 * @param {...string} roles - Allowed roles
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication required.',
        error: 'UNAUTHORIZED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Access denied. Insufficient permissions.',
        error: 'FORBIDDEN'
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
