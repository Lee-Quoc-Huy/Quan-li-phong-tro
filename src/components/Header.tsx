import React, { useState } from 'react';
import { useRental } from '../context/RentalContext';
import { AppLogo } from './Common/AppLogo';
import { UserRole } from '../types';
import { 
  Building, 
  Home, 
  Shield, 
  Bell, 
  KeyRound, 
  UserCheck, 
  RotateCcw, 
  ChevronDown, 
  Copy, 
  Check, 
  AlertTriangle,
  Sparkles,
  UserCog,
  RefreshCw
} from 'lucide-react';
import { NotificationDrawer } from './Common/NotificationDrawer';
import { UserProfileModal } from './Common/UserProfileModal';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    users, 
    switchUserById, 
    switchRoleQuick, 
    settings, 
    joinRequests,
    unreadNotifsCount,
    resetAllData,
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
                    Hệ Thống Quản Lý Trọ
                  </span>
                  <span className="hidden md:inline-flex text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Trực Tuyến
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {currentUser.role === 'tenant' && !currentUser.landlordId && !joinRequests.some((r) => r.tenantId === currentUser.id)
                    ? 'Chưa kết nối trọ'
                    : settings.houseName}
                </div>
              </div>
            </div>

            {/* Middle Role Switcher Navigation */}
            <div className="hidden lg:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => switchRoleQuick('tenant')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentUser.role === 'tenant'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Người Thuê Trọ</span>
              </button>

              <button
                onClick={() => switchRoleQuick('landlord')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentUser.role === 'landlord'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Chủ Nhà Trọ</span>
              </button>

              <button
                onClick={() => switchRoleQuick('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Quản Lý Hệ Thống</span>
              </button>
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

              {/* User Account Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all"
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
                    <div className="p-3 border-b border-slate-800 mb-1 bg-slate-900/50 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200">{currentUser.name} {currentUser.age ? `(${currentUser.age} tuổi)` : ''}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
                        <div className="text-[11px] text-slate-400">SĐT: {currentUser.phone}</div>
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors border border-amber-500/30 shrink-0"
                        title="Cập nhật hồ sơ cá nhân"
                      >
                        <UserCog className="w-3.5 h-3.5" /> Sửa Hồ Sơ
                      </button>
                    </div>

                    {/* Quick Switch Profiles */}
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                      Chuyển đổi tài khoản làm việc:
                    </div>
                    <div className="space-y-1">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUserById(u.id);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                            u.id === currentUser.id
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-md object-cover" />
                            <div>
                              <div>{u.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {u.role === 'tenant' ? 'Khách thuê' : u.role === 'landlord' ? 'Chủ trọ' : 'Admin'}
                              </div>
                            </div>
                          </div>
                          {u.id === currentUser.id && <UserCheck className="w-4 h-4 text-amber-400" />}
                        </button>
                      ))}
                    </div>

                    {/* Reset Data Button */}
                    <div className="border-t border-slate-800 mt-2 pt-2">
                      <button
                        onClick={() => {
                          if (window.confirm('Khôi phục toàn bộ dữ liệu ban đầu? Dữ liệu bạn tạo sẽ được đặt lại.')) {
                            resetAllData();
                            setIsUserMenuOpen(false);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Đặt lại dữ liệu ban đầu
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Mobile Sub Navigation bar for roles */}
        <div className="lg:hidden flex items-center justify-around bg-slate-950/90 border-t border-slate-800/80 px-2 py-2">
          <button
            onClick={() => switchRoleQuick('tenant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              currentUser.role === 'tenant' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> Khách Thuê
          </button>
          <button
            onClick={() => switchRoleQuick('landlord')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              currentUser.role === 'landlord' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Chủ Trọ
          </button>
          <button
            onClick={() => switchRoleQuick('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              currentUser.role === 'admin' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Quản Trị
          </button>
        </div>
      </header>

      {/* Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};
