import { useState, useEffect } from 'react';
import { X, HelpCircle, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const QuestionModal = ({ content, onClose }) => {
  const [qText, setQText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!content) return;

    const fetchQuestion = async () => {
      try {
        const res = await api.get(`/questions/${content.id}`);
        if (res.data) {
          setQText(res.data.question_text);
          setOptions(res.data.options || ['', '', '', '']);
          setCorrectIndex(res.data.correct_index ?? 0);
        } else {
          setQText('');
          setOptions(['', '', '', '']);
          setCorrectIndex(0);
        }
      } catch (err) {
        console.error('Error al cargar pregunta:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [content]);

  if (!content) return null;

  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (options.some(opt => !opt.trim())) {
      setMsg({ type: 'error', text: 'Por favor completa todas las 4 opciones.' });
      return;
    }

    setSaving(true);
    try {
      await api.post('/questions', {
        content_id: content.id,
        question_text: qText,
        options,
        correct_index: correctIndex
      });

      setMsg({ type: 'success', text: 'Pregunta guardada correctamente' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error al guardar la pregunta' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FFD700]" />
            <div>
              <h3 className="text-base font-bold text-white">Pregunta de Evaluación</h3>
              <p className="text-xs text-gray-400 line-clamp-1">{content.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 p-1.5 rounded-full cursor-pointer">
            <X className="w-4 h-4"/>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#FFD700]">Cargando pregunta...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {msg.text && (
              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                msg.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/50 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/50 text-red-400'
              }`}>
                {msg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">
                Pregunta (se mostrará al terminar el video)
              </label>
              <textarea 
                rows="2"
                required
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                placeholder="Ej: ¿Cuál es el paso clave antes de iniciar la transmisión?"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-gray-400 mb-2">
                Opciones (marca la casilla circular de la respuesta correcta)
              </label>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="correctOption" 
                      checked={correctIndex === idx}
                      onChange={() => setCorrectIndex(idx)}
                      className="w-4 h-4 text-[#FFD700] focus:ring-[#FFD700] cursor-pointer"
                      title="Marcar como respuesta correcta"
                    />
                    <input 
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Opción ${idx + 1}`}
                      className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-5 py-2 bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Pregunta'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuestionModal;

