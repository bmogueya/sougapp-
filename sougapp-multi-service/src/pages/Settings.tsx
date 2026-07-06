import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Settings as SettingsIcon, Bell, Shield, DollarSign } from 'lucide-react';

export function Settings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Configuration locale temporaire
  const [config, setConfig] = useState({
    siteName: 'SougApp',
    contactEmail: 'contact@sougapp.com',
    commissionRate: '15',
    deliveryFeeBase: '100', // En devise locale, ex: MRU
    notificationsEnabled: true,
    maintenanceMode: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setConfig({ ...config, [e.target.name]: value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simuler une sauvegarde vers Supabase (table 'app_settings')
    setTimeout(() => {
      setLoading(false);
      alert('Paramètres enregistrés avec succès !');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text">{t('settings')}</h1>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-primary hover:bg-primary-strong text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Colonne navigation paramètres */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-info/10 text-info rounded-lg text-sm font-medium text-left">
            <SettingsIcon size={18} />
            Général
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-muted hover:bg-surface-2 hover:text-text rounded-lg text-sm font-medium text-left transition-colors">
            <DollarSign size={18} />
            Commissions
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-muted hover:bg-surface-2 hover:text-text rounded-lg text-sm font-medium text-left transition-colors">
            <Bell size={18} />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-muted hover:bg-surface-2 hover:text-text rounded-lg text-sm font-medium text-left transition-colors">
            <Shield size={18} />
            Sécurité
          </button>
        </div>

        {/* Contenu des paramètres */}
        <div className="md:col-span-3">
          <form className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">
            
            <div className="p-6 border-b border-border space-y-4">
              <h2 className="text-lg font-bold text-text">Paramètres de la Plateforme</h2>
              <p className="text-sm text-muted">
                Gérez les paramètres globaux de SougApp. Ces valeurs affecteront les applications clients et marchands.
              </p>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Section Générales */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider">Identité</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Nom de l'Application</label>
                    <input
                      type="text"
                      name="siteName"
                      value={config.siteName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border bg-surface text-text rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Email de Contact</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={config.contactEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border bg-surface text-text rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Section Finances */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider">Taxes & Commissions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Taux de Commission Marchand (%)</label>
                    <input
                      type="number"
                      name="commissionRate"
                      value={config.commissionRate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border bg-surface text-text rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Frais de Livraison de base (Devise)</label>
                    <input
                      type="number"
                      name="deliveryFeeBase"
                      value={config.deliveryFeeBase}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border bg-surface text-text rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Section Toggles */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider">Système</h3>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      name="notificationsEnabled"
                      checked={config.notificationsEnabled}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-surface after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-colors peer-checked:bg-primary"></div>
                  </div>
                  <div className="text-sm font-medium text-text">Activer les Notifications Push (Global)</div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      name="maintenanceMode"
                      checked={config.maintenanceMode}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-surface after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-colors peer-checked:bg-danger"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text">Mode Maintenance</div>
                    <div className="text-xs text-muted">Coupe l'accès aux clients et marchands temporairement.</div>
                  </div>
                </label>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
