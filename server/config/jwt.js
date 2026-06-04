/**
 * JWT configuration and helper functions
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'wellness_tracker_jwt_secret_key_2024';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * Generate a JWT token for a user
 * @param {Object} payload - Data to encode in the token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRY
};
