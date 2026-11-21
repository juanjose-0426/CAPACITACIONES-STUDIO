const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'guzman_studio_jwt_secret_2026';

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // { id, role }
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'No autorizado, token falló' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'No autorizado como administrador' });
    }
};

module.exports = { protect, admin };
