import React, { useState } from 'react';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import CategoryManager from '../components/CategoryManager';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Moon,
  Sun,
  ChevronRight,
  Save,
  Tag,
  Layout,
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';

const SettingsPage = ({ user }) => {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: ''
  });
  
  // Dashboard customization
  const [useDraggableDashboard, setUseDraggableDashboard] = useState(() => {
    return localStorage.getItem('useDraggableDashboard') === 'true';
  });
  
  // Offline mode
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(() => {
    return localStorage.getItem('offlineMode') === 'true';
  });

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'customization', label: 'Customization', icon: Layout },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ];

  const handleSaveProfile = () => {
    toast.success('Profile saved successfully!');
  };

  const handleSavePreferences = () => {
    toast.success('Preferences saved!');
  };

  const handleChangePhoto = () => {
    toast.success('Photo upload feature coming soon!');
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    await logout();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Header 
        title="Settings"
        subtitle="Manage your account settings and preferences"
        user={user}
      />

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="card p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: activeSection === item.id ? 'var(--primary-100)' : 'transparent',
                    color: activeSection === item.id ? 'var(--primary-600)' : 'var(--text-secondary)'
                  }}
                  onMouseOver={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.background = 'var(--hover-bg)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="col-span-3 space-y-6">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <>
              <div className="card p-6">
                <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Personal Information</h3>
                <div className="flex items-start gap-6 mb-6">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
                    style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email || 'user@email.com'}</p>
                    <button 
                      onClick={handleChangePhoto}
                      className="text-sm font-medium mt-2 hover:underline"
                      style={{ color: 'var(--primary-600)' }}
                    >
                      Change photo
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="input"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="input"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="input"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      className="input"
                      placeholder="City, India"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button className="btn btn-primary" onClick={handleSaveProfile}>
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Appearance */}
              <div className="card p-6">
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Appearance</h3>
                
                {/* Premium Theme Toggle */}
                <div 
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Elegant coin/moon icon */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                        style={{
                          background: isDark 
                            ? 'linear-gradient(135deg, #2d2d3a 0%, #1a1a2e 100%)' 
                            : 'linear-gradient(135deg, #fff9e6 0%, #ffeeba 100%)',
                          boxShadow: isDark 
                            ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.3)' 
                            : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.08)'
                        }}
                      >
                        <span className="text-base">{isDark ? '🌙' : '☀️'}</span>
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Theme</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {isDark ? 'Dark mode' : 'Light mode'}
                        </p>
                      </div>
                    </div>

                    {/* Elegant segmented control */}
                    <div 
                      className="flex p-1 rounded-lg"
                      style={{ background: 'var(--hover-bg)' }}
                    >
                      <button
                        onClick={() => isDark && toggleTheme()}
                        className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
                        style={{
                          background: !isDark ? 'var(--card-bg)' : 'transparent',
                          color: !isDark ? 'var(--text-primary)' : 'var(--text-muted)',
                          boxShadow: !isDark ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        <span className="text-xs">₹</span>
                        Light
                      </button>
                      <button
                        onClick={() => !isDark && toggleTheme()}
                        className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
                        style={{
                          background: isDark ? 'var(--card-bg)' : 'transparent',
                          color: isDark ? 'var(--text-primary)' : 'var(--text-muted)',
                          boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
                        }}
                      >
                        <span className="text-xs">◐</span>
                        Dark
                      </button>
                    </div>
                  </div>

                  {/* Subtle decorative chart */}
                  <div className="flex items-end justify-center gap-0.5 mt-4 h-6 opacity-40">
                    {[35, 55, 42, 68, 51, 74, 48, 62, 45, 58].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          background: isDark 
                            ? 'var(--primary-400)' 
                            : 'var(--primary-600)',
                          opacity: 0.3 + (i * 0.07)
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="card p-6">
              <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: 'Email notifications', desc: 'Receive updates via email', defaultChecked: true },
                  { label: 'Push notifications', desc: 'Receive push notifications', defaultChecked: true },
                  { label: 'Budget alerts', desc: 'Get notified when reaching budget limits', defaultChecked: true },
                  { label: 'Weekly summary', desc: 'Receive weekly spending summary', defaultChecked: false },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked={item.defaultChecked} 
                        className="sr-only peer"
                        onChange={() => toast.success(`${item.label} ${item.defaultChecked ? 'disabled' : 'enabled'}`)}
                      />
                      <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-600)]" style={{ background: 'var(--neutral-300)' }}></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="card p-6">
              <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Security Settings</h3>
              <div className="space-y-4">
                <button 
                  className="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-secondary)' }}
                  onClick={() => toast.success('Password change feature coming soon!')}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                >
                  <div className="text-left">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Change Password</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Update your password regularly</p>
                  </div>
                  <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                </button>
                <div 
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add an extra layer of security</p>
                  </div>
                  <span className="badge badge-success">Enabled</span>
                </div>
                <button 
                  className="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-secondary)' }}
                  onClick={() => toast.success('Active sessions: 1 device')}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                >
                  <div className="text-left">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Active Sessions</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your active sessions</p>
                  </div>
                  <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={handleLogout} className="btn btn-danger">
                  Log Out
                </button>
              </div>
            </div>
          )}

          {/* Billing Section */}
          {activeSection === 'billing' && (
            <div className="card p-6">
              <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Billing & Subscription</h3>
              <div 
                className="p-4 rounded-xl mb-6"
                style={{ background: 'var(--primary-100)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--primary-600)' }}>Free Plan</p>
                    <p className="text-sm" style={{ color: 'var(--primary-600)' }}>₹0/month</p>
                  </div>
                  <span className="badge badge-primary">Active</span>
                </div>
              </div>
              <div className="space-y-4">
                <button 
                  className="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-secondary)' }}
                  onClick={() => toast.success('Payment methods coming soon!')}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                >
                  <div className="text-left">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Payment Method</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add a payment method</p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--primary-600)' }}>Add</span>
                </button>
                <button 
                  className="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-secondary)' }}
                  onClick={() => toast.success('No billing history yet')}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                >
                  <div className="text-left">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Billing History</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>View past invoices</p>
                  </div>
                  <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>
          )}

          {/* Language Section */}
          {activeSection === 'language' && (
            <div className="card p-6">
              <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Language & Region</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Language</label>
                  <select className="input">
                    <option>English (India)</option>
                    <option>Hindi</option>
                    <option>English (US)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Currency</label>
                  <select className="input">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Date Format</label>
                  <select className="input">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button className="btn btn-primary" onClick={handleSavePreferences}>
                  <Save size={16} />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Categories Section */}
          {activeSection === 'categories' && (
            <div className="card p-6">
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Custom Categories</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Manage your income and expense categories. Custom categories can be added or removed.
              </p>
              <CategoryManager 
                onCategoriesChange={(categories) => {
                  toast.success('Categories updated');
                }}
              />
            </div>
          )}

          {/* Customization Section */}
          {activeSection === 'customization' && (
            <div className="card p-6">
              <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Dashboard Customization</h3>
              
              <div className="space-y-4">
                {/* Draggable Dashboard Toggle */}
                <div 
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <div className="flex items-center gap-3">
                    <Layout size={20} style={{ color: 'var(--primary-600)' }} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Draggable Dashboard</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Enable drag & drop to rearrange dashboard widgets
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useDraggableDashboard}
                      onChange={(e) => {
                        setUseDraggableDashboard(e.target.checked);
                        localStorage.setItem('useDraggableDashboard', e.target.checked.toString());
                        toast.success(e.target.checked ? 'Draggable dashboard enabled' : 'Standard dashboard enabled');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-600)]" style={{ background: 'var(--neutral-300)' }}></div>
                  </label>
                </div>

                {useDraggableDashboard && (
                  <div 
                    className="p-4 rounded-xl"
                    style={{ background: 'var(--primary-100)', borderLeft: '4px solid var(--primary-600)' }}
                  >
                    <p className="text-sm" style={{ color: 'var(--primary-600)' }}>
                      <strong>Tip:</strong> Go to Dashboard and click "Customize Dashboard" to add, remove, or rearrange widgets. Drag widgets by grabbing the grip handle.
                    </p>
                  </div>
                )}

                {/* Reset Dashboard Layout */}
                <button
                  onClick={() => {
                    localStorage.removeItem('dashboardWidgets');
                    toast.success('Dashboard layout reset to default');
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-secondary)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                >
                  <div className="text-left">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Reset Dashboard Layout</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Restore default widget arrangement</p>
                  </div>
                  <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>
          )}

          {/* Data & Storage Section */}
          {activeSection === 'data' && (
            <div className="card p-6">
              <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Data & Storage</h3>
              
              <div className="space-y-4">
                {/* Offline Mode */}
                <div 
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <div className="flex items-center gap-3">
                    {offlineModeEnabled ? (
                      <WifiOff size={20} style={{ color: 'var(--warning-600)' }} />
                    ) : (
                      <Wifi size={20} style={{ color: 'var(--success-800)' }} />
                    )}
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Offline Mode</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Save data locally when offline and sync when back online
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={offlineModeEnabled}
                      onChange={(e) => {
                        setOfflineModeEnabled(e.target.checked);
                        localStorage.setItem('offlineMode', e.target.checked.toString());
                        toast.success(e.target.checked ? 'Offline mode enabled' : 'Offline mode disabled');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-600)]" style={{ background: 'var(--neutral-300)' }}></div>
                  </label>
                </div>

                {offlineModeEnabled && (
                  <div 
                    className="p-4 rounded-xl"
                    style={{ background: 'var(--warning-200)', borderLeft: '4px solid var(--warning-500)' }}
                  >
                    <p className="text-sm" style={{ color: 'var(--warning-700)' }}>
                      <strong>Note:</strong> When offline mode is enabled, your data is stored locally in your browser. Changes will automatically sync when you're back online.
                    </p>
                  </div>
                )}

                {/* Virtual Scrolling */}
                <div 
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <div className="flex items-center gap-3">
                    <Database size={20} style={{ color: 'var(--primary-600)' }} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Virtual Scrolling</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Optimize performance for large transaction lists
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked={localStorage.getItem('useVirtualScroll') === 'true'}
                      onChange={(e) => {
                        localStorage.setItem('useVirtualScroll', e.target.checked.toString());
                        toast.success(e.target.checked ? 'Virtual scrolling enabled' : 'Virtual scrolling disabled');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-600)]" style={{ background: 'var(--neutral-300)' }}></div>
                  </label>
                </div>

                {/* Clear Cache */}
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all cached data?')) {
                      localStorage.removeItem('dashboardWidgets');
                      localStorage.removeItem('onboardingCompleted');
                      localStorage.removeItem('setupCompleted');
                      toast.success('Cache cleared successfully');
                    }
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
                  style={{ background: 'var(--danger-200)' }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <div className="text-left">
                    <p className="font-medium" style={{ color: 'var(--danger-500)' }}>Clear Local Cache</p>
                    <p className="text-sm" style={{ color: 'var(--danger-400)' }}>Remove all locally stored data</p>
                  </div>
                  <ChevronRight size={20} style={{ color: 'var(--danger-500)' }} />
                </button>

                {/* Export All Data */}
                <button
                  onClick={() => {
                    toast.success('Export feature coming soon!');
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-secondary)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                >
                  <div className="text-left">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Export All Data</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Download all your financial data</p>
                  </div>
                  <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={confirmLogout}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        cancelText="Stay"
        type="logout"
      />
    </div>
  );
};

export default SettingsPage;
