const express = require('express');
const { body, validationResult } = require('express-validator');
const { getSleepEntries, createSleepEntry, updateSleepEntry, deleteSleepEntry } = require('../controllers/sleepController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, data: null, message: 'Validation failed', error: errors.array() });
  next();
};

router.use(authMiddleware);
router.get('/', getSleepEntries);
router.post('/', [
  body('bedtime').notEmpty().withMessage('Bedtime is required'),
  body('wakeTime').notEmpty().withMessage('Wake time is required'),
  body('quality').isInt({ min: 1, max: 5 }).withMessage('Quality must be 1-5'),
  body('date').notEmpty().withMessage('Date is required')
], validate, createSleepEntry);
router.put('/:id', updateSleepEntry);
router.delete('/:id', deleteSleepEntry);

module.exports = router;
