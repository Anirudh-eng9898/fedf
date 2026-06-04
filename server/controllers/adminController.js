const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const getUsers = (req, res) => {
  try {
    const users = db.readCollection('users').map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    res.status(200).json({ success: true, data: users, message: 'OK', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const updateUser = (req, res) => {
  try {
    const user = db.findById('users', req.params.id);
    if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found', error: 'NOT_FOUND' });
    const { active, role } = req.body;
    const updates = {};
    if (active !== undefined) updates.active = active;
    if (role) updates.role = role;
    updates.updatedAt = new Date().toISOString();
    const updated = db.updateById('users', req.params.id, updates);
    const { password, ...safe } = updated;
    res.status(200).json({ success: true, data: safe, message: 'Updated', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const deleteUser = (req, res) => {
  try {
    const user = db.findById('users', req.params.id);
    if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found', error: 'NOT_FOUND' });
    db.deleteById('users', req.params.id);
    res.status(200).json({ success: true, data: null, message: 'Deleted', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const getStats = (req, res) => {
  try {
    const users = db.readCollection('users');
    const today = new Date().toISOString().split('T')[0];
    const activities = db.readCollection('activities');
    const challenges = db.readCollection('challenges');
    const todayActivities = activities.filter(a => a.date === today);
    const activeToday = new Set(todayActivities.map(a => a.userId)).size;
    const activeChallenges = challenges.filter(c => c.status === 'active');

    res.status(200).json({
      success: true,
      data: {
        totalUsers: users.length,
        activeToday,
        totalActivitiesToday: todayActivities.length,
        activeChallenges: activeChallenges.length
      },
      message: 'OK', error: null
    });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const broadcastNotification = (req, res) => {
  try {
    const { title, message } = req.body;
    const users = db.readCollection('users');
    const now = new Date().toISOString();
    users.forEach(u => {
      db.insert('notifications', {
        id: uuidv4(), userId: u.id, type: 'system',
        title, message, read: false, createdAt: now
      });
    });
    res.status(201).json({ success: true, data: null, message: `Notification sent to ${users.length} users`, error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

module.exports = { getUsers, updateUser, deleteUser, getStats, broadcastNotification };
