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
  UserCog,
  RefreshCw
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
    logout,
    settings, 
    currentHouseName,
    joinRequests, 
    issues, 
    invoices, 
    unreadNotifsCount,
    regenerateHostCode
  } = useRental();

  const [copiedCode, setCopiedCode] = useState(false);

  const pendingJoinCount = joinRequests.filter((r) => r.status === 'pending').length;
  const activeIssuesCount = issues.filter((i) => i.status !== 'resolved').length;
  const pendingInvoicesCount = invoices.filter((i) => i.status === 'pending').length;

  const handleCopyHostCode = () => {
    navigator.clipboard.writeText(settings.hostCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRandomizeHostCode = () => {
    if (window.confirm('Tạo lại Mã Chủ Trọ ngẫu nhiên mới?\n\nMã cũ sẽ bị hủy. Khách thuê mới cần nhập mã mới để gửi yêu cầu tham gia.')) {
      const newCode = regenerateHostCode();
      alert(`Mã Chủ Trọ mới của bạn là: ${newCode}`);
    }
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
              <div className="font-bold text-slate-900 text-sm leading-tight uppercase truncate max-w-[150px]">
                {currentUser.role === 'admin' 
                  ? 'Quản Trị Hệ Thống' 
                  : (currentUser.role === 'tenant' && !currentUser.landlordId) 
                    ? 'Chưa kết nối trọ' 
                    : currentHouseName}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {currentUser.role === 'admin'
                  ? 'Quản trị viên'
                  : (currentUser.role === 'tenant' && !currentUser.landlordId)
                    ? 'Vui lòng nhập mã để kết nối'
                    : 'Hệ Thống Quản Lý Trọ'}
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
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyHostCode}
                title="Sao chép mã chủ trọ"
                className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium px-2 py-0.5 rounded bg-emerald-100/70"
              >
                {copiedCode ? 'Đã chép' : 'Chép'}
              </button>
              <button
                onClick={handleRandomizeHostCode}
                title="Đổi/Tạo mã ngẫu nhiên mới"
                className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium p-1 rounded bg-emerald-100/70"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
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
    </>
  );
};
