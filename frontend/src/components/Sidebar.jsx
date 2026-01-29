import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useOffline } from '../contexts/OfflineContext';
import {
  LayoutGrid,
  Receipt,
  Wallet,
  Target,
  PiggyBank,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Lightbulb,
  Calculator,
  Wifi,
  WifiOff,
  Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed, onClose }) => {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isOnline, isOfflineMode, toggleOfflineMode, pendingSyncCount } = useOffline();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const isMobileDrawer = typeof onClose === 'function';

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'budget', label: 'Budget', icon: PiggyBank },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'planning', label: 'Planning', icon: Calculator },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (item) => {
    setActiveTab(item.id);
  };

  const handleHelp = () => {
    toast.success('Need help? Contact support@finset.app');
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    await logout();
  };

  return (
    <aside 
      className="h-full flex flex-col transition-all duration-300" 
      style={{ 
        width: isMobileDrawer ? '280px' : (collapsed ? '80px' : '240px'),
        backgroundColor: isDark ? '#1A1A1C' : '#FFFFFF',
        borderRight: `1px solid ${isDark ? '#2A2A2E' : '#EFEFF1'}`
      }}
    >
      {/* Logo */}
      <div className="p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" 
            style={{ background: '#8470FF' }}
          >
            <span className="text-white font-bold text-lg">F</span>
          </div>
          {!collapsed && (
            <span 
              className="text-xl font-bold" 
              style={{ color: isDark ? '#F5F5F7' : '#111113' }}
            >
              FinSet
            </span>
          )}
        </div>
        {/* Close button for mobile drawer */}
        {isMobileDrawer ? (
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ 
              background: isDark ? '#2A2A2E' : '#F5F5F7', 
              color: isDark ? '#F5F5F7' : '#111113' 
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => setCollapsed && setCollapsed(!collapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: isDark ? '#6B6B73' : '#82828C' }}
            onMouseOver={(e) => e.currentTarget.style.background = isDark ? '#2A2A2E' : '#F5F5F7'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronLeft size={18} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isActive ? '#8470FF' : 'transparent',
                color: isActive ? 'white' : (isDark ? '#A1A1AA' : '#56565E')
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = isDark ? '#2A2A2E' : '#F5F5F7';
                  e.currentTarget.style.color = isDark ? '#F5F5F7' : '#111113';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = isDark ? '#A1A1AA' : '#56565E';
                }
              }}
            >
              <Icon size={20} />
              {(isMobileDrawer || !collapsed) && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 pb-4 space-y-1">
        {/* Help Button */}
        <button
          onClick={handleHelp}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          style={{ color: isDark ? '#A1A1AA' : '#56565E' }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = isDark ? '#2A2A2E' : '#F5F5F7';
            e.currentTarget.style.color = isDark ? '#F5F5F7' : '#111113';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isDark ? '#A1A1AA' : '#56565E';
          }}
        >
          <HelpCircle size={20} />
          {(isMobileDrawer || !collapsed) && <span>Help</span>}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          style={{ color: isDark ? '#A1A1AA' : '#56565E' }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = isDark ? '#3D2020' : '#FFEBEB';
            e.currentTarget.style.color = '#E83838';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isDark ? '#A1A1AA' : '#56565E';
          }}
        >
          <LogOut size={20} />
          {(isMobileDrawer || !collapsed) && <span>Log out</span>}
        </button>

        {/* Settings Section */}
        <div 
          className={`pt-3 mt-2 border-t ${(isMobileDrawer || !collapsed) ? 'px-3' : 'px-1'} space-y-2`} 
          style={{ borderColor: isDark ? '#2A2A2E' : '#EFEFF1' }}
        >
          {/* Offline Mode Indicator */}
          <button
            onClick={() => toggleOfflineMode(!isOfflineMode)}
            className={`w-full flex items-center ${(isMobileDrawer || !collapsed) ? 'justify-between' : 'justify-center'} p-2 rounded-xl transition-all duration-300 relative`}
            style={{
              background: isDark ? '#2A2A2E' : '#F5F5F7',
              border: `1px solid ${isDark ? '#3A3A3E' : '#E0E0E5'}`
            }}
          >
            {/* WiFi Icon */}
            <div className={`flex items-center ${(isMobileDrawer || !collapsed) ? 'gap-2' : ''}`}>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 relative"
                style={{
                  background: isOfflineMode 
                    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' 
                    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                {isOfflineMode ? <WifiOff size={16} className="text-white" /> : <Wifi size={16} className="text-white" />}
                
                {/* Pending badge */}
                {pendingSyncCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                    style={{ background: '#E83838', color: 'white' }}
                  >
                    {pendingSyncCount > 9 ? '9+' : pendingSyncCount}
                  </span>
                )}
              </div>
              
              {(isMobileDrawer || !collapsed) && (
                <span className="text-xs font-medium" style={{ color: isDark ? '#A1A1AA' : '#56565E' }}>
                  {isOfflineMode ? 'Offline' : 'Online'}
                </span>
              )}
            </div>

            {/* Mini toggle switch - only show when expanded */}
            {(isMobileDrawer || !collapsed) && (
              <div 
                className="relative w-9 h-5 rounded-full transition-all duration-300 shrink-0"
                style={{
                  background: isOfflineMode ? '#F59E0B' : '#297B32'
                }}
              >
                <div 
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center"
                  style={{
                    left: isOfflineMode ? '18px' : '2px',
                    background: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: isOfflineMode ? '#F59E0B' : '#297B32'
                    }}
                  />
                </div>
              </div>
            )}
          </button>

          {/* Premium Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center ${(isMobileDrawer || !collapsed) ? 'justify-between' : 'justify-center'} p-2 rounded-xl transition-all duration-300`}
            style={{
              background: isDark ? '#2A2A2E' : '#F5F5F7',
              border: `1px solid ${isDark ? '#3A3A3E' : '#E0E0E5'}`
            }}
          >
            {/* Animated coin icon */}
            <div className={`flex items-center ${(isMobileDrawer || !collapsed) ? 'gap-2' : ''}`}>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0"
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, #2d2d3a 0%, #1a1a2e 100%)' 
                    : 'linear-gradient(135deg, #fff9e6 0%, #ffeeba 100%)',
                  boxShadow: isDark 
                    ? 'inset 0 1px 0 rgba(255,255,255,0.1)' 
                    : 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <span className="text-sm">{isDark ? '🌙' : '☀️'}</span>
              </div>
              
              {(isMobileDrawer || !collapsed) && (
                <span className="text-xs font-medium" style={{ color: isDark ? '#A1A1AA' : '#56565E' }}>
                  {isDark ? 'Dark' : 'Light'}
                </span>
              )}
            </div>

            {/* Mini toggle switch - only show when expanded */}
            {(isMobileDrawer || !collapsed) && (
              <div 
                className="relative w-9 h-5 rounded-full transition-all duration-300 shrink-0"
                style={{
                  background: isDark ? '#8470FF' : '#D0D0D4'
                }}
              >
                <div 
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center"
                  style={{
                    left: isDark ? '18px' : '2px',
                    background: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: isDark ? '#8470FF' : '#A1A1A9'
                    }}
                  />
                </div>
              </div>
            )}
          </button>
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
    </aside>
  );
};

export default Sidebar;
