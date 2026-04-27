import { Shield, Users, Tag, Bell, Database } from 'lucide-react';
import { TEAM_MEMBERS, CATEGORY_LABELS, CATEGORY_COLORS } from '../types';
import type { TaskCategory } from '../types';
import { useTaskStore } from '../store/taskStore';

export function Settings() {
  const { tasks } = useTaskStore();

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your Ringfence Task Manager preferences</p>
      </div>

      <div className="space-y-4">
        {/* Workspace info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-[#0f1e3d]" />
            <h2 className="text-sm font-semibold text-slate-700">Workspace</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Firm Name</label>
              <input
                defaultValue="Ringfence Consulting"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00b4c8]/30"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input
                defaultValue="admin@ringfence.net"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00b4c8]/30"
              />
            </div>
          </div>
        </div>

        {/* Team members */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-[#00b4c8]" />
            <h2 className="text-sm font-semibold text-slate-700">Team Members</h2>
          </div>
          <div className="space-y-2">
            {TEAM_MEMBERS.map((member) => {
              const ini = member.split(' ').map((n) => n[0]).join('').toUpperCase();
              const memberTasks = tasks.filter((t) => t.assignee === member);
              const activeTasks = memberTasks.filter((t) => t.status !== 'done').length;
              return (
                <div key={member} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0f1e3d]/10 flex items-center justify-center text-xs font-bold text-[#0f1e3d]">
                      {ini}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{member}</p>
                      <p className="text-xs text-slate-400">{activeTasks} active tasks</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{memberTasks.length} total</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={16} className="text-[#f0a500]" />
            <h2 className="text-sm font-semibold text-slate-700">Task Categories</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(CATEGORY_LABELS) as [TaskCategory, string][]).map(([cat, label]) => (
              <div key={cat} className="flex items-center gap-2 py-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                />
                <span className="text-xs text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications stub */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-purple-500" />
            <h2 className="text-sm font-semibold text-slate-700">Notifications</h2>
          </div>
          {[
            'Overdue task alerts',
            'Daily digest email',
            'Task assignment notifications',
          ].map((item) => (
            <div key={item} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-600">{item}</span>
              <div className="w-9 h-5 bg-[#0f1e3d] rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          ))}
        </div>

        {/* Data */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Data</h2>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            {tasks.length} tasks stored locally in your browser.
          </p>
          <button
            className="px-4 py-2 text-xs bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
            onClick={() => {
              if (confirm('Clear all tasks? This cannot be undone.')) {
                localStorage.removeItem('ringfence-tasks');
                window.location.reload();
              }
            }}
          >
            Clear all data
          </button>
        </div>
      </div>
    </div>
  );
}
