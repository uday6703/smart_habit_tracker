import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BarChart3, 
  Lightbulb, 
  Settings as SettingsIcon, 
  LogOut, 
  Activity,
  X
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, sidebarOpen, setSidebarOpen } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Habits', path: '/habits', icon: CheckSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Suggestions', path: '/suggestions', icon: Lightbulb },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1E293B] border-r border-[#334155] flex flex-col h-screen transition-transform duration-300 md:static md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#334155] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Activity size={22} className="animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white leading-tight tracking-tight">SmartHabit</h1>
              <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Resume Project</p>
            </div>
          </div>
          
          {/* Close button on mobile */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-400 border-l-4 border-indigo-500 pl-3'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="p-4 border-t border-[#334155] bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate">{user?.username}</h4>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSidebarOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all duration-200"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
