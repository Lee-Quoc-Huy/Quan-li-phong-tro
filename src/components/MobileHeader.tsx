import React, { useState } from 'react';
import { useRental } from '../context/RentalContext';
import { AppLogo } from './Common/AppLogo';
import { Menu, Bell, User, LogOut, Copy, Check, ShieldAlert, RefreshCw } from 'lucide-react';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onToggleSidebar,
  onOpenNotifications,
}) => {
  const { currentUser, settings, joinRequests, unreadNotifsCount, logout, regenerateHostCode } = useRental();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyHostCode = () => {
    navigator.clipboard.writeText(settings.hostCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRandomizeHostCode = () => {
    if (window.confirm('Tạo lại Mã Chủ Trọ ngẫu nhiên mới?\n\nMã cũ sẽ ngừng hoạt động.')) {
      const newCode = regenerateHostCode();
      alert(`Đã tạo mã ngẫu nhiên mới: ${newCode}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3.5 py-2.5 flex items-center justify-between lg:hidden shadow-2xs">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Mở danh mục"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 p-1 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
            <AppLogo className="w-full h-full" color="#0f766e" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 text-xs leading-tight truncate">
              {currentUser.role === 'admin' 
                ? 'Quản Trị Hệ Thống' 
                : (currentUser.role === 'tenant' && !currentUser.landlordId) 
                  ? 'Chưa kết nối trọ' 
                  : settings.houseName || 'Nhà Trọ'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9px] font-bold uppercase">
                {currentUser.role === 'landlord' ? 'Chủ trọ' : currentUser.role === 'tenant' ? 'Khách thuê' : 'Admin'}
              </span>
              {currentUser.role === 'landlord' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyHostCode}
                    className="text-teal-700 hover:text-teal-900 font-mono font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>Mã: {settings.hostCode}</span>
                    {copiedCode ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                  </button>
                  <button
                    onClick={handleRandomizeHostCode}
                    title="Đổi mã mới"
                    className="p-1 rounded hover:bg-slate-100 text-teal-700"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Thông báo"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.2 text-[9px] font-bold bg-amber-500 text-white rounded-full border border-white">
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar */}
        <div className="pl-1 flex items-center gap-1">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-2xs"
          />
        </div>
      </div>
    </header>
  );
};

