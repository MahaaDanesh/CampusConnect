import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  Users2,
  FileWarning,
  Search,
  BookOpen,
  UserCircle,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import NotificationBell from '../components/NotificationBell.jsx';
import Avatar from '../components/Avatar.jsx';
import Badge from '../components/Badge.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'faculty', 'admin'] },
  { to: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['student', 'faculty', 'admin'] },
  { to: '/events', label: 'Events', icon: CalendarDays, roles: ['student', 'faculty', 'admin'] },
  { to: '/clubs', label: 'Clubs', icon: Users2, roles: ['student', 'faculty', 'admin'] },
  { to: '/complaints', label: 'Complaints', icon: FileWarning, roles: ['student', 'faculty', 'admin'] },
  { to: '/lost-found', label: 'Lost & Found', icon: Search, roles: ['student', 'faculty', 'admin'] },
  { to: '/notes', label: 'Notes & Resources', icon: BookOpen, roles: ['student', 'faculty', 'admin'] },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin'] },
  { to: '/admin/users', label: 'Manage Users', icon: Users, roles: ['admin'] },
  { to: '/profile', label: 'Profile', icon: UserCircle, roles: ['student', 'faculty', 'admin'] },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-base font-bold leading-tight text-ink-900 dark:text-white">CampusConnect</p>
          <p className="text-[11px] text-ink-400">College Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-100 p-3 dark:border-ink-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-500 hover:bg-red-50 hover:text-red-600 dark:text-ink-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ink-50 dark:bg-ink-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900 lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-ink-900 animate-fadeIn">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-100 bg-white/80 px-4 py-3 backdrop-blur dark:border-ink-800 dark:bg-ink-900/80 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <NotificationBell />

          <NavLink to="/profile" className="flex items-center gap-2.5 rounded-lg py-1 pl-1.5 pr-3 hover:bg-ink-100 dark:hover:bg-ink-800">
            <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-ink-800 dark:text-ink-100">{user?.name}</p>
              <Badge tone={user?.role} className="mt-0.5 !py-0 !px-1.5 text-[10px]">
                {user?.role}
              </Badge>
            </div>
          </NavLink>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl page-fade">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
