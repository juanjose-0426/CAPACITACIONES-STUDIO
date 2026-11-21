const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'guzman_studio_jwt_secret_2026';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Autenticar usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { email, password } = req.body || {};
    const cleanEmail = typeof email === 'string' ? email.trim() : '';

    if (!cleanEmail || !password) {
        return res.status(400).json({ message: 'Por favor ingresa tu correo y contraseña' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = rows[0];

        if (!user.is_active) {
            return res.status(401).json({ message: 'La cuenta está desactivada' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Obtener perfil del usuario actual
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?', [req.user.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { login, getMe };
