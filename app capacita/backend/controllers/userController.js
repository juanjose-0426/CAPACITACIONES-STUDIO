const bcrypt = require('bcryptjs');
const pool = require('../db');

// @desc    Obtener todos los usuarios (modelos y monitores)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const [users] = await pool.query("SELECT id, name, email, role, is_active, created_at FROM users WHERE role IN ('model', 'monitor') ORDER BY created_at DESC");
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Crear un nuevo usuario
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    const userRole = role === 'monitor' ? 'monitor' : 'model'; // Default a model

    try {
        const [existing] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'El correo ya está en uso' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, userRole]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            email,
            role: userRole,
            is_active: 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Actualizar usuario (activar/desactivar)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    const { is_active } = req.body;
    
    try {
        const [result] = await pool.query(
            "UPDATE users SET is_active = ? WHERE id = ? AND role IN ('model', 'monitor')",
            [is_active !== undefined ? is_active : 1, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Eliminar usuario
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM users WHERE id = ? AND role IN ('model', 'monitor')", [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
