import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  isToday,
  isPast,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import type { Task, TaskPriority } from '../types';
import { TaskDrawer } from '../components/TaskDrawer';
import { TaskModal } from '../components/TaskModal';

const PRIORITY_DOT: Record<TaskPriority, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#94a3b8',
};

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function TaskPill({ task, onClick }: { task: Task; onClick: () => void }) {
  const overdue = task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 transition-opacity hover:opacity-80 ${
        task.status === 'done'
          ? 'bg-emerald-50 text-emerald-700 line-through opacity-60'
          : overdue
          ? 'bg-red-50 text-red-700'
          : 'bg-[#0f1e3d]/8 text-slate-700'
      }`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: PRIORITY_DOT[task.priority] }}
      />
      <span className="truncate">{task.title}</span>
    </button>
  );
}

export function Calendar() {
  const { tasks } = useTaskStore();
  const [current, setCurrent] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [_newTaskDate, setNewTaskDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const tasksWithDue = tasks.filter((t) => t.dueDate);
  const tasksByDate: Record<string, Task[]> = {};
  tasksWithDue.forEach((t) => {
    const key = t.dueDate as string;
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(t);
  });

  const days: Date[] = [];
  let cur = calStart;
  while (cur <= calEnd) {
    days.push(cur);
    cur = addDays(cur, 1);
  }

  const selectedDayTasks = selectedDay
    ? (tasksByDate[format(selectedDay, 'yyyy-MM-dd')] || [])
    : [];

  function handleDayClick(day: Date) {
    setSelectedDay(isSameDay(day, selectedDay || new Date(-1)) ? null : day);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Calendar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tasks by due date</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrent(new Date())}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrent(subMonths(current, 1))}
            className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-semibold text-slate-700 min-w-32 text-center">
            {format(current, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrent(addMonths(current, 1))}
            className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1e3d] text-white text-xs font-medium rounded-lg hover:bg-[#1a3060] transition-colors"
          >
            <Plus size={12} /> New Task
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Calendar grid */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {DAY_HEADERS.map((d) => (
                <div key={d} className="py-2.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, current);
                const todayDay = isToday(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const hasOverdue = dayTasks.some(
                  (t) => t.status !== 'done' && isPast(day) && !todayDay
                );

                return (
                  <div
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-20 border-b border-r border-slate-50 p-1.5 cursor-pointer transition-colors relative ${
                      !isCurrentMonth ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50'
                    } ${isSelected ? 'ring-2 ring-inset ring-[#00b4c8]/40 bg-sky-50/30' : ''}`}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                          todayDay
                            ? 'bg-[#0f1e3d] text-white'
                            : isCurrentMonth
                            ? 'text-slate-700'
                            : 'text-slate-300'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      {hasOverdue && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Task pills — show up to 2, then "+N" */}
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 2).map((task) => (
                        <TaskPill key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                      ))}
                      {dayTasks.length > 2 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedDay(day); }}
                          className="text-[10px] text-slate-400 hover:text-[#00b4c8] transition-colors px-1"
                        >
                          +{dayTasks.length - 2} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 px-1">
            <span className="text-[10px] text-slate-400 font-medium">Priority:</span>
            {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
              <div key={p} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_DOT[p] }} />
                <span className="text-[10px] text-slate-400 capitalize">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel — selected day detail */}
        {selectedDay && (
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{format(selectedDay, 'EEEE')}</p>
                  <p className="text-xs text-slate-400">{format(selectedDay, 'd MMMM yyyy')}</p>
                </div>
                <button
                  onClick={() => {
                    setNewTaskDate(format(selectedDay, 'yyyy-MM-dd'));
                    setModalOpen(true);
                  }}
                  className="p-1.5 bg-[#0f1e3d] text-white rounded-lg hover:bg-[#1a3060] transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              {selectedDayTasks.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400">No tasks due</p>
                  <button
                    onClick={() => {
                      setNewTaskDate(format(selectedDay, 'yyyy-MM-dd'));
                      setModalOpen(true);
                    }}
                    className="mt-2 text-xs text-[#00b4c8] hover:underline"
                  >
                    Add one →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayTasks.map((task) => {
                    const overdue = task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
                    return (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-colors hover:shadow-sm ${
                          task.status === 'done'
                            ? 'border-emerald-100 bg-emerald-50/50'
                            : overdue
                            ? 'border-red-100 bg-red-50/50'
                            : 'border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: PRIORITY_DOT[task.priority] }}
                          />
                          <div className="min-w-0">
                            <p className={`text-xs font-medium leading-snug ${
                              task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}>
                              {task.title}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{task.assignee.split(' ')[0]}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTask && <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />}
      {modalOpen && (
        <TaskModal
          onClose={() => { setModalOpen(false); setNewTaskDate(null); }}
        />
      )}
    </div>
  );
}
