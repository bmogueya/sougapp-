import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search as SearchIcon, Store, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ClientSearch() {
  const [query, setQuery] = useState('');
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setStores([]);
        setProducts([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    
    // Search stores
    const { data: storesData } = await supabase
      .from('stores')
      .select('id, name, logo, address, is_open')
      .ilike('name', `%${query}%`)
      .limit(5);

    // Search products (assuming products have a name and store_id)
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, price, store_id, stores(name)')
      .ilike('name', `%${query}%`)
      .limit(10);

    setStores(storesData || []);
    setProducts(productsData || []);
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* Search Input */}
      <div className="relative sticky top-4 z-10">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-muted" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-4 border-none rounded-2xl bg-surface shadow-sm focus:ring-2 focus:ring-primary focus:outline-none text-text text-lg"
          placeholder="Plats, restaurants, articles..."
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      {query.trim() !== '' && !loading && stores.length === 0 && products.length === 0 && (
        <div className="text-center py-10 text-muted">
          <p>Aucun résultat pour "{query}"</p>
        </div>
      )}

      {stores.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg text-text flex items-center gap-2">
            <Store size={20} className="text-primary" />
            Boutiques
          </h2>
          <div className="grid gap-3">
            {stores.map(store => (
              <Link 
                key={store.id} 
                to={`/app/store/${store.id}`}
                className="flex items-center gap-4 bg-surface p-3 rounded-2xl border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center shrink-0 overflow-hidden">
                  {store.logo ? (
                    <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store size={24} className="text-faint" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-text">{store.name}</h3>
                  <p className="text-xs text-muted truncate">{store.address}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg text-text flex items-center gap-2">
            <Package size={20} className="text-primary" />
            Produits
          </h2>
          <div className="grid gap-3">
            {products.map(product => (
              <Link 
                key={product.id} 
                to={`/app/store/${product.store_id}`}
                className="flex items-center justify-between bg-surface p-3 rounded-2xl border border-border hover:border-primary/50 transition-colors"
              >
                <div>
                  <h3 className="font-bold text-text text-sm">{product.name}</h3>
                  <p className="text-xs text-muted">Chez {product.stores?.name}</p>
                </div>
                <div className="font-bold text-primary text-sm whitespace-nowrap">
                  {product.price} MRU
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {query === '' && (
        <div className="text-center py-10">
          <SearchIcon size={48} className="mx-auto text-faint mb-4" />
          <h3 className="text-lg font-bold text-text mb-2">Que recherchez-vous ?</h3>
          <p className="text-muted text-sm px-8">Cherchez vos restaurants préférés, des médicaments ou vos courses du quotidien.</p>
        </div>
      )}
    </div>
  );
}
