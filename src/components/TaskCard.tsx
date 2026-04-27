import { Calendar, Tag } from 'lucide-react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import type { Task } from '../types';
import { PriorityBadge, CategoryBadge } from './Badge';

interface Props {
  task: Task;
  onClick: () => void;
  compact?: boolean;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors: Record<string, string> = {
  AM: '#6366f1',
  JL: '#0ea5e9',
  SR: '#10b981',
  CK: '#f59e0b',
  TB: '#ec4899',
  MC: '#8b5cf6',
};

export function TaskCard({ task, onClick, compact = false }: Props) {
  const isOverdue =
    task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
  const isDueToday = task.dueDate && task.status !== 'done' && isToday(parseISO(task.dueDate));
  const ini = initials(task.assignee);
  const avatarColor = avatarColors[ini] || '#64748b';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#00b4c8]/30 transition-all cursor-pointer group p-4"
    >
      {/* Priority + Category row */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <PriorityBadge priority={task.priority} />
        {!compact && <CategoryBadge category={task.category} />}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-800 group-hover:text-[#0f1e3d] leading-snug mb-1.5 line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {!compact && task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      {/* Tags */}
      {!compact && task.tags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <Tag size={10} className="text-slate-400" />
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {ini}
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:block">{task.assignee.split(' ')[0]}</span>
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div
            className={`flex items-center gap-1 text-[11px] ${
              isOverdue
                ? 'text-red-600 font-medium'
                : isDueToday
                ? 'text-amber-600 font-medium'
                : 'text-slate-400'
            }`}
          >
            <Calendar size={11} />
            {isOverdue
              ? 'Overdue'
              : isDueToday
              ? 'Today'
              : format(parseISO(task.dueDate), 'dd MMM')}
          </div>
        )}
      </div>
    </div>
  );
}
