const OverallProgressBar = ({ progressPercentage }) => {
  return (
    <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800 shadow-lg mb-8">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="text-lg font-bold text-white">Avance Total del Programa</h3>
          <p className="text-xs text-gray-400">Progreso acumulado en base a los módulos desbloqueados</p>
        </div>
        <span className="text-2xl font-black text-[#FFD700]">{progressPercentage}%</span>
      </div>

      <div className="w-full bg-[#0A0A0A] rounded-full h-3 overflow-hidden border border-gray-800">
        <div 
          className="bg-gradient-to-r from-yellow-600 via-[#FFD700] to-yellow-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,215,0,0.6)]" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default OverallProgressBar;

