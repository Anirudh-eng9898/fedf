const express = require('express');
const { getUsers, updateUser, deleteUser, getStats, broadcastNotification } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);
router.post('/notify', broadcastNotification);

module.exports = router;
