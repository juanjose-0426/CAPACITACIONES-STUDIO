import { Users, Eye, FolderOpen } from 'lucide-react';

const AdminStats = ({ modelsCount, monitorsCount, levelsCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden">
        <Users className="w-16 h-16 text-[#FFD700] absolute top-0 right-0 p-4 opacity-10" />
        <h3 className="text-gray-400 font-medium mb-1">Total Modelos</h3>
        <p className="text-3xl font-bold text-white">{modelsCount}</p>
      </div>

      <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden">
        <Eye className="w-16 h-16 text-[#FFD700] absolute top-0 right-0 p-4 opacity-10" />
        <h3 className="text-gray-400 font-medium mb-1">Total Monitores</h3>
        <p className="text-3xl font-bold text-white">{monitorsCount}</p>
      </div>

      <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden">
        <FolderOpen className="w-16 h-16 text-[#FFD700] absolute top-0 right-0 p-4 opacity-10" />
        <h3 className="text-gray-400 font-medium mb-1">Niveles Creados</h3>
        <p className="text-3xl font-bold text-white">{levelsCount}</p>
      </div>
    </div>
  );
};

export default AdminStats;

