import { useState, useEffect } from "react";
import { Store, MapPin, Phone, Clock, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export function MerchantSettings() {
  const { session } = useAuth();
  const [shop, setShop] = useState({
    name: "",
    description: "",
    phone: "",
    address: "",
    opening: "08:00",
    closing: "22:00",
  });
  const [saved, setSaved] = useState(false);
  const [, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user.id) fetchStore();
  }, [session?.user.id]);

  const fetchStore = async () => {
    const { data } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', session!.user.id)
      .single();
    
    if (data) {
      setShop({
        name: data.name || "",
        description: data.description || "",
        phone: data.phone || "",
        address: data.address || "",
        opening: data.opening_time ? data.opening_time.substring(0, 5) : "08:00",
        closing: data.closing_time ? data.closing_time.substring(0, 5) : "22:00",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { data: existing } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', session!.user.id)
      .single();

    const payload = {
      name: shop.name,
      description: shop.description,
      phone: shop.phone,
      address: shop.address,
      opening_time: shop.opening + ":00",
      closing_time: shop.closing + ":00",
    };

    if (existing) {
      await supabase.from('stores').update(payload).eq('owner_id', session!.user.id);
    } else {
      await supabase.from('stores').insert({
        ...payload,
        owner_id: session!.user.id,
        module_id: 'food', // fallback
        is_open: true
      });
    }

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text">Paramètres</h1>
        <p className="mt-1 text-sm text-muted">
          Gérez les informations de votre boutique
        </p>
      </div>

      <Card className="divide-y divide-border">
        {/* Name */}
        <div className="flex items-start gap-4 px-5 py-5">
          <Store size={18} className="mt-0.5 shrink-0 text-muted" />
          <div className="flex-1 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Nom de la boutique</label>
              <input value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })}
                className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Description</label>
              <textarea value={shop.description} onChange={(e) => setShop({ ...shop, description: e.target.value })}
                rows={2}
                className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-start gap-4 px-5 py-5">
          <Phone size={18} className="mt-0.5 shrink-0 text-muted" />
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted">Téléphone</label>
            <input value={shop.phone} onChange={(e) => setShop({ ...shop, phone: e.target.value })}
              className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-4 px-5 py-5">
          <MapPin size={18} className="mt-0.5 shrink-0 text-muted" />
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted">Adresse</label>
            <input value={shop.address} onChange={(e) => setShop({ ...shop, address: e.target.value })}
              className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
        </div>

        {/* Hours */}
        <div className="flex items-start gap-4 px-5 py-5">
          <Clock size={18} className="mt-0.5 shrink-0 text-muted" />
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Ouverture</label>
              <input type="time" value={shop.opening} onChange={(e) => setShop({ ...shop, opening: e.target.value })}
                className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Fermeture</label>
              <input type="time" value={shop.closing} onChange={(e) => setShop({ ...shop, closing: e.target.value })}
                className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
        </div>
      </Card>

      <button onClick={handleSave}
        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong">
        <Save size={16} />
        {saved ? "Enregistré !" : "Enregistrer"}
      </button>
    </div>
  );
}