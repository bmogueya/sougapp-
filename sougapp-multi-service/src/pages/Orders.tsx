import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import { getOrderStatusMeta, ORDER_STATUS_TONE_CLASS } from '../lib/orderStatus';
import { Button } from '../components/ui/Button';
import { usePagination } from '../lib/hooks/usePagination';

interface Order {
  id: string;
  store_id: string | null;
  driver_id: string | null;
  status: string;
  total_amount: number;
  delivery_address: string;
  created_at: string;
  store?: { name: string };
  driver?: { raw_user_meta_data?: { full_name: string } };
}

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { page, total, from, to, hasMore, setTotal, nextPage, prevPage } = usePagination(20);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  useEffect(() => {
    const subscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const { data, count, error } = await supabase
        .from('orders')
        .select('*, store:stores(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setOrders(data || []);
      if (count !== null) setTotal(count);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const meta = getOrderStatusMeta(status);
    return (
      <span className={cn('px-3 py-1 rounded-full text-sm', ORDER_STATUS_TONE_CLASS[meta.tone])}>
        {meta.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-text">{t('orders')}</h1>

      <div className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-muted text-xs sm:text-sm">ID</th>
                <th className="p-4 font-semibold text-muted text-xs sm:text-sm">Date</th>
                <th className="p-4 font-semibold text-muted text-xs sm:text-sm">Marchand</th>
                <th className="p-4 font-semibold text-muted text-xs sm:text-sm">Statut</th>
                <th className="p-4 font-semibold text-muted text-xs sm:text-sm">Montant</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    Chargement...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingBag size={40} className="text-faint" />
                      <p className="text-muted">Aucune commande trouvée.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-surface-2">
                    <td data-label="ID" className="p-4">
                      <span className="sm:hidden text-xs text-muted font-medium block mb-1">ID</span>
                      <span className="font-mono text-sm">{order.id.substring(0, 8)}</span>
                    </td>
                    <td data-label="Date" className="p-4">
                      <span className="sm:hidden text-xs text-muted font-medium block mb-1">Date</span>
                      <span className="text-muted">{new Date(order.created_at).toLocaleString()}</span>
                    </td>
                    <td data-label="Marchand" className="p-4">
                      <span className="sm:hidden text-xs text-muted font-medium block mb-1">Marchand</span>
                      <span className="font-medium">{order.store?.name || 'Inconnu'}</span>
                    </td>
                    <td data-label="Statut" className="p-4">{getStatusBadge(order.status)}</td>
                    <td data-label="Montant" className="p-4">
                      <span className="font-semibold">{order.total_amount} MRU</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <span className="text-sm text-muted">{total} résultats</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={page === 0}>Précédent</Button>
            <Button variant="outline" size="sm" onClick={nextPage} disabled={!hasMore}>Suivant</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
