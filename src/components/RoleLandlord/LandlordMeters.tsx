import React from 'react';
import { useRental } from '../../context/RentalContext';
import { RealtimeTelemetry } from '../../types';
import { 
  Zap, 
  Droplet, 
  Activity
} from 'lucide-react';
import { AIInsightCard } from '../Common/AIInsightCard';

export const LandlordMeters: React.FC = () => {
  const { rooms, telemetry } = useRental();

  const telList = Object.values(telemetry) as RealtimeTelemetry[];
  const totalCurrentWatts = telList.reduce((acc, t) => acc + (t.powerWatts || 0), 0);
  const totalWaterLpm = telList.reduce((acc, t) => acc + (t.waterFlowRateLpm || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Đồng hồ Điện Nước
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cảm biến IoT đọc thông số trực tiếp từ đồng hồ điện tử từng phòng
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Tổng tải điện dãy:</div>
            <div className="font-mono font-bold text-amber-600 text-sm">{totalCurrentWatts.toFixed(0)} W</div>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Lưu lượng nước:</div>
            <div className="font-mono font-bold text-blue-600 text-sm">{totalWaterLpm.toFixed(1)} L/phút</div>
          </div>
        </div>
      </div>

      {/* Grid of rooms telemetry */}
      {rooms.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 max-w-lg mx-auto">
          <Activity className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">Chưa có phòng nào trong hệ thống</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Chủ trọ chưa tạo danh sách phòng. Vui lòng vào mục <strong>"Quản lý Phòng"</strong> để khởi tạo phòng trọ trước khi theo dõi đồng hồ điện nước.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => {
          const tel = telemetry[room.id] || {
            roomId: room.id,
            currentKwh: 3500.0,
            currentWaterM3: 180.0,
            voltage: 220.0,
            currentAmps: 1.0,
            powerWatts: 220.0,
            waterFlowRateLpm: 0.0,
            lastTelemetryPing: 'Vừa xong',
            dailyKwhTrend: [],
            dailyWaterTrend: [],
          };

          const usedKwh = Math.max(0, tel.currentKwh - room.electricityMeterStart);
          const usedWater = Math.max(0, tel.currentWaterM3 - room.waterMeterStart);
          const isHighPower = tel.powerWatts > 2000;

          return (
            <div
              key={room.id}
              className={`p-5 rounded-2xl bg-white border transition-all space-y-4 shadow-2xs ${
                isHighPower ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/90'
              }`}
            >
              {/* Card top */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{room.roomNumber}</h3>
                    <span className="text-xs text-slate-400 font-medium">Tầng {room.floor}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {room.status === 'occupied' ? 'Đang thuê' : 'Phòng trống'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Realtime</span>
                </div>
              </div>

              {/* Electricity & Water stats */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Electricity */}
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Điện kế</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    {tel.currentKwh.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">kWh</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Tháng này: <strong className="text-slate-800 font-mono">{usedKwh.toFixed(1)}</strong> kWh
                  </div>
                  <div className="text-[10px] text-amber-700 font-mono pt-1 border-t border-amber-100">
                    Tải: {tel.powerWatts.toFixed(0)} W ({tel.currentAmps.toFixed(1)} A)
                  </div>
                </div>

                {/* Water */}
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                    <Droplet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Đồng hồ nước</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    {tel.currentWaterM3.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">m³</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Tháng này: <strong className="text-slate-800 font-mono">{usedWater.toFixed(1)}</strong> m³
                  </div>
                  <div className="text-[10px] text-blue-700 font-mono pt-1 border-t border-blue-100">
                    Chảy: {tel.waterFlowRateLpm.toFixed(1)} L/p
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>
      )}

    </div>
  );
};
