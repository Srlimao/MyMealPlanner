import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import { AdminUserSummary } from './types';
import { adminService } from './adminService';
import { FinancialMetricsCard } from './FinancialMetricsCard';
import { UserDirectoryTable } from './UserDirectoryTable';
import { UserEditModal } from './UserEditModal';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await adminService.fetchAllUsers();
      setUsers(fetched);
    } catch (err) {
      console.error('Failed to fetch admin users', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const financialSummary = adminService.calculateFinancialMetrics(users);

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-100">
              Painel de Administração
            </h1>
            <p className="text-xs text-neutral-400">
              Gestão de utilizadores, planos, quotas e saúde financeira
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Atualizar</span>
        </button>
      </div>

      {loading && users.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="text-xs">A carregar utilizadores e métricas...</span>
        </div>
      ) : (
        <>
          {/* Financial & Token Health Card */}
          <FinancialMetricsCard metrics={financialSummary} />

          {/* User Directory Table */}
          <UserDirectoryTable users={users} onSelectUser={setSelectedUser} />
        </>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUserUpdated={loadData}
        />
      )}
    </div>
  );
};
