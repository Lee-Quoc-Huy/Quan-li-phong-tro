import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { UserRole } from '../../types';
import { 
  Building2, 
  Home, 
  Shield, 
  LogIn, 
  UserPlus, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  KeyRound, 
  QrCode, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  MapPin
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, loginAsDemoUser, registerUser, users } = useRental();

  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole | 'all'>('all');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Register form state
  const [regRole, setRegRole] = useState<UserRole>('tenant');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regIdCard, setRegIdCard] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regHouseName, setRegHouseName] = useState('');
  const [regHouseAddress, setRegHouseAddress] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    if (!loginIdentifier.trim()) {
      setLoginError('Vui lòng nhập Số điện thoại hoặc Email!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(
        loginIdentifier, 
        loginPassword, 
        loginRole === 'all' ? undefined : loginRole
      );
      setIsSubmitting(false);

      if (!res.success) {
        setLoginError(res.message);
      } else {
        setLoginSuccess(res.message);
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regPhone.trim()) {
      setRegError('Vui lòng điền Họ tên và Số điện thoại!');
      return;
    }

    if (regRole === 'landlord' && !regHouseName.trim()) {
      setRegError('Vui lòng nhập Tên dãy trọ / khu căn hộ của bạn!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerUser({
        name: regName,
        phone: regPhone,
        email: regEmail,
        idCard: regIdCard,
        role: regRole,
        houseName: regHouseName,
        houseAddress: regHouseAddress,
      });
      setIsSubmitting(false);

      if (!res.success) {
        setRegError(res.message);
      }
    }, 500);
  };

  // Demo accounts list for fast 1-click preview
  const demoAccounts = [
    {
      userId: 'user_landlord_1',
      title: 'Chủ nhà trọ (Mẫu)',
      name: 'Nguyễn Văn Hùng',
      role: 'Chủ trọ Hoàng Gia' as const,
      roleType: 'landlord' as UserRole,
      badge: 'Quản lý 6 phòng',
      desc: 'Quản lý dãy trọ, chốt số điện nước IoT, gửi hóa đơn VietQR',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      icon: Building2,
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-950',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    },
    {
      userId: 'user_tenant_1',
      title: 'Khách thuê (Phòng 201)',
      name: 'Lê Minh Tuấn',
      role: 'Khách thuê phòng' as const,
      roleType: 'tenant' as UserRole,
      badge: 'Phòng 201 • Đã ký HĐ',
      desc: 'Theo dõi điện nước trực tiếp, thanh toán VietQR, mở khóa phòng',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      icon: Home,
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-950',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      userId: 'user_tenant_2',
      title: 'Khách thuê (Phòng 102)',
      name: 'Phạm Thu Hà',
      role: 'Khách thuê phòng' as const,
      roleType: 'tenant' as UserRole,
      badge: 'Phòng 102',
      desc: 'Xem công nợ, gửi báo cáo sự cố sửa chữa, đóng tiền phòng',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      icon: Users,
      color: 'border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-teal-950',
      btnColor: 'bg-teal-600 hover:bg-teal-700 text-white'
    },
    {
      userId: 'user_admin_1',
      title: 'Quản trị viên Hệ thống',
      name: 'Hoàng Đăng Khoa',
      role: 'Admin Master' as const,
      roleType: 'admin' as UserRole,
      badge: 'Toàn quyền',
      desc: 'Giám sát nhà trọ, cấp giấy phép sử dụng, xử lý khiếu nại',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      icon: Shield,
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-950',
      btnColor: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Top Brand Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-2xl shadow-lg shadow-teal-600/20">
          T
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Hệ thống quản lý nhà trọ
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Nền tảng số hóa quản lý phòng trọ, đồng hồ IoT & hóa đơn VietQR
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white shadow-xl rounded-3xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left / Main Auth Form (7 cols) */}
          <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <div>
              {/* Tab Switcher: Login vs Register */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('login');
                    setLoginError(null);
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeMode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-4 h-4 text-teal-600" />
                  Đăng Nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('register');
                    setRegError(null);
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeMode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-teal-600" />
                  Đăng Ký Mới
                </button>
              </div>

              {/* Login View */}
              {activeMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  
                  {/* Role filter quick buttons */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Vai trò đăng nhập:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'all', label: 'Tất cả', icon: Sparkles },
                        { id: 'landlord', label: 'Chủ nhà', icon: Building2 },
                        { id: 'tenant', label: 'Khách thuê', icon: Home },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLoginRole(item.id as UserRole | 'all')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1 transition-all ${
                            loginRole === item.id
                              ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <item.icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Phone / Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại / Email / Mã chủ trọ:
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="VD: 0918 293 847 hoặc hung.nguyen@..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Input Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Mật khẩu:
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[11px] text-teal-600 hover:text-teal-700 hover:underline font-medium"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Nhập mật khẩu (tùy chọn trong bản demo)"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Alerts */}
                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>{loginError}</div>
                    </div>
                  )}

                  {loginSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>{loginSuccess}</div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang xác thực...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Đăng Nhập Vào Hệ Thống
                      </>
                    )}
                  </button>

                </form>
              ) : (
                /* Register View */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  
                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tôi muốn đăng ký làm:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('tenant')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          regRole === 'tenant'
                            ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Home className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="text-xs">Khách thuê phòng</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('landlord')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          regRole === 'landlord'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="text-xs">Chủ nhà trọ mới</div>
                      </button>
                    </div>
                  </div>

                  {/* Personal info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Họ và tên *:
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="VD: Trần Văn Bình"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Số điện thoại *:
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="VD: 0905 123 456"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  {/* If landlord: Building Info */}
                  {regRole === 'landlord' && (
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                      <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                        Thông tin dãy trọ / Nhà trọ mới:
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                          Tên dãy trọ *:
                        </label>
                        <input
                          type="text"
                          value={regHouseName}
                          onChange={(e) => setRegHouseName(e.target.value)}
                          placeholder="VD: Dãy Trọ Bình An - Chi Nhánh 2"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                          Địa chỉ nhà trọ:
                        </label>
                        <input
                          type="text"
                          value={regHouseAddress}
                          onChange={(e) => setRegHouseAddress(e.target.value)}
                          placeholder="VD: 45/12 Kha Vạn Cân, TP. Thủ Đức"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Identification & Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Số CCCD (Định danh):
                      </label>
                      <input
                        type="text"
                        value={regIdCard}
                        onChange={(e) => setRegIdCard(e.target.value)}
                        placeholder="VD: 079201009182"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Mật khẩu tạo mới:
                      </label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {regError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>{regError}</div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang tạo tài khoản...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Hoàn Tất Đăng Ký & Đăng Nhập
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>

            {/* Quick Demo Switcher Prompt */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500">
                Chưa có tài khoản thật? Trải nghiệm ngay tài khoản demo ở bảng bên phải 👉
              </span>
            </div>

          </div>

          {/* Right Side: Fast 1-Click Demo Accounts (5 cols) */}
          <div className="p-6 sm:p-8 lg:col-span-5 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between space-y-4">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Đăng Nhập 1-Chạm (Demo)
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                  Dành cho Giám Khảo
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Bấm vào thẻ bên dưới để đăng nhập ngay mà không cần nhập mật khẩu:
              </p>

              {/* Demo Account Cards List */}
              <div className="space-y-2.5">
                {demoAccounts.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <div
                      key={acc.userId}
                      className={`p-3 rounded-2xl border transition-all ${acc.color} flex items-start justify-between gap-3`}
                    >
                      <div className="flex items-start gap-2.5">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-10 h-10 rounded-xl object-cover border border-white shadow-xs shrink-0 mt-0.5"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {acc.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-white border border-slate-200 shrink-0">
                              {acc.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                            {acc.desc}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => loginAsDemoUser(acc.userId)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs flex items-center gap-1 ${acc.btnColor} cursor-pointer`}
                      >
                        <span>Vào</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform Highlights */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-[11px] text-slate-600">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Các module sẵn sàng trải nghiệm:
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-slate-500">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> IoT Điện Nước Realtime
                </div>
                <div className="flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-teal-600" /> VietQR Napas Tự Động
                </div>
                <div className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-blue-500" /> Khóa Cửa & Cổng Số
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-purple-500" /> Phân Quyền 3 Vai Trò
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-teal-600" />
                Khôi Phục Mật Khẩu
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống hiện đang hoạt động ở chế độ Demo mô phỏng. Bạn có thể sử dụng tính năng <strong>Đăng nhập 1-chạm</strong> với bất kỳ tài khoản nào mà không cần nhập mật khẩu, hoặc liên hệ trực tiếp với Chủ nhà / Quản trị viên để đặt lại mã PIN.
            </p>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
              <strong>Hotline hỗ trợ kỹ thuật:</strong> 1900 8899 (Trọ Xanh 24/7)
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
            >
              Đã hiểu & Quay lại
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
