const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { runMigrations } = require('./migrations');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const levelRoutes = require('./routes/levelRoutes');
const contentRoutes = require('./routes/contentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const viewsRoutes = require('./routes/viewsRoutes');
const questionRoutes = require('./routes/questionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/views', viewsRoutes);
app.use('/api/questions', questionRoutes);

// Servir el frontend compilado (producción) si existe ../frontend/dist
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

// Middleware centralizado de manejo de errores
app.use((err, req, res, next) => {
    console.error('[Error Middleware]:', err.message);
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'El archivo excede el tamaño máximo permitido (1 GB).' });
        }
        return res.status(400).json({ message: `Error de subida: ${err.message}` });
    }
    res.status(500).json({ message: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`[Servidor] Corriendo en el puerto ${PORT}`);
    // Ejecutar migraciones automáticamente de forma segura al inicio
    await runMigrations();
});
