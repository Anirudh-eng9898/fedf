const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const getChallenges = (req, res) => {
  try {
    const allChallenges = db.readCollection('challenges');
    const userChallenges = allChallenges.filter(c =>
      c.creatorId === req.user.id || c.participants.some(p => p.userId === req.user.id)
    );
    res.status(200).json({ success: true, data: userChallenges, message: 'OK', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const getChallenge = (req, res) => {
  try {
    const challenge = db.findById('challenges', req.params.id);
    if (!challenge) return res.status(404).json({ success: false, data: null, message: 'Not found', error: 'NOT_FOUND' });
    res.status(200).json({ success: true, data: challenge, message: 'OK', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const createChallenge = (req, res) => {
  try {
    const { title, metric, targetValue, durationDays, invitees = [] } = req.body;
    const now = new Date();
    const endDate = new Date(now.getTime() + parseInt(durationDays) * 24 * 60 * 60 * 1000);

    const participants = invitees.map(email => {
      const users = db.find('users', { email });
      return {
        userId: users.length > 0 ? users[0].id : null,
        email,
        name: users.length > 0 ? users[0].name : email,
        status: 'pending', progress: 0
      };
    });

    // Add creator as accepted participant
    participants.unshift({
      userId: req.user.id, email: req.user.email,
      name: req.user.name, status: 'accepted', progress: 0
    });

    const challenge = {
      id: uuidv4(), creatorId: req.user.id, creatorName: req.user.name,
      title, metric, targetValue: parseInt(targetValue),
      durationDays: parseInt(durationDays),
      startDate: now.toISOString(), endDate: endDate.toISOString(),
      status: 'active', participants,
      createdAt: now.toISOString(), updatedAt: now.toISOString()
    };

    db.insert('challenges', challenge);

    // Create notifications for invitees
    participants.forEach(p => {
      if (p.userId && p.userId !== req.user.id) {
        db.insert('notifications', {
          id: uuidv4(), userId: p.userId, type: 'challenge',
          title: 'New Challenge Invitation',
          message: `${req.user.name} challenged you: "${title}"`,
          challengeId: challenge.id, read: false,
          createdAt: now.toISOString()
        });
      }
    });

    res.status(201).json({ success: true, data: challenge, message: 'Challenge created', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const acceptChallenge = (req, res) => {
  try {
    const challenge = db.findById('challenges', req.params.id);
    if (!challenge) return res.status(404).json({ success: false, data: null, message: 'Not found', error: 'NOT_FOUND' });
    const pIdx = challenge.participants.findIndex(p => p.userId === req.user.id);
    if (pIdx === -1) return res.status(403).json({ success: false, data: null, message: 'Not invited', error: 'FORBIDDEN' });
    challenge.participants[pIdx].status = 'accepted';
    challenge.updatedAt = new Date().toISOString();
    db.updateById('challenges', req.params.id, { participants: challenge.participants, updatedAt: challenge.updatedAt });
    res.status(200).json({ success: true, data: challenge, message: 'Accepted', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const declineChallenge = (req, res) => {
  try {
    const challenge = db.findById('challenges', req.params.id);
    if (!challenge) return res.status(404).json({ success: false, data: null, message: 'Not found', error: 'NOT_FOUND' });
    const pIdx = challenge.participants.findIndex(p => p.userId === req.user.id);
    if (pIdx === -1) return res.status(403).json({ success: false, data: null, message: 'Not invited', error: 'FORBIDDEN' });
    challenge.participants[pIdx].status = 'declined';
    db.updateById('challenges', req.params.id, { participants: challenge.participants, updatedAt: new Date().toISOString() });
    res.status(200).json({ success: true, data: challenge, message: 'Declined', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

module.exports = { getChallenges, getChallenge, createChallenge, acceptChallenge, declineChallenge };
