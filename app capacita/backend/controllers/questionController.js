const pool = require('../db');

// @desc    Obtener la pregunta de un contenido (oculta respuesta correcta a no-admins)
// @route   GET /api/questions/:contentId
// @access  Private
const getQuestionByContent = async (req, res) => {
    try {
        const [questions] = await pool.query('SELECT * FROM questions WHERE content_id = ? LIMIT 1', [req.params.contentId]);
        if (questions.length === 0) {
            return res.json(null);
        }

        const q = questions[0];
        const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;

        // Si es admin, devolver todo incluyendo correct_index
        if (req.user && req.user.role === 'admin') {
            return res.json({
                ...q,
                options: parsedOptions
            });
        }

        // Si es modelo o monitor, ocultar correct_index por seguridad
        return res.json({
            id: q.id,
            content_id: q.content_id,
            question_text: q.question_text,
            options: parsedOptions
        });
    } catch (error) {
        console.error('Error al obtener pregunta:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Verificar respuesta de cuestionario en el servidor
// @route   POST /api/questions/verify
// @access  Private
const verifyAnswer = async (req, res) => {
    const { content_id, selected_index } = req.body;

    if (!content_id || selected_index === undefined || selected_index === null) {
        return res.status(400).json({ message: 'content_id y selected_index son obligatorios' });
    }

    try {
        const [questions] = await pool.query('SELECT id, correct_index FROM questions WHERE content_id = ? LIMIT 1', [content_id]);
        
        if (questions.length === 0) {
            return res.status(404).json({ message: 'No hay pregunta asociada a este contenido' });
        }

        const isCorrect = Number(selected_index) === Number(questions[0].correct_index);

        if (isCorrect) {
            // Registrar visualización completada automáticamente
            await pool.query(
                'INSERT IGNORE INTO content_views (user_id, content_id) VALUES (?, ?)',
                [req.user.id, content_id]
            );

            return res.json({
                success: true,
                message: '¡Respuesta correcta! Contenido completado exitosamente.'
            });
        } else {
            return res.json({
                success: false,
                message: 'Respuesta incorrecta. Debes volver a ver el contenido para reintentar.'
            });
        }
    } catch (error) {
        console.error('Error al verificar respuesta:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Crear o actualizar pregunta para un contenido
// @route   POST /api/questions
// @access  Private/Admin
const saveQuestion = async (req, res) => {
    const { content_id, question_text, options, correct_index } = req.body;

    if (!content_id || !question_text || !Array.isArray(options) || correct_index === undefined) {
        return res.status(400).json({ message: 'Faltan datos de la pregunta o formato de opciones inválido' });
    }

    try {
        const [existing] = await pool.query('SELECT id FROM questions WHERE content_id = ?', [content_id]);
        const optionsJson = JSON.stringify(options);

        if (existing.length > 0) {
            await pool.query(
                'UPDATE questions SET question_text = ?, options = ?, correct_index = ? WHERE content_id = ?',
                [question_text, optionsJson, correct_index, content_id]
            );
        } else {
            await pool.query(
                'INSERT INTO questions (content_id, question_text, options, correct_index) VALUES (?, ?, ?, ?)',
                [content_id, question_text, optionsJson, correct_index]
            );
        }

        res.status(201).json({ message: 'Pregunta guardada correctamente' });
    } catch (error) {
        console.error('Error al guardar pregunta:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { getQuestionByContent, verifyAnswer, saveQuestion };
