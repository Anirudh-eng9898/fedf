import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-950"><div className="animate-pulse text-emerald-400 text-xl">Loading...</div></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-950"><div className="animate-pulse text-emerald-400 text-xl">Loading...</div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};
