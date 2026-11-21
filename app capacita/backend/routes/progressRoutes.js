const express = require('express');
const router = express.Router();
const { getMyProgress } = require('../controllers/progressController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/me').get(protect, getMyProgress);

module.exports = router;
