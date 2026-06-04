const express = require('express');
const { getHistory } = require('../controllers/historyController');
const { getProgress } = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');

const historyRouter = express.Router();
historyRouter.use(authMiddleware);
historyRouter.get('/', getHistory);

const progressRouter = express.Router();
progressRouter.use(authMiddleware);
progressRouter.get('/', getProgress);

module.exports = { historyRouter, progressRouter };
