import { useState, useEffect } from 'react';
import { X, Film, Upload, Check, AlertCircle, HardDrive } from 'lucide-react';
import api from '../../services/api';

const ContentModal = ({ content, levels, preselectedLevelId, onClose, onSaved }) => {
  const isEditing = Boolean(content);
  const [levelId, setLevelId] = useState(preselectedLevelId || (levels[0]?.id || ''));
  const [type, setType] = useState('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState([]);
  const [unlinkedFiles, setUnlinkedFiles] = useState([]);
  const [selectedExistingUrl, setSelectedExistingUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (content) {
      setTitle(content.title || '');
      setDescription(content.description || '');
      setLevelId(content.level_id || preselectedLevelId || (levels[0]?.id || ''));
      setType(content.type || 'video');
      if (content.type === 'text') {
        setTextContent(content.content_url_or_text || '');
      }
    } else {
      setTitle('');
      setDescription('');
      setTextContent('');
      setFiles([]);
      setSelectedExistingUrl('');
      setLevelId(preselectedLevelId || (levels[0]?.id || ''));

      // Consultar si hay archivos en /uploads sin vincular
      api.get('/contents/files/unlinked')
        .then((res) => setUnlinkedFiles(res.data || []))
        .catch(() => setUnlinkedFiles([]));
    }
  }, [content, preselectedLevelId, levels]);

  const handleFileChange = (selectedFileList) => {
    const arr = Array.from(selectedFileList || []);
    if (arr.length === 0) return;
    setFiles(arr);
    setSelectedExistingUrl('');

    // Si el título está vacío, sugerir el nombre del primer archivo sin extensión
    if (!title.trim() && arr.length === 1) {
      const cleanName = arr[0].name.replace(/\.[^/.]+$/, '');
      setTitle(cleanName);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    const targetLevelId = levelId || preselectedLevelId || levels[0]?.id;
    if (!targetLevelId) {
      setMsg({ type: 'error', text: 'Primero debes seleccionar o crear un nivel.' });
      return;
    }

    if (!isEditing && type !== 'text' && files.length === 0 && !selectedExistingUrl) {
      setMsg({ type: 'error', text: 'Por favor selecciona al menos un archivo para publicar.' });
      return;
    }

    setSaving(true);
    setUploadProgress(0);

    try {
      if (isEditing) {
        await api.put(`/contents/${content.id}`, {
          title,
          description
        });
        setMsg({ type: 'success', text: 'Contenido actualizado correctamente' });
      } else if (type === 'text' || selectedExistingUrl) {
        await api.post('/contents', {
          level_id: targetLevelId,
          type,
          title: title.trim() || 'Contenido del Módulo',
          description,
          content_url_or_text: type === 'text' ? textContent : selectedExistingUrl
        });
        setMsg({ type: 'success', text: 'Contenido publicado exitosamente' });
      } else {
        // Subir uno o varios archivos seleccionados desde la PC
        for (let i = 0; i < files.length; i++) {
          const currentFile = files[i];
          const cleanName = currentFile.name.replace(/\.[^/.]+$/, '');
          const itemTitle =
            files.length === 1
              ? (title.trim() || cleanName)
              : (title.trim() ? `${title.trim()} (${i + 1})` : cleanName);

          const formData = new FormData();
          formData.append('level_id', String(targetLevelId));
          formData.append('type', type);
          formData.append('title', itemTitle);
          formData.append('description', description || '');
          formData.append('file', currentFile);

          await api.post('/contents', formData, {
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const filePercent = (progressEvent.loaded / progressEvent.total) * 100;
                const totalPercent = Math.round(((i * 100) + filePercent) / files.length);
                setUploadProgress(totalPercent);
              }
            }
          });
        }

        setMsg({
          type: 'success',
          text: files.length > 1
            ? `¡${files.length} archivos subidos y publicados exitosamente!`
            : '¡Video / archivo publicado exitosamente!'
        });
      }

      setTimeout(() => {
        onSaved(targetLevelId);
      }, 900);
    } catch (err) {
      console.error('Error al subir contenido:', err);
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Error al subir el archivo. Verifica tu conexión con el servidor.'
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredUnlinked = unlinkedFiles.filter((f) => f.type === type);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#FFD700]" />
            <h3 className="text-base font-bold text-white">
              {isEditing ? 'Editar Información del Contenido' : 'Publicar Nuevo Contenido'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 p-1.5 rounded-full cursor-pointer">
            <X className="w-4 h-4"/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
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

          {!isEditing && (
            <>
              <div>
                <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Módulo / Nivel</label>
                <select 
                  value={levelId}
                  onChange={(e) => setLevelId(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                >
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.target_role === 'both' ? 'Todos' : l.target_role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Tipo de Formato</label>
                <div className="grid grid-cols-3 gap-2">
                  {['video', 'pdf', 'text'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setType(t);
                        setFiles([]);
                        setSelectedExistingUrl('');
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold uppercase transition-colors cursor-pointer ${
                        type === t 
                          ? 'bg-[#FFD700] border-[#FFD700] text-black' 
                          : 'bg-[#1A1A1A] border-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">
              Título {files.length > 1 && '(se numerará automáticamente para cada archivo)'}
            </label>
            <input 
              type="text" 
              required={isEditing || type === 'text'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none"
              placeholder="Ej: Clase 1: Hablar Sucio en Transmisión"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Descripción (Opcional)</label>
            <textarea 
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none"
              placeholder="Resumen del material..."
            />
          </div>

          {!isEditing && type === 'text' && (
            <div>
              <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Contenido de Texto</label>
              <textarea 
                rows="5"
                required
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none font-mono"
                placeholder="Escribe el texto de capacitación aquí..."
              />
            </div>
          )}

          {!isEditing && type !== 'text' && (
            <div className="space-y-3">
              <label className="block text-xs uppercase font-semibold text-gray-400">
                Subir Archivo(s) {type === 'video' ? '(MP4, MOV, MKV, WebM, AVI)' : '(PDF)'}
              </label>

              <label
                htmlFor="contentFileInput"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors block ${
                  isDragging
                    ? 'border-[#FFD700] bg-[#FFD700]/10'
                    : files.length > 0
                    ? 'border-green-500/60 bg-green-500/5'
                    : 'border-gray-700 hover:border-[#FFD700] bg-[#1A1A1A]/40'
                }`}
              >
                <input 
                  type="file" 
                  multiple
                  accept={type === 'video' ? 'video/*,.mp4,.mov,.mkv,.avi,.webm,.m4v' : 'application/pdf,.pdf'}
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="hidden" 
                  id="contentFileInput"
                />
                <Upload className="w-8 h-8 text-[#FFD700] mx-auto mb-2" />
                {files.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-green-400">
                      {files.length === 1
                        ? files[0].name
                        : `${files.length} archivos seleccionados`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB en total • Haz clic para cambiar
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-white">
                      Haz clic aquí o arrastra tus {type === 'video' ? 'videos' : 'PDFs'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Puedes seleccionar uno o varios archivos a la vez (MP4, MOV, MKV, PDF)
                    </p>
                  </>
                )}
              </label>

              {/* Opción rápida si hay archivos en la carpeta /uploads sin vincular */}
              {filteredUnlinked.length > 0 && (
                <div className="bg-[#141414] border border-gray-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#FFD700] mb-2">
                    <HardDrive className="w-4 h-4" />
                    <span>O selecciona un archivo ya guardado en el servidor ({filteredUnlinked.length}):</span>
                  </div>
                  <select
                    value={selectedExistingUrl}
                    onChange={(e) => {
                      setSelectedExistingUrl(e.target.value);
                      if (e.target.value) setFiles([]);
                    }}
                    className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  >
                    <option value="">-- Subir archivo nuevo desde mi PC --</option>
                    {filteredUnlinked.map((f) => (
                      <option key={f.filename} value={f.url}>
                        {f.filename} ({(f.size / (1024 * 1024)).toFixed(1)} MB)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {saving && uploadProgress > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>Subiendo y publicando...</span>
                    <span className="font-bold text-[#FFD700]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-[#FFD700] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

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
              {saving ? `Publicando... ${uploadProgress > 0 ? `${uploadProgress}%` : ''}` : (isEditing ? 'Actualizar' : 'Publicar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;
