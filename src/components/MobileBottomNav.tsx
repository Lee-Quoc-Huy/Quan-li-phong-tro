import React from 'react';
import { useRental } from '../context/RentalContext';
import { 
  Home, 
  DoorClosed, 
  Users, 
  DollarSign, 
  Zap, 
  ShieldCheck, 
  Menu,
  FileText,
  UserPlus,
  Wrench,
  Tag,
  KeyRound,
  Shield,
  UserCog
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigateTab,
  onOpenMenu,
}) => {
  const { currentUser, joinRequests, issues, invoices } = useRental();

  const pendingJoinCount = joinRequests.filter((r) => r.status === 'pending').length;
  const activeIssuesCount = issues.filter((i) => i.status !== 'resolved').length;
  const pendingInvoicesCount = invoices.filter((i) => i.status === 'pending').length;

  // Define primary bottom bar items depending on role
  let navItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | null;
  }> = [];

  if (currentUser.role === 'tenant') {
    navItems = [
      { id: 'dashboard', label: 'Trang chủ', icon: Home },
      { id: 'invoices', label: 'Hóa đơn', icon: DollarSign, badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : null },
      { id: 'meters', label: 'Điện nước', icon: Zap },
      { id: 'security', label: 'Cửa & PIN', icon: ShieldCheck },
    ];
  } else if (currentUser.role === 'landlord') {
    navItems = [
      { id: 'dashboard', label: 'Tổng quan', icon: Home },
      { id: 'rooms', label: 'Phòng trọ', icon: DoorClosed },
      { id: 'tenants', label: 'Yêu cầu', icon: UserPlus, badge: pendingJoinCount > 0 ? pendingJoinCount : null },
      { id: 'invoices', label: 'Hóa đơn', icon: DollarSign, badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : null },
      { id: 'meters', label: 'Điện nước', icon: Zap },
    ];
  } else {
    // Admin
    navItems = [
      { id: 'dashboard', label: 'Quản trị', icon: Shield },
      { id: 'profile', label: 'Hồ sơ', icon: UserCog },
    ];
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigateTab(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all relative ${
              isActive
                ? 'text-teal-700 font-bold bg-teal-50/80 scale-105'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-amber-500 text-white text-[9px] font-bold rounded-full border border-white">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] mt-0.5 leading-tight truncate max-w-[64px]">
              {item.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-teal-600 mt-0.5" />
            )}
          </button>
        );
      })}

      {/* Menu Drawer Toggle Button */}
      <button
        onClick={onOpenMenu}
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
      >
        <Menu className="w-5 h-5 text-slate-500" />
        <span className="text-[10px] mt-0.5 leading-tight">Danh mục</span>
      </button>
    </nav>
  );
};
