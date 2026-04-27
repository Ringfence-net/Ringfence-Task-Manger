import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, ListTodo, Columns3, TrendingUp, Target, Users, Plus, CheckCircle2 } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { STATUS_LABELS, PRIORITY_LABELS } from '../types';

interface Props {
  onClose: () => void;
  onNewTask: () => void;
}

const PAGES = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Tasks', to: '/tasks', icon: ListTodo },
  { label: 'Kanban', to: '/kanban', icon: Columns3 },
  { label: 'BD Pipeline', to: '/pipeline', icon: TrendingUp },
  { label: 'Campaigns', to: '/campaigns', icon: Target },
  { label: 'Team Workload', to: '/team', icon: Users },
];

export function CommandPalette({ onClose, onNewTask }: Props) {
  const navigate = useNavigate();
  const { tasks } = useTaskStore();
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const matchedPages = PAGES.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase())
  );

  const matchedTasks = query.length > 1
    ? tasks
        .filter(
          (t) =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.assignee.toLowerCase().includes(query.toLowerCase()) ||
            t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  const allResults: { type: 'page' | 'task' | 'action'; label: string; sub?: string; action: () => void }[] = [
    {
      type: 'action',
      label: 'Create New Task',
      sub: 'Shortcut: N',
      action: () => { onClose(); onNewTask(); },
    },
    ...matchedPages.map((p) => ({
      type: 'page' as const,
      label: p.label,
      sub: 'Navigate',
      action: () => { navigate(p.to); onClose(); },
    })),
    ...matchedTasks.map((t) => ({
      type: 'task' as const,
      label: t.title,
      sub: `${STATUS_LABELS[t.status]} · ${PRIORITY_LABELS[t.priority]} · ${t.assignee}`,
      action: () => { navigate('/tasks'); onClose(); },
    })),
  ];

  useEffect(() => { setHighlighted(0); }, [query]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      allResults[highlighted]?.action();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      style={{ backgroundColor: 'rgba(15,30,61,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search tasks, navigate pages..."
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-slate-400 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-1.5">
          {allResults.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">No results</p>
          )}
          {allResults.map((result, i) => (
            <button
              key={i}
              onClick={result.action}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                highlighted === i ? 'bg-[#0f1e3d] text-white' : 'hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  highlighted === i ? 'bg-white/20' : 'bg-slate-100'
                }`}
              >
                {result.type === 'action' && <Plus size={13} className={highlighted === i ? 'text-white' : 'text-[#00b4c8]'} />}
                {result.type === 'page' && <LayoutDashboard size={13} className={highlighted === i ? 'text-white' : 'text-slate-500'} />}
                {result.type === 'task' && <CheckCircle2 size={13} className={highlighted === i ? 'text-white' : 'text-slate-500'} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${highlighted === i ? 'text-white' : 'text-slate-800'}`}>
                  {result.label}
                </p>
                {result.sub && (
                  <p className={`text-[11px] truncate ${highlighted === i ? 'text-white/60' : 'text-slate-400'}`}>
                    {result.sub}
                  </p>
                )}
              </div>
              {result.type === 'page' && (
                <span className={`text-[10px] flex-shrink-0 ${highlighted === i ? 'text-white/50' : 'text-slate-300'}`}>
                  Page
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-400">
          <span><kbd className="border border-slate-200 rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="border border-slate-200 rounded px-1">↵</kbd> select</span>
          <span><kbd className="border border-slate-200 rounded px-1">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
