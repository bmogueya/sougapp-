import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Utensils, Pill, Package, CarFront, CalendarDays } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Module {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  icon_name: string;
  theme_color: string;
}

const iconMap: Record<string, any> = {
  Utensils, ShoppingBag, Pill, Package, CarFront, CalendarDays
};

export function Modules() {
  const { t } = useTranslation();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('id');
      
    if (!error && data) {
      setModules(data as Module[]);
    }
    setLoading(false);
  };

  const toggleModuleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic UI update
    setModules(modules.map(mod => 
      mod.id === id ? { ...mod, is_active: newStatus } : mod
    ));

    const { error } = await supabase
      .from('modules')
      .update({ is_active: newStatus })
      .eq('id', id);

    if (error) {
      // Revert if failed
      console.error("Failed to toggle module status", error);
      fetchModules();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{t('modules_nav', 'Gestion des Modules')}</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-500">
          Chargement des modules...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = iconMap[module.icon_name] || Package;
            return (
              <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${module.theme_color} bg-opacity-10`}>
                      <Icon className={module.theme_color.replace('bg-', 'text-')} size={24} />
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={module.is_active}
                        onChange={() => toggleModuleStatus(module.id, module.is_active)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{module.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 h-10">{module.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      module.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {module.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 border-t border-slate-100 p-4">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800 w-full text-center">
                    Configurer le module
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
