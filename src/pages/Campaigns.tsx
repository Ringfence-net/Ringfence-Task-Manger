import { useState } from 'react';
import { Plus, Share2, BarChart2, Mail, Search as SearchIcon, Megaphone } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { TaskModal } from '../components/TaskModal';
import { TaskCard } from '../components/TaskCard';
import type { Task } from '../types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../types';

const MARKETING_CATEGORIES = [
  'social_media',
  'content_marketing',
  'seo_analytics',
  'email_campaigns',
  'paid_advertising',
  'brand_strategy',
  'market_research',
] as const;

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  social_media: Share2,
  content_marketing: Megaphone,
  seo_analytics: SearchIcon,
  email_campaigns: Mail,
  paid_advertising: BarChart2,
  brand_strategy: Megaphone,
  market_research: BarChart2,
};

export function Campaigns() {
  const { tasks } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const marketingTasks = tasks.filter((t) =>
    MARKETING_CATEGORIES.includes(t.category as typeof MARKETING_CATEGORIES[number])
  );

  const totalActive = marketingTasks.filter((t) => t.status !== 'done').length;
  const totalDone = marketingTasks.filter((t) => t.status === 'done').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalActive} active · {totalDone} completed
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0f1e3d] text-white text-sm font-medium rounded-xl hover:bg-[#1a3060] transition-colors shadow-sm"
        >
          <Plus size={15} />
          New Campaign Task
        </button>
      </div>

      <div className="space-y-6">
        {MARKETING_CATEGORIES.map((cat) => {
          const catTasks = marketingTasks.filter((t) => t.category === cat);
          if (catTasks.length === 0) return null;
          const Icon = CATEGORY_ICONS[cat] || Megaphone;
          const color = CATEGORY_COLORS[cat];

          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: color + '20' }}
                >
                  <Icon size={14} style={{ color }} />
                </div>
                <h2 className="text-sm font-semibold text-slate-700">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                  {catTasks.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {catTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                ))}
              </div>
            </div>
          );
        })}

        {marketingTasks.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">No campaign tasks yet.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 text-[#00b4c8] text-sm hover:underline"
            >
              Create your first campaign task →
            </button>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
      {modalOpen && (
        <TaskModal onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
