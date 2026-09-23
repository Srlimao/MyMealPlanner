import React, { useState, useMemo } from 'react';
import { Search, Settings, Crown, Zap, Sparkles } from 'lucide-react';
import { AdminUserSummary, AdminTierFilter } from './types';
import { TIER_CONFIGS } from '../subscription/types';

interface UserDirectoryTableProps {
  users: AdminUserSummary[];
  onSelectUser: (user: AdminUserSummary) => void;
}

export const UserDirectoryTable: React.FC<UserDirectoryTableProps> = ({
  users,
  onSelectUser,
}) => {
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<AdminTierFilter>('all');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName.toLowerCase().includes(search.toLowerCase()) ||
        u.uid.toLowerCase().includes(search.toLowerCase());
      const matchTier = filterTier === 'all' || u.tier === filterTier;
      return matchSearch && matchTier;
    });
  }, [users, search, filterTier]);

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Controls Bar: Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, email ou UID..."
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
        </div>

        {/* Tier Filter Tabs */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto text-xs">
          {(['all', 'free', 'starter', 'pro'] as AdminTierFilter[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTier(tab)}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterTier === tab
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab === 'all' ? 'Todos' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Count */}
      <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
        <span>{filteredUsers.length} utilizador(es) encontrado(s)</span>
      </div>

      {/* Responsive Table / Cards */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800 text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
              <th className="pb-2.5 px-2">Utilizador</th>
              <th className="pb-2.5 px-2">Plano</th>
              <th className="pb-2.5 px-2">Consumo Hoje</th>
              <th className="pb-2.5 px-2 hidden sm:table-cell">Último Acesso</th>
              <th className="pb-2.5 px-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-neutral-500">
                  Nenhum utilizador encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const config = TIER_CONFIGS[user.tier];
                const initial = (user.displayName || user.email)[0].toUpperCase();

                return (
                  <tr key={user.uid} className="hover:bg-neutral-800/30 transition-colors">
                    {/* User Info */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-200 truncate max-w-[130px] sm:max-w-[180px]">
                            {user.displayName}
                          </p>
                          <p className="text-[11px] text-neutral-400 truncate max-w-[130px] sm:max-w-[180px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tier Badge */}
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          user.tier === 'pro'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-mono'
                            : user.tier === 'starter'
                            ? 'bg-sky-950/80 text-sky-400 border border-sky-500/30 font-mono'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700 font-mono'
                        }`}
                      >
                        {user.tier === 'pro' ? (
                          <Crown className="w-3 h-3" />
                        ) : user.tier === 'starter' ? (
                          <Zap className="w-3 h-3" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        <span>{config.name}</span>
                      </span>
                    </td>

                    {/* Today's Usage */}
                    <td className="py-3 px-2 font-mono text-[11px] text-neutral-300">
                      <div>💬 {user.chatsToday} chats</div>
                      <div className="text-neutral-400 text-[10px]">📸 {user.photosToday} fotos</div>
                    </td>

                    {/* Last Active */}
                    <td className="py-3 px-2 text-[11px] text-neutral-400 hidden sm:table-cell">
                      {new Date(user.lastActive).toLocaleDateString()}{' '}
                      <span className="text-[10px] text-neutral-500">
                        {new Date(user.lastActive).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectUser(user)}
                        className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Gerenciar Utilizador"
                      >
                        <Settings className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Gerenciar</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
