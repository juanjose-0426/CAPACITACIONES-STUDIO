import { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Unlock } from 'lucide-react';
import api from '../../services/api';
import ModelHeader from './ModelHeader';
import OverallProgressBar from './OverallProgressBar';
import LevelCard from './LevelCard';
import ContentViewerModal from './ContentViewerModal';

const ModelDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Visor modal
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelContents, setLevelContents] = useState([]);
  const [watchedContentIds, setWatchedContentIds] = useState([]);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await api.get('/progress/me');
      setProgress(res.data);
    } catch (error) {
      console.error('Error al cargar progreso del usuario:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWatchedContents = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/views/user/${user.id}`);
      // res.data trae la lista de visualizaciones con watched_at, content_title, level_title
      // Si necesitamos IDs exactos o títulos, podemos guardarlos
      const ids = res.data.map((v) => v.content_id || v.id);
      setWatchedContentIds(ids);
    } catch (err) {
      console.error('Error al cargar contenidos vistos:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
    fetchWatchedContents();
  }, [fetchProgress, fetchWatchedContents]);

  const calculateOverallProgress = () => {
    if (progress.length === 0) return 0;
    const unlocked = progress.filter((p) => p.isUnlocked).length;
    return Math.round((unlocked / progress.length) * 100);
  };

  const handleOpenLevel = async (level) => {
    setSelectedLevel(level);
    try {
      const res = await api.get(`/contents/${level.level_id}`);
      setLevelContents(res.data);
    } catch (err) {
      console.error('Error al cargar contenidos del nivel:', err);
      setLevelContents([]);
    }
  };

  const handleContentCompleted = (contentId) => {
    setWatchedContentIds((prev) => (prev.includes(contentId) ? prev : [...prev, contentId]));
  };

  return (
    <div className="w-full">
      <ModelHeader user={user} logout={logout} />

      <OverallProgressBar progressPercentage={calculateOverallProgress()} />

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Unlock className="w-5 h-5 text-[#FFD700]" />
        <span>Niveles de Entrenamiento</span>
      </h2>

      {loading ? (
        <div className="text-center py-12 text-[#FFD700] font-medium">Cargando niveles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {progress.map((level) => (
            <LevelCard 
              key={level.level_id} 
              level={level} 
              onSelect={handleOpenLevel} 
            />
          ))}

          {progress.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-[#1A1A1A] rounded-xl border border-gray-800">
              Aún no tienes niveles configurados. Contacta a la administración.
            </div>
          )}
        </div>
      )}

      {selectedLevel && (
        <ContentViewerModal 
          level={selectedLevel}
          contents={levelContents}
          watchedContentIds={watchedContentIds}
          onClose={() => {
            setSelectedLevel(null);
            setLevelContents([]);
          }}
          onContentCompleted={handleContentCompleted}
        />
      )}
    </div>
  );
};

export default ModelDashboard;
