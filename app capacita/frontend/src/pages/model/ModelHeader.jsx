import { LogOut } from 'lucide-react';

const ModelHeader = ({ user, logout }) => {
  const isMonitor = user?.role === 'monitor';

  return (
    <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
      <div className="flex items-center gap-4">
        <img 
          src="/logo.png" 
          alt="Guzmán Studio" 
          className="h-16 drop-shadow-lg" 
          onError={(e) => { e.target.style.display = 'none'; }} 
        />
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-white">Mi</span> <span className="text-[#FFD700]">Progreso</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
            <span>Bienvenid{isMonitor ? 'o' : 'a'}, <strong className="text-white">{user?.name}</strong></span>
            <span className="px-2 py-0.5 bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 rounded text-xs uppercase font-semibold">
              {user?.role}
            </span>
          </p>
        </div>
      </div>
      <button 
        onClick={logout}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-900/30 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Salir</span>
      </button>
    </header>
  );
};

export default ModelHeader;

