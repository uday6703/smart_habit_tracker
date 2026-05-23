import React, { useState, useEffect, useRef } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Trash2, X, AlertTriangle, ShieldCheck, Flame, Info, Sun, Moon, Menu } from 'lucide-react';

const Navbar = ({ title }) => {
  const { setSidebarOpen } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      setIsDarkMode(false);
      document.body.classList.add('light-mode');
    } else {
      setIsDarkMode(true);
      document.body.classList.remove('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data);
      const unreads = response.data.filter(n => !n.isRead);
      setUnreadCount(unreads.length);
      
      // Proactively check settings and dispatch browser notification if enabled
      if (unreads.length > 0) {
        triggerBrowserPushNotification(unreads[0]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerBrowserPushNotification = (notif) => {
    // Check if browser notifications are allowed and settings matches
    if ('Notification' in window && Notification.permission === 'granted') {
      const shownKey = `notif_shown_${notif.id}`;
      if (!localStorage.getItem(shownKey)) {
        new Notification(notif.title, {
          body: notif.message,
          icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>'
        });
        localStorage.setItem(shownKey, 'true');
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'STREAK_ALERT':
        return <Flame className="text-amber-500" size={16} />;
      case 'SYSTEM':
        return <ShieldCheck className="text-emerald-500" size={16} />;
      case 'WEEKLY_SUMMARY':
        return <Info className="text-indigo-400" size={16} />;
      default:
        return <Bell className="text-slate-400" size={16} />;
    }
  };

  return (
    <header className="h-16 border-b border-[#334155] bg-[#1E293B]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-30 sticky top-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-[#334155] cursor-pointer"
          title="Open Navigation Menu"
        >
          <Menu size={16} />
        </button>
        <h2 className="text-base md:text-xl font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-350 hover:text-white hover:bg-slate-700 transition-all border border-[#334155] flex items-center justify-center cursor-pointer"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-[#334155]"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-[#1E293B]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute right-0 top-14 w-80 glass-card rounded-2xl shadow-xl border border-[#334155] overflow-hidden z-50">
            <div className="p-4 border-b border-[#334155] flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Check size={12} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#334155]/50">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Bell size={24} className="opacity-30" />
                  <p>All caught up! No notifications.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 flex gap-3 transition-colors ${
                      notif.isRead ? 'bg-transparent' : 'bg-indigo-500/5'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 border border-[#334155] h-fit">
                      {getNotifIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className={`text-xs font-bold text-slate-200 truncate ${!notif.isRead && 'text-white'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[9px] text-slate-500 whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                      
                      {/* Actions */}
                      <div className="flex justify-end gap-3 mt-2">
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-[10px] text-slate-500 hover:text-red-400 font-semibold flex items-center gap-0.5"
                        >
                          <Trash2 size={10} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
