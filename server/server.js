require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activity');
const sleepRoutes = require('./routes/sleep');
const hydrationRoutes = require('./routes/hydration');
const wellnessRoutes = require('./routes/wellness');
const goalsRoutes = require('./routes/goals');
const challengesRoutes = require('./routes/challenges');
const notificationsRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const { historyRouter, progressRouter } = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/hydration', hydrationRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/history', historyRouter);
app.use('/api/progress', progressRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() }, message: 'Server is running', error: null });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
