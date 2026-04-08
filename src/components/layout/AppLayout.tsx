import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/authContext';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import { LogOut, User, Menu, Sun, Moon } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar with mobile toggle */}
      <div className={`fixed inset-y-0 left-0 z-50 transform md:translate-x-0 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[240px]'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 mr-2 text-foreground/70 hover:text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-colors border border-border"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {user ? (
                <>
                  {/* User Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-teal to-deep-teal flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm text-foreground/80 font-medium hidden sm:inline">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-teal/15 text-primary-teal font-semibold hidden sm:inline">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 bg-surface hover:bg-red-500/10 hover:text-red-500 text-foreground/70 rounded-lg transition text-sm border border-border hover:border-red-500/30"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/auth/login')}
                  className="flex items-center gap-2 px-6 py-2 btn-primary hover:scale-105 transition-transform text-sm font-bold shadow-lg"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
