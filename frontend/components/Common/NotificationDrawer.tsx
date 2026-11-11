import React from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Bell, 
  X, 
  CheckCheck, 
  DollarSign, 
  ShieldAlert, 
  Wrench, 
  UserPlus, 
  Calendar, 
  Info 
} from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useRental();

  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'security_alert':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'invoice_ready':
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'tenant_join_request':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'prepayment_notice':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Trung Tâm Thông Báo</h3>
                <p className="text-[11px] text-slate-500">
                  {notifications.filter((n) => !n.isRead).length} thông báo mới
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={markAllNotificationsAsRead}
                title="Đánh dấu tất cả đã đọc"
                className="p-1.5 text-xs text-emerald-700 hover:bg-emerald-50 rounded-lg flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đã đọc hết</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                <Bell className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                    notif.isRead
                      ? 'bg-slate-50/60 border-slate-200/60 opacity-75'
                      : notif.priority === 'urgent'
                      ? 'bg-rose-50/70 border-rose-200'
                      : notif.priority === 'high'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {!notif.isRead && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-slate-100 rounded-lg shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="space-y-0.5 pr-2">
                      <div className="text-xs font-bold text-slate-800">
                        {notif.title}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span>{notif.senderName}</span>
                        <span>{notif.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
            Tự động cập nhật 24/7
          </div>

        </div>
      </div>
    </div>
  );
};
