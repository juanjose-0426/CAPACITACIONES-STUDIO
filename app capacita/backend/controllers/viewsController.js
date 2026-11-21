const pool = require('../db');

// @desc    Registrar que un usuario vio un contenido (video)
// @route   POST /api/views
// @access  Private
const recordView = async (req, res) => {
    const { content_id } = req.body;

    if (!content_id) {
        return res.status(400).json({ message: 'content_id is required' });
    }

    try {
        await pool.query(
            'INSERT IGNORE INTO content_views (user_id, content_id) VALUES (?, ?)',
            [req.user.id, content_id]
        );
        res.status(201).json({ message: 'View recorded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Obtener los contenidos vistos por un usuario específico
// @route   GET /api/views/user/:userId
// @access  Private/Admin
const getUserViews = async (req, res) => {
    const { userId } = req.params;

    try {
        const [views] = await pool.query(`
            SELECT cv.watched_at, c.title as content_title, l.title as level_title 
            FROM content_views cv
            JOIN contents c ON cv.content_id = c.id
            JOIN levels l ON c.level_id = l.id
            WHERE cv.user_id = ?
            ORDER BY cv.watched_at DESC
        `, [userId]);

        res.json(views);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { recordView, getUserViews };
