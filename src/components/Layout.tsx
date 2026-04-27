import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Search, Plus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TaskModal } from './TaskModal';
import { CommandPalette } from './CommandPalette';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

      // Cmd/Ctrl+K → command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }

      if (isInput) return;

      // N → new task
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setNewTaskOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — always offset on lg */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#0f1e3d]">Ringfence</span>
          </div>
          <button
            onClick={() => setNewTaskOpen(true)}
            className="p-1.5 bg-[#0f1e3d] text-white rounded-lg hover:bg-[#1a3060]"
          >
            <Plus size={16} />
          </button>
        </header>

        {/* Desktop top bar hint */}
        <div className="hidden lg:flex items-center justify-end px-6 py-2 border-b border-slate-100 bg-white/60 backdrop-blur-sm">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <Search size={12} />
            Search or jump to...
            <kbd className="ml-1 px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">⌘K</kbd>
          </button>
        </div>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Global modals */}
      {newTaskOpen && <TaskModal onClose={() => setNewTaskOpen(false)} />}
      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onNewTask={() => setNewTaskOpen(true)}
        />
      )}
    </div>
  );
}
