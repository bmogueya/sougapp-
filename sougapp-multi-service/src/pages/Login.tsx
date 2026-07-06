import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSent(true);
    }
    setResetLoading(false);
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-surface p-8 rounded-2xl shadow-card w-full max-w-md border border-border">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text">Réinitialisation</h1>
            <p className="text-muted mt-2">Recevez un lien pour réinitialiser votre mot de passe</p>
          </div>

          {error && (
            <div className="bg-danger/10 text-danger p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {resetSent ? (
            <div className="text-center space-y-4">
              <div className="bg-success/10 text-success p-4 rounded-lg text-sm">
                Si un compte existe avec cette adresse, un email de réinitialisation vous a été envoyé.
              </div>
              <button
                onClick={() => { setShowResetForm(false); setResetSent(false); setError(null); }}
                className="text-primary hover:text-primary-strong text-sm font-medium transition-colors"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-text mb-1">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sougapp.mr"
                  autoComplete="email"
                  className="w-full px-4 py-2 border border-border bg-surface text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg hover:bg-primary-strong transition-colors disabled:opacity-50"
              >
                {resetLoading ? 'Envoi...' : 'Envoyer le lien'}
              </button>

              <button
                type="button"
                onClick={() => { setShowResetForm(false); setError(null); }}
                className="w-full text-muted hover:text-text text-sm font-medium transition-colors text-center"
              >
                Retour à la connexion
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-surface p-8 rounded-2xl shadow-card w-full max-w-md border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text">SougApp Admin</h1>
          <p className="text-muted mt-2">Connectez-vous à votre compte</p>
        </div>

        {error && (
          <div className="bg-danger/10 text-danger p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-text mb-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sougapp.mr"
              autoComplete="email"
              className="w-full px-4 py-2 border border-border bg-surface text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-text mb-1">
              Mot de passe
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-border bg-surface text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowResetForm(true)}
              className="text-sm text-primary hover:text-primary-strong transition-colors"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg hover:bg-primary-strong transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
