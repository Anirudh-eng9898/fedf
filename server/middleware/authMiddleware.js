/**
 * Authentication middleware - verifies JWT token from Authorization header
 */
const { verifyToken } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Access denied. No token provided.',
        error: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token has expired. Please login again.',
        error: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid token.',
      error: 'INVALID_TOKEN'
    });
  }
};

module.exports = authMiddleware;
