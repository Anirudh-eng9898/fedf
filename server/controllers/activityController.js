/**
 * Activity Controller
 * Handles CRUD operations for activity logs
 */
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

/** Calorie burn rates per minute by activity type and intensity */
const CALORIE_RATES = {
  walking:  { low: 3.5, medium: 4.5, high: 6.0 },
  running:  { low: 8.0, medium: 11.0, high: 14.0 },
  cycling:  { low: 5.0, medium: 8.0, high: 12.0 },
  gym:      { low: 5.0, medium: 7.5, high: 10.0 },
  yoga:     { low: 2.5, medium: 4.0, high: 6.0 },
  other:    { low: 3.0, medium: 5.0, high: 7.0 }
};

/**
 * Calculate calories burned
 * @param {string} type - Activity type
 * @param {number} duration - Duration in minutes
 * @param {string} intensity - Intensity level
 * @returns {number} Calories burned
 */
const calculateCalories = (type, duration, intensity) => {
  const typeKey = type.toLowerCase();
  const intensityKey = intensity.toLowerCase();
  const rate = CALORIE_RATES[typeKey]?.[intensityKey] || CALORIE_RATES.other[intensityKey] || 5;
  return Math.round(rate * duration);
};

/**
 * Get all activities for the authenticated user (paginated, filterable)
 * GET /api/activity
 */
const getActivities = (req, res) => {
  try {
    const { page = 1, limit = 10, type, from, to, sort = 'date', order = 'desc' } = req.query;
    let activities = db.find('activities', { userId: req.user.id });

    // Filter by type
    if (type) {
      activities = activities.filter(a => a.type.toLowerCase() === type.toLowerCase());
    }

    // Filter by date range
    if (from) {
      activities = activities.filter(a => new Date(a.date) >= new Date(from));
    }
    if (to) {
      activities = activities.filter(a => new Date(a.date) <= new Date(to));
    }

    // Sort
    activities.sort((a, b) => {
      let valA, valB;
      if (sort === 'duration') {
        valA = a.duration;
        valB = b.duration;
      } else {
        valA = new Date(a.date);
        valB = new Date(b.date);
      }
      return order === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    // Paginate
    const total = activities.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    const paginated = activities.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      data: {
        activities: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      },
      message: 'Activities retrieved successfully.',
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve activities.',
      error: error.message
    });
  }
};

/**
 * Create a new activity log
 * POST /api/activity
 */
const createActivity = (req, res) => {
  try {
    const { type, duration, intensity, date, notes = '' } = req.body;

    const calories = calculateCalories(type, duration, intensity);

    const activity = {
      id: uuidv4(),
      userId: req.user.id,
      type,
      duration: parseInt(duration),
      intensity,
      date,
      notes,
      calories,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.insert('activities', activity);

    res.status(201).json({
      success: true,
      data: activity,
      message: 'Activity logged successfully.',
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to log activity.',
      error: error.message
    });
  }
};

/**
 * Update an activity log
 * PUT /api/activity/:id
 */
const updateActivity = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.findById('activities', id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Activity not found.',
        error: 'NOT_FOUND'
      });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Not authorized to update this activity.',
        error: 'FORBIDDEN'
      });
    }

    const { type, duration, intensity, date, notes } = req.body;
    const calories = calculateCalories(
      type || existing.type,
      duration || existing.duration,
      intensity || existing.intensity
    );

    const updates = {
      type: type || existing.type,
      duration: duration ? parseInt(duration) : existing.duration,
      intensity: intensity || existing.intensity,
      date: date || existing.date,
      notes: notes !== undefined ? notes : existing.notes,
      calories,
      updatedAt: new Date().toISOString()
    };

    const updated = db.updateById('activities', id, updates);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Activity updated successfully.',
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to update activity.',
      error: error.message
    });
  }
};

/**
 * Delete an activity log
 * DELETE /api/activity/:id
 */
const deleteActivity = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.findById('activities', id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Activity not found.',
        error: 'NOT_FOUND'
      });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Not authorized to delete this activity.',
        error: 'FORBIDDEN'
      });
    }

    db.deleteById('activities', id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Activity deleted successfully.',
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to delete activity.',
      error: error.message
    });
  }
};

module.exports = { getActivities, createActivity, updateActivity, deleteActivity };
