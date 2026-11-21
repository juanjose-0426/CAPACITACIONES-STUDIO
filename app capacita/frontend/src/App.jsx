import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ModelDashboard from './pages/model/ModelDashboard';
// import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-semibold">Cargando...</div>;

  if (!user) return <Navigate to="/" />;
  
  if (allowedRole && (Array.isArray(allowedRole) ? !allowedRole.includes(user.role) : user.role !== allowedRole)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-darker text-white font-sans selection:bg-primary selection:text-black">
      {/* {user && <Navbar />} */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
          
          {/* Rutas de Admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Rutas de Usuario (Modelos y Monitores) */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute allowedRole={['model', 'monitor']}>
              <ModelDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;
