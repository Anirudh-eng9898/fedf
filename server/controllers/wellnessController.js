const db = require('../config/db');

const getWellnessScore = (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const weekStr = weekAgo.toISOString().split('T')[0];

    // Activity Score (30 pts)
    const activities = db.find('activities', { userId }).filter(a => a.date >= weekStr);
    const totalMinutes = activities.reduce((s, a) => s + a.duration, 0);
    const goals = db.find('goals', { userId });
    const goal = goals.length > 0 ? goals[goals.length - 1] : null;
    const activityGoal = goal?.activityMinutes || 150;
    const activityScore = Math.min(30, Math.round((totalMinutes / activityGoal) * 30));

    // Sleep Score (30 pts)
    const sleepEntries = db.find('sleep', { userId }).filter(s => s.date >= weekStr);
    let sleepScore = 0;
    if (sleepEntries.length > 0) {
      const avgDuration = sleepEntries.reduce((s, e) => s + e.duration, 0) / sleepEntries.length;
      const avgQuality = sleepEntries.reduce((s, e) => s + e.quality, 0) / sleepEntries.length;
      const durationScore = Math.min(15, Math.round((avgDuration / 8) * 15));
      const qualityScore = Math.min(15, Math.round((avgQuality / 5) * 15));
      sleepScore = durationScore + qualityScore;
    }

    // Hydration Score (20 pts)
    const today = now.toISOString().split('T')[0];
    const hydrationEntries = db.find('hydration', { userId }).filter(h => h.date === today);
    const dailyIntake = hydrationEntries.reduce((s, h) => s + h.amount, 0);
    const hydrationGoal = goal?.hydrationMl || 2500;
    const hydrationScore = Math.min(20, Math.round((dailyIntake / hydrationGoal) * 20));

    // Consistency Score (20 pts)
    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const hasActivity = db.find('activities', { userId }).some(a => a.date === d);
      const hasSleep = db.find('sleep', { userId }).some(s => s.date === d);
      const hasHydration = db.find('hydration', { userId }).some(h => h.date === d);
      if (hasActivity && hasSleep && hasHydration) streak++;
      else break;
    }
    const consistencyScore = Math.min(20, Math.round((streak / 7) * 20));

    const totalScore = activityScore + sleepScore + hydrationScore + consistencyScore;

    res.status(200).json({
      success: true,
      data: {
        totalScore,
        breakdown: {
          activity: { score: activityScore, max: 30, minutes: totalMinutes, goal: activityGoal },
          sleep: { score: sleepScore, max: 30, entries: sleepEntries.length },
          hydration: { score: hydrationScore, max: 20, intake: dailyIntake, goal: hydrationGoal },
          consistency: { score: consistencyScore, max: 20, streak }
        }
      },
      message: 'Wellness score calculated.', error: null
    });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const getWellnessHistory = (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    const history = [];
    const now = new Date();

    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];

      const acts = db.find('activities', { userId }).filter(a => a.date === dateStr);
      const mins = acts.reduce((s, a) => s + a.duration, 0);
      const sleeps = db.find('sleep', { userId }).filter(s => s.date === dateStr);
      const avgSleep = sleeps.length ? sleeps.reduce((s, e) => s + e.duration, 0) / sleeps.length : 0;
      const hyds = db.find('hydration', { userId }).filter(h => h.date === dateStr);
      const water = hyds.reduce((s, h) => s + h.amount, 0);

      const aScore = Math.min(30, Math.round((mins / 30) * 30));
      const sScore = Math.min(30, Math.round((avgSleep / 8) * 30));
      const hScore = Math.min(20, Math.round((water / 2500) * 20));
      const score = aScore + sScore + hScore;

      history.push({ date: dateStr, score, activity: mins, sleep: avgSleep, hydration: water });
    }

    res.status(200).json({ success: true, data: history, message: 'OK', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

module.exports = { getWellnessScore, getWellnessHistory };
