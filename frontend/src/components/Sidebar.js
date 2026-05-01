import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';
import {
  LayoutDashboard,
  FolderOpen,
  CalendarClock,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { useState } from 'react';

const participantNav = [
  { label: 'My Workspace', path: '/clarity/app', icon: LayoutDashboard },
  { label: 'Resources', path: '/clarity/app/resources', icon: FolderOpen },
  { label: 'Schedule', path: '/clarity/app/schedule', icon: CalendarClock },
  { label: 'Community', path: '/clarity/app/community', icon: MessageSquare },
  { label: 'Settings', path: '/clarity/app/settings', icon: Settings },
];

const adminNav = [
  { label: 'Dashboard', path: '/clarity/app', icon: LayoutDashboard },
  { label: 'Participants', path: '/clarity/app/admin/participants', icon: Users },
  { label: 'Resources', path: '/clarity/app/admin/resources', icon: FolderOpen },
  { label: 'Schedule', path: '/clarity/app/admin/schedule', icon: CalendarClock },
  { label: 'Community', path: '/clarity/app/community', icon: MessageSquare },
  { label: 'Settings', path: '/clarity/app/settings', icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNav : participantNav;

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/clarity/app/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[#0B7A6F]" data-testid="sidebar-logo">
                CLARITY
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">
                by Performance Solutions by Design, Inc.
              </p>
            </div>
          )}
          {collapsed && (
            <span className="text-lg font-bold text-[#0B7A6F]">C</span>
          )}
        </div>
      </div>

      {/* Back to website */}
      <div className="px-3 pt-3">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          data-testid="back-to-site"
        >
          <ArrowLeft size={14} />
          {!collapsed && <span>Back to Website</span>}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${active
                  ? 'bg-[#0B7A6F]/[0.08] text-[#0B7A6F]'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              <Icon size={18} strokeWidth={1.5} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <UserAvatar user={user} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                {isAdmin && <Shield size={10} className="text-[#0B7A6F]" />}
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          data-testid="logout-btn"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} strokeWidth={1.5} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center p-2 m-3 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        data-testid="sidebar-collapse-btn"
      >
        <ChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-slate-200 rounded-lg p-2 shadow-sm"
        data-testid="mobile-menu-btn"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-slate-100 z-50 w-64 transform transition-transform duration-300 lg:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      <aside className={`hidden lg:flex flex-col h-screen bg-white border-r border-slate-100 sticky top-0 transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-64'}`} data-testid="sidebar">
        {sidebarContent}
      </aside>
    </>
  );
}
