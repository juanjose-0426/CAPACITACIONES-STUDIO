import { useState } from 'react';
import { Plus, Trash2, CheckCircle, XCircle, Eye, AlertCircle, Check } from 'lucide-react';
import api from '../../services/api';
import UserProgressModal from './UserProgressModal';

const UserManagement = ({ users, onRefresh }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('model');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Modal de progreso
  const [selectedUser, setSelectedUser] = useState(null);
  const [userViews, setUserViews] = useState([]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSubmitting(true);

    try {
      await api.post('/users', { name, email, password, role });
      setMsg({ type: 'success', text: 'Usuario creado exitosamente' });
      setName('');
      setEmail('');
      setPassword('');
      onRefresh();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error al crear el usuario' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/users/${id}`, { is_active: !currentStatus });
      onRefresh();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const handleDeleteUser = async (id, userName) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente a ${userName}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      onRefresh();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
    }
  };

  const handleOpenProgress = async (u) => {
    setSelectedUser(u);
    try {
      const res = await api.get(`/views/user/${u.id}`);
      setUserViews(res.data);
    } catch (err) {
      console.error('Error al cargar progreso del usuario:', err);
      setUserViews([]);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Formulario de Creación */}
        <div className="xl:col-span-1 bg-[#1A1A1A] border border-gray-800 rounded-xl p-6 h-fit shadow-lg">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#FFD700]"/> Nuevo Usuario
          </h2>

          {msg.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm flex items-center gap-2 ${
              msg.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/50 text-green-400' 
                : 'bg-red-500/10 border border-red-500/50 text-red-400'
            }`}>
              {msg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none" 
                placeholder="Ej. Ana Gómez"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none" 
                placeholder="ana@guzmanstudio.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Contraseña</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none" 
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Rol</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-[#FFD700] focus:outline-none"
              >
                <option value="model">Modelo</option>
                <option value="monitor">Monitor / Supervisor</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={submitting} 
              className="w-full bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold p-2.5 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creando...' : 'Guardar Usuario'}
            </button>
          </form>
        </div>

        {/* Tabla de Usuarios */}
        <div className="xl:col-span-3 bg-[#1A1A1A] border border-gray-800 rounded-xl p-6 shadow-lg overflow-x-auto">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">
            Modelos y Monitores Registrados ({users.length})
          </h2>

          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#0A0A0A] text-gray-300 text-xs uppercase">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Email</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Registrado</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="p-3 font-medium text-white">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                      u.role === 'monitor' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'bg-yellow-900/40 text-[#FFD700] border border-yellow-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => handleToggleStatus(u.id, u.is_active)}
                      className="flex items-center gap-1.5 cursor-pointer"
                      title="Cambiar estado"
                    >
                      {u.is_active ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="w-4 h-4"/> Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-xs">
                          <XCircle className="w-4 h-4"/> Inactivo
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenProgress(u)}
                        className="p-1.5 bg-gray-800 hover:bg-[#FFD700] hover:text-black rounded text-gray-300 transition-colors cursor-pointer"
                        title="Ver progreso de contenidos"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 bg-gray-800 hover:bg-red-900/60 hover:text-red-300 rounded text-gray-300 transition-colors cursor-pointer"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No hay usuarios registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserProgressModal 
        user={selectedUser} 
        views={userViews} 
        onClose={() => setSelectedUser(null)} 
      />
    </>
  );
};

export default UserManagement;

