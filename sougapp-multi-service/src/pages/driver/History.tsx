import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, MapPin, CheckCircle } from 'lucide-react';
import { formatMRU } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

export function DriverHistory() {
  const { t } = useTranslation('driver');
  const { user } = useAuth();
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
      .select('*, stores(name)')
      .eq('driver_id', user?.id)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="text-primary" size={24} />
        <h1 className="text-xl font-bold text-text">{t('history.title')}</h1>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted">Chargement...</div>
      ) : orders.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-3xl p-8 text-center">
          <CheckCircle size={40} className="mx-auto text-faint mb-3" />
          <p className="text-muted font-medium">{t('history.noHistory')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-surface border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-md uppercase tracking-wider">
                    {t('history.completedMissions')}
                  </span>
                  <p className="text-xs text-muted mt-2">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {/* On simule un gain de 500 MRU par course pour le livreur */}
                <div className="text-right">
                  <p className="font-bold text-primary">+{formatMRU(500)}</p>
                  <p className="text-xs text-muted">Gain de livraison</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-text"></div>
                  </div>
                  <div>
                    <p className="font-medium text-text text-sm">{order.stores?.name}</p>
                  </div>
                </div>
                
                <div className="ml-3 w-0.5 h-4 bg-border"></div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={12} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text text-sm">{order.delivery_address || 'Adresse non spécifiée'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
