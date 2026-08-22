import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { ADMIN_USER } from '../../mockData';
import { SystemFeatureFlags } from '../../types';
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
  AlertTriangle,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Zap,
  Droplets,
  FileText,
  CreditCard,
  FileCheck,
  Wrench,
  Sheet,
  MessageSquareWarning,
  Bell,
  Sparkles,
  Key,
  ShieldCheck,
  UserCheck,
  Building2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Layers,
  Trash2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    users, 
    rooms, 
    invoices, 
    issues, 
    complaints,
    securityLogs, 
    settings, 
    updateFeatureFlags,
    getFeatureFlagsForLandlord,
    triggerEmergencyAlarm, 
    dismissEmergencyAlarm,
    toggleUserLock,
    deleteUser,
    deleteAllNonAdminUsers,
    resolveComplaint,
    resetAllData 
  } = useRental();

  const [activeTab, setActiveTab] = useState<'features' | 'users' | 'complaints' | 'system'>('features');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState('');

  const landlords = users.filter((u) => u.role === 'landlord');
  const tenants = users.filter((u) => u.role === 'tenant');
  const totalVolume = invoices.reduce((acc, i) => acc + i.totalAmount, 0);

  // Selected landlord for feature flags tab
  const [selectedLandlordId, setSelectedLandlordId] = useState<string>('');

  // Auto select first landlord if available and none selected
  const activeLandlord = landlords.find((l) => l.id === selectedLandlordId) || landlords[0];
  const activeLandlordId = activeLandlord ? activeLandlord.id : (settings.landlordId || 'default_host');

  // Active feature flags for selected landlord
  const flags: SystemFeatureFlags = getFeatureFlagsForLandlord(activeLandlordId);

  const handleToggle = (key: keyof SystemFeatureFlags) => {
    const updatedValue = !flags[key];
    updateFeatureFlags({ [key]: updatedValue }, activeLandlordId);
    const targetName = activeLandlord ? activeLandlord.name : 'Chủ trọ';
    setStatusMessage(`Đã ${updatedValue ? 'BẬT' : 'TẮT'} tính năng cho "${targetName}" thành công!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const applyPreset = (type: 'all' | 'starter' | 'security_only') => {
    let presetFlags: Partial<SystemFeatureFlags> = {};
    if (type === 'all') {
      presetFlags = {
        enableSmartDoorLock: true,
        enableAutoGate: true,
        enableIoTMeters: true,
        enableAutoBilling: true,
        enableVietQR: true,
        enableDigitalContracts: true,
        enableIssueTickets: true,
        enableGoogleSheetSync: true,
        enableComplaints: true,
        enableEmergencyAlarm: true,
      };
    } else if (type === 'starter') {
      presetFlags = {
        enableSmartDoorLock: false,
        enableAutoGate: false,
        enableIoTMeters: true,
        enableAutoBilling: true,
        enableVietQR: true,
        enableDigitalContracts: true,
        enableIssueTickets: true,
        enableGoogleSheetSync: false,
        enableComplaints: true,
        enableEmergencyAlarm: false,
      };
    } else if (type === 'security_only') {
      presetFlags = {
        enableSmartDoorLock: true,
        enableAutoGate: true,
        enableIoTMeters: false,
        enableAutoBilling: false,
        enableVietQR: false,
        enableDigitalContracts: false,
        enableIssueTickets: true,
        enableGoogleSheetSync: false,
        enableComplaints: true,
        enableEmergencyAlarm: true,
      };
    }

    updateFeatureFlags(presetFlags, activeLandlordId);
    const targetName = activeLandlord ? activeLandlord.name : 'Chủ trọ';
    setStatusMessage(`Đã áp dụng mẫu cấu hình tính năng cho "${targetName}"!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const featureList: Array<{
    key: keyof SystemFeatureFlags;
    name: string;
    description: string;
    category: 'iot_security' | 'billing_ops' | 'services';
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      key: 'enableSmartDoorLock',
      name: 'Khóa cửa phòng thông minh IoT',
      description: 'Cho phép chủ trọ và khách thuê đóng/mở cửa phòng từ xa, thay đổi mã PIN số và kiểm tra trạng thái khóa thời gian thực.',
      category: 'iot_security',
      icon: <Lock className="w-5 h-5" />,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      key: 'enableAutoGate',
      name: 'Cổng chính thông minh & Tự động đóng mở',
      description: 'Lịch trình tự động khóa/mở cổng chính theo giờ giới nghiêm (23:00 - 05:30) và remote mở cổng cho khách thuê.',
      category: 'iot_security',
      icon: <Key className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      key: 'enableIoTMeters',
      name: 'Đo điện nước thời gian thực & Cảnh báo AI',
      description: 'Thu thập chỉ số kWh điện và m³ nước liên tục, vẽ biểu đồ tiêu thụ theo giờ và phát hiện rò rỉ hoặc quá tải.',
      category: 'iot_security',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      key: 'enableAutoBilling',
      name: 'Tự động tính toán & Lập hóa đơn AI',
      description: 'Tự động chốt số điện nước ngày 25 hàng tháng, tính thành tiền theo đơn giá và xuất hóa đơn chi tiết cho từng phòng.',
      category: 'billing_ops',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      key: 'enableVietQR',
      name: 'Cổng thanh toán quét mã VietQR Napas',
      description: 'Sinh mã QR chuyển khoản ngân hàng động kèm sẵn số tiền và nội dung hóa đơn để khách thuê chuyển khoản tức thì.',
      category: 'billing_ops',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      key: 'enableDigitalContracts',
      name: 'Hợp đồng thuê điện tử & Chữ ký số',
      description: 'Quản lý thời hạn thuê phòng, tiền đặt cọc, thanh toán trả trước và điều khoản cam kết số hóa giữa hai bên.',
      category: 'billing_ops',
      icon: <FileCheck className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      key: 'enableIssueTickets',
      name: 'Phiếu báo hỏng & Sửa chữa kỹ thuật',
      description: 'Khách thuê gửi yêu cầu sửa chữa (điện, nước, điều hòa, khóa cửa) kèm ảnh chụp; chủ trọ tiếp nhận và cập nhật tiến độ.',
      category: 'services',
      icon: <Wrench className="w-5 h-5" />,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    {
      key: 'enableGoogleSheetSync',
      name: 'Đồng bộ Google Sheets & Apps Script Webhook',
      description: 'Tự động đẩy danh sách khách thuê, hóa đơn và phòng trọ sang bảng tính Google Sheets của chủ nhà.',
      category: 'services',
      icon: <Sheet className="w-5 h-5" />,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      key: 'enableComplaints',
      name: 'Kênh phản ánh vi phạm & Tiếng ồn',
      description: 'Cho phép cư dân gửi phản ánh tranh chấp, ồn ào hoặc góp ý lên trực tiếp ban quản trị và chủ trọ.',
      category: 'services',
      icon: <MessageSquareWarning className="w-5 h-5" />,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      key: 'enableEmergencyAlarm',
      name: 'Báo động an ninh khẩn cấp',
      description: 'Hệ thống chuông báo động diện rộng khi xảy ra sự cố đột nhập, cháy nổ hoặc cảnh báo an ninh toàn khu trọ.',
      category: 'iot_security',
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
  ];

  const activeFlagsCount = Object.values(flags).filter(Boolean).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản Trị Hệ Thống
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-teal-400 text-xs font-bold font-mono">
              ROOT ADMIN
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Tài khoản: <strong className="text-slate-800">60.wuy.lii.06@gmail.com</strong> (Lê Quốc Huy) • Quản lý & Cấu hình tính năng theo nhu cầu chủ trọ
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
              <ShieldAlert className="w-4 h-4" /> Báo Động Khẩn Cấp
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeFlagsCount} / {featureList.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Tính năng đang được BẬT cho dãy trọ
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {rooms.length} phòng
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {rooms.filter(r => r.status === 'occupied').length} phòng đang có khách ở
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {users.length} tài khoản
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {landlords.length} Chủ trọ • {tenants.length} Khách thuê
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
              Tổng sản lượng hóa đơn phát hành
            </div>
          </div>
        </div>

      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('features')}
          className={`pb-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'features'
              ? 'border-teal-600 text-teal-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4 text-teal-600" />
          <span>Bật / Tắt Tính Năng Cho Chủ Trọ</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-800">
            {activeFlagsCount}/{featureList.length} Bật
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-teal-600 text-teal-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh Sách Tài Khoản ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`pb-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'complaints'
              ? 'border-teal-600 text-teal-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquareWarning className="w-4 h-4" />
          <span>Ý Kiến & Khiếu Nại ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-teal-600 text-teal-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Bảo Trì & Dữ Liệu</span>
        </button>
      </div>

      {/* TAB 1: FEATURE TOGGLES MANAGEMENT */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          
          {/* Landlord Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  1. Chọn Chủ Trọ Để Cấu Hình Tính Năng Riêng Biệt
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {landlords.length} Chủ trọ trên hệ thống
              </span>
            </div>

            {landlords.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                Chưa có tài khoản Chủ trọ nào đăng ký. Cấu hình bên dưới sẽ áp dụng làm mặc định chung cho hệ thống.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {landlords.map((l) => {
                  const isSelected = (l.id === activeLandlordId);
                  const lFlags = getFeatureFlagsForLandlord(l.id);
                  const activeCount = Object.values(lFlags).filter(Boolean).length;

                  return (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLandlordId(l.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={l.avatar}
                          alt={l.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs truncate">
                            {l.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Mã: <span className="font-mono font-bold text-teal-700">{l.hostCode || settings.hostCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {activeCount}/10 BẬT
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Header & Quick Preset Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h2 className="font-bold text-slate-900 text-sm">
                  2. Cấu Hình Tính Năng Riêng Cho: <span className="text-teal-700 underline font-extrabold">{activeLandlord?.name || 'Chủ trọ'}</span>
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl">
                Với tư cách Admin, các thiết lập tính năng dưới đây <strong>chỉ áp dụng riêng cho Chủ trọ được chọn</strong> và hoàn toàn không ảnh hưởng đến các chủ trọ khác.
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500">Mẫu nhanh:</span>
              <button
                onClick={() => applyPreset('all')}
                className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors"
              >
                Gói Đầy Đủ (100%)
              </button>
              <button
                onClick={() => applyPreset('starter')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
              >
                Gói Cơ Bản (Hóa đơn + Điện nước)
              </button>
              <button
                onClick={() => applyPreset('security_only')}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors"
              >
                Gói An Ninh IoT
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureList.map((feat) => {
              const isEnabled = flags[feat.key];

              return (
                <div
                  key={feat.key}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isEnabled
                      ? 'bg-white border-slate-200/90 shadow-2xs hover:border-teal-300'
                      : 'bg-slate-50/70 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isEnabled ? feat.color : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}>
                        {feat.icon}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">
                            {feat.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span className={`text-xs font-bold ${isEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {isEnabled ? `Đang BẬT cho ${activeLandlord?.name || 'Chủ trọ'}` : 'Đang TẮT (Ẩn khỏi giao diện)'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggle(feat.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-teal-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: USERS LIST (HIERARCHICAL / GROUPED BY LANDLORD) */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Search & Header Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                Danh Sách Tài Khoản Hệ Thống ({users.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tài khoản được phân nhóm theo từng Chủ Trọ và danh sách Khách Thuê trực thuộc
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                placeholder="Tìm theo tên, SĐT, CCCD, Mã dãy trọ..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64"
              />

              <button
                onClick={() => {
                  if (window.confirm('CẢNH BÁO QUAN TRỌNG:\n\nBạn có chắc chắn muốn XÓA TẤT CẢ các tài khoản (Chủ trọ, Khách thuê) trong hệ thống không?\n\nChỉ duy nhất tài khoản Quản Trị Viên (Admin) sẽ được giữ lại. Mọi dữ liệu phòng trọ và tài khoản liên quan sẽ bị xóa sạch.')) {
                    deleteAllNonAdminUsers();
                    setStatusMessage('Đã xóa toàn bộ tất cả tài khoản thành công! Chỉ giữ lại tài khoản Admin.');
                    setTimeout(() => setStatusMessage(null), 4000);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                title="Xóa sạch mọi tài khoản trừ Admin"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Tất Cả (Trừ Admin)</span>
              </button>
            </div>
          </div>

          {/* GROUP 1: ROOT ADMIN */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Ban Quản Trị Hệ Thống (Root Admin)
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <img src={ADMIN_USER.avatar} alt="Admin" className="w-11 h-11 rounded-xl object-cover border-2 border-teal-400" />
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    Lê Quốc Huy (Admin)
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold border border-teal-500/40">
                      60.wuy.lii.06@gmail.com
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    SĐT: 0918889999 • CCCD: 079206008899 • Quyền hạn: Toàn quyền quản trị hệ thống
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30 self-start sm:self-center">
                HOẠT ĐỘNG
              </span>
            </div>
          </div>

          {/* GROUP 2: LANDLORDS & THEIR DIRECT TENANTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-600" />
                Danh Sách Chủ Trọ & Khách Thuê Trực Thuộc ({landlords.length} Chủ trọ)
              </h3>
            </div>

            {landlords.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 space-y-2">
                <Building className="w-8 h-8 mx-auto text-slate-300" />
                <div>Chưa có chủ trọ nào đăng ký trên hệ thống.</div>
              </div>
            ) : (
              landlords
                .filter(l => 
                  !searchUser || 
                  l.name.toLowerCase().includes(searchUser.toLowerCase()) || 
                  l.phone.includes(searchUser) ||
                  (l.email && l.email.toLowerCase().includes(searchUser.toLowerCase())) ||
                  (l.hostCode && l.hostCode.toLowerCase().includes(searchUser.toLowerCase()))
                )
                .map((l) => {
                  // Find tenants belonging to this landlord
                  const landlordTenants = users.filter(
                    (u) => u.role === 'tenant' && (u.landlordId === l.id || (!u.landlordId && l.id === landlords[0]?.id))
                  );

                  const filteredTenants = landlordTenants.filter(
                    (t) =>
                      !searchUser ||
                      t.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                      t.phone.includes(searchUser) ||
                      (t.email && t.email.toLowerCase().includes(searchUser.toLowerCase())) ||
                      (t.idCard && t.idCard.includes(searchUser))
                  );

                  return (
                    <div key={l.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                      
                      {/* Landlord Header Box */}
                      <div className="p-4 bg-teal-50/50 border-b border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <img src={l.avatar} alt={l.name} className="w-11 h-11 rounded-xl object-cover border border-teal-200 shadow-2xs" />
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{l.name}</span>
                              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase">
                                Chủ Trọ
                              </span>
                              {l.hostCode && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 font-mono text-[10px] font-bold">
                                  Mã: {l.hostCode}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              SĐT: <strong className="text-slate-800">{l.phone}</strong> • Email: {l.email || 'N/A'} • Ngày tham gia: {l.joinedAt}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 text-xs font-bold">
                            {landlordTenants.length} Khách thuê
                          </span>

                          <button
                            onClick={() => {
                              toggleUserLock(l.id);
                              setStatusMessage(`Đã ${l.status === 'locked' ? 'mở khóa' : 'khóa'} tài khoản ${l.name}!`);
                              setTimeout(() => setStatusMessage(null), 3000);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                              l.status === 'locked'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {l.status === 'locked' ? 'Mở Khóa' : 'Khóa'}
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`XÁC NHẬN XÓA TÀI KHOẢN CHỦ TRỌ:\n\nBạn có chắc chắn muốn xóa vĩnh viễn chủ trọ "${l.name}" (${l.phone}) khỏi hệ thống không?`)) {
                                deleteUser(l.id);
                                setStatusMessage(`Đã xóa vĩnh viễn tài khoản ${l.name}!`);
                                setTimeout(() => setStatusMessage(null), 3000);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>

                      {/* Direct Tenants Nested List */}
                      <div className="p-4 bg-slate-50/40 space-y-3">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Danh sách khách thuê thuộc dãy trọ của {l.name} ({filteredTenants.length}):
                        </div>

                        {filteredTenants.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 italic bg-white rounded-xl border border-slate-200/60">
                            Chưa có khách thuê nào đăng ký hoặc được duyệt vào dãy trọ này.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredTenants.map((t) => {
                              const myRoom = rooms.find((r) => r.id === t.roomId || r.currentTenantId === t.id);

                              return (
                                <div
                                  key={t.id}
                                  className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                        <span>{t.name}</span>
                                        {myRoom && (
                                          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                                            {myRoom.roomNumber}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                                        SĐT: <strong className="text-slate-700">{t.phone}</strong> • CCCD: {t.idCard || 'Chưa cập nhật'}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => {
                                        toggleUserLock(t.id);
                                        setStatusMessage(`Đã ${t.status === 'locked' ? 'mở khóa' : 'khóa'} tài khoản ${t.name}!`);
                                        setTimeout(() => setStatusMessage(null), 3000);
                                      }}
                                      className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                                        t.status === 'locked'
                                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                      }`}
                                    >
                                      {t.status === 'locked' ? 'Mở Khóa' : 'Khóa'}
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Xóa vĩnh viễn khách thuê "${t.name}" (${t.phone})?`)) {
                                          deleteUser(t.id);
                                          setStatusMessage(`Đã xóa tài khoản ${t.name}!`);
                                          setTimeout(() => setStatusMessage(null), 3000);
                                        }
                                      }}
                                      className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 transition-colors"
                                      title="Xóa khách thuê"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
            )}
          </div>

          {/* GROUP 3: UNASSIGNED / UNVERIFIED USERS */}
          {(() => {
            const unassignedList = users.filter(
              (u) =>
                u.role === 'tenant' &&
                !u.landlordId &&
                landlords.every((l) => l.id !== u.landlordId)
            );

            const filteredUnassigned = unassignedList.filter(
              (u) =>
                !searchUser ||
                u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                u.phone.includes(searchUser) ||
                (u.email && u.email.toLowerCase().includes(searchUser.toLowerCase()))
            );

            return (
              <div className="bg-white rounded-2xl border border-amber-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Tài Khoản Chưa Xác Minh / Chưa Thuộc Chủ Trọ Nào ({unassignedList.length})
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                    Cần ghép trọ / Xác minh
                  </span>
                </div>

                {filteredUnassigned.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic">
                    Không có tài khoản nào chưa thuộc chủ trọ hoặc đang chờ xác minh.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {filteredUnassigned.map((u) => (
                      <div key={u.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              {u.name}
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.2 rounded-full">
                                Chưa có Chủ trọ
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              SĐT: <strong className="text-slate-700">{u.phone}</strong> • Email: {u.email || 'N/A'} • CCCD: {u.idCard || 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => {
                              toggleUserLock(u.id);
                              setStatusMessage(`Đã ${u.status === 'locked' ? 'mở khóa' : 'khóa'} tài khoản ${u.name}!`);
                              setTimeout(() => setStatusMessage(null), 3000);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                              u.status === 'locked'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {u.status === 'locked' ? 'Mở Khóa' : 'Khóa'}
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Xác nhận xóa tài khoản "${u.name}" (${u.phone})?`)) {
                                deleteUser(u.id);
                                setStatusMessage(`Đã xóa vĩnh viễn tài khoản ${u.name}!`);
                                setTimeout(() => setStatusMessage(null), 3000);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      )}

      {/* TAB 3: COMPLAINTS & REPORTS */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <h2 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Kênh Phản Ánh & Khiếu Nại Của Cư Dân
          </h2>

          {complaints.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <MessageSquareWarning className="w-8 h-8 mx-auto text-slate-300" />
              <div>Chưa có khiếu nại hoặc phản ánh nào từ người dùng.</div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {complaints.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 text-sm">{c.title}</div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status === 'resolved' ? 'Đã giải quyết' : 'Đang xử lý'}
                    </span>
                  </div>
                  <p className="text-slate-600">{c.content}</p>
                  <div className="text-[11px] text-slate-400">
                    Người gửi: {c.userName} ({c.userRole}) • {c.createdAt}
                  </div>
                  {c.status !== 'resolved' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          const resp = window.prompt('Nhập phản hồi từ Admin:', 'Ban quản trị đã tiếp nhận và giải quyết xong.');
                          if (resp) resolveComplaint(c.id, resp);
                        }}
                        className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                      >
                        Đánh dấu Đã xử lý
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SYSTEM MAINTENANCE */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 text-xs">
          <div className="space-y-2">
            <h2 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Công Cụ Đặt Lại & Bảo Trì Hệ Thống
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Xóa sạch toàn bộ dữ liệu tạm trên trình duyệt và đưa hệ thống về trạng thái sạch sẽ ban đầu. Tài khoản Admin gốc (<code className="text-teal-700 font-bold font-mono">60.wuy.lii.06@gmail.com</code>) sẽ luôn được bảo tồn.
            </p>
          </div>

          <div className="pt-3">
            <button
              onClick={() => {
                if (window.confirm('Khôi phục toàn bộ hệ thống về trạng thái ban đầu?')) {
                  resetAllData();
                  setStatusMessage('Đã đặt lại dữ liệu hệ thống thành công!');
                  setTimeout(() => setStatusMessage(null), 3000);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold inline-flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-teal-400" />
              <span>Khôi Phục Dữ Liệu Về Mặc Định</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
