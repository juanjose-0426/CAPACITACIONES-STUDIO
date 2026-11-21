import { Lock, Clock, CheckCircle } from 'lucide-react';

const LevelCard = ({ level, onSelect }) => {
  const isUnlocked = level.isUnlocked;

  return (
    <div 
      onClick={() => isUnlocked && onSelect(level)}
      className={`relative bg-[#1A1A1A] p-6 rounded-xl border ${
        isUnlocked 
          ? 'border-gray-700 hover:border-[#FFD700]/70 cursor-pointer transition-all hover:scale-[1.01] shadow-lg' 
          : 'border-gray-800 opacity-65 cursor-not-allowed'
      } overflow-hidden group flex flex-col justify-between`}
    >
      {/* Overlay de Bloqueo si faltan días */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
          <div className="p-3 bg-gray-900/80 rounded-full border border-gray-700 mb-3 shadow-lg">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-[#FFD700] font-bold text-sm flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4" /> 
            <span>Faltan {level.daysRemaining} día(s)</span>
          </p>
          <span className="text-[11px] text-gray-400 mt-1">Se desbloquea automáticamente</span>
        </div>
      )}

      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            isUnlocked 
              ? 'bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30' 
              : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}>
            Módulo {level.order_num}
          </span>
          {isUnlocked && <CheckCircle className="w-5 h-5 text-[#FFD700]" />}
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors">
          {level.title}
        </h3>
        <p className="text-gray-400 text-sm mb-6 line-clamp-3">
          {level.description || 'Módulo de formación especializada.'}
        </p>
      </div>

      {isUnlocked && (
        <button className="w-full mt-2 py-2.5 bg-gray-800 group-hover:bg-[#FFD700] group-hover:text-black rounded-lg transition-colors text-sm font-semibold cursor-pointer">
          Ver Contenido
        </button>
      )}
    </div>
  );
};

export default LevelCard;

