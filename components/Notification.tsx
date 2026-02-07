
import React, { useEffect } from 'react';
import { Bell, X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Notification as NotificationType } from '../types';

interface NotificationProps {
  notification: NotificationType;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(notification.id), 8000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const icons = {
    info: <Info className="text-sky-400" size={20} />,
    success: <CheckCircle className="text-emerald-400" size={20} />,
    warning: <AlertTriangle className="text-amber-400" size={20} />,
    error: <AlertCircle className="text-red-400" size={20} />,
  };

  const colors = {
    info: 'border-sky-500/50 bg-sky-500/10',
    success: 'border-emerald-500/50 bg-emerald-500/10',
    warning: 'border-amber-500/50 bg-amber-500/10',
    error: 'border-red-500/50 bg-red-500/10',
  };

  return (
    <div 
      className={`glass border rounded-2xl p-4 mb-3 flex gap-4 min-w-[320px] max-w-md shadow-2xl animate-in slide-in-from-right duration-500 ${colors[notification.type]}`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-1" role="img" aria-label={notification.type}>
        {icons[notification.type]}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-white mb-1">{notification.title}</h4>
        <p className="text-xs text-slate-300 leading-relaxed">{notification.message}</p>
        <span className="text-[10px] text-slate-500 mt-2 block font-mono">
          {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <button 
        onClick={() => onClose(notification.id)}
        className="text-slate-500 hover:text-white transition-colors rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        aria-label="Close notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
};

export default Notification;
