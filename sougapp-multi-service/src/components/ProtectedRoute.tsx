import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Rôles autorisés à accéder au back-office d'administration.
const ADMIN_ROLES = ['super_admin', 'dispatcher'];

export function ProtectedRoute() {
  const { session, role, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Session valide mais rôle non autorisé => accès refusé (pas seulement "connecté").
  if (!role || !ADMIN_ROLES.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-100 text-center">
          <h1 className="text-xl font-bold text-slate-900">Accès refusé</h1>
          <p className="text-slate-500 mt-2">
            Ce compte n'a pas les droits d'administration nécessaires pour accéder à cette interface.
          </p>
          <button
            onClick={() => signOut()}
            className="mt-6 w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
