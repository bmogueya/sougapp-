import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Trash2, MapPin, Receipt, CheckCircle } from 'lucide-react';

export function ClientCart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pour la démonstration, on utilise un état local. 
  // Dans une vraie application, cela viendrait d'un Contexte React ou Redux.
  const [cartItems, setCartItems] = useState([
    { id: '1', name: 'Burger Classic', price: 250, quantity: 2, store_id: 'store_1' },
    { id: '2', name: 'Frites', price: 100, quantity: 1, store_id: 'store_1' }
  ]);

  const [address, setAddress] = useState('Nouakchott, Tevragh Zeina');

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!user) {
      alert("Vous devez être connecté pour commander.");
      return;
    }
    
    if (cartItems.length === 0) return;

    setLoading(true);

    // 1. Create the Order
    // Note: In reality, we'd take the actual store_id from the first item
    const storeId = cartItems[0].store_id; 
    const { error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_id: user.id,
          store_id: storeId,
          total_amount: total,
          delivery_address: address,
          status: 'pending' // En attente d'acceptation par le marchand
        }
      ]);

    setLoading(false);

    if (orderError) {
      alert("Erreur lors de la commande: " + orderError.message);
    } else {
      setSuccess(true);
      setCartItems([]);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center text-success mb-6">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Commande Réussie !</h2>
        <p className="text-muted mb-8 max-w-sm">
          Votre commande a été envoyée au restaurant. Vous recevrez une notification lorsqu'elle sera acceptée.
        </p>
        <button 
          onClick={() => navigate('/app')}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold w-full max-w-xs hover:bg-primary-strong transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface border-b border-border p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center text-text">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-text">Votre Panier</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="p-8 text-center text-muted flex flex-col items-center gap-4 mt-10">
          <Receipt size={48} className="text-faint" />
          <p>Votre panier est vide.</p>
          <button 
            onClick={() => navigate('/app')}
            className="text-primary font-medium mt-4"
          >
            Découvrir des restaurants
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          
          {/* Items */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-surface-2/50 font-medium text-text">
              Articles
            </div>
            <div className="divide-y divide-border">
              {cartItems.map(item => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-text">{item.name}</h3>
                    <p className="text-primary font-bold mt-1">{item.price} MRU</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded bg-surface-2 flex items-center justify-center text-sm font-bold">
                      {item.quantity}x
                    </span>
                    <button className="text-danger p-2 hover:bg-danger/10 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-4">
            <div className="flex items-center gap-2 mb-3 text-text font-medium">
              <MapPin size={18} className="text-primary" /> Adresse de livraison
            </div>
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full bg-surface-2 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none text-text"
            />
          </div>

          {/* Bill details */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-4 space-y-3">
            <div className="flex justify-between text-sm text-muted">
              <span>Sous-total</span>
              <span className="text-text font-medium">{subtotal} MRU</span>
            </div>
            <div className="flex justify-between text-sm text-muted">
              <span>Frais de livraison</span>
              <span className="text-text font-medium">{deliveryFee} MRU</span>
            </div>
            <div className="h-px w-full bg-border my-2"></div>
            <div className="flex justify-between font-bold text-lg text-text">
              <span>Total</span>
              <span className="text-primary">{total} MRU</span>
            </div>
          </div>

        </div>
      )}

      {/* Checkout Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-[65px] sm:bottom-0 left-0 right-0 sm:left-64 bg-surface border-t border-border p-4 shadow-[0_-4px_10px_rgb(0,0,0,0.05)]">
          <div className="max-w-md mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
            <button 
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:bg-primary-strong transition-colors shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {loading ? 'Traitement...' : `Commander • ${total} MRU`}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
