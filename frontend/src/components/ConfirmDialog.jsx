import React from 'react';
import { AlertTriangle, Trash2, LogOut, X, Info, CheckCircle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' // 'warning', 'danger', 'info', 'success'
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconBg: 'var(--warning-200)',
      iconColor: 'var(--warning-500)',
      confirmBg: 'var(--warning-500)',
      confirmHover: 'var(--warning-500)'
    },
    danger: {
      icon: Trash2,
      iconBg: 'var(--danger-200)',
      iconColor: 'var(--danger-500)',
      confirmBg: 'var(--danger-500)',
      confirmHover: '#c92a2a'
    },
    info: {
      icon: Info,
      iconBg: 'var(--primary-100)',
      iconColor: 'var(--primary-600)',
      confirmBg: 'var(--primary-600)',
      confirmHover: 'var(--primary-700)'
    },
    success: {
      icon: CheckCircle,
      iconBg: 'var(--success-200)',
      iconColor: 'var(--success-800)',
      confirmBg: 'var(--success-800)',
      confirmHover: '#1e6b27'
    },
    logout: {
      icon: LogOut,
      iconBg: 'var(--neutral-100)',
      iconColor: 'var(--neutral-600)',
      confirmBg: 'var(--neutral-700)',
      confirmHover: 'var(--neutral-800)'
    }
  };

  const config = typeConfig[type] || typeConfig.warning;
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="w-full max-w-sm rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
        style={{ background: 'var(--card-bg)' }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: config.iconBg }}
            >
              <Icon size={24} style={{ color: config.iconColor }} />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-semibold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div 
          className="px-6 py-4 flex gap-3"
          style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ 
              background: 'var(--card-bg)', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--card-bg)'}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: config.confirmBg }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
