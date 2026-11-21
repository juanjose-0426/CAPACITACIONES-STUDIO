import { useState } from 'react';
import { 
  X, 
  PlayCircle, 
  CheckCircle, 
  Film, 
  FileText, 
  FileCode, 
  ExternalLink 
} from 'lucide-react';
import api, { getFileUrl } from '../../services/api';
import QuizModal from './QuizModal';

const ContentViewerModal = ({ level, contents, watchedContentIds, onClose, onContentCompleted }) => {
  const [activeContent, setActiveContent] = useState(contents[0] || null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleSelectContent = (content) => {
    setActiveContent(content);
    setShowQuiz(false);
    setActiveQuiz(null);
  };

  const handleVideoEnded = async () => {
    if (!activeContent) return;

    try {
      // 1. Verificar si este contenido tiene pregunta configurada
      const res = await api.get(`/questions/${activeContent.id}`);
      if (res.data) {
        setActiveQuiz(res.data);
        setShowQuiz(true);
      } else {
        // No hay preguntas asociadas: registrar visualización completada directamente
        await api.post('/views', { content_id: activeContent.id });
        onContentCompleted(activeContent.id);
      }
    } catch (err) {
      console.error('Error al verificar pregunta:', err);
      // Fallback seguro
      try {
        await api.post('/views', { content_id: activeContent.id });
        onContentCompleted(activeContent.id);
      } catch (viewErr) {
        console.error('Error al registrar visualización:', viewErr);
      }
    }
  };

  const handleMarkAsCompleted = async (contentId) => {
    try {
      await api.post('/views', { content_id: contentId });
      onContentCompleted(contentId);
    } catch (err) {
      console.error('Error al registrar visualización:', err);
    }
  };

  const getFormatIcon = (type) => {
    if (type === 'video') return <Film className="w-4 h-4 text-[#FFD700]" />;
    if (type === 'pdf') return <FileText className="w-4 h-4 text-red-400" />;
    return <FileCode className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Cabecera del visor */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#141414] shrink-0">
          <div>
            <span className="text-xs uppercase font-semibold text-[#FFD700] tracking-wider">
              Módulo {level.order_num}
            </span>
            <h2 className="text-lg font-bold text-white">{level.title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Cuerpo del visor */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
          {/* Barra lateral: Temario / Lista de contenidos */}
          <div className="w-full md:w-1/3 space-y-3">
            <h3 className="font-semibold text-gray-400 mb-2 uppercase text-xs tracking-wider">
              Temario ({contents.length})
            </h3>

            <div className="space-y-2">
              {contents.map((c) => {
                const isSelected = activeContent?.id === c.id;
                const isCompleted = watchedContentIds.includes(c.id);

                return (
                  <button 
                    key={c.id} 
                    onClick={() => handleSelectContent(c)}
                    className={`w-full text-left p-3 rounded-xl flex items-start justify-between gap-3 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#FFD700]/15 border border-[#FFD700]/50 shadow-[0_0_12px_rgba(255,215,0,0.15)]' 
                        : 'bg-[#1A1A1A] hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 overflow-hidden">
                      <div className="mt-0.5 shrink-0">
                        {getFormatIcon(c.type)}
                      </div>
                      <div className="overflow-hidden">
                        <p className={`font-semibold text-sm truncate ${isSelected ? 'text-[#FFD700]' : 'text-white'}`}>
                          {c.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {c.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>

                    {isCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-1" title="Completado" />
                    )}
                  </button>
                );
              })}

              {contents.length === 0 && (
                <p className="text-gray-500 text-xs italic py-4">No hay contenidos en este módulo aún.</p>
              )}
            </div>
          </div>

          {/* Área principal: Reproductor / Visor */}
          <div className="w-full md:w-2/3 bg-black rounded-xl border border-gray-800 overflow-hidden flex flex-col">
            {activeContent ? (
              <>
                {showQuiz && activeQuiz ? (
                  <QuizModal 
                    question={activeQuiz}
                    onCompleted={(contentId) => {
                      setShowQuiz(false);
                      onContentCompleted(contentId);
                    }}
                    onFailed={() => {
                      setShowQuiz(false);
                    }}
                  />
                ) : activeContent.type === 'video' ? (
                  <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                    <video 
                      key={activeContent.id}
                      controls 
                      controlsList="nodownload"
                      className="w-full h-full object-contain bg-black" 
                      src={getFileUrl(activeContent.content_url_or_text)}
                      onEnded={handleVideoEnded}
                    >
                      Tu navegador no soporta el formato de video.
                    </video>
                  </div>
                ) : activeContent.type === 'pdf' ? (
                  <div className="w-full h-[65vh] flex flex-col bg-gray-900">
                    <div className="bg-[#1A1A1A] p-2.5 px-4 flex justify-between items-center text-xs border-b border-gray-800">
                      <span className="text-gray-400 font-medium">Documento de Capacitación</span>
                      <div className="flex items-center gap-3">
                        <a 
                          href={getFileUrl(activeContent.content_url_or_text)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[#FFD700] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Abrir en pestaña nueva</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <iframe 
                      src={`${getFileUrl(activeContent.content_url_or_text)}#toolbar=0`} 
                      className="w-full flex-1 border-0"
                      title={activeContent.title}
                    />

                    {!watchedContentIds.includes(activeContent.id) && (
                      <div className="p-3 bg-[#1A1A1A] border-t border-gray-800 flex justify-end">
                        <button
                          onClick={() => handleMarkAsCompleted(activeContent.id)}
                          className="bg-[#FFD700] text-black font-semibold px-4 py-2 rounded-lg text-xs hover:bg-[#E6C200] transition-colors cursor-pointer"
                        >
                          Marcar como leída y completada
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full min-h-[50vh] p-6 flex flex-col justify-between bg-[#141414]">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-4">{activeContent.title}</h4>
                      <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {activeContent.content_url_or_text}
                      </div>
                    </div>

                    {!watchedContentIds.includes(activeContent.id) && (
                      <div className="mt-8 pt-4 border-t border-gray-800 flex justify-end">
                        <button
                          onClick={() => handleMarkAsCompleted(activeContent.id)}
                          className="bg-[#FFD700] text-black font-semibold px-4 py-2 rounded-lg text-xs hover:bg-[#E6C200] transition-colors cursor-pointer"
                        >
                          Marcar como completado
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Pie de detalles del contenido */}
                {!showQuiz && (
                  <div className="p-4 bg-[#141414] border-t border-gray-800/60">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-white">{activeContent.title}</h4>
                      {watchedContentIds.includes(activeContent.id) && (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/30">
                          <CheckCircle className="w-3.5 h-3.5" /> Completado
                        </span>
                      )}
                    </div>
                    {activeContent.description && (
                      <p className="text-xs text-gray-400 mt-1">{activeContent.description}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center text-gray-600 flex-col gap-2">
                <PlayCircle className="w-12 h-12" />
                <p className="text-sm">Selecciona un contenido de la lista para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentViewerModal;

