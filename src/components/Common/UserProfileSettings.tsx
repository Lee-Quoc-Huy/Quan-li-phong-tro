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
  RefreshCw
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
  const { currentUser, updateUserProfile, settings, regenerateHostCode } = useRental();

  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [age, setAge] = useState<number | ''>(currentUser.age ?? 25);
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedHostCode, setCopiedHostCode] = useState(false);
  const [hostCodeMsg, setHostCodeMsg] = useState<string | null>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      age: age === '' ? undefined : Number(age),
      avatar: avatar.trim(),
    });

    setSuccessMsg('Đã cập nhật thông tin cá nhân và giao diện thành công!');
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
                    onClick={() => setAvatar(url)}
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

    </div>
  );
};
