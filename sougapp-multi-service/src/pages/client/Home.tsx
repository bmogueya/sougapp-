import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Store, ChevronRight, Utensils, Pill, ShoppingBasket, Search } from 'lucide-react';


export function ClientHome() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    // Fetch only active/open stores
    const { data } = await supabase
      .from('stores')
      .select('id, name, description, module_id, is_open')
      .eq('is_open', true)
      .limit(10);
    
    if (data) setStores(data);
    setLoading(false);
  };

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'food': return <Utensils size={24} className="text-orange-500" />;
      case 'pharmacy': return <Pill size={24} className="text-emerald-500" />;
      case 'grocery': return <ShoppingBasket size={24} className="text-blue-500" />;
      default: return <Store size={24} className="text-primary" />;
    }
  };

  const CATEGORIES = [
    { id: 'food', name: 'Restaurants', color: 'bg-orange-100', icon: 'food' },
    { id: 'pharmacy', name: 'Pharmacies', color: 'bg-emerald-100', icon: 'pharmacy' },
    { id: 'grocery', name: 'Supermarchés', color: 'bg-blue-100', icon: 'grocery' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input 
          type="text" 
          placeholder="De quoi avez-vous besoin ?"
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface border-none shadow-[0_2px_10px_rgb(0,0,0,0.05)] focus:ring-2 focus:ring-primary outline-none font-medium text-text"
        />
      </div>

      {/* Modules (Categories) */}
      <section>
        <h2 className="text-lg font-bold text-text mb-3">Que cherchez-vous ?</h2>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map(cat => (
            <Link key={cat.id} to={`/app/search?module=${cat.id}`} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface shadow-sm active:scale-95 transition-transform">
              <div className={`w-12 h-12 rounded-full ${cat.color} flex items-center justify-center`}>
                {getModuleIcon(cat.icon)}
              </div>
              <span className="text-xs font-semibold text-text text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Stores */}
      <section className="pb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-text">À la une</h2>
          <Link to="/app/search" className="text-sm font-medium text-primary flex items-center">
            Voir tout <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-surface rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-10 bg-surface rounded-2xl border border-border border-dashed">
            <Store size={40} className="mx-auto text-faint mb-2" />
            <p className="text-muted font-medium">Aucun magasin ouvert pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stores.map(store => (
              <Link 
                key={store.id} 
                to={`/app/store/${store.id}`}
                className="flex items-center gap-4 bg-surface p-3 rounded-2xl shadow-sm border border-border active:scale-[0.98] transition-transform"
              >
                <div className="w-16 h-16 rounded-xl bg-surface-2 flex items-center justify-center text-muted shrink-0">
                  {getModuleIcon(store.module_id)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text truncate">{store.name}</h3>
                  <p className="text-sm text-muted line-clamp-1">{store.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
