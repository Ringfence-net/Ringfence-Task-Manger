import { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import { TEAM_MEMBERS, CATEGORY_LABELS, CATEGORY_COLORS } from '../types';
import type { Task } from '../types';
import { TaskDrawer } from '../components/TaskDrawer';
import { PriorityBadge, CategoryBadge } from '../components/Badge';

const avatarColors: Record<string, string> = {
  AM: '#6366f1', JL: '#0ea5e9', SR: '#10b981',
  CK: '#f59e0b', TB: '#ec4899', MC: '#8b5cf6',
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function WorkloadBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
        <span>{done} done</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0f1e3d, #00b4c8)' }}
        />
      </div>
    </div>
  );
}

export function Team() {
  const { tasks } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(TEAM_MEMBERS[0]);

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Team Workload</h1>
        <p className="text-sm text-slate-500 mt-0.5">Task distribution and workload across the team</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {TEAM_MEMBERS.map((member) => {
          const memberTasks = tasks.filter((t) => t.assignee === member);
          const active = memberTasks.filter((t) => t.status !== 'done').length;
          const done = memberTasks.filter((t) => t.status === 'done').length;
          const overdue = memberTasks.filter(
            (t) => t.dueDate && t.status !== 'done' && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))
          ).length;
          const ini = initials(member);
          const color = avatarColors[ini] || '#64748b';

          return (
            <button
              key={member}
              onClick={() => setExpandedMember(expandedMember === member ? null : member)}
              className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                expandedMember === member
                  ? 'border-[#00b4c8]/50 shadow-md ring-2 ring-[#00b4c8]/20'
                  : 'border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {ini}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{member.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-400">{memberTasks.length} tasks</p>
                </div>
              </div>
              <WorkloadBar done={done} total={memberTasks.length} />
              {overdue > 0 && (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-red-500">
                  <AlertTriangle size={10} />
                  {overdue} overdue
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                <span className="text-blue-500 font-medium">{active}</span> active
                <span>·</span>
                <span className="text-emerald-500 font-medium">{done}</span> done
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded member detail */}
      {expandedMember && (() => {
        const memberTasks = tasks.filter((t) => t.assignee === expandedMember);
        const activeTasks = memberTasks.filter((t) => t.status !== 'done');
        const doneTasks = memberTasks.filter((t) => t.status === 'done');
        const overdueTasks = activeTasks.filter(
          (t) => t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))
        );
        const ini = initials(expandedMember);
        const color = avatarColors[ini] || '#64748b';

        // Category breakdown for this member
        const catCounts: Record<string, number> = {};
        memberTasks.forEach((t) => {
          catCounts[t.category] = (catCounts[t.category] || 0) + 1;
        });
        const topCats = Object.entries(catCounts).sort(([, a], [, b]) => b - a).slice(0, 4);

        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Member header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {ini}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{expandedMember}</h2>
                  <p className="text-sm text-slate-500">{memberTasks.length} total tasks</p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-500">{activeTasks.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-500">{doneTasks.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Done</p>
                </div>
                {overdueTasks.length > 0 && (
                  <div>
                    <p className="text-2xl font-bold text-red-500">{overdueTasks.length}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Overdue</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              {/* Active tasks */}
              <div className="lg:col-span-2 p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Active Tasks</p>
                {activeTasks.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">All caught up! 🎉</p>
                ) : (
                  <div className="space-y-2">
                    {activeTasks
                      .sort((a, b) => {
                        if (!a.dueDate && !b.dueDate) return 0;
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return a.dueDate.localeCompare(b.dueDate);
                      })
                      .map((task) => {
                        const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
                        const isDueToday = task.dueDate && isToday(parseISO(task.dueDate));
                        return (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border ${
                              isOverdue
                                ? 'border-red-100 bg-red-50/30'
                                : isDueToday
                                ? 'border-amber-100 bg-amber-50/30'
                                : 'border-slate-100'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <PriorityBadge priority={task.priority} />
                                <CategoryBadge category={task.category} />
                              </div>
                            </div>
                            {task.dueDate && (
                              <span className={`text-[11px] font-medium flex-shrink-0 ${
                                isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-600' : 'text-slate-400'
                              }`}>
                                {format(parseISO(task.dueDate), 'dd MMM')}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Right panel: categories + recent done */}
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Top Categories</p>
                  {topCats.length === 0 ? (
                    <p className="text-xs text-slate-400">No tasks yet</p>
                  ) : (
                    <div className="space-y-2">
                      {topCats.map(([cat, count]) => (
                        <div key={cat} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] }}
                          />
                          <span className="text-xs text-slate-600 flex-1 truncate">
                            {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                          </span>
                          <span className="text-xs font-bold text-slate-700">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Recently Done</p>
                  {doneTasks.length === 0 ? (
                    <p className="text-xs text-slate-400">None yet</p>
                  ) : (
                    <div className="space-y-2">
                      {doneTasks
                        .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
                        .slice(0, 4)
                        .map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 rounded-lg p-1.5 transition-colors"
                          >
                            <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-600 line-clamp-1">{task.title}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedTask && (
        <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
