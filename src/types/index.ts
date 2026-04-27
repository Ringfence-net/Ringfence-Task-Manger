export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory =
  | 'lead_generation'
  | 'client_outreach'
  | 'social_media'
  | 'content_marketing'
  | 'seo_analytics'
  | 'email_campaigns'
  | 'proposals_pitches'
  | 'client_management'
  | 'market_research'
  | 'partnerships'
  | 'brand_strategy'
  | 'paid_advertising';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignee: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  completedAt: string | null;
}

export interface FilterState {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: TaskCategory | 'all';
  assignee: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortDir: 'asc' | 'desc';
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  lead_generation: 'Lead Generation',
  client_outreach: 'Client Outreach',
  social_media: 'Social Media',
  content_marketing: 'Content Marketing',
  seo_analytics: 'SEO & Analytics',
  email_campaigns: 'Email Campaigns',
  proposals_pitches: 'Proposals & Pitches',
  client_management: 'Client Management',
  market_research: 'Market Research',
  partnerships: 'Partnerships',
  brand_strategy: 'Brand Strategy',
  paid_advertising: 'Paid Advertising',
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  lead_generation: '#6366f1',
  client_outreach: '#0ea5e9',
  social_media: '#ec4899',
  content_marketing: '#f59e0b',
  seo_analytics: '#10b981',
  email_campaigns: '#8b5cf6',
  proposals_pitches: '#f97316',
  client_management: '#06b6d4',
  market_research: '#84cc16',
  partnerships: '#14b8a6',
  brand_strategy: '#a855f7',
  paid_advertising: '#ef4444',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'In Review',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const TEAM_MEMBERS = [
  'Alex Morgan',
  'Jordan Lee',
  'Sam Rivera',
  'Casey Kim',
  'Taylor Brooks',
  'Morgan Chen',
];
