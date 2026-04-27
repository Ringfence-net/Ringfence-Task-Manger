import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Columns3,
  TrendingUp,
  Target,
  Settings,
  Shield,
} from 'lucide-react';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/kanban', icon: Columns3, label: 'Kanban' },
  { to: '/pipeline', icon: TrendingUp, label: 'BD Pipeline' },
  { to: '/campaigns', icon: Target, label: 'Campaigns' },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-[#0f1e3d] flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00b4c8] rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Ringfence</p>
            <p className="text-white/50 text-xs mt-0.5">Consulting</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
          Workspace
        </p>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-[#00b4c8] text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              isActive
                ? 'bg-[#00b4c8] text-white font-medium'
                : 'text-white/60 hover:text-white hover:bg-white/8'
            }`
          }
        >
          <Settings size={16} />
          Settings
        </NavLink>
        <div className="mt-4 px-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#00b4c8]/20 border border-[#00b4c8]/40 flex items-center justify-center text-[#00b4c8] text-xs font-bold">
              RC
            </div>
            <div>
              <p className="text-white text-xs font-medium">Ringfence Team</p>
              <p className="text-white/40 text-[10px]">admin@ringfence.net</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
