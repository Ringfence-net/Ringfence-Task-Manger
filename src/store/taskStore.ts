import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskStatus, FilterState } from '../types';
import { PRIORITY_ORDER } from '../types';
import { format } from 'date-fns';

interface TaskStore {
  tasks: Task[];
  filter: FilterState;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  setFilter: (filter: Partial<FilterState>) => void;
  resetFilter: () => void;
  getFilteredTasks: () => Task[];
  getStats: () => {
    total: number;
    todo: number;
    in_progress: number;
    review: number;
    done: number;
    overdue: number;
    dueToday: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    completionRate: number;
  };
}

const defaultFilter: FilterState = {
  search: '',
  status: 'all',
  priority: 'all',
  category: 'all',
  assignee: '',
  sortBy: 'dueDate',
  sortDir: 'asc',
};

const today = format(new Date(), 'yyyy-MM-dd');

const seedTasks: Task[] = [
  {
    id: uuidv4(),
    title: 'Launch Q2 LinkedIn Campaign',
    description: 'Create and schedule a series of LinkedIn posts targeting mid-market B2B clients in fintech and legal sectors.',
    status: 'in_progress',
    priority: 'high',
    category: 'social_media',
    assignee: 'Alex Morgan',
    dueDate: format(new Date(Date.now() + 3 * 86400000), 'yyyy-MM-dd'),
    tags: ['LinkedIn', 'B2B', 'Q2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uuidv4(),
    title: 'Prepare Proposal for Vertex Capital',
    description: 'Draft a tailored digital strategy proposal including SEO, content and paid media roadmap for Vertex Capital.',
    status: 'todo',
    priority: 'urgent',
    category: 'proposals_pitches',
    assignee: 'Jordan Lee',
    dueDate: format(new Date(Date.now() + 1 * 86400000), 'yyyy-MM-dd'),
    tags: ['Vertex', 'Proposal'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uuidv4(),
    title: 'Website SEO Audit – Ringfence.net',
    description: 'Run full technical SEO audit using Screaming Frog and Ahrefs, document findings and prioritise fixes.',
    status: 'review',
    priority: 'medium',
    category: 'seo_analytics',
    assignee: 'Sam Rivera',
    dueDate: today,
    tags: ['SEO', 'Audit'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uuidv4(),
    title: 'Monthly Email Newsletter – May Edition',
    description: 'Write, design and schedule the May client newsletter covering industry insights and Ringfence service updates.',
    status: 'todo',
    priority: 'medium',
    category: 'email_campaigns',
    assignee: 'Casey Kim',
    dueDate: format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd'),
    tags: ['Newsletter', 'Email'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uuidv4(),
    title: 'Identify 20 New Enterprise Leads',
    description: 'Research and qualify 20 enterprise prospects in the professional services space using LinkedIn Sales Navigator.',
    status: 'in_progress',
    priority: 'high',
    category: 'lead_generation',
    assignee: 'Taylor Brooks',
    dueDate: format(new Date(Date.now() + 5 * 86400000), 'yyyy-MM-dd'),
    tags: ['Leads', 'Enterprise'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uuidv4(),
    title: 'Content Calendar – June',
    description: 'Plan and populate the content calendar for June across all channels: blog, social, email and video.',
    status: 'todo',
    priority: 'low',
    category: 'content_marketing',
    assignee: 'Morgan Chen',
    dueDate: format(new Date(Date.now() + 14 * 86400000), 'yyyy-MM-dd'),
    tags: ['Content', 'Planning'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uuidv4(),
    title: 'Follow-up: Meridian Group Discovery Call',
    description: 'Send follow-up email with tailored case studies and schedule next steps with Meridian Group decision-makers.',
    status: 'done',
    priority: 'high',
    category: 'client_outreach',
    assignee: 'Alex Morgan',
    dueDate: format(new Date(Date.now() - 2 * 86400000), 'yyyy-MM-dd'),
    tags: ['Meridian', 'Follow-up'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Google Ads Campaign Optimisation',
    description: 'Review and optimise PPC campaigns for three client accounts – adjust bids, negative keywords and ad copy.',
    status: 'in_progress',
    priority: 'high',
    category: 'paid_advertising',
    assignee: 'Sam Rivera',
    dueDate: format(new Date(Date.now() + 2 * 86400000), 'yyyy-MM-dd'),
    tags: ['Google Ads', 'PPC'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uuidv4(),
    title: 'Competitor Landscape Report – Q2',
    description: 'Analyse top 5 competitors across digital presence, messaging, pricing and positioning. Present to leadership.',
    status: 'todo',
    priority: 'medium',
    category: 'market_research',
    assignee: 'Jordan Lee',
    dueDate: format(new Date(Date.now() + 10 * 86400000), 'yyyy-MM-dd'),
    tags: ['Research', 'Competitive'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uuidv4(),
    title: 'Renew Partnership with DataPulse Agency',
    description: 'Review partnership terms with DataPulse, negotiate updated referral rates and sign new 12-month agreement.',
    status: 'review',
    priority: 'medium',
    category: 'partnerships',
    assignee: 'Taylor Brooks',
    dueDate: format(new Date(Date.now() + 6 * 86400000), 'yyyy-MM-dd'),
    tags: ['Partnership', 'DataPulse'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uuidv4(),
    title: 'Brand Refresh – Visual Identity Update',
    description: 'Coordinate with design team on updated brand guidelines including colour palette, typography and logo usage.',
    status: 'todo',
    priority: 'low',
    category: 'brand_strategy',
    assignee: 'Casey Kim',
    dueDate: format(new Date(Date.now() + 21 * 86400000), 'yyyy-MM-dd'),
    tags: ['Branding', 'Design'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uuidv4(),
    title: 'Quarterly Review – NovaTech Account',
    description: 'Prepare and present Q1 performance report for NovaTech. Include KPI dashboard, wins and next quarter roadmap.',
    status: 'done',
    priority: 'high',
    category: 'client_management',
    assignee: 'Morgan Chen',
    dueDate: format(new Date(Date.now() - 1 * 86400000), 'yyyy-MM-dd'),
    tags: ['NovaTech', 'QBR'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
];

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: seedTasks,
      filter: defaultFilter,

      addTask: (task) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...task,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          completedAt: task.status === 'done' ? now : null,
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== id) return t;
            const now = new Date().toISOString();
            return {
              ...t,
              ...updates,
              updatedAt: now,
              completedAt:
                updates.status === 'done' && t.status !== 'done'
                  ? now
                  : updates.status !== 'done' && updates.status !== undefined
                  ? null
                  : t.completedAt,
            };
          }),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      moveTask: (id, status) => {
        get().updateTask(id, { status });
      },

      setFilter: (filter) => {
        set((state) => ({ filter: { ...state.filter, ...filter } }));
      },

      resetFilter: () => {
        set({ filter: defaultFilter });
      },

      getFilteredTasks: () => {
        const { tasks, filter } = get();
        let result = [...tasks];

        if (filter.search) {
          const q = filter.search.toLowerCase();
          result = result.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q) ||
              t.assignee.toLowerCase().includes(q) ||
              t.tags.some((tag) => tag.toLowerCase().includes(q))
          );
        }
        if (filter.status !== 'all') result = result.filter((t) => t.status === filter.status);
        if (filter.priority !== 'all') result = result.filter((t) => t.priority === filter.priority);
        if (filter.category !== 'all') result = result.filter((t) => t.category === filter.category);
        if (filter.assignee) result = result.filter((t) => t.assignee === filter.assignee);

        result.sort((a, b) => {
          let cmp = 0;
          if (filter.sortBy === 'priority') {
            cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          } else if (filter.sortBy === 'dueDate') {
            if (!a.dueDate && !b.dueDate) cmp = 0;
            else if (!a.dueDate) cmp = 1;
            else if (!b.dueDate) cmp = -1;
            else cmp = a.dueDate.localeCompare(b.dueDate);
          } else if (filter.sortBy === 'createdAt') {
            cmp = a.createdAt.localeCompare(b.createdAt);
          } else if (filter.sortBy === 'title') {
            cmp = a.title.localeCompare(b.title);
          }
          return filter.sortDir === 'asc' ? cmp : -cmp;
        });

        return result;
      },

      getStats: () => {
        const { tasks } = get();
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const byCategory: Record<string, number> = {};
        const byPriority: Record<string, number> = {};

        tasks.forEach((t) => {
          byCategory[t.category] = (byCategory[t.category] || 0) + 1;
          byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
        });

        const done = tasks.filter((t) => t.status === 'done').length;

        return {
          total: tasks.length,
          todo: tasks.filter((t) => t.status === 'todo').length,
          in_progress: tasks.filter((t) => t.status === 'in_progress').length,
          review: tasks.filter((t) => t.status === 'review').length,
          done,
          overdue: tasks.filter(
            (t) => t.dueDate && t.dueDate < todayStr && t.status !== 'done'
          ).length,
          dueToday: tasks.filter(
            (t) => t.dueDate === todayStr && t.status !== 'done'
          ).length,
          byCategory,
          byPriority,
          completionRate: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0,
        };
      },
    }),
    { name: 'ringfence-tasks' }
  )
);
