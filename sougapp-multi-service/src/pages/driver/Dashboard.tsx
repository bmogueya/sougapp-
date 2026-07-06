import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Navigation, MapPin, CheckCircle, Clock } from 'lucide-react';

export function DriverDashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Initial fetch of 'ready_for_delivery' or 'delivering' by this driver
    fetchOrders();

    // Subscribe to new orders or status changes
    const channel = supabase.channel('driver-orders-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `status=in.(ready_for_delivery,delivering)`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    // Fetch orders ready for delivery OR currently being delivered by THIS driver
    const { data, error } = await supabase
      .from('orders')
      .select('*, stores(name, address)')
      .or(`status.eq.ready_for_delivery,and(status.eq.delivering,driver_id.eq.${user?.id})`)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'delivering',
        driver_id: user.id
      })
      .eq('id', orderId);

    if (!error) {
      fetchOrders();
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId);

    if (!error) {
      fetchOrders();
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* Status Toggle */}
      <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border flex flex-col items-center gap-4 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${isOnline ? 'border-success bg-success/10 text-success' : 'border-faint bg-surface-2 text-muted'}`}>
          <Navigation size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text mb-1">
            {isOnline ? 'Vous êtes en ligne' : 'Vous êtes hors ligne'}
          </h2>
          <p className="text-sm text-muted">
            {isOnline ? 'Prêt à recevoir des commandes.' : 'Passez en ligne pour travailler.'}
          </p>
        </div>
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full py-3.5 rounded-xl font-bold text-lg transition-colors ${
            isOnline ? 'bg-danger text-white hover:bg-danger/90' : 'bg-success text-white hover:bg-success/90'
          }`}
        >
          {isOnline ? 'Se déconnecter' : 'Passer En Ligne'}
        </button>
      </div>

      {/* Orders List */}
      {isOnline && (
        <div className="space-y-4">
          <h3 className="font-bold text-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Missions disponibles
          </h3>

          {loading ? (
            <div className="text-center py-8 text-muted">Recherche de courses...</div>
          ) : orders.length === 0 ? (
            <div className="bg-surface border border-border border-dashed rounded-2xl p-8 text-center">
              <Clock size={40} className="mx-auto text-faint mb-3" />
              <p className="text-muted font-medium">Aucune course pour le moment.</p>
              <p className="text-sm text-faint mt-1">Nous vous avertirons dès qu'une commande sera prête.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">
                <div className={`p-3 text-xs font-bold text-white flex justify-between items-center ${
                  order.status === 'delivering' ? 'bg-primary' : 'bg-warning'
                }`}>
                  <span>{order.status === 'delivering' ? 'COURSE EN COURS' : 'NOUVELLE COURSE'}</span>
                  <span>{order.total_amount} MRU</span>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Store info */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-text"></div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wide mb-0.5">Récupération</p>
                      <p className="font-bold text-text">{order.stores?.name}</p>
                      <p className="text-sm text-muted">{order.stores?.address}</p>
                    </div>
                  </div>

                  {/* Divider line */}
                  <div className="ml-4 w-0.5 h-6 bg-border"></div>

                  {/* Customer info */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center shrink-0 mt-1">
                      <MapPin size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wide mb-0.5">Livraison</p>
                      <p className="font-bold text-text">{order.delivery_address || 'Adresse non spécifiée'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface-2/50 border-t border-border">
                  {order.status === 'ready_for_delivery' ? (
                    <button 
                      onClick={() => handleAcceptOrder(order.id)}
                      className="w-full bg-text text-surface py-3 rounded-xl font-bold hover:bg-black transition-colors"
                    >
                      Accepter la course
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleCompleteOrder(order.id)}
                      className="w-full bg-success text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-success/90 transition-colors"
                    >
                      <CheckCircle size={20} />
                      Marquer comme Livré
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
