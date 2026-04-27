import { useState } from 'react';
import { Plus, ArrowRight, Phone, Mail, FileText, Handshake } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { TaskModal } from '../components/TaskModal';
import { TaskDrawer } from '../components/TaskDrawer';
import { TaskCard } from '../components/TaskCard';
import type { Task } from '../types';

const BD_CATEGORIES = [
  'lead_generation',
  'client_outreach',
  'proposals_pitches',
  'client_management',
  'partnerships',
] as const;

const BD_STAGES = [
  { id: 'lead_generation', label: 'Leads', icon: Phone, color: '#6366f1' },
  { id: 'client_outreach', label: 'Outreach', icon: Mail, color: '#0ea5e9' },
  { id: 'proposals_pitches', label: 'Proposals', icon: FileText, color: '#f97316' },
  { id: 'client_management', label: 'Active Clients', icon: Handshake, color: '#10b981' },
  { id: 'partnerships', label: 'Partnerships', icon: Handshake, color: '#14b8a6' },
] as const;

export function Pipeline() {
  const { tasks } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const bdTasks = tasks.filter((t) =>
    BD_CATEGORIES.includes(t.category as typeof BD_CATEGORIES[number])
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">BD Pipeline</h1>
        <p className="text-sm text-slate-500 mt-0.5">Business development tasks across your pipeline stages</p>
      </div>

      {/* Pipeline funnel stats */}
      <div className="flex items-center gap-0 mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {BD_STAGES.map((stage, i) => {
          const count = bdTasks.filter((t) => t.category === stage.id && t.status !== 'done').length;
          return (
            <div key={stage.id} className="flex items-center flex-1 min-w-0">
              <div className="flex-1 px-4 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <stage.icon size={14} style={{ color: stage.color }} />
                  <span className="text-xs font-medium text-slate-500 truncate">{stage.label}</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{count}</p>
              </div>
              {i < BD_STAGES.length - 1 && (
                <ArrowRight size={16} className="text-slate-200 flex-shrink-0 mr-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage rows */}
      <div className="space-y-6">
        {BD_STAGES.map((stage) => {
          const stageTasks = bdTasks.filter((t) => t.category === stage.id);
          return (
            <div key={stage.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                  <h2 className="text-sm font-semibold text-slate-700">{stage.label}</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                    {stageTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#00b4c8] transition-colors"
                >
                  <Plus size={12} /> Add
                </button>
              </div>

              {stageTasks.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
                  No tasks in this stage
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {stageTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedTask && <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />}
      {modalOpen && <TaskModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
