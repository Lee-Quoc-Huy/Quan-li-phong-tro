import React, { useState } from 'react';
import { RentalProvider, useRental } from './context/RentalContext';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { NotificationDrawer } from './components/Common/NotificationDrawer';
import { EmergencyAlertModal } from './components/Common/EmergencyAlertModal';

// Tenant Components
import { TenantDashboard } from './components/RoleTenant/TenantDashboard';
import { TenantMeters } from './components/RoleTenant/TenantMeters';
import { TenantInvoices } from './components/RoleTenant/TenantInvoices';
import { TenantContract } from './components/RoleTenant/TenantContract';
import { TenantSecurity } from './components/RoleTenant/TenantSecurity';
import { TenantIssues } from './components/RoleTenant/TenantIssues';
import { TenantJoinHost } from './components/RoleTenant/TenantJoinHost';

// Landlord Components
import { LandlordDashboard } from './components/RoleLandlord/LandlordDashboard';
import { LandlordRooms } from './components/RoleLandlord/LandlordRooms';
import { LandlordTenants } from './components/RoleLandlord/LandlordTenants';
import { LandlordPricing } from './components/RoleLandlord/LandlordPricing';
import { LandlordInvoices } from './components/RoleLandlord/LandlordInvoices';
import { LandlordMeters } from './components/RoleLandlord/LandlordMeters';
import { LandlordSecurity } from './components/RoleLandlord/LandlordSecurity';
import { LandlordIssues } from './components/RoleLandlord/LandlordIssues';

// Admin Component
import { AdminDashboard } from './components/RoleAdmin/AdminDashboard';
import { AuthPage } from './components/Auth/AuthPage';

const MainApp: React.FC = () => {
  const { currentUser, settings, isAuthenticated } = useRental();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Render role view contents
  const renderContent = () => {
    if (currentUser.role === 'admin') {
      return <AdminDashboard />;
    }

    if (currentUser.role === 'tenant') {
      switch (activeTab) {
        case 'meters':
          return <TenantMeters />;
        case 'invoices':
          return <TenantInvoices />;
        case 'contract':
          return <TenantContract />;
        case 'security':
          return <TenantSecurity />;
        case 'issues':
          return <TenantIssues />;
        case 'join':
          return <TenantJoinHost />;
        case 'dashboard':
        default:
          return <TenantDashboard onNavigateTab={setActiveTab} />;
      }
    }

    if (currentUser.role === 'landlord') {
      switch (activeTab) {
        case 'rooms':
          return <LandlordRooms />;
        case 'tenants':
          return <LandlordTenants />;
        case 'pricing':
          return <LandlordPricing />;
        case 'invoices':
          return <LandlordInvoices />;
        case 'meters':
          return <LandlordMeters />;
        case 'security':
          return <LandlordSecurity />;
        case 'issues':
          return <LandlordIssues />;
        case 'dashboard':
        default:
          return <LandlordDashboard onNavigateTab={setActiveTab} />;
      }
    }

    return <TenantDashboard onNavigateTab={setActiveTab} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500 selection:text-white flex">
      
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Mobile Header (Hidden on lg screens) */}
        <MobileHeader
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        />

        {/* Content Container */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {renderContent()}
        </main>

        {/* Minimal Clean Footer */}
        <footer className="w-full border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-400">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong>Quản lí nhà trọ</strong> • Hệ thống Quản lý dãy trọ thông minh & Khóa IoT
            </div>
            <div className="text-[11px] text-slate-400">
              Đồ án Môn học: Phân tích & Thiết kế Hệ thống
            </div>
          </div>
        </footer>

      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />

      {/* Emergency modal if active */}
      <EmergencyAlertModal />

    </div>
  );
};

export function App() {
  return (
    <RentalProvider>
      <MainApp />
    </RentalProvider>
  );
}

export default App;
