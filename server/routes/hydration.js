const express = require('express');
const { body, validationResult } = require('express-validator');
const { getHydration, createHydration, deleteHydration } = require('../controllers/hydrationController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, data: null, message: 'Validation failed', error: errors.array() });
  next();
};

router.use(authMiddleware);
router.get('/', getHydration);
router.post('/', [
  body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive number')
], validate, createHydration);
router.delete('/:id', deleteHydration);

module.exports = router;
