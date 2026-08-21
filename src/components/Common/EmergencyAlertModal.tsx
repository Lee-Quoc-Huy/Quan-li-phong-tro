import React from 'react';
import { useRental } from '../../context/RentalContext';
import { ShieldAlert, AlertTriangle, PhoneCall, Volume2, X } from 'lucide-react';

export const EmergencyAlertModal: React.FC = () => {
  const { settings, dismissEmergencyAlarm, currentUser } = useRental();

  if (!settings.emergencyAlarmActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg bg-white border border-rose-200 rounded-2xl p-6 shadow-2xl text-slate-900 space-y-4">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-rose-600 uppercase">
              Cảnh Báo An Ninh Khẩn Cấp
            </div>
            <h3 className="text-lg font-bold text-slate-900">Báo Động Dãy Trọ Được Kích Hoạt</h3>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
          <div className="text-xs text-rose-700 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Lý do cảnh báo:
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {settings.emergencyAlarmReason || 'Phát hiện sự cố an ninh hoặc khẩn cấp tại khu nhà trọ. Vui lòng kiểm tra khóa cửa và giữ trật tự an toàn!'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500">Hotline Chủ trọ:</span>
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> 0918 293 847
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500">Công an / Cấp cứu:</span>
            <div className="font-bold text-rose-600">113 / 115</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2">
          {currentUser.role === 'landlord' || currentUser.role === 'admin' ? (
            <button
              onClick={dismissEmergencyAlarm}
              type="button"
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Tắt chế độ báo động khẩn cấp
            </button>
          ) : (
            <button
              onClick={dismissEmergencyAlarm}
              type="button"
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              Tôi đã nắm thông tin (Đóng)
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
