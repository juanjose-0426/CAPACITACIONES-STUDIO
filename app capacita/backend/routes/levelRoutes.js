const express = require('express');
const router = express.Router();
const { getLevels, createLevel, updateLevel, deleteLevel } = require('../controllers/levelController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getLevels)
    .post(protect, admin, createLevel);

router.route('/:id')
    .put(protect, admin, updateLevel)
    .delete(protect, admin, deleteLevel);

module.exports = router;
