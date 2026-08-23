import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Smartphone, 
  Check, 
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Clock
} from 'lucide-react';

interface TenantSecurityProps {
  onNavigateTab: (tab: string) => void;
}

export const TenantSecurity: React.FC<TenantSecurityProps> = ({ onNavigateTab }) => {
  const { currentUser, rooms, toggleRoomDoor, changeRoomDoorPIN, securityLogs, settings, currentHouseName, contracts, joinRequests } = useRental();

  const myContractMatch = contracts?.find(
    (c) => (c.tenantId === currentUser.id || (currentUser.phone && c.tenantPhone === currentUser.phone)) && c.status === 'active'
  );

  const cleanUserRoomId = currentUser.roomId && currentUser.roomId !== 'Chưa chọn phòng' && currentUser.roomId !== 'Chưa gán phòng' ? currentUser.roomId : undefined;

  const matchedRoom = rooms.find(
    (r) => (cleanUserRoomId && (r.id === cleanUserRoomId || r.roomNumber === cleanUserRoomId)) ||
           r.currentTenantId === currentUser.id ||
           (currentUser.phone && r.currentTenantName && currentUser.name && r.currentTenantName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) ||
           (myContractMatch && (r.id === myContractMatch.roomId || r.roomNumber === myContractMatch.roomNumber))
  ) || (cleanUserRoomId ? rooms.find((r) => r.id === cleanUserRoomId || r.roomNumber === cleanUserRoomId) : undefined);

  const pendingReq = joinRequests?.find(
    (r) => (r.tenantId === currentUser.id || (currentUser.phone && r.tenantPhone === currentUser.phone)) && r.status === 'pending'
  );

  if (!matchedRoom && pendingReq) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Khóa Cửa & Mã PIN
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý khóa thông minh và mã PIN ra vào phòng
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="flex items-center gap-3 border-b border-amber-200/60 pb-4">
            <div className="w-11 h-11 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Đang chờ duyệt
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-0.5">
                Chờ chủ trọ kích hoạt bàn giao phòng
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700 bg-white/80 p-4 rounded-xl border border-amber-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Mã kết nối:</span>
              <span className="font-mono font-bold text-slate-900">{pendingReq.hostCodeInput}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dãy trọ:</span>
              <span className="font-semibold text-slate-900">{currentHouseName}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed italic">
            💡 Bạn đã gửi mã kết nối thành công. Quyền mở khóa từ xa và đổi mã PIN mở cửa sẽ hiển thị ngay khi chủ trọ phê duyệt yêu cầu của bạn!
          </p>

          <button
            onClick={() => onNavigateTab('join')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Xem chi tiết yêu cầu</span>
          </button>
        </div>
      </div>
    );
  }

  if (!matchedRoom && !currentUser.roomId && !currentUser.landlordId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Khóa Cửa & Mã PIN
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý khóa thông minh và mã PIN ra vào phòng
          </p>
        </div>

        <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Vui lòng nhập Mã chủ trọ và nhận phòng</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn chưa có phòng được gán. Vui lòng vào mục <strong>"Nhập mã chủ trọ"</strong> để kết nối và quản lý khóa cửa.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('join')}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Đi đến trang Nhập Mã Chủ Trọ</span>
          </button>
        </div>
      </div>
    );
  }

  const fallbackRoom = {
    id: currentUser.roomId || 'room_default',
    landlordId: settings.landlordId || '',
    roomNumber: 'Phòng thuê',
    floor: 1,
    areaM2: 25,
    basePrice: 2500000,
    amenities: ['Điều hòa', 'Wifi'],
    status: 'occupied' as const,
    doorLockState: 'locked' as const,
    doorPasscode: '123456',
    securityStatus: 'secure' as const,
    electricityMeterStart: 100,
    waterMeterStart: 30,
  };

  const myRoom = matchedRoom || rooms[0] || fallbackRoom;

  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [showPIN, setShowPIN] = useState(false);
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const roomLogs = securityLogs.filter(
    (log) => log.targetLabel.includes(myRoom.roomNumber) || log.performedBy === currentUser.name
  );

  const handleUpdatePIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPIN || newPIN.length < 4 || newPIN.length > 8) {
      setPinMessage({ type: 'error', text: 'Mã PIN khóa cửa phải từ 4 đến 8 chữ số!' });
      return;
    }
    if (newPIN !== confirmPIN) {
      setPinMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    changeRoomDoorPIN(myRoom.id, newPIN);
    setPinMessage({ type: 'success', text: `Đổi mã PIN cửa phòng thành công: ${newPIN}` });
    setNewPIN('');
    setConfirmPIN('');
    setTimeout(() => setPinMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Khóa Cửa & An Ninh
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý khóa thông minh phòng {myRoom.roomNumber} và xem mã PIN mở cửa
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Khóa cửa: Online</span>
        </div>
      </div>

      {pinMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
            pinMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          {pinMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          {pinMessage.text}
        </div>
      )}

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Remote Door Lock Control */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Điều Khiển Cửa Phòng</h2>
                  <p className="text-xs text-slate-400">Khóa điện tử phòng {myRoom.roomNumber}</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                myRoom.doorLockState === 'locked'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {myRoom.doorLockState === 'locked' ? 'Đang Khóa' : 'Đang Mở'}
              </span>
            </div>

            {/* Interactive Lock Button */}
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 mt-4">
              <button
                onClick={() => toggleRoomDoor(myRoom.id)}
                className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all shadow-xs ${
                  myRoom.doorLockState === 'locked'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {myRoom.doorLockState === 'locked' ? (
                  <Lock className="w-10 h-10" />
                ) : (
                  <Unlock className="w-10 h-10" />
                )}
              </button>

              <div className="text-xs text-slate-500 font-medium">
                Bấm nút trên để {myRoom.doorLockState === 'locked' ? 'mở khóa cửa' : 'khóa cửa phòng'}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Mã PIN cổng chính dãy trọ:</span>
            <span className="font-mono font-bold text-slate-900">{settings.mainGatePasscode}</span>
          </div>
        </div>

        {/* Change Door PIN Form */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Đổi Mã PIN Cửa Phòng</h2>
              <p className="text-slate-400 text-[11px]">Chủ động đổi mật mã bàn phím số của phòng</p>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400">Mã PIN hiện tại:</div>
              <div className="font-mono font-bold text-emerald-800 text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {showPIN ? myRoom.doorPasscode : '••••••'}
              </div>
              <button
                type="button"
                onClick={() => setShowPIN(!showPIN)}
                className="text-[10px] text-teal-700 font-semibold mt-0.5 hover:underline"
              >
                {showPIN ? 'Ẩn' : 'Hiện PIN'}
              </button>
            </div>
          </div>

          <form onSubmit={handleUpdatePIN} className="space-y-3">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Mã PIN mới (4 - 8 số):</label>
              <input
                type="password"
                required
                maxLength={8}
                value={newPIN}
                onChange={(e) => setNewPIN(e.target.value)}
                placeholder="Nhập mã số mới..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Xác nhận lại mã PIN mới:</label>
              <input
                type="password"
                required
                maxLength={8}
                value={confirmPIN}
                onChange={(e) => setConfirmPIN(e.target.value)}
                placeholder="Nhập lại để xác nhận..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-all"
            >
              Lưu mã PIN mới
            </button>
          </form>

          {/* Access Logs */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="font-semibold text-slate-800">Nhật ký mở cửa gần nhất:</div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {roomLogs.slice(0, 3).map((l) => (
                <div key={l.id} className="p-2 rounded-lg bg-slate-50 text-[11px] flex items-center justify-between text-slate-600">
                  <span>{l.note || l.action}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{l.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
