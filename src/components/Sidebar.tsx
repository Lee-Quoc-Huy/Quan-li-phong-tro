import React, { useState } from 'react';
import { useRental } from '../context/RentalContext';
import { AppLogo } from './Common/AppLogo';
import { UserRole } from '../types';
import { 
  Home, 
  DoorClosed, 
  UserPlus, 
  Users, 
  DollarSign, 
  Wrench, 
  ShieldCheck, 
  Tag, 
  Zap, 
  FileText, 
  KeyRound, 
  Shield, 
  LogOut, 
  ChevronRight, 
  Building2, 
  Check, 
  X,
  Key,
  RotateCcw,
  Sparkles,
  Bell,
  UserCog
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenNotifications: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigateTab,
  isOpenMobile,
  onCloseMobile,
  onOpenNotifications
}) => {
  const { 
    currentUser, 
    users, 
    switchUserById, 
    switchRoleQuick, 
    logout,
    settings, 
    joinRequests, 
    issues, 
    invoices, 
    unreadNotifsCount,
    resetAllData 
  } = useRental();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const pendingJoinCount = joinRequests.filter((r) => r.status === 'pending').length;
  const activeIssuesCount = issues.filter((i) => i.status !== 'resolved').length;
  const pendingInvoicesCount = invoices.filter((i) => i.status === 'pending').length;

  const handleCopyHostCode = () => {
    navigator.clipboard.writeText(settings.hostCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  interface SidebarLink {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | null;
  }

  // Landlord Navigation Links matching the reference layout
  const landlordLinks: SidebarLink[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'rooms', label: 'Phòng trọ', icon: DoorClosed },
    { id: 'tenants', label: 'Yêu cầu tham gia', icon: UserPlus, badge: pendingJoinCount > 0 ? pendingJoinCount : null },
    { id: 'all_tenants', label: 'Khách thuê & Hợp đồng', icon: Users },
    { id: 'invoices', label: 'Hóa đơn', icon: DollarSign, badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : null },
    { id: 'meters', label: 'Đồng hồ điện nước', icon: Zap },
    { id: 'issues', label: 'Sự cố', icon: Wrench, badge: activeIssuesCount > 0 ? activeIssuesCount : null },
    { id: 'security', label: 'An ninh', icon: ShieldCheck },
    { id: 'pricing', label: 'Giá & Thông báo', icon: Tag },
    { id: 'profile', label: 'Cài đặt hồ sơ', icon: UserCog },
  ];

  // Tenant Navigation Links
  const tenantLinks: SidebarLink[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'meters', label: 'Điện nước IoT', icon: Zap },
    { id: 'invoices', label: 'Hóa đơn & VietQR', icon: DollarSign, badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : null },
    { id: 'contract', label: 'Hợp đồng thuê', icon: FileText },
    { id: 'security', label: 'Khóa cửa & Mã PIN', icon: ShieldCheck },
    { id: 'issues', label: 'Báo sự cố hư hỏng', icon: Wrench },
    { id: 'join', label: 'Nhập mã chủ trọ', icon: KeyRound },
    { id: 'profile', label: 'Cài đặt hồ sơ', icon: UserCog },
  ];

  // Admin Navigation Links
  const adminLinks: SidebarLink[] = [
    { id: 'dashboard', label: 'Quản trị hệ thống', icon: Shield },
    { id: 'profile', label: 'Cài đặt hồ sơ', icon: UserCog },
  ];

  const currentLinks: SidebarLink[] = 
    currentUser.role === 'landlord' ? landlordLinks :
    currentUser.role === 'tenant' ? tenantLinks : adminLinks;

  const getRoleBadgeLabel = (role: UserRole) => {
    switch (role) {
      case 'landlord': return 'Chủ nhà';
      case 'tenant': return 'Khách thuê';
      case 'admin': return 'Quản trị viên';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top: Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center p-1.5 text-blue-600 shadow-xs">
              <AppLogo className="w-full h-full" color="#2563eb" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm leading-tight uppercase">
                Hệ Thống Quản Lý Trọ
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {currentUser.role === 'tenant' && !currentUser.landlordId && !joinRequests.some((r) => r.tenantId === currentUser.id)
                  ? 'Chưa kết nối trọ'
                  : settings.houseName}
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Host Code Quick Display for Landlord */}
        {currentUser.role === 'landlord' && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-center justify-between">
            <div className="text-[11px]">
              <span className="text-slate-500">Mã kết nối: </span>
              <span className="font-bold text-emerald-800 font-mono">{settings.hostCode}</span>
            </div>
            <button
              onClick={handleCopyHostCode}
              title="Sao chép mã chủ trọ"
              className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium px-2 py-0.5 rounded bg-emerald-100/70"
            >
              {copiedCode ? 'Đã chép' : 'Chép'}
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            // Map tab if landlord clicks 'all_tenants'
            const targetTab = link.id === 'all_tenants' ? 'tenants' : link.id;
            const isActive = activeTab === targetTab;

            return (
              <button
                key={link.id}
                onClick={() => {
                  onNavigateTab(targetTab);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-2 border-emerald-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </div>

                {link.badge && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded-full">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom: Role Switcher & Account Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {getRoleBadgeLabel(currentUser.role)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="text-[11px] text-slate-600 hover:text-teal-700 font-medium hover:underline cursor-pointer"
                title="Đổi tài khoản / vai trò"
              >
                Đổi TK
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => {
                  if (window.confirm(`Bạn có chắc chắn muốn đăng xuất khỏi tài khoản ${currentUser.name}?`)) {
                    logout();
                  }
                }}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-3 h-3" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* User Profile Bar */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser.phone}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          </div>

        </div>

      </aside>

      {/* Role & Account Switcher Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Thông Tin Tài Khoản</h3>
                <p className="text-xs text-slate-500">Quản lý phiên làm việc & chuyển đổi tài khoản</p>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active User Profile */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-11 h-11 rounded-xl object-cover border border-slate-300" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</div>
                <div className="text-xs text-slate-500">{currentUser.phone} • {currentUser.email}</div>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase">
                  {currentUser.role === 'landlord' ? 'Chủ Nhà' : currentUser.role === 'tenant' ? 'Khách Thuê' : 'Quản Trị'}
                </span>
              </div>
            </div>

            {/* Registered Users List (if more than 1) */}
            {users.length > 1 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Chuyển sang tài khoản khác:
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUserById(u.id);
                        setIsRoleModalOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors border ${
                        u.id === currentUser.id
                          ? 'bg-teal-50/80 border-teal-400 text-teal-950 font-bold'
                          : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover border border-slate-200" />
                        <div>
                          <div className="text-xs font-bold">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {u.role === 'tenant' ? 'Khách thuê' : u.role === 'landlord' ? 'Chủ trọ' : 'Admin'} • {u.phone}
                          </div>
                        </div>
                      </div>
                      {u.id === currentUser.id && <Check className="w-4 h-4 text-teal-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Logout and Clear Data Option */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsRoleModalOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold transition-colors border border-rose-200"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                Đăng Xuất Khỏi Hệ Thống
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Xóa sạch toàn bộ dữ liệu và đưa hệ thống về trạng thái ban đầu?')) {
                    resetAllData();
                    setIsRoleModalOpen(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Xóa toàn bộ dữ liệu & Đặt lại
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
