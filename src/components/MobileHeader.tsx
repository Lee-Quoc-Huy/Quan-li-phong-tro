import React from 'react';
import { useRental } from '../context/RentalContext';
import { Menu, Bell, Building2, User, LogOut } from 'lucide-react';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onToggleSidebar,
  onOpenNotifications,
}) => {
  const { currentUser, settings, unreadNotifsCount, logout } = useRental();

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200/90 px-4 py-3 flex items-center justify-between lg:hidden shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-sm">
            T
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm leading-tight">
              Trọ Xanh
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
              {settings.houseName}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => {
            if (window.confirm(`Đăng xuất khỏi ${currentUser.name}?`)) {
              logout();
            }
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 pl-1">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-200"
          />
        </div>
      </div>
    </header>
  );
};
