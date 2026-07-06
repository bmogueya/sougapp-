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
  status: string;
  created_at: string;
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
      .from('merchants')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMerchants(data);
    } else {
      // Données statiques de démonstration en attendant la base de données
      setMerchants([
        { id: '1', name: 'Superette Nouakchott', description: 'Epicerie générale', address: 'Tevragh Zeina', status: 'active', created_at: new Date().toISOString() },
        { id: '2', name: 'Pharmacie Centrale', description: 'Médicaments et parapharmacie', address: 'Ksar', status: 'active', created_at: new Date().toISOString() },
        { id: '3', name: 'Burger Express', description: 'Restauration rapide', address: 'Arafat', status: 'pending', created_at: new Date().toISOString() },
      ]);
    }
    setLoading(false);
  };

  const filteredMerchants = merchants.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{t('merchants')}</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nouveau Marchand
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un marchand..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
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
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Chargement...
                  </td>
                </tr>
              ) : filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Aucun marchand trouvé.
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((merchant) => (
                  <tr key={merchant.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Store size={18} />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{merchant.name}</div>
                          <div className="text-xs text-slate-500">{merchant.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {merchant.address || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${merchant.status === 'active' ? 'bg-green-100 text-green-700' : 
                          merchant.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'}`}
                      >
                        {merchant.status === 'active' ? 'Actif' : merchant.status === 'pending' ? 'En attente' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedMerchant(merchant);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
