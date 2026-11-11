import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { User } from '../../types';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Image as ImageIcon, 
  ShieldCheck, 
  CheckCircle2, 
  X,
  Camera
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, settings, updateUserProfile } = useRental();

  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [houseName, setHouseName] = useState(currentUser.houseName || settings.houseName || '');
  const [houseAddress, setHouseAddress] = useState(currentUser.houseAddress || settings.houseAddress || '');
  const [age, setAge] = useState<number | ''>(currentUser.age ?? 25);
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
      houseName: currentUser.role === 'landlord' ? houseName.trim() : undefined,
      houseAddress: currentUser.role === 'landlord' ? houseAddress.trim() : undefined,
      age: age === '' ? undefined : Number(age),
      avatar: avatar.trim(),
    });

    setSuccessMsg('Đã cập nhật thông tin cá nhân thành công!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1500);
  };

  const roleLabel = currentUser.role === 'admin' 
    ? 'Quản trị viên (Admin)' 
    : currentUser.role === 'landlord' 
    ? 'Chủ nhà trọ' 
    : 'Khách thuê trọ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Cài Đặt Hồ Sơ & Tài Khoản
              </h2>
              <p className="text-xs text-slate-400">
                Cập nhật thông tin cá nhân áp dụng cho mọi phân quyền hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Role badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Phân quyền hiện tại:</div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {roleLabel}
            </span>
          </div>

          {/* Avatar Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Ảnh Đại Diện (Avatar)
              </label>
              <label className="cursor-pointer px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/30 transition-all flex items-center gap-1 shadow-sm">
                <Camera className="w-3.5 h-3.5" /> Tải từ thiết bị
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={avatar || currentUser.avatar}
                alt="Avatar preview"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md shrink-0"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={avatar.startsWith('data:') ? 'Ảnh tải lên từ thiết bị (Đã lưu)' : avatar}
                  onChange={(e) => {
                    if (!e.target.value.startsWith('Ảnh tải lên')) {
                      setAvatar(e.target.value);
                    }
                  }}
                  placeholder="Dán link ảnh https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] text-slate-500 shrink-0">Chọn mẫu nhanh:</span>
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`w-7 h-7 rounded-lg overflow-hidden border shrink-0 transition-transform hover:scale-105 ${
                        avatar === url ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-700 opacity-70'
                      }`}
                    >
                      <img src={url} alt={`preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grid fields: Name & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-amber-400" /> Họ và Tên
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Tuổi
              </label>
              <input
                type="number"
                min={16}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="VD: 28"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> Số Điện Thoại
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912345678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" /> Địa Chỉ Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: email@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Landlord Specific: House Name & Address */}
          {currentUser.role === 'landlord' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="text-xs font-bold text-amber-300">
                Thông tin Dãy Trọ của bạn (Hiển thị cho khách thuê & tiêu đề):
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tên Dãy Trọ:</label>
                <input
                  type="text"
                  required
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  placeholder="Ví dụ: Trọ 1, Trọ 2, Nhà Trọ Hoa Mai,..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-200 text-xs font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Địa chỉ Dãy Trọ:</label>
                <input
                  type="text"
                  value={houseAddress}
                  onChange={(e) => setHouseAddress(e.target.value)}
                  placeholder="Ví dụ: 123 Nguyễn Văn Cừ, Quận 5, TP.HCM"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all"
            >
              Lưu Thay Đổi
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
