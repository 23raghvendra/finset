import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationCenter from './NotificationCenter';

const Header = ({ title, subtitle, user, children }) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for: ${searchQuery}`);
      setSearchQuery('');
      setSearchExpanded(false);
    }
  };

  const handleSearchClose = () => {
    setSearchQuery('');
    setSearchExpanded(false);
  };

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && searchExpanded) {
        handleSearchClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [searchExpanded]);

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
      {/* Title Section */}
      <div className="min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Children (usually Add Transaction button) - hidden on mobile, shown in Dashboard */}
        <div className="hidden sm:flex">
          {children}
        </div>
        
        {/* Search - Hidden on very small screens, icon only on mobile */}
        <div className="relative hidden sm:block">
          <form onSubmit={handleSearch} className="flex items-center">
            {/* Search Container */}
            <div
              className="flex items-center rounded-full overflow-hidden transition-all duration-300 ease-out"
              style={{
                width: searchExpanded ? '240px' : '40px',
                background: searchExpanded ? 'var(--card-bg)' : 'transparent',
                border: `1px solid ${searchExpanded ? 'var(--primary-600)' : 'var(--border)'}`,
                boxShadow: searchExpanded ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              {/* Search Icon / Button */}
              <button
                type={searchExpanded ? 'submit' : 'button'}
                onClick={() => !searchExpanded && setSearchExpanded(true)}
                className="w-10 h-10 flex items-center justify-center shrink-0 transition-all duration-300"
                style={{ 
                  color: searchExpanded ? 'var(--primary-600)' : 'var(--text-secondary)'
                }}
                onMouseOver={(e) => {
                  if (!searchExpanded) e.currentTarget.parentElement.style.background = 'var(--hover-bg)';
                }}
                onMouseOut={(e) => {
                  if (!searchExpanded) e.currentTarget.parentElement.style.background = 'transparent';
                }}
              >
                <Search 
                  size={18} 
                  className="transition-transform duration-300"
                  style={{ transform: searchExpanded ? 'scale(0.9)' : 'scale(1)' }}
                />
              </button>

              {/* Input Field */}
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent border-none outline-none text-sm transition-all duration-300"
                style={{ 
                  color: 'var(--text-primary)',
                  width: searchExpanded ? '100%' : '0',
                  padding: searchExpanded ? '0 4px' : '0',
                  opacity: searchExpanded ? 1 : 0,
                  fontSize: '16px' // Prevent zoom on iOS
                }}
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={handleSearchClose}
                className="w-8 h-8 flex items-center justify-center shrink-0 rounded-full mr-1 transition-all duration-300"
                style={{ 
                  opacity: searchExpanded ? 1 : 0,
                  transform: searchExpanded ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-90deg)',
                  color: 'var(--text-muted)',
                  pointerEvents: searchExpanded ? 'auto' : 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--hover-bg)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <X size={16} />
              </button>
            </div>
          </form>

          {/* Search backdrop */}
          {searchExpanded && (
            <div 
              className="fixed inset-0 z-[-1]" 
              onClick={handleSearchClose}
            />
          )}
        </div>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Profile - Simplified on mobile */}
        <div className="hidden sm:flex items-center gap-3 pl-3 sm:pl-4 border-l" style={{ borderColor: 'var(--border)' }}>
          <div 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-transform duration-200 hover:scale-105 cursor-pointer text-sm sm:text-base"
            style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
            <p className="text-xs truncate max-w-[120px]" style={{ color: 'var(--text-muted)' }}>{user?.email || 'user@email.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
