import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Rôles autorisés à accéder au back-office d'administration.
const ADMIN_ROLES = ['super_admin', 'dispatcher'];

export function ProtectedRoute() {
  const { session, role, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-muted">Chargement...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Session valide mais rôle non autorisé => accès refusé (pas seulement "connecté").
  if (!role || !ADMIN_ROLES.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <div className="bg-surface p-8 rounded-2xl shadow-card w-full max-w-md border border-border text-center">
          <h1 className="text-xl font-bold text-text">Accès refusé</h1>
          <p className="text-muted mt-2">
            Ce compte n'a pas les droits d'administration nécessaires pour accéder à cette interface.
          </p>
          <button
            onClick={() => signOut()}
            className="mt-6 w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg hover:bg-primary-strong transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
