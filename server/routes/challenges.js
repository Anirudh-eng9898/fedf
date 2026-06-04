const express = require('express');
const { body, validationResult } = require('express-validator');
const { getChallenges, getChallenge, createChallenge, acceptChallenge, declineChallenge } = require('../controllers/challengesController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, data: null, message: 'Validation failed', error: errors.array() });
  next();
};

router.use(authMiddleware);
router.get('/', getChallenges);
router.get('/:id', getChallenge);
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('metric').isIn(['steps', 'sleep', 'activity', 'hydration']).withMessage('Invalid metric'),
  body('targetValue').isInt({ min: 1 }).withMessage('Target value must be positive'),
  body('durationDays').isInt({ min: 1, max: 90 }).withMessage('Duration must be 1-90 days')
], validate, createChallenge);
router.patch('/:id/accept', acceptChallenge);
router.patch('/:id/decline', declineChallenge);

module.exports = router;
