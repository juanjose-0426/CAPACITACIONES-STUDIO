const pool = require('../db');

// @desc    Obtener progreso del usuario actual (qué niveles están bloqueados/desbloqueados)
// @route   GET /api/progress/me
// @access  Private
const getMyProgress = async (req, res) => {
    try {
        // Obtener usuario
        const [userRow] = await pool.query('SELECT created_at FROM users WHERE id = ?', [req.user.id]);
        if (userRow.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        const createdDate = new Date(userRow[0].created_at);
        const currentDate = new Date();
        const daysSinceCreation = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));

        // Obtener niveles
        const [levels] = await pool.query('SELECT * FROM levels WHERE target_role IN (?, "both") ORDER BY order_num ASC', [req.user.role]);

        const progress = levels.map(level => {
            const isUnlocked = daysSinceCreation >= level.unlock_days;
            const daysRemaining = isUnlocked ? 0 : level.unlock_days - daysSinceCreation;
            
            return {
                level_id: level.id,
                title: level.title,
                description: level.description,
                order_num: level.order_num,
                isUnlocked,
                daysRemaining,
                unlocks_at: new Date(createdDate.getTime() + level.unlock_days * 24 * 60 * 60 * 1000)
            };
        });

        res.json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { getMyProgress };
