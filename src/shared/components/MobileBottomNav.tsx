import React from 'react';
import { Calendar, Plus, BookOpen, BarChart3, ShieldCheck } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  onOpenQuickLog: () => void;
  isAdmin: boolean;
  translations: {
    dashboard: string;
    plan: string;
    history: string;
  };
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickLog,
  isAdmin,
  translations,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800/90 px-3 py-2 flex items-center justify-around">
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-neutral-400'
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span>{translations.dashboard}</span>
      </button>

      {/* Center Quick Log Action Button */}
      <button
        onClick={onOpenQuickLog}
        className="flex items-center justify-center w-11 h-11 -mt-4 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-950/80 border-2 border-neutral-950 active:scale-90 transition-transform cursor-pointer"
      >
        <Plus className="w-5 h-5" />
      </button>

      <button
        onClick={() => onSelectTab('plan')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          activeTab === 'plan' ? 'text-emerald-400 font-bold' : 'text-neutral-400'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        <span>{translations.plan}</span>
      </button>

      <button
        onClick={() => onSelectTab('metrics')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          activeTab === 'metrics' ? 'text-emerald-400 font-bold' : 'text-neutral-400'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        <span>{translations.history}</span>
      </button>

      {isAdmin && (
        <button
          data-tab="admin"
          onClick={() => onSelectTab('admin')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'admin' ? 'text-emerald-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin</span>
        </button>
      )}
    </nav>
  );
};
