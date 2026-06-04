/**
 * Authentication Controller
 * Handles user registration, login, and profile retrieval
 */
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { generateToken } = require('../config/jwt');
const db = require('../config/db');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // Check if user already exists
    const existing = db.find('users', { email });
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'A user with this email already exists.',
        error: 'EMAIL_EXISTS'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'student',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.insert('users', user);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: { user: userWithoutPassword, token },
      message: 'Registration successful.',
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Registration failed.',
      error: error.message
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const users = db.find('users', { email });
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password.',
        error: 'INVALID_CREDENTIALS'
      });
    }

    const user = users[0];

    // Check if account is active
    if (!user.active) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Account has been deactivated. Contact admin.',
        error: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password.',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: { user: userWithoutPassword, token },
      message: 'Login successful.',
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Login failed.',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = (req, res) => {
  try {
    const user = db.findById('users', req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found.',
        error: 'NOT_FOUND'
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: 'Profile retrieved successfully.',
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve profile.',
      error: error.message
    });
  }
};

module.exports = { register, login, getMe };
