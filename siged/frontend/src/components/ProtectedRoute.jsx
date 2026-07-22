import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, isAdministrador } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const allowed = roles.some((r) => user?.roles?.includes(r));
    if (!allowed && !isAdministrador()) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
