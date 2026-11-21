const pool = require('../db');
const path = require('path');
const fs = require('fs');

// @desc    Obtener contenidos de un nivel (Validando rol y días de desbloqueo)
// @route   GET /api/contents/:levelId
// @access  Private
const getContentsByLevel = async (req, res) => {
    const levelId = req.params.levelId;

    try {
        // Si el usuario no es admin, verificar restricciones de acceso
        if (req.user.role !== 'admin') {
            const [userRow] = await pool.query('SELECT created_at, role FROM users WHERE id = ?', [req.user.id]);
            const [levelRow] = await pool.query('SELECT unlock_days, target_role FROM levels WHERE id = ?', [levelId]);
            
            if (levelRow.length === 0) {
                return res.status(404).json({ message: 'Nivel no encontrado' });
            }

            const level = levelRow[0];
            const user = userRow[0];

            // Validar si el nivel corresponde al rol del usuario
            if (level.target_role !== 'both' && level.target_role !== user.role) {
                return res.status(403).json({ message: 'No tienes acceso a los contenidos de este nivel.' });
            }

            // Validar días transcurridos
            const createdDate = new Date(user.created_at);
            const currentDate = new Date();
            const daysSinceCreation = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));

            if (daysSinceCreation < level.unlock_days) {
                const remaining = level.unlock_days - daysSinceCreation;
                return res.status(403).json({ 
                    message: `Este nivel aún está bloqueado. Estará disponible en ${remaining} día(s).` 
                });
            }
        }

        const [contents] = await pool.query('SELECT * FROM contents WHERE level_id = ? ORDER BY id ASC', [levelId]);
        res.json(contents);
    } catch (error) {
        console.error('Error al obtener contenidos:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Crear contenido (Subir archivo o texto)
// @route   POST /api/contents
// @access  Private/Admin
const createContent = async (req, res) => {
    const { level_id, type, title, description } = req.body;
    let content_url_or_text = '';

    if (req.file) {
        // Guardar ruta relativa normalizada
        content_url_or_text = `/uploads/${req.file.filename}`;
    } else if (req.body.content_url_or_text) {
        content_url_or_text = req.body.content_url_or_text;
    }

    if (!level_id) {
        return res.status(400).json({ message: 'Debe seleccionar un nivel o módulo válido' });
    }

    if (!content_url_or_text) {
        return res.status(400).json({ message: 'Debe proveer un archivo válido o un contenido de texto' });
    }

    try {
        const finalTitle = (title && title.trim()) ? title.trim() : (req.file ? req.file.originalname : 'Contenido');
        const [result] = await pool.query(
            'INSERT INTO contents (level_id, type, title, content_url_or_text, description) VALUES (?, ?, ?, ?, ?)',
            [level_id, type || 'video', finalTitle, content_url_or_text, description || '']
        );

        console.log(`[Contenido] Publicado con éxito: "${finalTitle}" -> ${content_url_or_text} (Nivel ${level_id})`);

        res.status(201).json({
            id: result.insertId,
            level_id: Number(level_id),
            type: type || 'video',
            title: finalTitle,
            content_url_or_text,
            description: description || ''
        });
    } catch (error) {
        console.error('Error al crear contenido:', error);
        res.status(500).json({ message: 'Error en el servidor al guardar contenido: ' + error.message });
    }
};

// @desc    Actualizar contenido (Título/Descripción)
// @route   PUT /api/contents/:id
// @access  Private/Admin
const updateContent = async (req, res) => {
    const { title, description } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE contents SET title = ?, description = ? WHERE id = ?',
            [title, description, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contenido no encontrado' });
        }

        res.json({ message: 'Contenido actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar contenido:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Eliminar contenido (y eliminar archivo físico del disco si existe)
// @route   DELETE /api/contents/:id
// @access  Private/Admin
const deleteContent = async (req, res) => {
    try {
        // 1. Obtener la ruta del archivo para borrarlo del disco
        const [rows] = await pool.query('SELECT content_url_or_text FROM contents WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Contenido no encontrado' });
        }

        const fileUrl = rows[0].content_url_or_text;
        if (fileUrl && fileUrl.startsWith('/uploads/')) {
            const filename = path.basename(fileUrl);
            const physicalPath = path.join(__dirname, '../uploads', filename);
            if (fs.existsSync(physicalPath)) {
                try {
                    fs.unlinkSync(physicalPath);
                } catch (fsErr) {
                    console.error('No se pudo eliminar el archivo físico:', fsErr.message);
                }
            }
        }

        // 2. Eliminar de la base de datos
        await pool.query('DELETE FROM contents WHERE id = ?', [req.params.id]);

        res.json({ message: 'Contenido y archivos asociados eliminados correctamente' });
    } catch (error) {
        console.error('Error al eliminar contenido:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Listar archivos existentes en /uploads que aún no están registrados en la BD
// @route   GET /api/contents/files/unlinked
// @access  Private/Admin
const getUnlinkedFiles = async (req, res) => {
    try {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            return res.json([]);
        }

        const allFiles = fs.readdirSync(uploadDir);
        const [rows] = await pool.query('SELECT content_url_or_text FROM contents');
        const usedUrls = new Set(rows.map(r => r.content_url_or_text));

        const unlinked = allFiles
            .filter(filename => !usedUrls.has(`/uploads/${filename}`))
            .map(filename => {
                const filePath = path.join(uploadDir, filename);
                const stat = fs.statSync(filePath);
                const ext = path.extname(filename).toLowerCase();
                const isPdf = ext === '.pdf';
                return {
                    filename,
                    url: `/uploads/${filename}`,
                    type: isPdf ? 'pdf' : 'video',
                    size: stat.size,
                    createdAt: stat.mtime
                };
            });

        res.json(unlinked);
    } catch (error) {
        console.error('Error al listar archivos en uploads:', error);
        res.status(500).json({ message: 'Error al consultar archivos en el servidor' });
    }
};

// @desc    Streaming de archivo con soporte HTTP 206 (Range requests para video y lectura de PDF)
// @route   GET /api/contents/stream/:filename
// @access  Public / Protected
const streamContentFile = (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.mp4': 'video/mp4',
        '.mov': 'video/mp4',
        '.m4v': 'video/mp4',
        '.mkv': 'video/x-matroska',
        '.avi': 'video/x-msvideo',
        '.webm': 'video/webm',
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes'
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
};

module.exports = { 
    getContentsByLevel, 
    createContent, 
    deleteContent, 
    updateContent,
    getUnlinkedFiles,
    streamContentFile
};
