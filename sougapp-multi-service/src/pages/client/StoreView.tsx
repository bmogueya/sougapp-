import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Store, ChevronLeft, Search, Plus } from 'lucide-react';


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

export function ClientStoreView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    if (id) fetchStoreData(id);
  }, [id]);

  const fetchStoreData = async (storeId: string) => {
    setLoading(true);
    
    // Fetch Store Details
    const { data: storeData } = await supabase.from('stores').select('*').eq('id', storeId).single();
    if (storeData) setStore(storeData);

    // Fetch Categories
    const { data: catData } = await supabase.from('categories').select('*').eq('store_id', storeId).eq('is_active', true).order('sort_order', { ascending: true });
    if (catData) setCategories(catData);

    // Fetch Products
    const { data: prodData } = await supabase.from('products').select('*').eq('store_id', storeId).eq('is_active', true);
    if (prodData) setProducts(prodData);

    setLoading(false);
  };

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === activeCategory);

  if (loading) {
    return <div className="p-8 text-center text-muted">Chargement de la boutique...</div>;
  }

  if (!store) {
    return <div className="p-8 text-center text-danger">Boutique introuvable.</div>;
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header Sticky avec Image ou Couleur */}
      <div className="sticky top-0 z-10 bg-surface border-b border-border shadow-sm">
        <div className="flex items-center gap-4 p-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center text-text"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text truncate">{store.name}</h1>
            <p className="text-sm text-success font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success"></span> Ouvert
            </p>
          </div>
          <button className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center text-text">
            <Search size={20} />
          </button>
        </div>
        
        {/* Categories Tabs */}
        {categories.length > 0 && (
          <div className="flex overflow-x-auto hide-scrollbar gap-2 p-4 pt-0">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'all' ? 'bg-text text-surface' : 'bg-surface-2 text-muted hover:text-text'
              }`}
            >
              Tout
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id ? 'bg-text text-surface' : 'bg-surface-2 text-muted hover:text-text'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Description de la boutique */}
      {store.description && (
        <div className="p-4 text-sm text-muted bg-surface/50 border-b border-border">
          {store.description}
        </div>
      )}

      {/* Products Grid */}
      <div className="p-4 space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted">
            Aucun produit dans cette catégorie.
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="flex gap-4 p-4 bg-surface rounded-2xl shadow-sm border border-border">
              {/* Product Info */}
              <div className="flex-1 min-w-0 py-1">
                <h3 className="font-bold text-text mb-1">{product.name}</h3>
                {product.description && (
                  <p className="text-xs text-muted line-clamp-2 mb-2">{product.description}</p>
                )}
                <div className="font-black text-primary mt-auto">
                  {product.price.toLocaleString()} MRU
                </div>
              </div>
              
              {/* Product Image & Add Button */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 bg-surface-2 rounded-xl border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="text-faint" size={24} />
                  )}
                </div>
                {/* Note: The cart logic will be connected later */}
                <button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-medium py-1.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-1">
                  <Plus size={16} /> Ajouter
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
    </div>
  );
}
