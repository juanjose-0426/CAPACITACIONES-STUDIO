const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear la carpeta uploads si no existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
        cb(null, uniqueSuffix + ext);
    }
});

// Filtro de archivos permitidos (soporta MP4, MOV, MKV, AVI, WebM, PDF e imágenes)
const fileFilter = (req, file, cb) => {
    const allowedExtensions = /\.(mp4|mov|webm|mkv|avi|m4v|wmv|flv|3gp|mpeg|mpg|ogv|ts|pdf|jpeg|jpg|png|gif|webp)$/i;
    const ext = path.extname(file.originalname).toLowerCase();
    const hasValidExt = allowedExtensions.test(ext);

    const mime = (file.mimetype || '').toLowerCase();
    const hasValidMime =
        mime.startsWith('video/') ||
        mime.startsWith('image/') ||
        mime === 'application/pdf' ||
        mime === 'application/octet-stream';

    if (hasValidExt || hasValidMime) {
        return cb(null, true);
    } else {
        return cb(new Error(`Formato de archivo no soportado (${ext || mime}). Sube un video (MP4, MOV, MKV, WebM, AVI) o PDF.`));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB máximo
    fileFilter: fileFilter
});

module.exports = upload;
