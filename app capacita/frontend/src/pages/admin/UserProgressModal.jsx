import { X, CheckCircle, Clock } from 'lucide-react';

const UserProgressModal = ({ user, views, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1A1A1A]">
          <div>
            <h3 className="text-lg font-bold text-white">Progreso de {user.name}</h3>
            <p className="text-xs text-gray-400 capitalize">{user.role} • {user.email}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4"/>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <h4 className="text-sm font-semibold text-[#FFD700] uppercase tracking-wider">
            Contenidos Vistos y Completados ({views.length})
          </h4>

          {views.length === 0 ? (
            <p className="text-gray-500 text-sm italic py-4">Este usuario aún no ha completado ningún contenido.</p>
          ) : (
            <div className="space-y-2">
              {views.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-gray-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-white">{v.content_title}</p>
                      <span className="text-xs text-gray-500">{v.level_title}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span>{new Date(v.watched_at).toLocaleDateString()} {new Date(v.watched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProgressModal;

