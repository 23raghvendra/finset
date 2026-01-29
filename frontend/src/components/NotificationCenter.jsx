import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Settings as SettingsIcon } from 'lucide-react';
import notificationService from '../services/notificationService';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(notificationService.getSettings());

  useEffect(() => {
    loadNotifications();
  }, [isOpen]);

  const loadNotifications = () => {
    setNotifications(notificationService.getNotifications());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleClearAll = () => {
    notificationService.clearAll();
    loadNotifications();
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      billReminder: '📅',
      budgetAlert: '💰',
      budgetExceeded: '🚨',
      savingsMilestone: '🎉',
      unusualActivity: '⚠️',
      weeklyReport: '📊',
      achievement: '🏆',
      levelUp: '⬆️',
      streak: '🔥',
      challengeComplete: '✅'
    };
    return icons[type] || 'ℹ️';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-200"
        style={{ 
          borderColor: 'var(--border)', 
          color: 'var(--text-secondary)',
          background: 'transparent'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white rounded-full animate-pulse"
            style={{ background: 'var(--danger-500)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
          <div 
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ 
              background: 'var(--card-bg)', 
              maxHeight: '80vh',
              border: '1px solid var(--border)'
            }}
          >
            {!showSettings ? (
              <>
                <div 
                  className="flex items-center justify-between p-4 sticky top-0 z-10"
                  style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <Bell size={20} style={{ color: 'var(--primary-600)' }} />
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'var(--primary-200)', color: 'var(--primary-600)' }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      title="Settings"
                    >
                      <SettingsIcon size={18} />
                    </button>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        title="Mark all as read"
                      >
                        <CheckCheck size={18} />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        title="Clear all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 65px)' }}>
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <Bell size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
                      <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No notifications yet</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {notifications.map(notif => (
                        <div
                          key={notif.id}
                          className="p-3 rounded-lg mb-2 transition-all cursor-pointer"
                          style={{
                            background: notif.read ? 'transparent' : 'var(--primary-100)',
                            border: '1px solid',
                            borderColor: notif.read ? 'transparent' : 'var(--primary-200)'
                          }}
                          onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getNotificationIcon(notif.data?.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                {notif.title}
                              </p>
                              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                {notif.body}
                              </p>
                              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {formatTimestamp(notif.timestamp)}
                              </p>
                            </div>
                            {!notif.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notif.id);
                                }}
                                className="p-1 rounded"
                                style={{ color: 'var(--primary-600)' }}
                              >
                                <Check size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div 
                  className="flex items-center justify-between p-4 sticky top-0"
                  style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}
                >
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Notification Settings
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1.5 rounded-lg"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {[
                    { key: 'billReminders', label: 'Bill Reminders', desc: 'Get notified 3 days before bills are due' },
                    { key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Alerts when you reach 80% of budget' },
                    { key: 'savingsMilestones', label: 'Savings Milestones', desc: 'Celebrate your savings achievements' },
                    { key: 'unusualActivity', label: 'Unusual Activity', desc: 'Alert on unusual spending patterns' },
                    { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Summary of your week every Sunday' },
                    { key: 'achievementUnlocks', label: 'Achievements', desc: 'Notifications for unlocked achievements' }
                  ].map(setting => (
                    <div key={setting.key} className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                          {setting.label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {setting.desc}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-3">
                        <input
                          type="checkbox"
                          checked={settings[setting.key]}
                          onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div 
                          className="w-11 h-6 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={{
                            background: settings[setting.key] ? 'var(--primary-600)' : 'var(--neutral-300)'
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationCenter;
