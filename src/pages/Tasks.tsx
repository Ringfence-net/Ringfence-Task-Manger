import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  Download,
  Trash2,
  CheckSquare,
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import type { Task, TaskStatus, TaskPriority, TaskCategory } from '../types';
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  PRIORITY_LABELS,
  TEAM_MEMBERS,
  CATEGORY_COLORS,
} from '../types';
import { TaskModal } from '../components/TaskModal';
import { TaskDrawer } from '../components/TaskDrawer';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../components/Badge';

const statusIcons: Record<TaskStatus, React.ElementType> = {
  todo: Circle, in_progress: Clock, review: Eye, done: CheckCircle2,
};
const statusIconColors: Record<TaskStatus, string> = {
  todo: '#94a3b8', in_progress: '#00b4c8', review: '#a855f7', done: '#10b981',
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}
const avatarColors: Record<string, string> = {
  AM: '#6366f1', JL: '#0ea5e9', SR: '#10b981',
  CK: '#f59e0b', TB: '#ec4899', MC: '#8b5cf6',
};

function exportToCSV(tasks: Task[]) {
  const headers = ['Title', 'Status', 'Priority', 'Category', 'Assignee', 'Due Date', 'Tags', 'Created'];
  const rows = tasks.map((t) => [
    `"${t.title.replace(/"/g, '""')}"`,
    STATUS_LABELS[t.status],
    PRIORITY_LABELS[t.priority],
    CATEGORY_LABELS[t.category],
    t.assignee,
    t.dueDate || '',
    t.tags.join('; '),
    format(new Date(t.createdAt), 'yyyy-MM-dd'),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ringfence-tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function Tasks() {
  const { filter, setFilter, resetFilter, getFilteredTasks, updateTask, deleteTask } = useTaskStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<TaskStatus | ''>('');
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const tasks = getFilteredTasks();

  const activeFilters = [
    filter.status !== 'all',
    filter.priority !== 'all',
    filter.category !== 'all',
    !!filter.assignee,
  ].filter(Boolean).length;

  const allSelected = tasks.length > 0 && tasks.every((t) => selected.has(t.id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tasks.map((t) => t.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function applyBulkStatus() {
    if (!bulkStatus) return;
    selected.forEach((id) => updateTask(id, { status: bulkStatus as TaskStatus }));
    setSelected(new Set());
    setBulkStatus('');
  }

  function bulkDelete() {
    selected.forEach((id) => deleteTask(id));
    setSelected(new Set());
    setConfirmBulkDelete(false);
  }

  const selectedTasks = useMemo(
    () => tasks.filter((t) => selected.has(t.id)),
    [tasks, selected]
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            {someSelected && (
              <span className="ml-2 text-[#00b4c8] font-medium">
                · {selected.size} selected
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(someSelected ? selectedTasks : tasks)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs border border-slate-200 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            title={someSelected ? 'Export selected' : 'Export all'}
          >
            <Download size={13} />
            {someSelected ? `Export (${selected.size})` : 'Export CSV'}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#0f1e3d] text-white text-sm font-medium rounded-xl hover:bg-[#1a3060] transition-colors shadow-sm"
          >
            <Plus size={15} />
            New Task
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#0f1e3d] text-white rounded-2xl mb-4 flex-wrap">
          <span className="text-sm font-medium flex-shrink-0">
            {selected.size} {selected.size === 1 ? 'task' : 'tasks'} selected
          </span>
          <div className="flex-1" />

          {/* Bulk status change */}
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as TaskStatus | '')}
            className="text-xs bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white focus:outline-none"
          >
            <option value="">Set status...</option>
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
              <option key={s} value={s} className="text-slate-800">{STATUS_LABELS[s]}</option>
            ))}
          </select>
          {bulkStatus && (
            <button
              onClick={applyBulkStatus}
              className="px-3 py-1.5 text-xs bg-[#00b4c8] rounded-lg hover:bg-[#00a0b2] transition-colors font-medium"
            >
              Apply
            </button>
          )}

          {/* Bulk delete */}
          {confirmBulkDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-300">Delete {selected.size}?</span>
              <button onClick={bulkDelete} className="px-3 py-1.5 text-xs bg-red-500 rounded-lg hover:bg-red-600">Confirm</button>
              <button onClick={() => setConfirmBulkDelete(false)} className="px-3 py-1.5 text-xs bg-white/10 rounded-lg hover:bg-white/20">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmBulkDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}

          <button
            onClick={() => setSelected(new Set())}
            className="p-1.5 text-white/50 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ search: e.target.value })}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4c8]/30 focus:border-[#00b4c8]"
            />
            {filter.search && (
              <button onClick={() => setFilter({ search: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex gap-1 flex-wrap">
            {(['all', 'todo', 'in_progress', 'review', 'done'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter({ status: s })}
                className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  filter.status === s ? 'bg-[#0f1e3d] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors border ${
              showFilters || activeFilters > 0
                ? 'bg-[#00b4c8]/10 text-[#00b4c8] border-[#00b4c8]/30'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal size={12} />
            Filters
            {activeFilters > 0 && (
              <span className="ml-0.5 bg-[#00b4c8] text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={12} className="text-slate-400" />
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ sortBy: e.target.value as typeof filter.sortBy })}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white text-slate-600"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Created</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={() => setFilter({ sortDir: filter.sortDir === 'asc' ? 'desc' : 'asc' })}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50"
            >
              {filter.sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex gap-3 flex-wrap items-end">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-medium uppercase tracking-wide">Priority</label>
              <select
                value={filter.priority}
                onChange={(e) => setFilter({ priority: e.target.value as typeof filter.priority })}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white text-slate-700"
              >
                <option value="all">All Priorities</option>
                {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-medium uppercase tracking-wide">Category</label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ category: e.target.value as typeof filter.category })}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white text-slate-700"
              >
                <option value="all">All Categories</option>
                {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-medium uppercase tracking-wide">Assignee</label>
              <select
                value={filter.assignee}
                onChange={(e) => setFilter({ assignee: e.target.value })}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white text-slate-700"
              >
                <option value="">All Members</option>
                {TEAM_MEMBERS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            {activeFilters > 0 && (
              <button
                onClick={resetFilter}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category color legend strip */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {(Object.entries(CATEGORY_LABELS) as [TaskCategory, string][])
          .filter(([cat]) => tasks.some((t) => t.category === cat))
          .map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => setFilter({ category: filter.category === cat ? 'all' : cat })}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all border ${
                filter.category === cat
                  ? 'border-current font-semibold'
                  : 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              style={filter.category === cat ? { color: CATEGORY_COLORS[cat], backgroundColor: CATEGORY_COLORS[cat] + '18' } : {}}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              {label}
            </button>
          ))}
      </div>

      {/* Task table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {tasks.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-sm">No tasks found.</p>
            <button onClick={() => setModalOpen(true)} className="mt-3 text-[#00b4c8] text-sm hover:underline">
              Create your first task →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 w-8">
                  <button onClick={toggleAll} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <CheckSquare size={14} className={allSelected ? 'text-[#00b4c8]' : ''} />
                  </button>
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Task</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Priority</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Status</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Assignee</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const StatusIcon = statusIcons[task.status];
                const iconColor = statusIconColors[task.status];
                const isOverdue = task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
                const isDueToday = task.dueDate && task.status !== 'done' && isToday(parseISO(task.dueDate));
                const ini = initials(task.assignee);
                const avatarColor = avatarColors[ini] || '#64748b';
                const isChecked = selected.has(task.id);

                return (
                  <tr
                    key={task.id}
                    className={`border-b border-slate-50 cursor-pointer transition-colors group ${
                      isChecked
                        ? 'bg-[#00b4c8]/5'
                        : isOverdue
                        ? 'bg-red-50/30 hover:bg-red-50/60'
                        : isDueToday
                        ? 'bg-amber-50/30 hover:bg-amber-50/60'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3.5 w-8" onClick={(e) => { e.stopPropagation(); toggleOne(task.id); }}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-[#00b4c8] border-[#00b4c8]' : 'border-slate-300 hover:border-[#00b4c8]'
                      }`}>
                        {isChecked && <X size={9} className="text-white" strokeWidth={3} />}
                      </div>
                    </td>

                    <td className="px-3 py-3.5" onClick={() => setSelectedTask(task)}>
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
                          }}
                          className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
                          title="Toggle complete"
                        >
                          <StatusIcon size={15} style={{ color: iconColor }} />
                        </button>
                        <div className="min-w-0">
                          <p className={`font-medium leading-snug ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                          {task.tags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {task.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 hidden md:table-cell" onClick={() => setSelectedTask(task)}>
                      <CategoryBadge category={task.category} />
                    </td>

                    <td className="px-3 py-3.5" onClick={() => setSelectedTask(task)}>
                      <PriorityBadge priority={task.priority} />
                    </td>

                    <td className="px-3 py-3.5 hidden lg:table-cell" onClick={() => setSelectedTask(task)}>
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="px-3 py-3.5 hidden lg:table-cell" onClick={() => setSelectedTask(task)}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: avatarColor }}
                        >
                          {ini}
                        </div>
                        <span className="text-xs text-slate-600">{task.assignee}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 hidden md:table-cell" onClick={() => setSelectedTask(task)}>
                      {task.dueDate ? (
                        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-600' : 'text-slate-500'}`}>
                          {isOverdue ? '⚠ ' : isDueToday ? '◉ ' : ''}
                          {format(parseISO(task.dueDate), 'dd MMM')}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-xs text-slate-400">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            {someSelected && ` · ${selected.size} selected`}
          </p>
          <button
            onClick={() => exportToCSV(tasks)}
            className="sm:hidden flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          >
            <Download size={12} /> Export CSV
          </button>
        </div>
      )}

      {modalOpen && <TaskModal onClose={() => setModalOpen(false)} />}
      {selectedTask && <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </div>
  );
}
