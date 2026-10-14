import React from 'react';
import { X, CheckCheck, AlertTriangle, Bed, Droplet, ShieldCheck } from 'lucide-react';
import { NotificationItem } from '../../types/hospital';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-[#FF873D]" />;
      case 'bed':
        return <Bed className="w-4 h-4 text-[#23D5F4]" />;
      case 'resource':
        return <Droplet className="w-4 h-4 text-[#FFB34F]" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-[#36D6A4]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full bg-[#051625] border-l border-[#145B89] shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#145B89] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F1F7FF] flex items-center gap-2">
              <span>Operational Alerts</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#087FC7]/40 border border-[#27B9FF]/50 text-[#23D5F4]">
                {notifications.filter((n) => !n.read).length} new
              </span>
            </h2>
            <p className="text-xs text-[#718BA5] mt-0.5">Real-time hospital incident & capacity feed</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              title="Mark all read"
              className="p-1.5 rounded-lg text-[#718BA5] hover:text-[#23D5F4] hover:bg-[#071D30] transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#718BA5] hover:text-white hover:bg-[#071D30] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[#718BA5] text-xs">
              No alerts at this time. All systems nominal.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-[#071D30]/40 border-[#145B89]/40 opacity-70'
                    : 'bg-[#071D30] border-[#27B9FF]/60 shadow-[0_0_10px_rgba(39,185,255,0.15)]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-[#051625] border border-[#145B89]/70 shrink-0 mt-0.5">
                    {getCategoryIcon(n.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#F1F7FF] truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[#718BA5] shrink-0 font-mono">
                        {n.created_at}
                      </span>
                    </div>
                    <p className="text-xs text-[#A7BED3] mt-1 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[#145B89] bg-[#071D30]/60 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] text-white text-xs font-semibold transition-colors"
          >
            Dismiss Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
