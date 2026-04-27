import { useMemo } from 'react';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  PRIORITY_LABELS,
  TEAM_MEMBERS,
  STATUS_LABELS,
} from '../types';
import type { TaskCategory, TaskStatus } from '../types';

/* ── helpers ─────────────────────────────────────────── */
function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

/* ── sub-components ───────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
      {children}
    </h2>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

function HorizBar({
  label,
  value,
  max,
  color,
  count,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  count: number;
}) {
  const w = max > 0 ? pct(value, max) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-slate-600 w-36 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${w}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-6 text-right flex-shrink-0">{count}</span>
      <span className="text-[10px] text-slate-400 w-8 text-right flex-shrink-0">{w}%</span>
    </div>
  );
}

/* Activity heatmap — last 12 weeks */
function ActivityHeatmap({ completedDates }: { completedDates: string[] }) {
  const today = new Date();
  const startDay = startOfWeek(subDays(today, 83), { weekStartsOn: 1 }); // 12 weeks back

  const countByDay: Record<string, number> = {};
  completedDates.forEach((d) => {
    const key = d.slice(0, 10);
    countByDay[key] = (countByDay[key] || 0) + 1;
  });

  const weeks: Date[][] = [];
  let cur = startDay;
  while (cur <= today) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(addDays(cur, i));
    }
    weeks.push(week);
    cur = addDays(cur, 7);
  }

  const max = Math.max(1, ...Object.values(countByDay));

  function cellColor(count: number) {
    if (count === 0) return '#f1f5f9';
    const intensity = count / max;
    if (intensity < 0.25) return '#bae6fd';
    if (intensity < 0.5) return '#38bdf8';
    if (intensity < 0.75) return '#0ea5e9';
    return '#0369a1';
  }

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div>
      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1 pt-5">
          {DAYS.map((d, i) => (
            <div key={i} className="w-3 h-3 flex items-center justify-center text-[8px] text-slate-300">
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {wi % 4 === 0 && (
              <div className="text-[8px] text-slate-300 h-4 flex items-end">
                {format(week[0], 'MMM')}
              </div>
            )}
            {wi % 4 !== 0 && <div className="h-4" />}
            {week.map((day, di) => {
              const key = format(day, 'yyyy-MM-dd');
              const count = countByDay[key] || 0;
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-sm transition-all ${isToday ? 'ring-1 ring-[#00b4c8]' : ''}`}
                  style={{ backgroundColor: cellColor(count) }}
                  title={`${format(day, 'dd MMM')}: ${count} task${count !== 1 ? 's' : ''} completed`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-3 ml-4">
        <span className="text-[10px] text-slate-400 mr-1">Less</span>
        {[0, 0.2, 0.5, 0.8, 1].map((v, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: cellColor(v * max) }} />
        ))}
        <span className="text-[10px] text-slate-400 ml-1">More</span>
      </div>
    </div>
  );
}

/* Mini donut using conic-gradient */
function Donut({ segments }: { segments: { color: string; value: number }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div className="w-24 h-24 rounded-full bg-slate-100" />;

  let cumulative = 0;
  const stops = segments
    .filter((s) => s.value > 0)
    .map(({ color, value }) => {
      const start = (cumulative / total) * 360;
      cumulative += value;
      const end = (cumulative / total) * 360;
      return `${color} ${start}deg ${end}deg`;
    })
    .join(', ');

  return (
    <div
      className="w-24 h-24 rounded-full relative"
      style={{ background: `conic-gradient(${stops})` }}
    >
      <div className="absolute inset-2.5 bg-white rounded-full flex items-center justify-center">
        <span className="text-xs font-bold text-slate-700">{total}</span>
      </div>
    </div>
  );
}

/* ── main page ────────────────────────────────────────── */
export function Analytics() {
  const { tasks } = useTaskStore();

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const active = tasks.filter((t) => t.status !== 'done').length;
    const today = format(new Date(), 'yyyy-MM-dd');
    const overdue = tasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.status !== 'done'
    ).length;

    // Category counts
    const byCat: Record<string, number> = {};
    tasks.forEach((t) => { byCat[t.category] = (byCat[t.category] || 0) + 1; });

    // Priority counts
    const byPri: Record<string, number> = {};
    tasks.forEach((t) => { byPri[t.priority] = (byPri[t.priority] || 0) + 1; });

    // Status counts
    const byStat: Record<string, number> = {};
    tasks.forEach((t) => { byStat[t.status] = (byStat[t.status] || 0) + 1; });

    // Per-member
    const byMember = TEAM_MEMBERS.map((name) => {
      const mine = tasks.filter((t) => t.assignee === name);
      return {
        name,
        total: mine.length,
        done: mine.filter((t) => t.status === 'done').length,
        active: mine.filter((t) => t.status !== 'done').length,
        overdue: mine.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done').length,
      };
    });

    // Completion dates for heatmap
    const completedDates = tasks
      .filter((t) => t.completedAt)
      .map((t) => t.completedAt as string);

    // Due in next 7 days
    const upcoming7 = tasks.filter((t) => {
      if (!t.dueDate || t.status === 'done') return false;
      const diff = (new Date(t.dueDate).getTime() - Date.now()) / 86400000;
      return diff >= 0 && diff <= 7;
    }).length;

    // Average tasks per member
    const avgPerMember = total > 0 ? Math.round(total / TEAM_MEMBERS.length) : 0;

    return { total, done, active, overdue, byCat, byPri, byStat, byMember, completedDates, upcoming7, avgPerMember };
  }, [tasks]);

  const topCats = Object.entries(stats.byCat)
    .sort(([, a], [, b]) => b - a);

  const statusSegments = [
    { color: '#94a3b8', value: stats.byStat['todo'] || 0 },
    { color: '#00b4c8', value: stats.byStat['in_progress'] || 0 },
    { color: '#a855f7', value: stats.byStat['review'] || 0 },
    { color: '#10b981', value: stats.byStat['done'] || 0 },
  ];

  const prioritySegments = [
    { color: '#ef4444', value: stats.byPri['urgent'] || 0 },
    { color: '#f97316', value: stats.byPri['high'] || 0 },
    { color: '#f59e0b', value: stats.byPri['medium'] || 0 },
    { color: '#94a3b8', value: stats.byPri['low'] || 0 },
  ];

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Performance insights for Ringfence Consulting</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Total Tasks', value: stats.total, color: '#0f1e3d' },
          { label: 'Completed', value: stats.done, color: '#10b981' },
          { label: 'Active', value: stats.active, color: '#00b4c8' },
          { label: 'Overdue', value: stats.overdue, color: stats.overdue > 0 ? '#ef4444' : '#94a3b8' },
          { label: 'Due in 7 days', value: stats.upcoming7, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Completion rate hero */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionTitle>Overall Completion Rate</SectionTitle>
            <p className="text-4xl font-bold text-slate-800">
              {pct(stats.done, stats.total)}
              <span className="text-lg text-slate-400 font-normal">%</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">{stats.done} of {stats.total} tasks completed</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Avg tasks / member</p>
            <p className="text-2xl font-bold text-slate-700">{stats.avgPerMember}</p>
          </div>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct(stats.done, stats.total)}%`,
              background: 'linear-gradient(90deg, #0f1e3d 0%, #00b4c8 100%)',
            }}
          />
        </div>
        <div className="flex gap-5 mt-3 flex-wrap">
          {[
            { label: 'To Do', count: stats.byStat['todo'] || 0, color: '#94a3b8' },
            { label: 'In Progress', count: stats.byStat['in_progress'] || 0, color: '#00b4c8' },
            { label: 'In Review', count: stats.byStat['review'] || 0, color: '#a855f7' },
            { label: 'Done', count: stats.byStat['done'] || 0, color: '#10b981' },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-500">{label}: <strong className="text-slate-700">{count}</strong></span>
            </div>
          ))}
        </div>
      </Card>

      {/* Donuts + category bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Status donut */}
        <Card>
          <SectionTitle>By Status</SectionTitle>
          <div className="flex items-center gap-5">
            <Donut segments={statusSegments} />
            <div className="space-y-2 flex-1">
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusSegments[i].color }} />
                  <span className="text-xs text-slate-500 flex-1">{STATUS_LABELS[s]}</span>
                  <span className="text-xs font-semibold text-slate-700">{stats.byStat[s] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Priority donut */}
        <Card>
          <SectionTitle>By Priority</SectionTitle>
          <div className="flex items-center gap-5">
            <Donut segments={prioritySegments} />
            <div className="space-y-2 flex-1">
              {(['urgent', 'high', 'medium', 'low'] as const).map((p, i) => (
                <div key={p} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: prioritySegments[i].color }} />
                  <span className="text-xs text-slate-500 flex-1">{PRIORITY_LABELS[p]}</span>
                  <span className="text-xs font-semibold text-slate-700">{stats.byPri[p] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Summary callout */}
        <Card>
          <SectionTitle>Highlights</SectionTitle>
          <div className="space-y-3">
            {[
              {
                label: 'Most loaded member',
                value: stats.byMember.sort((a, b) => b.active - a.active)[0]?.name.split(' ')[0] || '—',
                color: '#0f1e3d',
              },
              {
                label: 'Highest category',
                value: CATEGORY_LABELS[topCats[0]?.[0] as TaskCategory] || '—',
                color: CATEGORY_COLORS[topCats[0]?.[0] as TaskCategory] || '#64748b',
              },
              {
                label: 'Overdue rate',
                value: `${pct(stats.overdue, stats.active || 1)}%`,
                color: stats.overdue > 0 ? '#ef4444' : '#10b981',
              },
              {
                label: 'Completion rate',
                value: `${pct(stats.done, stats.total)}%`,
                color: '#10b981',
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-sm font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Category bars */}
      <Card className="mb-6">
        <SectionTitle>Tasks by Category</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          {topCats.map(([cat, count]) => (
            <HorizBar
              key={cat}
              label={CATEGORY_LABELS[cat as TaskCategory]}
              value={count}
              max={stats.total}
              color={CATEGORY_COLORS[cat as TaskCategory]}
              count={count}
            />
          ))}
        </div>
      </Card>

      {/* Team performance table */}
      <Card className="mb-6">
        <SectionTitle>Team Performance</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Member</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Total</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Active</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Done</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Overdue</th>
                <th className="text-left py-2 pl-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Completion</th>
              </tr>
            </thead>
            <tbody>
              {stats.byMember
                .sort((a, b) => b.total - a.total)
                .map((m) => {
                  const ini = m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
                  const completionPct = pct(m.done, m.total);
                  return (
                    <tr key={m.name} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#0f1e3d]/10 flex items-center justify-center text-[10px] font-bold text-[#0f1e3d]">
                            {ini}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{m.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-sm text-slate-600">{m.total}</td>
                      <td className="py-3 text-right text-sm text-[#00b4c8] font-medium">{m.active}</td>
                      <td className="py-3 text-right text-sm text-emerald-600 font-medium">{m.done}</td>
                      <td className="py-3 text-right text-sm">
                        <span className={m.overdue > 0 ? 'text-red-600 font-medium' : 'text-slate-300'}>
                          {m.overdue > 0 ? m.overdue : '—'}
                        </span>
                      </td>
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-16">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${completionPct}%`,
                                background: completionPct >= 75 ? '#10b981' : completionPct >= 40 ? '#f59e0b' : '#ef4444',
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 w-8">{completionPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Activity heatmap */}
      <Card>
        <SectionTitle>Completion Activity (last 12 weeks)</SectionTitle>
        <div className="overflow-x-auto">
          <ActivityHeatmap completedDates={stats.completedDates} />
        </div>
        {stats.completedDates.length === 0 && (
          <p className="text-xs text-slate-400 text-center mt-4">Complete tasks to see activity here</p>
        )}
      </Card>
    </div>
  );
}
