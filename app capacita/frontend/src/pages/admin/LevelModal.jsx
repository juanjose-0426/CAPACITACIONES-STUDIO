import { useState, useEffect } from 'react';
import { X, FolderOpen, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const LevelModal = ({ level, totalLevels, onClose, onSaved }) => {
  const isEditing = Boolean(level);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unlockDays, setUnlockDays] = useState(0);
  const [targetRole, setTargetRole] = useState('both');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (level) {
      setTitle(level.title || '');
      setDescription(level.description || '');
      setUnlockDays(level.unlock_days || 0);
      setTargetRole(level.target_role || 'both');
    } else {
      setTitle('');
      setDescription('');
      setUnlockDays(0);
      setTargetRole('both');
    }
  }, [level]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSaving(true);

    const payload = {
      title,
      description,
      unlock_days: parseInt(unlockDays) || 0,
      target_role: targetRole,
      order_num: isEditing ? level.order_num : totalLevels + 1
    };

    try {
      if (isEditing) {
        await api.put(`/levels/${level.id}`, payload);
      } else {
        await api.post('/levels', payload);
      }
      setMsg({ type: 'success', text: `Nivel ${isEditing ? 'actualizado' : 'creado'} con éxito` });
      setTimeout(() => {
        onSaved();
      }, 1000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error al guardar el nivel' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#FFD700]" />
            <h3 className="text-base font-bold text-white">
              {isEditing ? 'Editar Nivel / Módulo' : 'Nuevo Nivel / Módulo'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 p-1.5 rounded-full cursor-pointer">
            <X className="w-4 h-4"/>
          </button>
        </div>

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
            <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Título del Módulo</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none"
              placeholder="Ej: Módulo 1: Introducción y Normas de Estudio"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Descripción</label>
            <textarea 
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none"
              placeholder="Descripción breve de los objetivos y contenidos..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">
                Días de Desbloqueo
              </label>
              <input 
                type="number" 
                min="0"
                value={unlockDays}
                onChange={(e) => setUnlockDays(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                title="Días transcurridos desde que el usuario se registró para desbloquear este nivel"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">0 = Inmediato desde el día 1</span>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">
                Audiencia Objetivo
              </label>
              <select 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none"
              >
                <option value="both">Todos (Modelos y Monitores)</option>
                <option value="model">Solo Modelos</option>
                <option value="monitor">Solo Monitores</option>
              </select>
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
              {saving ? 'Guardando...' : (isEditing ? 'Actualizar Nivel' : 'Crear Nivel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LevelModal;

