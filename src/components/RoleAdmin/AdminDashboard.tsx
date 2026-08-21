import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Shield, 
  Users, 
  Building, 
  DollarSign, 
  ShieldAlert, 
  RefreshCw,
  Lock, 
  Unlock, 
  Check, 
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    users, 
    rooms, 
    invoices, 
    issues, 
    securityLogs, 
    settings, 
    updateSystemSettings, 
    triggerEmergencyAlarm, 
    dismissEmergencyAlarm,
    resetAllData 
  } = useRental();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'security' | 'system'>('overview');
  const [globalPanicText, setGlobalPanicText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const landlords = users.filter((u) => u.role === 'landlord');
  const tenants = users.filter((u) => u.role === 'tenant');
  const totalVolume = invoices.reduce((acc, i) => acc + i.totalAmount, 0);

  const handleGlobalPanic = (e: React.FormEvent) => {
    e.preventDefault();
    triggerEmergencyAlarm(globalPanicText || 'Cảnh báo khẩn cấp từ Trung tâm Quản trị Hệ thống!');
    setGlobalPanicText('');
    setStatusMessage('Đã kích hoạt cảnh báo an ninh toàn hệ thống!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản Trị Hệ Thống
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              Root Admin
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Giám sát vận hành dãy trọ, tài khoản người dùng và cảm biến IoT
          </p>
        </div>

        <div className="flex items-center gap-2">
          {settings.emergencyAlarmActive ? (
            <button
              onClick={dismissEmergencyAlarm}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              Tắt Báo Động
            </button>
          ) : (
            <button
              onClick={() => {
                const text = window.prompt('Nhập lý do kích hoạt báo động toàn hệ thống:', 'Cảnh báo an ninh toàn khu vực từ Ban Quản Trị!');
                if (text) triggerEmergencyAlarm(text);
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <ShieldAlert className="w-4 h-4" /> Báo Động Toàn Dãy
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {rooms.length} phòng
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {rooms.filter(r => r.status === 'occupied').length} đang cho thuê
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {users.length} tài khoản
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {landlords.length} chủ trọ • {tenants.length} khách thuê
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {totalVolume.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Tổng sản lượng hóa đơn ({invoices.length} bản ghi)
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {settings.hostCode}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Mã kết nối trọ (Host Code)
            </div>
          </div>
        </div>

      </div>

      {/* Users Table & Reset Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <h2 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Danh Sách Người Dùng Hệ Thống
          </h2>

          <div className="divide-y divide-slate-100 text-xs">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-slate-200" />
                  <div>
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-slate-400 text-[11px]">{u.phone} • CCCD: {u.idCard}</div>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  u.role === 'admin'
                    ? 'bg-purple-50 text-purple-700'
                    : u.role === 'landlord'
                    ? 'bg-teal-50 text-teal-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {u.role === 'admin' ? 'Quản Trị Viên' : u.role === 'landlord' ? 'Chủ Nhà Trọ' : 'Khách Thuê'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance / Reset Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 text-xs flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Công Cụ Bảo Trì Hệ Thống
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Khôi phục lại dữ liệu mẫu đồ án ban đầu, làm mới chỉ số đồng hồ điện nước, xóa sạch hóa đơn thử nghiệm và thiết lập lại an ninh.
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn đặt lại dữ liệu hệ thống về mặc định đồ án ban đầu?')) {
                resetAllData();
                setStatusMessage('Đã khôi phục toàn bộ dữ liệu hệ thống về mặc định!');
                setTimeout(() => setStatusMessage(null), 3000);
              }
            }}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Khôi Phục Dữ Liệu Mẫu</span>
          </button>
        </div>

      </div>

    </div>
  );
};
