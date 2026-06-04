const db = require('../config/db');

const getHistory = (req, res) => {
  try {
    const { type, from, to, page = 1, limit = 10, search } = req.query;
    const userId = req.user.id;
    let results = [];

    const addEntries = (collection, entryType) => {
      const entries = db.find(collection, { userId }).map(e => ({ ...e, entryType }));
      results.push(...entries);
    };

    if (!type || type === 'all') {
      addEntries('activities', 'activity');
      addEntries('sleep', 'sleep');
      addEntries('hydration', 'hydration');
    } else if (type === 'activity') {
      addEntries('activities', 'activity');
    } else if (type === 'sleep') {
      addEntries('sleep', 'sleep');
    } else if (type === 'hydration') {
      addEntries('hydration', 'hydration');
    }

    if (from) results = results.filter(r => new Date(r.date || r.timestamp) >= new Date(from));
    if (to) results = results.filter(r => new Date(r.date || r.timestamp) <= new Date(to));
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(r =>
        (r.type && r.type.toLowerCase().includes(s)) ||
        (r.notes && r.notes.toLowerCase().includes(s)) ||
        (r.entryType && r.entryType.toLowerCase().includes(s))
      );
    }

    results.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));

    const total = results.length;
    const p = parseInt(page);
    const l = parseInt(limit);
    const paginated = results.slice((p - 1) * l, p * l);

    res.status(200).json({
      success: true,
      data: { entries: paginated, pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) } },
      message: 'OK', error: null
    });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const getProgress = (req, res) => {
  try {
    const { from, to } = req.query;
    const userId = req.user.id;
    const startDate = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();
    const data = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const acts = db.find('activities', { userId }).filter(a => a.date === dateStr);
      const sleeps = db.find('sleep', { userId }).filter(s => s.date === dateStr);
      const hyds = db.find('hydration', { userId }).filter(h => h.date === dateStr);

      data.push({
        date: dateStr,
        activityMinutes: acts.reduce((s, a) => s + a.duration, 0),
        calories: acts.reduce((s, a) => s + (a.calories || 0), 0),
        sleepHours: sleeps.length ? sleeps.reduce((s, e) => s + e.duration, 0) / sleeps.length : 0,
        sleepQuality: sleeps.length ? sleeps.reduce((s, e) => s + e.quality, 0) / sleeps.length : 0,
        hydrationMl: hyds.reduce((s, h) => s + h.amount, 0)
      });
    }

    res.status(200).json({ success: true, data, message: 'OK', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

module.exports = { getHistory, getProgress };
