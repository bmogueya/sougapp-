import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, Package } from 'lucide-react';
import { formatMRU } from '../../lib/utils';

export function ClientProfile() {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, stores(name, logo)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-warning/20 text-warning text-xs font-bold rounded-lg">En attente</span>;
      case 'preparing':
      case 'ready_for_delivery':
      case 'delivering':
        return <span className="px-2 py-1 bg-info/20 text-info text-xs font-bold rounded-lg">En cours</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-success/20 text-success text-xs font-bold rounded-lg">Livrée</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-danger/20 text-danger text-xs font-bold rounded-lg">Annulée</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* Profile Header */}
      <div className="bg-surface p-6 rounded-3xl border border-border flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User size={32} className="text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text">{(user as any)?.first_name} {(user as any)?.last_name}</h1>
          <p className="text-muted text-sm">{user?.email}</p>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="font-bold text-lg text-text mb-4 flex items-center gap-2">
          <Package size={20} className="text-primary" />
          Mes Commandes
        </h2>
        
        {loading ? (
          <div className="text-center py-8 text-muted">Chargement de l'historique...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 bg-surface rounded-3xl border border-border border-dashed">
            <Package size={40} className="mx-auto text-faint mb-3" />
            <p className="text-muted font-medium">Aucune commande pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-surface border border-border p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="font-bold text-text">{formatMRU(order.total_amount)}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center overflow-hidden shrink-0">
                    {order.stores?.logo ? (
                      <img src={order.stores.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Store size={20} className="text-faint" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text text-sm truncate">{order.stores?.name}</p>
                    <p className="text-xs text-muted truncate">
                      {order.items?.length || 0} article(s)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4">
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 py-4 bg-danger/10 text-danger font-bold rounded-2xl hover:bg-danger/20 transition-colors"
        >
          <LogOut size={20} />
          Se déconnecter
        </button>
      </div>

    </div>
  );
}

// Just to fix build error if Store isn't imported above
import { Store } from 'lucide-react';
