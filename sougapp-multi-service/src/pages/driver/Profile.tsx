import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, TrendingUp, Star, Award } from 'lucide-react';
import { formatMRU } from '../../lib/utils';

export function DriverProfile() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({ total_deliveries: 0, total_earnings: 0 });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('driver_id', user?.id)
      .eq('status', 'delivered');

    if (data) {
      setStats({
        total_deliveries: data.length,
        total_earnings: data.length * 500 // Simulation: 500 MRU per delivery
      });
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* Profile Header */}
      <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
          <User size={40} className="text-primary" />
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-success rounded-full flex items-center justify-center border-2 border-surface text-white">
            <Award size={16} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-text">{(user as any)?.first_name} {(user as any)?.last_name}</h1>
        <p className="text-muted text-sm">{user?.email}</p>
        
        <div className="flex items-center gap-1 mt-3 bg-surface-2 px-3 py-1 rounded-full">
          <Star size={14} className="text-warning fill-warning" />
          <span className="text-sm font-bold text-text">4.8</span>
          <span className="text-xs text-muted">(124 avis)</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-5 rounded-3xl border border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <TrendingUp size={20} className="text-primary" />
          </div>
          <p className="text-sm text-muted mb-1">Gains Totaux</p>
          <p className="text-xl font-bold text-text">{formatMRU(stats.total_earnings)}</p>
        </div>
        <div className="bg-surface p-5 rounded-3xl border border-border">
          <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center mb-3">
            <PackageIcon size={20} className="text-info" />
          </div>
          <p className="text-sm text-muted mb-1">Courses</p>
          <p className="text-xl font-bold text-text">{stats.total_deliveries}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-8">
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 py-4 bg-danger/10 text-danger font-bold rounded-2xl hover:bg-danger/20 transition-colors"
        >
          <LogOut size={20} />
          Se déconnecter
        </button>
      </div>

    </div>
  );
}

import { Package as PackageIcon } from 'lucide-react';
