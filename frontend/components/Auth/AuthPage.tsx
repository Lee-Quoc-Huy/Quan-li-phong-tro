import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { AppLogo } from '../Common/AppLogo';
import { UserRole } from '../../types';
import { 
  Building2, 
  Home, 
  LogIn, 
  UserPlus, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck, 
  Mail, 
  User as UserIcon, 
  CreditCard, 
  Database,
  ArrowLeft,
  Check,
  Copy,
  Code2
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, registerUser, users, isSupabaseConnected, resetPasswordByEmailAndCccd } = useRental();

  const [activeMode, setActiveMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  
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

  // Forgot password form state (Đổi mật khẩu qua Email & CCCD trên Supabase)
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCccd, setForgotCccd] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Modal xem mã SQL
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    if (!loginIdentifier.trim()) {
      setLoginError('Vui lòng nhập Số điện thoại hoặc Email!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginIdentifier, loginPassword);
      setIsSubmitting(false);

      if (!res.success) {
        setLoginError(res.message);
      } else {
        setLoginSuccess(res.message);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setLoginError(err.message || 'Lỗi kết nối cơ sở dữ liệu khi xác thực tài khoản!');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regPhone.trim()) {
      setRegError('Vui lòng điền Họ tên và Số điện thoại!');
      return;
    }

    if (!regPassword.trim() || regPassword.trim().length < 6) {
      setRegError('Mật khẩu bảo mật phải có ít nhất 6 ký tự để bảo vệ tài khoản!');
      return;
    }

    if (regRole === 'landlord' && !regHouseName.trim()) {
      setRegError('Vui lòng nhập Tên dãy trọ / tòa nhà của bạn!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: regName,
        phone: regPhone,
        password: regPassword.trim(),
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
    } catch (err: any) {
      setIsSubmitting(false);
      setRegError(err.message || 'Lỗi đăng ký tài khoản!');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail.trim() || !forgotCccd.trim()) {
      setForgotError('Vui lòng nhập đầy đủ Email và Số CCCD đã đăng ký!');
      return;
    }

    if (!forgotNewPassword.trim() || forgotNewPassword.trim().length < 6) {
      setForgotError('Mật khẩu mới phải có ít nhất 6 ký tự để bảo vệ tài khoản!');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Xác nhận mật khẩu mới không trùng khớp! Vui lòng kiểm tra lại.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetPasswordByEmailAndCccd(forgotEmail, forgotCccd, forgotNewPassword);
      setIsResetting(false);

      if (!res.success) {
        setForgotError(res.message);
      } else {
        setForgotSuccess(res.message);
        setLoginIdentifier(forgotEmail.trim());
        setLoginSuccess('Đã đổi mật khẩu thành công trên CSDL Supabase! Vui lòng đăng nhập với mật khẩu mới.');
        setTimeout(() => {
          setActiveMode('login');
          setForgotSuccess(null);
          setForgotNewPassword('');
          setForgotConfirmPassword('');
        }, 2200);
      }
    } catch (err: any) {
      setIsResetting(false);
      setForgotError(err.message || 'Lỗi khi kết nối CSDL Supabase để đổi mật khẩu!');
    }
  };

  const copySqlCode = () => {
    const sqlText = `-- Chạy mã này trong Supabase SQL Editor:
-- Xem chi tiết toàn bộ 16 bảng tại file /sql/supabase_schema.sql trong dự án`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-white">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/80 p-2 shadow-2xl shadow-blue-950/60">
          <AppLogo className="w-full h-full" color="#60a5fa" />
        </div>
        
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            Hệ Thống Quản Lý Trọ
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Đồng bộ CSDL Supabase (16 bảng ERD) & Chỉ số điện nước IoT
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
          


          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 p-1.5 bg-slate-100/90 border-b border-slate-200 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveMode('login');
                setLoginError(null);
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center ${
                activeMode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">Đăng Nhập</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('register');
                setRegError(null);
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center ${
                activeMode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Đăng Ký</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('forgot-password');
                setForgotError(null);
                setForgotSuccess(null);
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center ${
                activeMode === 'forgot-password'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Đổi MK (CCCD)</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">

            {/* TAB 1: LOGIN FORM */}
            {activeMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {users.length === 0 && !isSupabaseConnected && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      Chưa có tài khoản trên hệ thống
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Hệ thống đang ở trạng thái mới. Vui lòng bấm sang tab <strong>"Đăng Ký"</strong> bên trên để tạo tài khoản Chủ nhà hoặc Khách thuê đầu tiên.
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
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode('forgot-password');
                        setForgotError(null);
                        setForgotSuccess(null);
                        if (loginIdentifier.includes('@')) {
                          setForgotEmail(loginIdentifier);
                        }
                      }}
                      className="text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline"
                    >
                      Quên mật khẩu? (Email & CCCD)
                    </button>
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
                    <span>{isSubmitting ? 'Đang đối chiếu CSDL...' : 'Đăng Nhập Vào Hệ Thống'}</span>
                  </button>
                </div>

                <div className="pt-2 text-center flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveMode('register')}
                      className="text-teal-600 font-bold hover:underline"
                    >
                      Đăng ký ngay
                    </button>
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveMode('forgot-password')}
                    className="text-amber-600 font-semibold hover:underline"
                  >
                    Đổi mật khẩu qua CCCD
                  </button>
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
                      <div className="text-[10px] text-slate-500">Xem điện nước & hóa đơn</div>
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
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
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
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Email đăng ký:
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="email@domain.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                      />
                    </div>
                  </div>

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
                        placeholder="079201001234 (để khôi phục MK)"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Landlord Fields */}
                {regRole === 'landlord' && (
                  <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-teal-600" />
                      Thông tin Dãy trọ / Tòa nhà:
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        required
                        value={regHouseName}
                        onChange={(e) => setRegHouseName(e.target.value)}
                        placeholder="Tên dãy trọ (vd: Dãy Trọ Bình An, Nhà Trọ Hoa Mai...)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="text"
                        value={regHouseAddress}
                        onChange={(e) => setRegHouseAddress(e.target.value)}
                        placeholder="Địa chỉ dãy trọ (vd: 123 Đường Số 5, P. Linh Trung, Thủ Đức)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mật khẩu bảo mật: * (ít nhất 6 ký tự)
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Nhập mật khẩu an toàn..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

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

            {/* TAB 3: FORGOT / RESET PASSWORD FORM (XÁC THỰC EMAIL & CCCD) */}
            {activeMode === 'forgot-password' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
                    Đổi mật khẩu tài khoản qua CSDL Supabase
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Hệ thống sẽ đối chiếu trực tiếp <strong>Email</strong> và <strong>Số CCCD</strong> trên bảng dữ liệu Supabase (<code>nguoi_thue</code>, <code>chu_tro</code>, <code>quan_tri_vien</code>). Khi khớp, bạn được phép thiết lập mật khẩu mới ngay lập tức.
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    1. Email đăng ký tài khoản: *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="vd: 60.wuy.lii.06@gmail.com hoặc user@email.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    2. Số CCCD / CMND chính xác: *
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={forgotCccd}
                      onChange={(e) => setForgotCccd(e.target.value)}
                      placeholder="vd: 001200000001 hoặc số CCCD của bạn"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    3. Mật khẩu mới (ít nhất 6 ký tự): *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showForgotPw ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPw(!showForgotPw)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showForgotPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    4. Xác nhận mật khẩu mới: *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showForgotPw ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4 text-white" />
                    <span>{isResetting ? 'Đang đối chiếu & băm mật khẩu...' : 'Xác Nhận Đổi Mật Khẩu Trên Supabase'}</span>
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveMode('login')}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Quay lại Đăng nhập
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Footer Highlights */}
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-center">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Hệ thống bảo mật mật khẩu băm SHA-256 an toàn
            </div>
          </div>

        </div>
      </div>

      {/* MODAL XEM MÃ SQL CHO SUPABASE (CHUẨN 16 BẢNG ERD) */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-2xl w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-400" />
                  Mã SQL Tạo 16 Bảng Supabase (Chuẩn Sơ Đồ ERD)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đã tạo sẵn file <code>/sql/supabase_schema.sql</code>. Bạn có thể sao chép và dán vào Supabase SQL Editor.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto font-mono text-[11px] text-teal-300 bg-slate-950/80 space-y-2 flex-1">
              <pre className="whitespace-pre-wrap leading-relaxed">
{`-- CÁC BẢNG TRONG CSDL SUPABASE (THEO ĐÚNG SƠ ĐỒ ERD):
1.  chu_tro (ma_chu_tro, ho_ten, sdt, email, dia_chi, cccd, password_hash, avatar, host_code, trang_thai)
2.  nguoi_thue (ma_nt, ho_ten, sdt, email, cccd, ngay_sinh, dia_chi, password_hash, avatar, trang_thai)
3.  quan_tri_vien (ma_qtv, ho_ten, sdt, email, cccd, vai_tro, password_hash, avatar, trang_thai)
4.  khu_tro (ma_khu, ma_chu_tro, ten_khu, dia_chi, mo_ta)
5.  phong (ma_phong, ma_chu_tro, ma_khu, so_phong, loai_phong, dien_tich, gia_thue, mo_ta, trang_thai)
6.  thiet_bi (ma_tb, ma_phong, ten_tb, loai_tb, ngay_lap, trang_thai)
7.  dich_vu (ma_dv, ten_dv, don_gia, ghi_chu)
8.  hop_dong_thue (ma_hd, ma_phong, ma_nguoi_thue, ngay_bat_dau, ngay_ket_thuc, tien_coc, trang_thai)
9.  hoa_don (ma_hdon, ma_hd, thang_nam, chi_so_cu, chi_so_moi, tong_tien, ngay_lap, trang_thai)
10. thanh_toan (ma_tt, ma_hdon, so_tien, phuong_thuc, ma_gd_vietqr, ngay_thanh_toan, trang_thai)
11. dang_ky (ma_dk, ma_nt, ma_phong, ngay_hen, ngay_di, trang_thai)
12. phieu_thu (ma_pt, ma_hd, ma_nt, ngay_thu, so_tien, ghi_chu)
13. phieu_chi (ma_pc, ma_khu, ngay_chi, noi_dung, so_tien, loai_chi)
14. chi_so (ma_cs, ma_phong, thang_nam, chi_so_dien, chi_so_nuoc, ngay_ghi, nguoi_ghi)
15. phan_hoi (ma_ph, ma_nt, ngay_ph, noi_dung, trang_thai)
16. bao_tri (ma_bt, ma_phong, ma_nt, ngay_yc, mo_ta_su_co, trang_thai)
+ Bảng tương thích: profiles (id, name, email, phone, role, avatar, id_card, password_hash)

* File schema đầy đủ: /sql/supabase_schema.sql
* Tài khoản Quản trị khởi tạo: 60.wuy.lii.06@gmail.com / CCCD: 001200000001`}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
              <span className="text-xs text-slate-400">
                File nguồn: <code>sql/supabase_schema.sql</code>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copySqlCode}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Đã sao chép!' : 'Sao chép thông tin'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
