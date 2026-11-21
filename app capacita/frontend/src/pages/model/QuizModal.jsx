import { useState } from 'react';
import { HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const QuizModal = ({ question, onCompleted, onFailed }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [resultMsg, setResultMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedOption === null || verifying) return;

    setVerifying(true);
    setResultMsg({ type: '', text: '' });

    try {
      // Verificación segura en el servidor (backend)
      const res = await api.post('/questions/verify', {
        content_id: question.content_id,
        selected_index: selectedOption,
      });

      if (res.data.success) {
        setResultMsg({
          type: 'success',
          text: res.data.message || '¡Respuesta correcta! Video completado.',
        });
        setTimeout(() => {
          onCompleted(question.content_id);
        }, 1800);
      } else {
        setResultMsg({
          type: 'error',
          text: res.data.message || 'Respuesta incorrecta. Debes repasar el contenido.',
        });
        setTimeout(() => {
          onFailed();
        }, 2500);
      }
    } catch (err) {
      setResultMsg({
        type: 'error',
        text: err.response?.data?.message || 'Error al validar la respuesta en el servidor.',
      });
      setTimeout(() => {
        onFailed();
      }, 2500);
    } finally {
      setVerifying(false);
    }
  };

  const options = Array.isArray(question.options)
    ? question.options
    : typeof question.options === 'string'
    ? JSON.parse(question.options)
    : [];

  return (
    <div className="w-full aspect-video bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-y-auto">
      <div className="max-w-lg w-full space-y-4">
        <div className="flex items-center justify-center gap-2 text-[#FFD700]">
          <HelpCircle className="w-6 h-6" />
          <h3 className="text-xl font-bold">Comprobación de Conocimiento</h3>
        </div>

        <p className="text-base text-gray-200 font-medium">
          {question.question_text}
        </p>

        {resultMsg.text && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-center gap-3 text-sm font-semibold animate-scale-up ${
              resultMsg.type === 'success'
                ? 'bg-green-500/20 border-green-500 text-green-300'
                : 'bg-red-500/20 border-red-500 text-red-300'
            }`}
          >
            {resultMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <span>{resultMsg.text}</span>
          </div>
        )}

        {!resultMsg.text && (
          <form onSubmit={handleSubmit} className="space-y-2.5 text-left mt-4">
            {options.map((opt, idx) => (
              <label
                key={idx}
                className={`block w-full p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedOption === idx
                    ? 'bg-[#FFD700]/20 border-[#FFD700] text-white shadow-[0_0_10px_rgba(255,215,0,0.2)]'
                    : 'bg-[#1A1A1A] border-gray-800 hover:border-gray-700 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="quizOption"
                    className="w-4 h-4 text-[#FFD700] focus:ring-[#FFD700] cursor-pointer"
                    checked={selectedOption === idx}
                    onChange={() => setSelectedOption(idx)}
                  />
                  <span className="text-sm font-medium">{opt}</span>
                </div>
              </label>
            ))}

            <button
              type="submit"
              disabled={selectedOption === null || verifying}
              className="w-full mt-4 bg-[#FFD700] hover:bg-[#E6C200] text-black font-bold py-3 rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
            >
              {verifying ? 'Verificando con el servidor...' : 'Enviar Respuesta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuizModal;

