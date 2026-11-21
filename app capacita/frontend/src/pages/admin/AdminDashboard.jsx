import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, Film } from 'lucide-react';
import api from '../../services/api';
import AdminHeader from './AdminHeader';
import AdminStats from './AdminStats';
import UserManagement from './UserManagement';
import LevelManagement from './LevelManagement';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'content'

  const [usersList, setUsersList] = useState([]);
  const [levels, setLevels] = useState([]);
  const [levelContents, setLevelContents] = useState({});

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setUsersList(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  }, []);

  const fetchContentsForLevel = useCallback(async (levelId) => {
    try {
      const res = await api.get(`/contents/${levelId}`);
      setLevelContents((prev) => ({ ...prev, [levelId]: res.data }));
    } catch (err) {
      console.error(`Error al cargar contenidos del nivel ${levelId}:`, err);
    }
  }, []);

  const fetchLevels = useCallback(async () => {
    try {
      const res = await api.get('/levels');
      setLevels(res.data);
      res.data.forEach((lvl) => {
        fetchContentsForLevel(lvl.id);
      });
    } catch (err) {
      console.error('Error al cargar niveles:', err);
    }
  }, [fetchContentsForLevel]);

  useEffect(() => {
    fetchUsers();
    fetchLevels();
  }, [fetchUsers, fetchLevels]);

  const modelsCount = usersList.filter((u) => u.role === 'model').length;
  const monitorsCount = usersList.filter((u) => u.role === 'monitor').length;

  return (
    <div className="w-full relative">
      <AdminHeader user={user} logout={logout} />

      <AdminStats 
        modelsCount={modelsCount} 
        monitorsCount={monitorsCount} 
        levelsCount={levels.length} 
      />

      {/* Navegación por pestañas */}
      <div className="flex border-b border-gray-800 mb-8">
        <button 
          onClick={() => setActiveTab('users')}
          className={`py-3 px-6 font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users' 
              ? 'border-[#FFD700] text-[#FFD700]' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5"/>
          <span>Gestión de Usuarios</span>
        </button>
        <button 
          onClick={() => setActiveTab('content')}
          className={`py-3 px-6 font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'content' 
              ? 'border-[#FFD700] text-[#FFD700]' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Film className="w-5 h-5"/>
          <span>Contenidos y Niveles</span>
        </button>
      </div>

      {activeTab === 'users' ? (
        <UserManagement 
          users={usersList} 
          onRefresh={fetchUsers} 
        />
      ) : (
        <LevelManagement 
          levels={levels} 
          levelContents={levelContents} 
          onRefresh={fetchLevels}
          onRefreshLevel={fetchContentsForLevel}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
