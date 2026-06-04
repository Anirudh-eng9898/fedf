const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const getNotifications = (req, res) => {
  try {
    let notifs = db.find('notifications', { userId: req.user.id });
    notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unreadCount = notifs.filter(n => !n.read).length;
    res.status(200).json({ success: true, data: { notifications: notifs, unreadCount }, message: 'OK', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const markAsRead = (req, res) => {
  try {
    const notif = db.findById('notifications', req.params.id);
    if (!notif) return res.status(404).json({ success: false, data: null, message: 'Not found', error: 'NOT_FOUND' });
    if (notif.userId !== req.user.id) return res.status(403).json({ success: false, data: null, message: 'Forbidden', error: 'FORBIDDEN' });
    db.updateById('notifications', req.params.id, { read: true });
    res.status(200).json({ success: true, data: null, message: 'Marked as read', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

const markAllAsRead = (req, res) => {
  try {
    const notifs = db.find('notifications', { userId: req.user.id });
    notifs.forEach(n => { if (!n.read) db.updateById('notifications', n.id, { read: true }); });
    res.status(200).json({ success: true, data: null, message: 'All marked as read', error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, message: 'Failed', error: error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
