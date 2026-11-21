const express = require('express');
const router = express.Router();
const { getQuestionByContent, verifyAnswer, saveQuestion } = require('../controllers/questionController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', protect, admin, saveQuestion);
router.post('/verify', protect, verifyAnswer);
router.get('/:contentId', protect, getQuestionByContent);

module.exports = router;
