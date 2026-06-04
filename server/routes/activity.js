const express = require('express');
const { body, validationResult } = require('express-validator');
const { getActivities, createActivity, updateActivity, deleteActivity } = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, data: null, message: 'Validation failed', error: errors.array() });
  next();
};

router.use(authMiddleware);
router.get('/', getActivities);
router.post('/', [
  body('type').isIn(['Walking', 'Running', 'Cycling', 'Gym', 'Yoga', 'Other']).withMessage('Invalid activity type'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive number'),
  body('intensity').isIn(['Low', 'Medium', 'High']).withMessage('Invalid intensity'),
  body('date').notEmpty().withMessage('Date is required')
], validate, createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;
