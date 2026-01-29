import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

const AlertDialog = ({ 
  isOpen, 
  onClose, 
  title = 'Alert',
  message = '',
  type = 'info', // 'info', 'success', 'warning', 'error'
  buttonText = 'OK'
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    info: {
      icon: Info,
      iconBg: 'var(--primary-100)',
      iconColor: 'var(--primary-600)',
      buttonBg: 'var(--primary-600)'
    },
    success: {
      icon: CheckCircle,
      iconBg: 'var(--success-200)',
      iconColor: 'var(--success-800)',
      buttonBg: 'var(--success-800)'
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'var(--warning-200)',
      iconColor: 'var(--warning-500)',
      buttonBg: 'var(--warning-500)'
    },
    error: {
      icon: XCircle,
      iconBg: 'var(--danger-200)',
      iconColor: 'var(--danger-500)',
      buttonBg: 'var(--danger-500)'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

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
          className="px-6 py-4 flex justify-end"
          style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: config.buttonBg }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
