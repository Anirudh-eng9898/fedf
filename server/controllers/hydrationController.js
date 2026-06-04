const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const getHydration = (req, res) => {
  try {
    const { date, from, to } = req.query;
    let entries = db.find('hydration', { userId: req.user.id });
    if (date) entries = entries.filter(e => e.date === date);
    if (from) entries = entries.filter(e => new Date(e.date) >= new Date(from));
    if (to) entries = entries.filter(e => new Date(e.date) <= new Date(to));
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const dailyTotals = {};
    entries.forEach(e => {
      if (!dailyTotals[e.date]) dailyTotals[e.date] = 0;
      dailyTotals[e.date] += e.amount;
    });
    res.status(200).json({ success: true, data: { entries, dailyTotals }, message: 'OK', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const createHydration = (req, res) => {
  try {
    const { amount, date } = req.body;
    const entry = {
      id: uuidv4(), userId: req.user.id, amount: parseInt(amount),
      date: date || new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(), createdAt: new Date().toISOString()
    };
    db.insert('hydration', entry);
    const todayEntries = db.find('hydration', { userId: req.user.id }).filter(e => e.date === entry.date);
    const dailyTotal = todayEntries.reduce((sum, e) => sum + e.amount, 0);
    res.status(201).json({ success: true, data: { entry, dailyTotal }, message: 'Logged', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const deleteHydration = (req, res) => {
  try {
    const existing = db.findById('hydration', req.params.id);
    if (!existing) return res.status(404).json({ success: false, data: null, message: 'Not found', error: 'NOT_FOUND' });
    if (existing.userId !== req.user.id) return res.status(403).json({ success: false, data: null, message: 'Forbidden', error: 'FORBIDDEN' });
    db.deleteById('hydration', req.params.id);
    res.status(200).json({ success: true, data: null, message: 'Deleted', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

module.exports = { getHydration, createHydration, deleteHydration };
