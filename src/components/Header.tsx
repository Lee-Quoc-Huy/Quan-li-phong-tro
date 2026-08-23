import React, { useState } from 'react';
import { useRental } from '../context/RentalContext';
import { AppLogo } from './Common/AppLogo';
import { 
  Bell, 
  KeyRound, 
  ChevronDown, 
  Copy, 
  Check, 
  UserCog,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { NotificationDrawer } from './Common/NotificationDrawer';
import { UserProfileModal } from './Common/UserProfileModal';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    settings, 
    currentHouseName,
    unreadNotifsCount,
    logout,
    regenerateHostCode
  } = useRental();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);

  const handleCopyHostCode = () => {
    navigator.clipboard.writeText(settings.hostCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRandomizeHostCode = () => {
    if (window.confirm('Bạn có chắc muốn đổi/tạo lại Mã Chủ Trọ ngẫu nhiên mới không?\n\nMã cũ sẽ ngừng hoạt động. Khách thuê mới sẽ cần dùng mã mới này để kết nối.')) {
      const newCode = regenerateHostCode();
      setCodeMsg(`Đã tạo mã mới: ${newCode}`);
      setTimeout(() => setCodeMsg(null), 3000);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#080c14]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo and Project Title */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 p-1.5 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-950/40">
                <AppLogo className="w-full h-full" color="#60a5fa" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-100 text-base tracking-tight uppercase">
                    {currentUser.role === 'admin' 
                      ? 'Quản Trị Hệ Thống' 
                      : (currentUser.role === 'tenant' && !currentUser.landlordId) 
                        ? 'Chưa kết nối trọ' 
                        : currentHouseName}
                  </span>
                  <span className="hidden md:inline-flex text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Trực Tuyến
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {currentUser.role === 'admin'
                    ? 'Hệ thống quản trị trực tuyến'
                    : (currentUser.role === 'tenant' && !currentUser.landlordId)
                      ? 'Vui lòng nhập mã để kết nối'
                      : 'Hệ Thống Quản Lý Trọ'}
                </div>
              </div>
            </div>

            {/* Right Tools & Profile */}
            <div className="flex items-center gap-3">
              
              {/* Host Code Display (Crucial for Landlord & Tenant connection) */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 border border-amber-500/30 rounded-xl relative">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <div className="text-[11px]">
                  <span className="text-slate-400 mr-1">Mã Chủ Trọ:</span>
                  <span className="font-mono font-bold text-amber-300">{settings.hostCode}</span>
                </div>
                <button
                  onClick={handleCopyHostCode}
                  title="Sao chép mã chủ trọ gửi cho khách"
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-300 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {currentUser.role === 'landlord' && (
                  <button
                    onClick={handleRandomizeHostCode}
                    title="Đổi/Tạo mã ngẫu nhiên mới (nếu mã cũ bị lộ)"
                    className="p-1 hover:bg-slate-800 rounded text-amber-400 hover:text-amber-200 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
                {codeMsg && (
                  <div className="absolute top-full left-0 mt-1 px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-lg shadow-lg whitespace-nowrap animate-in fade-in z-50">
                    {codeMsg}
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                title="Thông báo hệ thống"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-mono font-extrabold text-[10px] rounded-full shadow-lg shadow-amber-900/50 animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* User Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-200 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-amber-400 font-medium capitalize">
                      {currentUser.role === 'tenant' ? 'Khách thuê trọ' : currentUser.role === 'landlord' ? 'Chủ nhà trọ' : 'Quản trị viên'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#0e1422] border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 bg-slate-900/70 rounded-xl mb-2">
                      <div className="text-xs font-bold text-slate-200">{currentUser.name} {currentUser.age ? `(${currentUser.age} tuổi)` : ''}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
                      <div className="text-[11px] text-slate-400">SĐT: {currentUser.phone}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsProfileModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors border border-amber-500/30"
                          title="Cập nhật hồ sơ cá nhân"
                        >
                          <UserCog className="w-3.5 h-3.5" /> Sửa Hồ Sơ
                        </button>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-slate-800 pt-2">
                      <button
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc chắn muốn đăng xuất khỏi tài khoản ${currentUser.name}?`)) {
                            setIsUserMenuOpen(false);
                            logout();
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Đăng Xuất
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};
