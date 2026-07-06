import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, DollarSign, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  wallets: {
    profiles: {
      first_name: string;
      last_name: string;
    }
  }
}

export function Finance() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    systemCommissions: 0,
    pendingPayouts: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    
    // Fetch latest transactions
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select(`
        id, amount, type, status, created_at,
        wallets (
          profiles ( first_name, last_name )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!txError && txData) {
      setTransactions(txData as any);
    }

    // Fetch stats (simplified sum for demo purposes)
    const { data: walletsData } = await supabase.from('wallets').select('balance');
    const { data: commData } = await supabase.from('transactions').select('amount').eq('type', 'commission').eq('status', 'completed');
    const { data: pendingData } = await supabase.from('transactions').select('amount').eq('type', 'payout').eq('status', 'pending');

    const totalBal = walletsData?.reduce((acc, w) => acc + Number(w.balance), 0) || 0;
    const totalComm = commData?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const totalPending = pendingData?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

    setStats({
      totalEarnings: totalBal,
      systemCommissions: totalComm,
      pendingPayouts: totalPending,
    });

    setLoading(false);
  };

  const formatMRU = (amount: number) => {
    return new Intl.NumberFormat('fr-MR', { style: 'currency', currency: 'MRU' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text">Finances & Transactions</h1>
        <button onClick={fetchFinanceData} className="bg-primary hover:bg-primary-strong text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-2xl shadow-card border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-info/10 p-3 rounded-lg text-info">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Volume Global (Wallets)</p>
              <h3 className="text-xl font-bold text-text">{formatMRU(stats.totalEarnings)}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-success font-medium">
            <Activity size={16} />
            <span>Basé sur les soldes actuels</span>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-card border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-success/10 p-3 rounded-lg text-success">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Commissions Plateforme</p>
              <h3 className="text-xl font-bold text-text">{formatMRU(stats.systemCommissions)}</h3>
            </div>
          </div>
          <p className="text-sm text-muted">Total des revenus générés</p>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-card border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-warning/10 p-3 rounded-lg text-warning">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Paiements en attente</p>
              <h3 className="text-xl font-bold text-text">{formatMRU(stats.pendingPayouts)}</h3>
            </div>
          </div>
          <p className="text-sm text-muted">Dûs aux marchands</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-text">Dernières Transactions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="bg-surface-2 text-muted font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">ID Transaction</th>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">Chargement...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">Aucune transaction trouvée.</td></tr>
              ) : transactions.map((trx) => (
                <tr key={trx.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                  <td className="px-6 py-4 font-medium text-text">{trx.id.split('-')[0]}...</td>
                  <td className="px-6 py-4 text-text">
                    {trx.wallets?.profiles?.first_name} {trx.wallets?.profiles?.last_name}
                  </td>
                  <td className="px-6 py-4 text-muted">{new Date(trx.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-text">{formatMRU(trx.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      trx.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
