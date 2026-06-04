const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const getGoals = (req, res) => {
  try {
    const goals = db.find('goals', { userId: req.user.id });
    goals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({ success: true, data: goals, message: 'OK', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const createGoal = (req, res) => {
  try {
    const { activityMinutes, sleepHours, hydrationMl, steps, weekStart } = req.body;
    const goal = {
      id: uuidv4(), userId: req.user.id,
      activityMinutes: parseInt(activityMinutes) || 150,
      sleepHours: parseFloat(sleepHours) || 8,
      hydrationMl: parseInt(hydrationMl) || 2500,
      steps: parseInt(steps) || 10000,
      weekStart: weekStart || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    db.insert('goals', goal);
    res.status(201).json({ success: true, data: goal, message: 'Goal created', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const updateGoal = (req, res) => {
  try {
    const existing = db.findById('goals', req.params.id);
    if (!existing) return res.status(404).json({ success: false, data: null, message: 'Not found', error: 'NOT_FOUND' });
    if (existing.userId !== req.user.id) return res.status(403).json({ success: false, data: null, message: 'Forbidden', error: 'FORBIDDEN' });
    const { activityMinutes, sleepHours, hydrationMl, steps } = req.body;
    const updates = {
      activityMinutes: activityMinutes ? parseInt(activityMinutes) : existing.activityMinutes,
      sleepHours: sleepHours ? parseFloat(sleepHours) : existing.sleepHours,
      hydrationMl: hydrationMl ? parseInt(hydrationMl) : existing.hydrationMl,
      steps: steps ? parseInt(steps) : existing.steps,
      updatedAt: new Date().toISOString()
    };
    const updated = db.updateById('goals', req.params.id, updates);
    res.status(200).json({ success: true, data: updated, message: 'Updated', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

module.exports = { getGoals, createGoal, updateGoal };
