import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  ShieldAlert, 
  Check, 
  AlertTriangle,
  PhoneCall,
  Flame,
  Shield,
  Clock,
  Info
} from 'lucide-react';

export const LandlordSecurity: React.FC = () => {
  const { 
    settings, 
    triggerEmergencyAlarm, 
    dismissEmergencyAlarm, 
    securityLogs 
  } = useRental();

  const [panicReason, setPanicReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTriggerPanic = (e: React.FormEvent) => {
    e.preventDefault();
    triggerEmergencyAlarm(panicReason.trim() || 'Phát hiện sự cố an ninh khẩn cấp tại dãy trọ!');
    setMessage({ type: 'success', text: 'Đã phát cảnh báo khẩn cấp tới toàn bộ khách thuê!' });
    setPanicReason('');
    setTimeout(() => setMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            An toàn & Báo động khẩn cấp
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Phát cảnh báo khẩn cấp, số điện thoại cứu hộ và nhật ký an toàn dãy trọ
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          {message.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          {message.text}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Safety Guidelines & Hotlines */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Đường dây nóng khẩn cấp & PCCC</h3>
              <p className="text-xs text-slate-500">Thông tin hỗ trợ an toàn 24/7</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
              <div className="text-rose-700 font-bold text-base font-mono">114</div>
              <div className="text-[11px] text-rose-800 font-medium mt-0.5">Cứu hỏa PCCC</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div className="text-amber-700 font-bold text-base font-mono">115</div>
              <div className="text-[11px] text-amber-800 font-medium mt-0.5">Cấp cứu y tế</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-blue-700 font-bold text-base font-mono">113</div>
              <div className="text-[11px] text-blue-800 font-medium mt-0.5">Cảnh sát 113</div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Nội quy an toàn dãy trọ {settings.houseName || ''}:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-600 leading-relaxed">
              <li>Khách thuê vui lòng khóa chốt then cửa cẩn thận khi rời khỏi phòng.</li>
              <li>Tắt các thiết bị điện công suất lớn (bếp từ, bình nóng lạnh, bàn ủi) trước khi ra ngoài.</li>
              <li>Bình chữa cháy mini được đặt tại chân cầu thang mỗi tầng; nghiêm cấm che chắn lối thoát hiểm.</li>
              <li>Khi có người lạ khả nghi hoặc sự cố bất thường, bấm báo động khẩn cấp hoặc gọi trực tiếp cho chủ trọ.</li>
            </ul>
          </div>
        </div>

        {/* Emergency Panic Alarm System */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Báo Động Khẩn Cấp Dãy Trọ</h3>
                <p className="text-xs text-slate-500">Phát cảnh báo lập tức tới điện thoại toàn bộ khách thuê</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100 text-xs text-rose-800 leading-relaxed">
              Khi kích hoạt báo động, ứng dụng của tất cả khách thuê sẽ hiển thị cảnh báo đỏ và hướng dẫn sơ tán/an toàn.
            </div>

            <form onSubmit={handleTriggerPanic} className="space-y-2.5 text-xs">
              <label className="font-semibold text-slate-700 block">Lý do phát báo động:</label>
              <input
                type="text"
                value={panicReason}
                onChange={(e) => setPanicReason(e.target.value)}
                placeholder="Nhập lý do (vd: Cháy nổ, phát hiện kẻ gian đột nhập...)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ShieldAlert className="w-4 h-4" /> Kích hoạt Báo Động Khẩn Cấp
                </button>

                {settings.emergencyAlarmActive && (
                  <button
                    type="button"
                    onClick={dismissEmergencyAlarm}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                  >
                    Tắt báo động
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Incident / Security Logs */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Nhật ký sự cố & an toàn:</span>
              <span className="text-[11px] text-slate-400 font-normal">Tự động lưu trữ</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {securityLogs && securityLogs.length > 0 ? (
                securityLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-2 rounded-lg bg-slate-50 text-[11px] flex items-center justify-between text-slate-600">
                    <span>{log.description}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-slate-400 italic text-xs">
                  Chưa có sự cố an toàn nào được ghi nhận
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
