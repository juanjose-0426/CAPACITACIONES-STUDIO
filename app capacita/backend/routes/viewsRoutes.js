const express = require('express');
const router = express.Router();
const { recordView, getUserViews } = require('../controllers/viewsController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', protect, recordView);
router.get('/user/:userId', protect, admin, getUserViews);

module.exports = router;
