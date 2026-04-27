import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import type { Task, TaskStatus } from '../types';
import { STATUS_LABELS } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';

const COLUMNS: { status: TaskStatus; color: string; dot: string }[] = [
  { status: 'todo', color: 'border-slate-200', dot: '#94a3b8' },
  { status: 'in_progress', color: 'border-[#00b4c8]/30', dot: '#00b4c8' },
  { status: 'review', color: 'border-purple-200', dot: '#a855f7' },
  { status: 'done', color: 'border-emerald-200', dot: '#10b981' },
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
    if (dragging) {
      moveTask(dragging, status);
    }
    setDragging(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kanban Board</h1>
          <p className="text-sm text-slate-500 mt-0.5">Drag cards between columns to update status</p>
        </div>
        <button
          onClick={() => { setDefaultStatus('todo'); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0f1e3d] text-white text-sm font-medium rounded-xl hover:bg-[#1a3060] transition-colors shadow-sm"
        >
          <Plus size={15} />
          New Task
        </button>
      </div>

      {/* Columns */}
      <div className="flex gap-4 flex-1 overflow-x-auto pb-4 min-h-0">
        {COLUMNS.map(({ status, color, dot }) => {
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
                className={`bg-white rounded-xl border-2 px-4 py-3 mb-3 flex items-center justify-between transition-colors ${
                  isOver ? 'border-[#00b4c8]/50 bg-[#00b4c8]/5' : color
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dot }} />
                  <span className="text-sm font-semibold text-slate-700">
                    {STATUS_LABELS[status]}
                  </span>
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

              {/* Drop zone */}
              <div
                className={`flex-1 overflow-y-auto space-y-3 rounded-xl p-2 transition-colors min-h-16 ${
                  isOver ? 'bg-[#00b4c8]/5 ring-2 ring-[#00b4c8]/20' : ''
                }`}
              >
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`transition-opacity ${dragging === task.id ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => setSelectedTask(task)}
                    />
                  </div>
                ))}

                {columnTasks.length === 0 && !isOver && (
                  <div className="text-center py-8 text-slate-300 text-xs select-none">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {modalOpen && (
        <TaskModal
          defaultStatus={defaultStatus}
          onClose={() => setModalOpen(false)}
        />
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
