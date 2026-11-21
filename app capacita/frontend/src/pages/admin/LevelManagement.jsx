import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  HelpCircle, 
  Film, 
  FileText, 
  FileCode, 
  FolderOpen, 
  Clock, 
  Users,
  PlayCircle,
  X,
  ExternalLink
} from 'lucide-react';
import api, { getFileUrl } from '../../services/api';
import LevelModal from './LevelModal';
import ContentModal from './ContentModal';
import QuestionModal from './QuestionModal';

const LevelManagement = ({ levels, levelContents, onRefresh, onRefreshLevel }) => {
  // Modals state
  const [levelModal, setLevelModal] = useState({ isOpen: false, level: null });
  const [contentModal, setContentModal] = useState({ isOpen: false, content: null, preselectedLevelId: null });
  const [questionModal, setQuestionModal] = useState({ isOpen: false, content: null });
  const [previewContent, setPreviewContent] = useState(null);

  const handleDeleteLevel = async (id, title) => {
    if (!window.confirm(`¿Estás seguro de eliminar el nivel "${title}" y TODOS sus contenidos?`)) return;
    try {
      await api.delete(`/levels/${id}`);
      onRefresh();
    } catch (err) {
      console.error('Error al eliminar nivel:', err);
    }
  };

  const handleDeleteContent = async (contentId, levelId, title) => {
    if (!window.confirm(`¿Estás seguro de eliminar el contenido "${title}"?`)) return;
    try {
      await api.delete(`/contents/${contentId}`);
      onRefreshLevel(levelId);
    } catch (err) {
      console.error('Error al eliminar contenido:', err);
    }
  };

  const getFormatIcon = (type) => {
    if (type === 'video') return <Film className="w-4 h-4 text-[#FFD700]" />;
    if (type === 'pdf') return <FileText className="w-4 h-4 text-red-400" />;
    return <FileCode className="w-4 h-4 text-blue-400" />;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Barra superior de acciones */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1A1A1A] p-4 rounded-xl border border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">Niveles y Contenidos de Capacitación</h2>
            <p className="text-xs text-gray-400">Organiza los módulos, los días de desbloqueo y sus evaluaciones.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLevelModal({ isOpen: true, level: null })}
              className="flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Nivel</span>
            </button>

            {levels.length > 0 && (
              <button
                onClick={() => setContentModal({ isOpen: true, content: null, preselectedLevelId: levels[0].id })}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#FFD700]" />
                <span>Subir Contenido</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de Niveles */}
        <div className="space-y-4">
          {levels.map((level) => {
            const contents = levelContents[level.id] || [];

            return (
              <div 
                key={level.id} 
                className="bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden shadow-lg transition-all"
              >
                {/* Cabecera del nivel */}
                <div className="p-5 border-b border-gray-800/80 flex flex-wrap items-center justify-between gap-4 bg-[#141414]">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] rounded-lg text-xs font-bold uppercase">
                      Módulo {level.order_num}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{level.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{level.description || 'Sin descripción'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{level.unlock_days === 0 ? 'Inmediato' : `${level.unlock_days} día(s)`}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="capitalize">{level.target_role === 'both' ? 'Todos' : level.target_role}</span>
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-gray-800 pl-4">
                      <button
                        onClick={() => setContentModal({ isOpen: true, content: null, preselectedLevelId: level.id })}
                        className="px-2.5 py-1.5 bg-[#FFD700]/15 hover:bg-[#FFD700] text-[#FFD700] hover:text-black rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Agregar video o documento a este nivel"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Subir Video / PDF</span>
                      </button>
                      <button
                        onClick={() => setLevelModal({ isOpen: true, level })}
                        className="p-1.5 bg-gray-800 hover:bg-blue-600 hover:text-white rounded text-gray-300 transition-colors cursor-pointer"
                        title="Editar nivel"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLevel(level.id, level.title)}
                        className="p-1.5 bg-gray-800 hover:bg-red-900/60 hover:text-red-300 rounded text-gray-300 transition-colors cursor-pointer"
                        title="Eliminar nivel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de contenidos del nivel */}
                <div className="p-4">
                  {contents.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-500 italic">
                      No hay contenidos subidos en este módulo. Haz clic en "Subir Video / PDF" para agregar tus archivos.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {contents.map((c) => (
                        <div 
                          key={c.id} 
                          className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                        >
                          <div 
                            onClick={() => setPreviewContent(c)}
                            className="flex items-center gap-3 overflow-hidden pr-2 cursor-pointer group flex-1"
                          >
                            <div className="p-2 bg-gray-800 group-hover:bg-[#FFD700]/20 rounded-lg shrink-0 transition-colors">
                              {getFormatIcon(c.type)}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-medium text-sm text-white group-hover:text-[#FFD700] truncate transition-colors">
                                {c.title}
                              </p>
                              <span className="text-[11px] text-gray-500 uppercase">{c.type} • Clic para reproducir</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setPreviewContent(c)}
                              className="p-1.5 bg-gray-800 hover:bg-green-600 hover:text-white rounded text-gray-300 transition-colors cursor-pointer"
                              title="Reproducir / Previsualizar contenido"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setQuestionModal({ isOpen: true, content: c })}
                              className="p-1.5 bg-gray-800 hover:bg-[#FFD700] hover:text-black rounded text-gray-300 transition-colors cursor-pointer"
                              title="Configurar pregunta de comprobación"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setContentModal({ isOpen: true, content: c, preselectedLevelId: level.id })}
                              className="p-1.5 bg-gray-800 hover:bg-blue-600 hover:text-white rounded text-gray-300 transition-colors cursor-pointer"
                              title="Editar título y descripción"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteContent(c.id, level.id, c.title)}
                              className="p-1.5 bg-gray-800 hover:bg-red-900/60 hover:text-red-300 rounded text-gray-300 transition-colors cursor-pointer"
                              title="Eliminar contenido"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {levels.length === 0 && (
            <div className="text-center py-12 bg-[#1A1A1A] rounded-xl border border-gray-800">
              <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No hay módulos creados aún</p>
              <p className="text-xs text-gray-500 mt-1">Crea tu primer módulo para comenzar a estructurar la capacitación.</p>
              <button
                onClick={() => setLevelModal({ isOpen: true, level: null })}
                className="mt-4 bg-[#FFD700] text-black font-semibold px-4 py-2 rounded-lg text-sm cursor-pointer"
              >
                Crear Primer Nivel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Previsualización de Video / PDF para el Admin */}
      {previewContent && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1A1A1A]">
              <div>
                <h3 className="text-base font-bold text-white">{previewContent.title}</h3>
                {previewContent.description && (
                  <p className="text-xs text-gray-400">{previewContent.description}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewContent(null)}
                className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black flex-1 overflow-y-auto flex items-center justify-center">
              {previewContent.type === 'video' ? (
                <video
                  controls
                  autoPlay
                  className="w-full max-h-[75vh] object-contain bg-black"
                  src={getFileUrl(previewContent.content_url_or_text)}
                >
                  Tu navegador no soporta la reproducción de este video.
                </video>
              ) : previewContent.type === 'pdf' ? (
                <div className="w-full h-[75vh] flex flex-col">
                  <div className="bg-[#141414] p-2 px-4 flex justify-end border-b border-gray-800">
                    <a
                      href={getFileUrl(previewContent.content_url_or_text)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#FFD700] hover:underline flex items-center gap-1"
                    >
                      <span>Abrir en pestaña nueva</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <iframe
                    src={getFileUrl(previewContent.content_url_or_text)}
                    className="w-full flex-1 border-0"
                    title={previewContent.title}
                  />
                </div>
              ) : (
                <div className="p-6 text-gray-200 whitespace-pre-wrap w-full">
                  {previewContent.content_url_or_text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      {levelModal.isOpen && (
        <LevelModal 
          level={levelModal.level}
          totalLevels={levels.length}
          onClose={() => setLevelModal({ isOpen: false, level: null })}
          onSaved={() => {
            setLevelModal({ isOpen: false, level: null });
            onRefresh();
          }}
        />
      )}

      {contentModal.isOpen && (
        <ContentModal 
          content={contentModal.content}
          levels={levels}
          preselectedLevelId={contentModal.preselectedLevelId}
          onClose={() => setContentModal({ isOpen: false, content: null, preselectedLevelId: null })}
          onSaved={(lvlId) => {
            setContentModal({ isOpen: false, content: null, preselectedLevelId: null });
            if (lvlId) onRefreshLevel(lvlId);
            onRefresh();
          }}
        />
      )}

      {questionModal.isOpen && (
        <QuestionModal 
          content={questionModal.content}
          onClose={() => setQuestionModal({ isOpen: false, content: null })}
        />
      )}
    </>
  );
};

export default LevelManagement;
