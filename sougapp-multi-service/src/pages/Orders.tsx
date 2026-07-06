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
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800"><Clock size={16} /> En attente</span>;
      case 'accepted':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"><Package size={16} /> Préparation</span>;
      case 'ready':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"><Package size={16} /> Prêt</span>;
      case 'delivering':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"><Truck size={16} /> En livraison</span>;
      case 'completed':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"><CheckCircle size={16} /> Terminé</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"><XCircle size={16} /> Annulé</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('orders')}</h1>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">ID</th>
                <th className="p-4 font-semibold text-slate-600">Date</th>
                <th className="p-4 font-semibold text-slate-600">Marchand</th>
                <th className="p-4 font-semibold text-slate-600">Statut</th>
                <th className="p-4 font-semibold text-slate-600">Montant</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Chargement...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-mono text-sm">{order.id.substring(0, 8)}</td>
                    <td className="p-4 text-slate-600">{new Date(order.created_at).toLocaleString()}</td>
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
