import { useEffect, useCallback, useState } from 'react';
import toast from 'react-hot-toast';

const SHORTCUTS = {
  'n': { action: 'newTransaction', description: 'New Transaction', category: 'Actions' },
  'b': { action: 'budget', description: 'Go to Budget', category: 'Navigation' },
  'g': { action: 'goals', description: 'Go to Goals', category: 'Navigation' },
  't': { action: 'transactions', description: 'Go to Transactions', category: 'Navigation' },
  'd': { action: 'dashboard', description: 'Go to Dashboard', category: 'Navigation' },
  'a': { action: 'analytics', description: 'Go to Analytics', category: 'Navigation' },
  'i': { action: 'insights', description: 'Go to Insights', category: 'Navigation' },
  'p': { action: 'planning', description: 'Go to Planning', category: 'Navigation' },
  's': { action: 'settings', description: 'Go to Settings', category: 'Navigation' },
  '/': { action: 'search', description: 'Focus Search', category: 'Actions' },
  'Escape': { action: 'close', description: 'Close Modal/Dialog', category: 'Actions' },
  '?': { action: 'help', description: 'Show Shortcuts', category: 'Help' },
};

export const useKeyboardShortcuts = (handlers = {}) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
    ) {
      // Allow Escape in inputs
      if (event.key !== 'Escape') return;
    }

    // Don't trigger if modifier keys are pressed (except for ?)
    if ((event.ctrlKey || event.metaKey || event.altKey) && event.key !== '?') {
      return;
    }

    const shortcut = SHORTCUTS[event.key];
    if (!shortcut) return;

    event.preventDefault();

    if (event.key === '?') {
      setShowHelp(prev => !prev);
      return;
    }

    const handler = handlers[shortcut.action];
    if (handler) {
      handler();
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp, shortcuts: SHORTCUTS };
};

// Keyboard Shortcuts Help Modal Component
export const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const groupedShortcuts = Object.entries(SHORTCUTS).reduce((acc, [key, value]) => {
    if (!acc[value.category]) acc[value.category] = [];
    acc[value.category].push({ key, ...value });
    return acc;
  }, {});

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        style={{ background: 'var(--card-bg)' }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Press these keys anywhere in the app
          </p>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts.map(({ key, description }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</span>
                    <kbd 
                      className="px-2 py-1 rounded text-xs font-mono"
                      style={{ 
                        background: 'var(--bg-secondary)', 
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      {key === '/' ? '/' : key === '?' ? 'Shift + /' : key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-secondary)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Press <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>?</kbd> anytime to toggle this menu
          </p>
        </div>
      </div>
    </div>
  );
};

export default useKeyboardShortcuts;
