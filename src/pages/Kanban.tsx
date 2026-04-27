import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import type { Task, TaskStatus } from '../types';
import { STATUS_LABELS } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { TaskDrawer } from '../components/TaskDrawer';

const COLUMNS: { status: TaskStatus; color: string; dot: string; bg: string }[] = [
  { status: 'todo', color: 'border-slate-200', dot: '#94a3b8', bg: 'bg-slate-50' },
  { status: 'in_progress', color: 'border-[#00b4c8]/30', dot: '#00b4c8', bg: 'bg-sky-50/50' },
  { status: 'review', color: 'border-purple-200', dot: '#a855f7', bg: 'bg-purple-50/30' },
  { status: 'done', color: 'border-emerald-200', dot: '#10b981', bg: 'bg-emerald-50/30' },
];

export function Kanban() {
  const { tasks, moveTask } = useTaskStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDragging(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(status);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (dragging) moveTask(dragging, status);
    setDragging(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="p-6 h-[calc(100vh-3rem)] lg:h-screen flex flex-col">
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kanban Board</h1>
          <p className="text-sm text-slate-500 mt-0.5">Drag cards between columns to update status</p>
        </div>
        <button
          onClick={() => { setDefaultStatus('todo'); setModalOpen(true); }}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#0f1e3d] text-white text-sm font-medium rounded-xl hover:bg-[#1a3060] transition-colors shadow-sm"
        >
          <Plus size={15} />
          New Task
        </button>
      </div>

      <div className="flex gap-4 flex-1 overflow-x-auto pb-4 min-h-0">
        {COLUMNS.map(({ status, color, dot, bg }) => {
          const columnTasks = byStatus(status);
          const isOver = dragOver === status;

          return (
            <div
              key={status}
              className="flex flex-col flex-shrink-0 w-72"
              onDragOver={(e) => handleDragOver(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              onDragLeave={() => setDragOver(null)}
            >
              {/* Column header */}
              <div
                className={`rounded-xl border-2 px-4 py-3 mb-3 flex items-center justify-between transition-all ${
                  isOver ? 'border-[#00b4c8]/60 bg-[#00b4c8]/10' : `${color} bg-white`
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dot }} />
                  <span className="text-sm font-semibold text-slate-700">{STATUS_LABELS[status]}</span>
                  <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-medium">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => { setDefaultStatus(status); setModalOpen(true); }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div
                className={`flex-1 overflow-y-auto space-y-3 rounded-xl p-2 transition-all min-h-16 ${
                  isOver ? 'bg-[#00b4c8]/5 ring-2 ring-[#00b4c8]/20' : bg
                }`}
              >
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`transition-opacity cursor-grab active:cursor-grabbing ${dragging === task.id ? 'opacity-40 scale-95' : 'opacity-100'}`}
                  >
                    <TaskCard task={task} onClick={() => setSelectedTask(task)} />
                  </div>
                ))}

                {columnTasks.length === 0 && !isOver && (
                  <div
                    className="text-center py-8 text-slate-300 text-xs select-none border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors"
                    onClick={() => { setDefaultStatus(status); setModalOpen(true); }}
                  >
                    Drop here or click to add
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <TaskModal defaultStatus={defaultStatus} onClose={() => setModalOpen(false)} />
      )}
      {selectedTask && (
        <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
