const express = require('express');
const { body, validationResult } = require('express-validator');
const { getGoals, createGoal, updateGoal } = require('../controllers/goalsController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, data: null, message: 'Validation failed', error: errors.array() });
  next();
};

router.use(authMiddleware);
router.get('/', getGoals);
router.post('/', [
  body('activityMinutes').optional().isInt({ min: 1, max: 1000 }).withMessage('Activity minutes must be 1-1000'),
  body('sleepHours').optional().isFloat({ min: 1, max: 24 }).withMessage('Sleep hours must be 1-24'),
  body('hydrationMl').optional().isInt({ min: 500, max: 10000 }).withMessage('Hydration must be 500-10000ml'),
  body('steps').optional().isInt({ min: 1000, max: 100000 }).withMessage('Steps must be 1000-100000')
], validate, createGoal);
router.put('/:id', updateGoal);

module.exports = router;
