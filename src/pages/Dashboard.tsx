import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  CalendarClock,
  Flame,
} from 'lucide-react';
import { format } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import { CATEGORY_LABELS, CATEGORY_COLORS, PRIORITY_LABELS } from '../types';
import type { TaskCategory } from '../types';
import { TaskModal } from '../components/TaskModal';
import { TaskCard } from '../components/TaskCard';
import type { Task } from '../types';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '18' }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-36 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-5 text-right flex-shrink-0">{value}</span>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { getStats, tasks } = useTaskStore();
  const stats = getStats();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const urgentTasks = tasks
    .filter((t) => t.priority === 'urgent' && t.status !== 'done')
    .slice(0, 3);

  const recentDone = tasks
    .filter((t) => t.status === 'done')
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
    .slice(0, 3);

  const upcomingTasks = tasks
    .filter((t) => t.dueDate && t.status !== 'done')
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 4);

  const topCategories = Object.entries(stats.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Good morning 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {format(new Date(), 'EEEE, d MMMM yyyy')} · Ringfence Consulting
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0f1e3d] text-white text-sm font-medium rounded-xl hover:bg-[#1a3060] transition-colors shadow-sm"
        >
          <Plus size={15} />
          New Task
        </button>
      </div>

      {/* Alert banners */}
      {(stats.overdue > 0 || stats.dueToday > 0) && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm">
              <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
              <span className="text-red-700">
                <strong>{stats.overdue}</strong> overdue {stats.overdue === 1 ? 'task' : 'tasks'}
              </span>
            </div>
          )}
          {stats.dueToday > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-sm">
              <CalendarClock size={15} className="text-amber-500 flex-shrink-0" />
              <span className="text-amber-700">
                <strong>{stats.dueToday}</strong> {stats.dueToday === 1 ? 'task' : 'tasks'} due today
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Tasks"
          value={stats.total}
          icon={TrendingUp}
          color="#0f1e3d"
          sub="All time"
        />
        <StatCard
          label="In Progress"
          value={stats.in_progress}
          icon={Clock}
          color="#00b4c8"
          sub={`${stats.review} in review`}
        />
        <StatCard
          label="Completed"
          value={stats.done}
          icon={CheckCircle2}
          color="#10b981"
          sub={`${stats.completionRate}% completion rate`}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          color={stats.overdue > 0 ? '#ef4444' : '#64748b'}
          sub={`${stats.dueToday} due today`}
        />
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Overall Progress</p>
          <span className="text-sm font-bold text-[#00b4c8]">{stats.completionRate}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${stats.completionRate}%`,
              background: 'linear-gradient(90deg, #0f1e3d, #00b4c8)',
            }}
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          {[
            { label: 'To Do', val: stats.todo, color: '#94a3b8' },
            { label: 'In Progress', val: stats.in_progress, color: '#00b4c8' },
            { label: 'In Review', val: stats.review, color: '#a855f7' },
            { label: 'Done', val: stats.done, color: '#10b981' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-500">
                {label}: <strong className="text-slate-700">{val}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Urgent tasks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-red-500" />
              <h2 className="text-sm font-semibold text-slate-700">Urgent</h2>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs text-[#00b4c8] hover:underline flex items-center gap-0.5"
            >
              View all <ArrowRight size={11} />
            </button>
          </div>
          {urgentTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No urgent tasks 🎉</p>
          ) : (
            <div className="space-y-2">
              {urgentTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  compact
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock size={15} className="text-[#00b4c8]" />
              <h2 className="text-sm font-semibold text-slate-700">Upcoming</h2>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs text-[#00b4c8] hover:underline flex items-center gap-0.5"
            >
              View all <ArrowRight size={11} />
            </button>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No upcoming tasks</p>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  compact
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recently completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-700">Recently Done</h2>
            </div>
          </div>
          {recentDone.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No completed tasks yet</p>
          ) : (
            <div className="space-y-2">
              {recentDone.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-start gap-2.5 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 line-clamp-1">{task.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {task.completedAt ? format(new Date(task.completedAt), 'dd MMM') : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Tasks by Category</h2>
          <div className="space-y-3">
            {topCategories.map(([cat, count]) => (
              <MiniBar
                key={cat}
                label={CATEGORY_LABELS[cat as TaskCategory]}
                value={count}
                max={stats.total}
                color={CATEGORY_COLORS[cat as TaskCategory]}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Tasks by Priority</h2>
          <div className="space-y-3">
            {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
              <MiniBar
                key={p}
                label={PRIORITY_LABELS[p]}
                value={stats.byPriority[p] || 0}
                max={stats.total}
                color={
                  p === 'urgent'
                    ? '#ef4444'
                    : p === 'high'
                    ? '#f97316'
                    : p === 'medium'
                    ? '#f59e0b'
                    : '#94a3b8'
                }
              />
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1e3d] text-white text-xs rounded-lg hover:bg-[#1a3060] transition-colors"
              >
                <Plus size={12} /> New Task
              </button>
              <button
                onClick={() => navigate('/kanban')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00b4c8]/10 text-[#00b4c8] text-xs rounded-lg hover:bg-[#00b4c8]/20 transition-colors"
              >
                Open Kanban
              </button>
              <button
                onClick={() => navigate('/tasks')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200 transition-colors"
              >
                All Tasks
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <TaskModal onClose={() => setModalOpen(false)} />
      )}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
