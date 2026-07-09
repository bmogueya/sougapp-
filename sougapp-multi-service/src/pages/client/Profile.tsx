import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, Package, Store } from 'lucide-react';
import { formatMRU, cn } from '../../lib/utils';
import { getOrderStatusMeta, ORDER_STATUS_TONE_CLASS } from '../../lib/orderStatus';
import { useTranslation } from 'react-i18next';
import { PreferencesCard } from '../../components/PreferencesCard';

export function ClientProfile() {
  const { t, i18n } = useTranslation('client');
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
      .eq('customer_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const meta = getOrderStatusMeta(status);
    return (
      <span className={cn('px-2 py-1 text-xs font-bold rounded-lg', ORDER_STATUS_TONE_CLASS[meta.tone])}>
        {meta.label}
      </span>
    );
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* Profile Header */}
      <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col md:flex-row items-center gap-4 text-center md:text-start">
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
          {t('profile.orders')}
        </h2>
        
        {loading ? (
          <div className="text-center py-8 text-muted">{t('profile.loading')}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 bg-surface rounded-3xl border border-border border-dashed">
            <Package size={40} className="mx-auto text-faint mb-3" />
            <p className="text-muted font-medium">{t('profile.noOrders')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-surface border border-border p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted">
                      {new Date(order.created_at).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="font-bold text-text">{formatMRU(order.total_amount)}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center overflow-hidden shrink-0">
                    {order.stores?.logo ? (
                      <img loading="lazy" src={order.stores.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Store size={20} className="text-faint" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text text-sm truncate">{order.stores?.name}</p>
                    <p className="text-xs text-muted truncate">
                      {t('profile.items', { count: order.items?.length || 0 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Préférences */}
      <PreferencesCard />

      {/* Actions */}
      <div className="pt-4">
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 py-4 bg-danger/10 text-danger font-bold rounded-2xl hover:bg-danger/20 transition-colors"
        >
          <LogOut size={20} />
          {t('profile.logout')}
        </button>
      </div>

    </div>
  );
}
