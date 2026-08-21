import React from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Zap, 
  Droplet
} from 'lucide-react';
import { AIInsightCard } from '../Common/AIInsightCard';

export const TenantMeters: React.FC = () => {
  const { currentUser, rooms, telemetry, settings } = useRental();

  const defaultUnassignedRoom = {
    id: 'room_unassigned',
    roomNumber: 'Chưa vào phòng',
    floor: 1,
    areaM2: 0,
    basePrice: 0,
    amenities: [],
    status: 'available' as const,
    doorLockState: 'locked' as const,
    doorPasscode: '---',
    securityStatus: 'secure' as const,
    electricityMeterStart: 0,
    waterMeterStart: 0,
  };

  const myRoom = rooms.find((r) => r.id === currentUser.roomId) || rooms.find((r) => r.currentTenantId === currentUser.id) || rooms[0] || defaultUnassignedRoom;
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
