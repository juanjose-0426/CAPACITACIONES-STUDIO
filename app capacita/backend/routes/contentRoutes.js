const express = require('express');
const router = express.Router();
const { 
    getContentsByLevel, 
    createContent, 
    deleteContent, 
    updateContent,
    getUnlinkedFiles,
    streamContentFile
} = require('../controllers/contentController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Endpoint para streaming optimizado (soporta Range requests para video)
router.get('/stream/:filename', streamContentFile);

// Endpoint para listar archivos existentes en /uploads que no están vinculados
router.get('/files/unlinked', protect, admin, getUnlinkedFiles);

router.route('/')
    .post(protect, admin, upload.single('file'), createContent);

router.route('/:levelId')
    .get(protect, getContentsByLevel);

router.route('/:id')
    .put(protect, admin, updateContent)
    .delete(protect, admin, deleteContent);

module.exports = router;
