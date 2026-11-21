const pool = require('../db');

// @desc    Obtener todos los niveles
// @route   GET /api/levels
// @access  Private (Todos pueden ver los niveles, el progreso determina si pueden entrar)
const getLevels = async (req, res) => {
    try {
        let query = 'SELECT * FROM levels ORDER BY order_num ASC';
        let params = [];
        
        if (req.user.role !== 'admin') {
            query = "SELECT * FROM levels WHERE target_role IN (?, 'both') ORDER BY order_num ASC";
            params = [req.user.role];
        }

        const [levels] = await pool.query(query, params);
        res.json(levels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Crear nivel
// @route   POST /api/levels
// @access  Private/Admin
const createLevel = async (req, res) => {
    const { title, description, unlock_days, order_num, target_role } = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO levels (title, description, unlock_days, order_num, target_role) VALUES (?, ?, ?, ?, ?)',
            [title, description, unlock_days || 0, order_num, target_role || 'both']
        );

        res.status(201).json({ id: result.insertId, title, description, unlock_days, order_num, target_role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Actualizar nivel
// @route   PUT /api/levels/:id
// @access  Private/Admin
const updateLevel = async (req, res) => {
    const { title, description, unlock_days, order_num, target_role } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE levels SET title = ?, description = ?, unlock_days = ?, order_num = ?, target_role = ? WHERE id = ?',
            [title, description, unlock_days, order_num, target_role || 'both', req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Nivel no encontrado' });
        }

        res.json({ message: 'Nivel actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Eliminar nivel
// @route   DELETE /api/levels/:id
// @access  Private/Admin
const deleteLevel = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM levels WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Nivel no encontrado' });
        }

        res.json({ message: 'Nivel eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { getLevels, createLevel, updateLevel, deleteLevel };
