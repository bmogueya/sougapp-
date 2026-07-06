import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Search, UserPlus, Users as UsersIcon } from 'lucide-react';
import { UserModal } from '../components/UserModal';
import { EditUserModal } from '../components/EditUserModal';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  created_at: string;
}

export function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // In a real app, this might require a specific view or admin access
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    } else {
      // Mock data for display purposes if table doesn't exist yet
      setUsers([
        { id: '1', first_name: 'Sidi', last_name: 'Mohamed', role: 'super_admin', phone: '+222 45 00 00 01', created_at: new Date().toISOString() },
        { id: '2', first_name: 'Aminata', last_name: 'Diallo', role: 'customer', phone: '+222 45 00 00 02', created_at: new Date().toISOString() },
        { id: '3', first_name: 'Demba', last_name: 'Sy', role: 'driver', phone: '+222 45 00 00 03', created_at: new Date().toISOString() },
      ]);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(u => 
    (u.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text">{t('users')}</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-strong text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <UserPlus size={16} />
          Nouveau
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-faint" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un utilisateur..." 
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
                <th className="px-6 py-4">Nom Complet</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Téléphone</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <UsersIcon size={40} className="text-faint" />
                      <p className="text-muted">Aucun utilisateur trouvé.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                    <td className="px-6 py-4 font-medium text-text">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${user.role === 'super_admin' ? 'bg-info/10 text-info' : 
                          user.role === 'merchant' ? 'bg-success/10 text-success' : 
                          user.role === 'driver' ? 'bg-warning/10 text-warning' : 
                          'bg-surface-2 text-muted'}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {user.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
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

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchUsers(); // Refresh the list
        }}
      />

      <EditUserModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          fetchUsers();
        }}
        userProfile={selectedUser}
      />
    </div>
  );
}
