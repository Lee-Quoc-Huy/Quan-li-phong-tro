import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Image as ImageIcon, 
  ShieldCheck, 
  CheckCircle2, 
  Camera,
  Save,
  UserCog,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CreditCard
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
];

export const UserProfileSettings: React.FC = () => {
  const { currentUser, updateUserProfile, settings, regenerateHostCode, changePassword } = useRental();

  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [age, setAge] = useState<number | ''>(currentUser.age ?? 25);
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);
  const [idCard, setIdCard] = useState(currentUser.idCard || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedHostCode, setCopiedHostCode] = useState(false);
  const [hostCodeMsg, setHostCodeMsg] = useState<string | null>(null);

  // State đổi mật khẩu
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!oldPassword.trim()) {
      setPwError('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }

    if (!newPassword.trim() || newPassword.trim().length < 6) {
      setPwError('Mật khẩu mới phải có ít nhất 6 ký tự để bảo vệ tài khoản!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('Xác nhận mật khẩu mới không trùng khớp! Vui lòng kiểm tra lại.');
      return;
    }

    if (oldPassword.trim() === newPassword.trim()) {
      setPwError('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
      return;
    }

    setIsChangingPw(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      setIsChangingPw(false);

      if (!res.success) {
        setPwError(res.message);
      } else {
        setPwSuccess(res.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwSuccess(null), 4000);
      }
    } catch (err: any) {
      setIsChangingPw(false);
      setPwError(err.message || 'Lỗi khi đổi mật khẩu!');
    }
  };

  const handleCopyHostCode = () => {
    navigator.clipboard.writeText(settings.hostCode);
    setCopiedHostCode(true);
    setTimeout(() => setCopiedHostCode(false), 2000);
  };

  const handleRandomizeHostCode = () => {
    if (window.confirm('Tạo lại Mã Chủ Trọ ngẫu nhiên mới?\n\nMã cũ sẽ không thể dùng để kết nối nữa.')) {
      const newCode = regenerateHostCode();
      setHostCodeMsg(`Đã tạo mã mới: ${newCode}`);
      setTimeout(() => setHostCodeMsg(null), 3000);
    }
  };

  // Hàm nén ảnh trên canvas để đảm bảo kích thước siêu nhẹ (~25KB), lưu đồng bộ nhanh vào CSDL
  const compressImage = (file: File, maxWidth = 280, maxHeight = 280, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(img.src);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPEG, WebP)!');
        return;
      }

      try {
        const compressed = await compressImage(file, 280, 280, 0.85);
        setAvatar(compressed);
        // Cập nhật và đồng bộ trực tiếp lên CSDL để tất cả người dùng khác nhìn thấy ngay
        updateUserProfile({ avatar: compressed });
        setSuccessMsg('Đã tải ảnh lên từ thiết bị và lưu trực tiếp vào CSDL SQL (Supabase)! Ảnh đã cập nhật vào hồ sơ của bạn.');
        setTimeout(() => setSuccessMsg(null), 3500);
      } catch (err) {
        console.error('Lỗi nén ảnh avatar:', err);
        alert('Không thể đọc file ảnh! Vui lòng thử lại với ảnh khác.');
      }
    }
  };

  const handleSelectPreset = (url: string) => {
    setAvatar(url);
    updateUserProfile({ avatar: url });
    setSuccessMsg('Đã chọn ảnh đại diện và lưu trực tiếp vào CSDL SQL!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      idCard: idCard.trim(),
      age: age === '' ? undefined : Number(age),
      avatar: avatar.trim(),
    });

    setSuccessMsg('Đã cập nhật thông tin cá nhân và lưu vào CSDL SQL thành công!');
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);
  };

  const roleLabel = currentUser.role === 'admin' 
    ? 'Quản trị viên hệ thống (Admin)' 
    : currentUser.role === 'landlord' 
    ? 'Chủ nhà trọ' 
    : 'Khách thuê trọ';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <img
              src={avatar || currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-2xl"
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-lg shadow-md uppercase tracking-wider">
              {currentUser.role}
            </span>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold mb-2">
              <UserCog className="w-3.5 h-3.5" /> Cài Đặt Hồ Sơ Cá Nhân & Giao Diện
            </div>
            <h1 className="text-2xl font-black tracking-tight">{currentUser.name}</h1>
            <p className="text-slate-300 text-xs mt-1">
              {roleLabel} • ID: <span className="font-mono text-teal-300">{currentUser.id}</span>
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-sm flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Thông tin tài khoản & định danh</h2>
            <p className="text-xs text-slate-500">Mọi thay đổi sẽ được áp dụng tức thì trên toàn bộ hệ thống (dùng chung cho cả 3 phân quyền).</p>
          </div>

          {/* Avatar URL & Presets & Device Upload */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-600" /> Ảnh Đại Diện (Avatar)
              </span>
              <label className="cursor-pointer px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold border border-teal-200 transition-all flex items-center gap-1.5 shadow-sm">
                <Camera className="w-3.5 h-3.5" /> Tải ảnh từ thiết bị
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="text"
                value={avatar.startsWith('data:') ? 'Ảnh tải lên từ thiết bị (Đã lưu)' : avatar}
                onChange={(e) => {
                  if (!e.target.value.startsWith('Ảnh tải lên')) {
                    setAvatar(e.target.value);
                  }
                }}
                placeholder="https://images.unsplash.com/... hoặc tải ảnh lên từ thiết bị"
                className="flex-1 w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">Hoặc chọn nhanh mẫu ảnh đại diện có sẵn:</span>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(url)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-transform hover:scale-105 ${
                      avatar === url ? 'border-teal-600 ring-4 ring-teal-500/20 shadow-md' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={url} alt={`preset avatar ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-teal-600" /> Họ và Tên
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" /> Tuổi
              </label>
              <input
                type="number"
                min={16}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="VD: 28"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-teal-600" /> Số Điện Thoại
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912345678"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-teal-600" /> Địa Chỉ Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: email@domain.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* CCCD / CMND Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-teal-600" /> Số CCCD / CMND (Dùng để xác thực và khôi phục/đổi mật khẩu khi quên)
            </label>
            <input
              type="text"
              value={idCard}
              onChange={(e) => setIdCard(e.target.value)}
              placeholder="VD: 079201001234"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Landlord Host Code Section */}
          {currentUser.role === 'landlord' && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Mã Kết Nối Chủ Trọ (Host Code)</h4>
                    <p className="text-[11px] text-slate-500">Khách thuê cần mã này để gửi yêu cầu tham gia dãy trọ.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-base text-amber-900 bg-amber-200/80 px-3 py-1.5 rounded-xl border border-amber-300">
                    {settings.hostCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyHostCode}
                    className="px-3 py-2 rounded-xl bg-amber-200/60 hover:bg-amber-300/80 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    {copiedHostCode ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedHostCode ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRandomizeHostCode}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Đổi Mã Mới</span>
                  </button>
                </div>
              </div>

              {hostCodeMsg && (
                <p className="text-xs font-bold text-amber-800 bg-amber-100 p-2 rounded-xl border border-amber-300">
                  {hostCodeMsg}
                </p>
              )}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-600/20 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" /> Lưu Thay Đổi Hồ Sơ
            </button>
          </div>

        </form>
      </div>

      {/* CARD 2: ĐỔI MẬT KHẨU TÀI KHOẢN */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleChangePasswordSubmit} className="space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Đổi Mật Khẩu Đăng Nhập</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Nhập mật khẩu hiện tại và tạo mật khẩu mới để bảo vệ tài khoản của bạn.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Băm SHA-256 an toàn
            </span>
          </div>

          {pwError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{pwError}</span>
            </div>
          )}

          {pwSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{pwSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Mật khẩu cũ */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Mật khẩu hiện tại: *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showOldPw ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu cũ"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPw(!showOldPw)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Mật khẩu mới: *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Xác nhận mật khẩu mới: *
              </label>
              <div className="relative">
                <Check className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              * Sau khi đổi, mật khẩu mới sẽ có hiệu lực ngay trên mọi thiết bị và CSDL.
            </span>
            <button
              type="submit"
              disabled={isChangingPw}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>{isChangingPw ? 'Đang cập nhật CSDL...' : 'Cập Nhật Mật Khẩu Mới'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
