import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Search, Store, Plus } from 'lucide-react';
import { MerchantModal } from '../components/MerchantModal';
import { EditMerchantModal } from '../components/EditMerchantModal';

interface Merchant {
  id: string;
  name: string;
  description: string;
  address: string;
  is_open: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export function Merchants() {
  const { t } = useTranslation();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*, profiles!stores_owner_id_fkey(first_name, last_name, phone)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMerchants(data as any);
    }
    setLoading(false);
  };

  const filteredMerchants = merchants.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text">{t('merchants')}</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-strong text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nouveau Marchand
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-faint" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un marchand..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 py-2 border border-border bg-surface text-text rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="bg-surface-2 text-muted font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Nom de la boutique</th>
                <th className="px-6 py-4">Zone / Adresse</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">
                    Chargement...
                  </td>
                </tr>
              ) : filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Store size={40} className="text-faint" />
                      <p className="text-muted">Aucun marchand trouvé.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((merchant) => (
                  <tr key={merchant.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-faint">
                          <Store size={18} />
                        </div>
                        <div>
                          <div className="font-medium text-text">{merchant.name}</div>
                          <div className="text-xs text-muted">{merchant.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {merchant.address || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${merchant.is_open ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}
                      >
                        {merchant.is_open ? 'Ouvert' : 'Fermé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedMerchant(merchant);
                          setIsEditModalOpen(true);
                        }}
                        className="text-primary hover:text-primary-strong text-sm font-medium"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MerchantModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchMerchants(); // Refresh the list
        }}
      />

      <EditMerchantModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMerchant(null);
        }}
        onSuccess={() => {
          fetchMerchants(); // Refresh the list
        }}
        merchant={selectedMerchant}
      />
    </div>
  );
}
