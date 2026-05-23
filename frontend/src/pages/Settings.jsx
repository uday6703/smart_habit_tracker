import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Settings as SettingsIcon, Bell, Moon, Clock, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [reminderTime, setReminderTime] = useState('20:00');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [theme, setTheme] = useState('DARK');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [seeding, setSeeding] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      const { dailyReminderTime, enableBrowserNotifications, theme: activeTheme } = response.data;
      setReminderTime(dailyReminderTime || '20:00');
      setEnableNotifications(enableBrowserNotifications !== undefined ? enableBrowserNotifications : true);
      setTheme(activeTheme || 'DARK');
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Could not retrieve user settings config.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        dailyReminderTime: reminderTime,
        enableBrowserNotifications: enableNotifications,
        theme: theme
      };

      await settingsAPI.update(payload);
      setSuccess('Configuration settings saved successfully!');
      
      // If notification enabled, test trigger request
      if (enableNotifications && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        } else if (Notification.permission === 'granted') {
          new Notification('Smart Habit Tracker', {
            body: 'Browser push notifications are active!',
            icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>'
          });
        }
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to write settings updates.');
    }
  };

  const handleSeedData = async () => {
    setError('');
    setSuccess('');
    setSeeding(true);
    try {
      await settingsAPI.seed();
      setSuccess('Demo data seeded successfully! Redirecting to Dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Error seeding data:', err);
      setError(err.response?.data?.message || 'Failed to seed demo data.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-xs text-slate-500 font-semibold">Retrieving system configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0F172A] overflow-y-auto">
      <Navbar title="Settings" />
      
      <main className="flex-1 p-8 max-w-2xl w-full mx-auto space-y-8">
        
        {/* Header Greeting */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Configuration</h1>
          <p className="text-slate-400 text-sm mt-1">Configure theme settings, browser notifications schedules, and reminder logs.</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Form panel */}
        <form onSubmit={handleSave} className="glass-card rounded-2xl border border-[#334155]/60 p-6 space-y-6">
          
          {/* Daily Reminder Time */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 mt-1">
              <Clock size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-200">Daily Reminder Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">Choose a default time to trigger daily check-in alerts</p>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="mt-3.5 bg-slate-900 border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <hr className="border-[#334155]/50" />

          {/* Browser Notifications Toggle */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 mt-1">
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Push Notifications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Toggle browser desktop notifications and reminders</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableNotifications}
                  onChange={(e) => setEnableNotifications(e.target.checked)}
                  className="h-4.5 w-4.5 text-indigo-600 border-[#334155] rounded focus:ring-indigo-500 bg-slate-900"
                />
              </div>
              <div className="mt-3.5 p-3.5 bg-slate-900/60 rounded-xl border border-[#334155]/30">
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                  <strong>How push works:</strong> Smart Habit Tracker runs fully local on browser alert APIs. 
                  When active, alerts are triggered when the app is open in background without using external cloud servers.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-[#334155]/50" />

          {/* Active theme settings */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 mt-1">
              <Moon size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-200">Appearance Mode</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">Select color layout config for the UI application</p>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                {['LIGHT', 'DARK'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTheme(m)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      theme === m 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                        : 'border-slate-800 bg-transparent text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    {m.charAt(0) + m.slice(1).toLowerCase()} Mode
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-[#334155]/40">
            <button
              type="button"
              onClick={handleSeedData}
              disabled={seeding}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold shadow-lg hover:bg-amber-500/20 transition-all ${seeding ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {seeding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-400"></div>
                  <span>Seeding Data...</span>
                </>
              ) : (
                <>
                  <span>Seed Demo Data</span>
                </>
              )}
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-lg hover:shadow-indigo-500/20 transition-all glow-btn"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </main>
    </div>
  );
};

export default Settings;
