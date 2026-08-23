import React from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Zap, 
  Droplet,
  KeyRound,
  Clock
} from 'lucide-react';
import { AIInsightCard } from '../Common/AIInsightCard';

interface TenantMetersProps {
  onNavigateTab: (tab: string) => void;
}

export const TenantMeters: React.FC<TenantMetersProps> = ({ onNavigateTab }) => {
  const { currentUser, rooms, telemetry, settings, contracts, joinRequests } = useRental();

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
            Điện Nước IoT
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi chỉ số tiêu thụ điện nước thông minh
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
                Chờ chủ trọ bấm "Duyệt" bàn giao phòng
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
              <span className="font-semibold text-slate-900">{settings.houseName || 'Nhà trọ Quản lí nhà trọ'}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed italic">
            💡 Bạn đã gửi mã kết nối thành công. Đồng hồ điện nước IoT sẽ tự động kích hoạt hiển thị ngay khi chủ trọ chấp nhận yêu cầu của bạn!
          </p>

          <button
            onClick={() => onNavigateTab('join')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Xem trang kết nối</span>
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
            Điện Nước IoT
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi chỉ số tiêu thụ điện nước thông minh
          </p>
        </div>

        <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Vui lòng nhập Mã chủ trọ và nhận phòng</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn chưa có phòng được gán. Vui lòng vào mục <strong>"Nhập mã chủ trọ"</strong> để kết nối và chờ chủ trọ duyệt.
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
  const tel = telemetry[myRoom.id] || {
    roomId: myRoom.id,
    currentKwh: 0,
    currentWaterM3: 0,
    voltage: 220,
    currentAmps: 0,
    powerWatts: 0,
    waterFlowRateLpm: 0.0,
    lastTelemetryPing: 'Chưa có dữ liệu',
    dailyKwhTrend: [],
    dailyWaterTrend: [],
  };

  const usedKwh = Math.max(0, tel.currentKwh - myRoom.electricityMeterStart);
  const usedWater = Math.max(0, tel.currentWaterM3 - myRoom.waterMeterStart);
  const estElecCost = usedKwh * settings.electricityRate;
  const estWaterCost = usedWater * settings.waterRate;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Đo lường Điện Nước
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Dữ liệu trực tiếp từ đồng hồ điện tử và cảm biến phòng {myRoom.roomNumber}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Realtime IoT</span>
        </div>
      </div>

      {/* Primary Dials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Electricity */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Đồng Hồ Điện Thông Minh</h2>
                <div className="text-xs text-slate-400">Đơn giá: {settings.electricityRate.toLocaleString('vi-VN')} đ/kWh</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-mono text-xs font-bold border border-amber-200">
              {tel.powerWatts.toFixed(0)} W
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Chỉ số điện hiện tại</div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-slate-900">
              {tel.currentKwh.toFixed(1)} <span className="text-sm font-normal text-slate-500">kWh</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500 text-[11px]">Đã tiêu thụ tháng này:</div>
              <div className="font-bold text-slate-900 font-mono mt-0.5">{usedKwh.toFixed(1)} kWh</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500 text-[11px]">Tiền điện tạm tính:</div>
              <div className="font-bold text-amber-700 font-mono mt-0.5">{estElecCost.toLocaleString('vi-VN')} đ</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Điện áp: {tel.voltage.toFixed(1)} V</span>
            <span>Cường độ: {tel.currentAmps.toFixed(1)} A</span>
          </div>
        </div>

        {/* Water */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Đồng Hồ Nước Điện Tử</h2>
                <div className="text-xs text-slate-400">Đơn giá: {settings.waterRate.toLocaleString('vi-VN')} đ/m³</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-mono text-xs font-bold border border-blue-200">
              {tel.waterFlowRateLpm.toFixed(1)} L/phút
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Chỉ số nước hiện tại</div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-slate-900">
              {tel.currentWaterM3.toFixed(1)} <span className="text-sm font-normal text-slate-500">m³</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500 text-[11px]">Đã tiêu thụ tháng này:</div>
              <div className="font-bold text-slate-900 font-mono mt-0.5">{usedWater.toFixed(1)} m³</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500 text-[11px]">Tiền nước tạm tính:</div>
              <div className="font-bold text-blue-700 font-mono mt-0.5">{estWaterCost.toLocaleString('vi-VN')} đ</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Cảm biến rò rỉ: Hoạt động bình thường</span>
            <span>Lưu lượng: {tel.waterFlowRateLpm.toFixed(1)} L/p</span>
          </div>
        </div>

      </div>

    </div>
  );
};
