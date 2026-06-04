const express = require('express');
const { getWellnessScore, getWellnessHistory } = require('../controllers/wellnessController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/score', getWellnessScore);
router.get('/history', getWellnessHistory);

module.exports = router;
