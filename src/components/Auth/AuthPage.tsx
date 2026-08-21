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
  KeyRound, 
  ArrowRight,
  ShieldCheck,
  MapPin,
  Mail,
  User as UserIcon,
  CreditCard
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, registerUser, users } = useRental();

  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regRole, setRegRole] = useState<UserRole>('landlord');
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
      const res = login(loginIdentifier, loginPassword);
      setIsSubmitting(false);

      if (!res.success) {
        setLoginError(res.message);
      } else {
        setLoginSuccess(res.message);
      }
    }, 350);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regPhone.trim()) {
      setRegError('Vui lòng điền Họ tên và Số điện thoại!');
      return;
    }

    if (regRole === 'landlord' && !regHouseName.trim()) {
      setRegError('Vui lòng nhập Tên dãy trọ / tòa nhà của bạn!');
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
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-white">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-xl shadow-amber-950/50">
          <div className="w-full h-full bg-[#0b0f17] rounded-[14px] flex items-center justify-center text-amber-400">
            <Building2 className="w-7 h-7 text-amber-400" />
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            Hệ Thống Quản Lý Trọ
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý dãy trọ thông minh, chỉ số điện nước IoT & đồng bộ Google Sheets
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
          
          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 p-2 bg-slate-100/80 border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveMode('login');
                setLoginError(null);
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeMode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4 text-teal-600" />
              <span>Đăng Nhập</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('register');
                setRegError(null);
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeMode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Đăng Ký Mới</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">

            {/* TAB 1: LOGIN FORM */}
            {activeMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {users.length === 0 && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      Chưa có tài khoản trên hệ thống
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Hệ thống đang ở trạng thái mới hoàn toàn. Vui lòng bấm sang tab <strong>"Đăng Ký Mới"</strong> bên trên để tạo tài khoản Chủ nhà hoặc Khách thuê đầu tiên.
                    </p>
                  </div>
                )}

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {loginSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{loginSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Số điện thoại hoặc Email:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="0918 293 847 hoặc email@domain.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Mật khẩu:
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4 text-teal-400" />
                    <span>{isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập Vào Hệ Thống'}</span>
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <span className="text-xs text-slate-500">
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveMode('register')}
                      className="text-teal-600 font-bold hover:underline"
                    >
                      Đăng ký ngay
                    </button>
                  </span>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {activeMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Bạn muốn tạo tài khoản với vai trò nào?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('landlord')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        regRole === 'landlord'
                          ? 'border-teal-500 bg-teal-50/80 text-teal-950 ring-2 ring-teal-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className={`w-5 h-5 mb-1 ${regRole === 'landlord' ? 'text-teal-600' : 'text-slate-400'}`} />
                      <div className="font-bold text-xs">Chủ Nhà / Quản Lý</div>
                      <div className="text-[10px] text-slate-500">Quản lý dãy trọ & phòng</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('tenant')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        regRole === 'tenant'
                          ? 'border-teal-500 bg-teal-50/80 text-teal-950 ring-2 ring-teal-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Home className={`w-5 h-5 mb-1 ${regRole === 'tenant' ? 'text-teal-600' : 'text-slate-400'}`} />
                      <div className="font-bold text-xs">Khách Thuê Phòng</div>
                      <div className="text-[10px] text-slate-500">Xem điện nước & mở khóa</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Họ và Tên: *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Số điện thoại: *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Email (tùy chọn):
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Mật khẩu: *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Tạo mật khẩu"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {regRole === 'tenant' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Số CCCD / CMND:
                    </label>
                    <div className="relative">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={regIdCard}
                        onChange={(e) => setRegIdCard(e.target.value)}
                        placeholder="079201009182"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {regRole === 'landlord' && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Tên Dãy Trọ / Tòa Nhà của bạn: *
                      </label>
                      <div className="relative">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={regHouseName}
                          onChange={(e) => setRegHouseName(e.target.value)}
                          placeholder="Ví dụ: Nhà Trọ An Bình, Căn Hộ Hoàng Gia..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Địa chỉ Dãy Trọ:
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={regHouseAddress}
                          onChange={(e) => setRegHouseAddress(e.target.value)}
                          placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản & Bắt Đầu'}</span>
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <span className="text-xs text-slate-500">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveMode('login')}
                      className="text-teal-600 font-bold hover:underline"
                    >
                      Đăng nhập ngay
                    </button>
                  </span>
                </div>

              </form>
            )}

          </div>

          {/* Footer Highlights */}
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Bảo mật 2 lớp & Khóa IoT
            </div>
            <span>Phiên bản Trực Tuyến 2026</span>
          </div>

        </div>
      </div>

    </div>
  );
};
