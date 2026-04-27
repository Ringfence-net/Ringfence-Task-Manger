import { useState, useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  Calendar,
  Tag,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  Edit3,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import type { Task, TaskStatus, TaskPriority, TaskCategory } from '../types';
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  PRIORITY_LABELS,
  TEAM_MEMBERS,
  CATEGORY_COLORS,
} from '../types';
import { useTaskStore } from '../store/taskStore';
import { PriorityBadge, CategoryBadge } from './Badge';

interface Props {
  task: Task;
  onClose: () => void;
}

const statusIcons: Record<TaskStatus, React.ElementType> = {
  todo: Circle,
  in_progress: Clock,
  review: Eye,
  done: CheckCircle2,
};
const statusColors: Record<TaskStatus, string> = {
  todo: '#94a3b8',
  in_progress: '#00b4c8',
  review: '#a855f7',
  done: '#10b981',
};
const avatarColors: Record<string, string> = {
  AM: '#6366f1', JL: '#0ea5e9', SR: '#10b981',
  CK: '#f59e0b', TB: '#ec4899', MC: '#8b5cf6',
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function TaskDrawer({ task, onClose }: Props) {
  const { updateTask, deleteTask } = useTaskStore();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    category: task.category,
    assignee: task.assignee,
    dueDate: task.dueDate || '',
    tags: task.tags.join(', '),
  });
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<{ text: string; at: string }[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);

  // Reset form when task changes
  useEffect(() => {
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      assignee: task.assignee,
      dueDate: task.dueDate || '',
      tags: task.tags.join(', '),
    });
    setEditing(false);
    setConfirmDelete(false);
  }, [task.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    updateTask(task.id, { ...form, dueDate: form.dueDate || null, tags });
    setEditing(false);
  };

  const handleQuickStatus = (status: TaskStatus) => {
    updateTask(task.id, { status });
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const addNote = () => {
    if (!note.trim()) return;
    setNotes([{ text: note.trim(), at: new Date().toISOString() }, ...notes]);
    setNote('');
  };

  const ini = initials(task.assignee);
  const avatarColor = avatarColors[ini] || '#64748b';
  const catColor = CATEGORY_COLORS[task.category];
  const isOverdue = task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
  const isDueToday = task.dueDate && task.status !== 'done' && isToday(parseISO(task.dueDate));
  const StatusIcon = statusIcons[task.status];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        style={{ backdropFilter: 'blur(1px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: catColor }}
            />
            <span className="text-xs font-medium text-slate-500">
              {CATEGORY_LABELS[task.category]}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {!editing && (
              <button
                onClick={() => { setEditing(true); setTimeout(() => titleRef.current?.focus(), 50); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit3 size={12} /> Edit
              </button>
            )}
            {editing && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white bg-[#0f1e3d] hover:bg-[#1a3060] rounded-lg transition-colors"
              >
                <Save size={12} /> Save
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Title + status */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-50">
            <div className="flex items-start gap-3 mb-3">
              <button
                onClick={() => handleQuickStatus(task.status === 'done' ? 'todo' : 'done')}
                className="mt-1 flex-shrink-0 hover:scale-110 transition-transform"
                title="Toggle done"
              >
                <StatusIcon size={18} style={{ color: statusColors[task.status] }} />
              </button>

              {editing ? (
                <input
                  ref={titleRef}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="flex-1 text-lg font-bold text-slate-800 border-b-2 border-[#00b4c8] focus:outline-none bg-transparent pb-1"
                />
              ) : (
                <h2
                  className={`flex-1 text-lg font-bold leading-snug ${
                    task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {task.title}
                </h2>
              )}
            </div>

            {/* Status pills */}
            <div className="flex gap-1.5 flex-wrap ml-7">
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => {
                const Icon = statusIcons[s];
                const active = (editing ? form.status : task.status) === s;
                return (
                  <button
                    key={s}
                    onClick={() => editing ? setForm({ ...form, status: s }) : handleQuickStatus(s)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      active
                        ? 'bg-[#0f1e3d] text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <Icon size={10} />
                    {STATUS_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meta grid */}
          <div className="px-5 py-4 border-b border-slate-50">
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Priority</p>
                {editing ? (
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#00b4c8]/30"
                  >
                    {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                ) : (
                  <PriorityBadge priority={task.priority} />
                )}
              </div>

              {/* Category */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Category</p>
                {editing ? (
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#00b4c8]/30"
                  >
                    {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                ) : (
                  <CategoryBadge category={task.category} />
                )}
              </div>

              {/* Assignee */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Assignee</p>
                {editing ? (
                  <select
                    value={form.assignee}
                    onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#00b4c8]/30"
                  >
                    {TEAM_MEMBERS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {ini}
                    </div>
                    <span className="text-xs text-slate-700">{task.assignee}</span>
                  </div>
                )}
              </div>

              {/* Due date */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Due Date</p>
                {editing ? (
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00b4c8]/30"
                  />
                ) : task.dueDate ? (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-600' : 'text-slate-700'
                    }`}
                  >
                    {isOverdue && <AlertTriangle size={12} />}
                    <Calendar size={12} />
                    {format(parseISO(task.dueDate), 'dd MMMM yyyy')}
                    {isOverdue && ' (Overdue)'}
                    {isDueToday && ' (Today)'}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No due date</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-5 py-4 border-b border-slate-50">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Description</p>
            {editing ? (
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Add a description..."
                className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00b4c8]/30 resize-none"
              />
            ) : task.description ? (
              <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
            ) : (
              <p className="text-sm text-slate-400 italic">No description</p>
            )}
          </div>

          {/* Tags */}
          <div className="px-5 py-4 border-b border-slate-50">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Tags</p>
            {editing ? (
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Tag1, Tag2..."
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00b4c8]/30"
              />
            ) : task.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No tags</p>
            )}
          </div>

          {/* Notes / Activity */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Notes</p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
                placeholder="Add a note and press Enter..."
                className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00b4c8]/30"
              />
              <button
                onClick={addNote}
                disabled={!note.trim()}
                className="px-3 py-2 text-xs bg-[#0f1e3d] text-white rounded-lg hover:bg-[#1a3060] disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {notes.map((n, i) => (
                <div key={i} className="flex gap-2.5 text-xs">
                  <div className="w-1 bg-[#00b4c8]/30 rounded flex-shrink-0" />
                  <div>
                    <p className="text-slate-700">{n.text}</p>
                    <p className="text-slate-400 mt-0.5">{format(new Date(n.at), 'dd MMM, HH:mm')}</p>
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-3">No notes yet</p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Created {format(new Date(task.createdAt), 'dd MMM yyyy')}</span>
              <span>Updated {format(new Date(task.updatedAt), 'dd MMM yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Delete this task?</span>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}

          <span className="text-[10px] text-slate-400">
            #{task.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </div>
    </>
  );
}
