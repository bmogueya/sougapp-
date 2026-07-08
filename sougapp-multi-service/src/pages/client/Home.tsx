import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Store, ChevronRight, Utensils, Pill, ShoppingBasket, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ClientHome() {
  const { t } = useTranslation('client');
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

  const MODULE_STYLE = (id: string) => ({ color: `rgb(var(--m-${id}))` });
  const MODULE_BG = (id: string) => ({ backgroundColor: `rgb(var(--m-${id}) / 0.12)` });

  const getModuleIcon = (moduleId: string) => {
    const style = MODULE_STYLE(moduleId);
    switch (moduleId) {
      case 'food': return <Utensils size={24} style={style} />;
      case 'pharmacy': return <Pill size={24} style={style} />;
      case 'grocery': return <ShoppingBasket size={24} style={style} />;
      default: return <Store size={24} style={style} />;
    }
  };

  const CATEGORIES = [
    { id: 'food', name: 'Restaurants', icon: 'food' },
    { id: 'pharmacy', name: 'Pharmacies', icon: 'pharmacy' },
    { id: 'grocery', name: 'Supermarchés', icon: 'grocery' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input 
          type="text" 
          placeholder={t('search.placeholder')}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface border-none shadow-[0_2px_10px_rgb(0,0,0,0.05)] focus:ring-2 focus:ring-primary outline-none font-medium text-text"
        />
      </div>

      {/* Modules (Categories) */}
      <section>
        <h2 className="text-lg font-bold text-text mb-3">{t('home.categories')}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory -mx-4 px-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.id} to={`/app/search?module=${cat.id}`} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface shadow-sm active:scale-95 transition-transform shrink-0 snap-start w-[100px]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={MODULE_BG(cat.id)}>
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
          <h2 className="text-lg font-bold text-text">{t('home.featuredStores')}</h2>
          <Link to="/app/search" className="text-sm font-medium text-primary flex items-center">
            {t('home.seeAll')} <ChevronRight size={16} />
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
            <p className="text-muted font-medium">{t('home.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stores.map(store => (
              <Link 
                key={store.id} 
                to={`/app/store/${store.id}`}
                className="flex items-center gap-4 bg-surface p-3 rounded-2xl shadow-sm border border-border active:scale-[0.98] transition-transform"
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={MODULE_BG(store.module_id)}>
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
