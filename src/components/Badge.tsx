import type { TaskPriority, TaskStatus, TaskCategory } from '../types';
import { PRIORITY_LABELS, STATUS_LABELS, CATEGORY_LABELS, CATEGORY_COLORS } from '../types';

const priorityStyles: Record<TaskPriority, string> = {
  urgent: 'bg-red-50 text-red-700 border border-red-200',
  high: 'bg-orange-50 text-orange-700 border border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  low: 'bg-slate-50 text-slate-600 border border-slate-200',
};

const statusStyles: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-700',
  review: 'bg-purple-50 text-purple-700',
  done: 'bg-emerald-50 text-emerald-700',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${priorityStyles[priority]}`}>
      {priority === 'urgent' && <span className="mr-1">🔴</span>}
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${statusStyles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function CategoryBadge({ category }: { category: TaskCategory }) {
  const color = CATEGORY_COLORS[category];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
      style={{ backgroundColor: color + '18', color, border: `1px solid ${color}40` }}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
