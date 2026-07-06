import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Order {
  id: string;
  merchant_id: string;
  driver_id: string | null;
  status: string;
  total_amount: number;
  delivery_address: string;
  created_at: string;
  merchant?: { name: string };
  driver?: { raw_user_meta_data?: { full_name: string } };
}

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Listen to real-time changes on the 'orders' table
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
      // NOTE: En production, on ferait un JOIN avec auth.users pour le nom du livreur
      // et merchants pour le nom du marchand. Pour le MVP, on fait une requête simple.
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          merchant:merchants(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-warning/10 text-warning"><Clock size={16} /> En attente</span>;
      case 'accepted':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-info/10 text-info"><Package size={16} /> Préparation</span>;
      case 'ready':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-info/10 text-info"><Package size={16} /> Prêt</span>;
      case 'delivering':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-warning/10 text-warning"><Truck size={16} /> En livraison</span>;
      case 'completed':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-success/10 text-success"><CheckCircle size={16} /> Terminé</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-danger/10 text-danger"><XCircle size={16} /> Annulé</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm bg-surface-2 text-muted">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text">{t('orders')}</h1>

      <div className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-muted">ID</th>
                <th className="p-4 font-semibold text-muted">Date</th>
                <th className="p-4 font-semibold text-muted">Marchand</th>
                <th className="p-4 font-semibold text-muted">Statut</th>
                <th className="p-4 font-semibold text-muted">Montant</th>
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
                  <td colSpan={5} className="p-8 text-center text-muted">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-surface-2">
                    <td className="p-4 font-mono text-sm">{order.id.substring(0, 8)}</td>
                    <td className="p-4 text-muted">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="p-4 font-medium">{order.merchant?.name || 'Inconnu'}</td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4 font-semibold">{order.total_amount} MRU</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
