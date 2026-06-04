/**
 * Sleep Controller
 * Handles CRUD operations for sleep logs
 */
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

/**
 * Calculate sleep duration from bedtime and wake time
 * @param {string} bedtime - Bedtime (HH:mm)
 * @param {string} wakeTime - Wake time (HH:mm)
 * @returns {number} Duration in hours (rounded to 1 decimal)
 */
const calculateSleepDuration = (bedtime, wakeTime) => {
  const [bedH, bedM] = bedtime.split(':').map(Number);
  const [wakeH, wakeM] = wakeTime.split(':').map(Number);

  let bedMinutes = bedH * 60 + bedM;
  let wakeMinutes = wakeH * 60 + wakeM;

  // If wake time is earlier, assume next day
  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }

  const durationMinutes = wakeMinutes - bedMinutes;
  return Math.round((durationMinutes / 60) * 10) / 10;
};

/**
 * Get all sleep entries for the authenticated user
 * GET /api/sleep
 */
const getSleepEntries = (req, res) => {
  try {
    const { from, to, page = 1, limit = 10 } = req.query;
    let entries = db.find('sleep', { userId: req.user.id });

    if (from) entries = entries.filter(e => new Date(e.date) >= new Date(from));
    if (to) entries = entries.filter(e => new Date(e.date) <= new Date(to));

    // Sort by date descending
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = entries.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    const paginated = entries.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      data: {
        entries: paginated,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
      },
      message: 'Sleep entries retrieved successfully.',
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve sleep entries.',
      error: error.message
    });
  }
};

/**
 * Create a new sleep entry
 * POST /api/sleep
 */
const createSleepEntry = (req, res) => {
  try {
    const { bedtime, wakeTime, quality, date, notes = '' } = req.body;
    const duration = calculateSleepDuration(bedtime, wakeTime);

    const entry = {
      id: uuidv4(),
      userId: req.user.id,
      bedtime,
      wakeTime,
      duration,
      quality: parseInt(quality),
      date,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.insert('sleep', entry);

    res.status(201).json({
      success: true,
      data: entry,
      message: 'Sleep entry logged successfully.',
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to log sleep entry.',
      error: error.message
    });
  }
};

/**
 * Update a sleep entry
 * PUT /api/sleep/:id
 */
const updateSleepEntry = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.findById('sleep', id);

    if (!existing) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Sleep entry not found.', error: 'NOT_FOUND'
      });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({
        success: false, data: null,
        message: 'Not authorized.', error: 'FORBIDDEN'
      });
    }

    const { bedtime, wakeTime, quality, date, notes } = req.body;
    const bt = bedtime || existing.bedtime;
    const wt = wakeTime || existing.wakeTime;
    const duration = calculateSleepDuration(bt, wt);

    const updates = {
      bedtime: bt,
      wakeTime: wt,
      duration,
      quality: quality ? parseInt(quality) : existing.quality,
      date: date || existing.date,
      notes: notes !== undefined ? notes : existing.notes,
      updatedAt: new Date().toISOString()
    };

    const updated = db.updateById('sleep', id, updates);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Sleep entry updated successfully.',
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false, data: null,
      message: 'Failed to update sleep entry.', error: error.message
    });
  }
};

/**
 * Delete a sleep entry
 * DELETE /api/sleep/:id
 */
const deleteSleepEntry = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.findById('sleep', id);

    if (!existing) {
      return res.status(404).json({
        success: false, data: null,
        message: 'Sleep entry not found.', error: 'NOT_FOUND'
      });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({
        success: false, data: null,
        message: 'Not authorized.', error: 'FORBIDDEN'
      });
    }

    db.deleteById('sleep', id);

    res.status(200).json({
      success: true, data: null,
      message: 'Sleep entry deleted successfully.', error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false, data: null,
      message: 'Failed to delete sleep entry.', error: error.message
    });
  }
};

module.exports = { getSleepEntries, createSleepEntry, updateSleepEntry, deleteSleepEntry };
