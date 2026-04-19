import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authContext';
import { Logo } from '../ui/Logo';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  ClipboardList,
  FileText
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isInstructor = user?.role === 'INSTRUCTOR';
  const isAdmin = user?.role === 'ADMIN';

  const navItems = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/courses', label: 'Explore Courses', icon: BookOpen },
    // For instructors, "My Learning" becomes "My Courses" (their created courses)
    ...(isInstructor || isAdmin
      ? [{ path: '/instructor', label: 'My Courses', icon: GraduationCap }]
      : [
          { path: '/my-courses', label: 'My Learning', icon: GraduationCap },
          { path: '/my-submissions', label: 'My Submissions', icon: FileText },
        ]),
    { path: '/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/discussions', label: 'Discussions', icon: MessageSquare },
    ...(isInstructor || isAdmin
      ? [{ path: '/instructor/submissions', label: 'All Submissions', icon: ClipboardList }]
      : []),
  ] : [
    { path: '/courses', label: 'Explore Courses', icon: BookOpen },
    { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`h-full bg-surface border-r border-border z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border flex-shrink-0">
        <Logo 
          showText={!collapsed} 
          size="sm" 
          className="min-w-0" 
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                active
                  ? 'bg-primary-teal/10 text-primary-teal'
                  : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-teal' : 'text-foreground/40 group-hover:text-foreground/70'}`} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-teal" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 pb-6 border-t border-border flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
