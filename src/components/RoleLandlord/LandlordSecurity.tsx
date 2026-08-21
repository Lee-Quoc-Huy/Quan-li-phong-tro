import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  Clock, 
  ShieldAlert, 
  Check, 
  AlertTriangle,
  Volume2
} from 'lucide-react';

export const LandlordSecurity: React.FC = () => {
  const { 
    settings, 
    toggleMainGate, 
    changeMainGatePIN, 
    triggerEmergencyAlarm, 
    dismissEmergencyAlarm, 
    updateSystemSettings, 
    securityLogs 
  } = useRental();

  const [newGatePIN, setNewGatePIN] = useState('');
  const [autoLockTime, setAutoLockTime] = useState(settings.autoLockTime);
  const [autoUnlockTime, setAutoUnlockTime] = useState(settings.autoUnlockTime);
  const [panicReason, setPanicReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdatePIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGatePIN || newGatePIN.length < 4) {
      setMessage({ type: 'error', text: 'Mã PIN cổng chính phải từ 4 chữ số trở lên!' });
      return;
    }
    changeMainGatePIN(newGatePIN);
    setMessage({ type: 'success', text: `Đã đổi mã PIN cổng chính dãy trọ thành: ${newGatePIN}` });
    setNewGatePIN('');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      autoLockTime,
      autoUnlockTime,
    });
    setMessage({ type: 'success', text: 'Đã lưu lịch tự động khóa/mở cổng chính!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleTriggerPanic = (e: React.FormEvent) => {
    e.preventDefault();
    triggerEmergencyAlarm(panicReason.trim() || 'Phát hiện sự cố an ninh nghiêm trọng tại cổng chính!');
    setPanicReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            An ninh & Cổng chính
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý cổng ra vào thông minh, mã PIN và hệ thống báo động khẩn cấp
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
        
        {/* Main Gate Control */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cổng Chính Dãy Trọ</h3>
                <p className="text-xs text-slate-500">Khóa điện tử thông minh IoT</p>
              </div>
            </div>

            <button
              onClick={() => toggleMainGate()}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 ${
                settings.mainGateState === 'locked'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {settings.mainGateState === 'locked' ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Đang Khóa (Bấm Mở)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Đang Mở (Bấm Khóa)</span>
                </>
              )}
            </button>
          </div>

          {/* Change PIN */}
          <form onSubmit={handleUpdatePIN} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Mã PIN cổng hiện tại:</span>
              <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {settings.mainGatePasscode}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã PIN mới (vd: 9988)..."
                value={newGatePIN}
                onChange={(e) => setNewGatePIN(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-mono outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0"
              >
                Đổi PIN
              </button>
            </div>
          </form>

          {/* Auto Lock Schedule */}
          <form onSubmit={handleUpdateSchedule} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="font-semibold text-slate-800">
              Lịch tự động khóa / mở cửa hàng ngày:
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Tự động khóa đêm:</label>
                <input
                  type="time"
                  value={autoLockTime}
                  onChange={(e) => setAutoLockTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Tự động mở sáng:</label>
                <input
                  type="time"
                  value={autoUnlockTime}
                  onChange={(e) => setAutoUnlockTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors"
            >
              Lưu lịch trình tự động
            </button>
          </form>

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
                <p className="text-xs text-slate-500">Phát cảnh báo lập tức tới điện thoại toàn bộ khách</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100 text-xs text-rose-800 leading-relaxed">
              Khi kích hoạt báo động, toàn bộ ứng dụng của tất cả khách thuê sẽ hiển thị cảnh báo đỏ và hướng dẫn thoát hiểm/khóa cửa an toàn.
            </div>

            <form onSubmit={handleTriggerPanic} className="space-y-2.5 text-xs">
              <label className="font-semibold text-slate-700 block">Lý do phát báo động:</label>
              <input
                type="text"
                value={panicReason}
                onChange={(e) => setPanicReason(e.target.value)}
                placeholder="Nhập lý do (vd: Có người lạ đột nhập, cháy nổ...)"
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

          {/* Access Logs snippet */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="font-bold text-slate-900">Nhật ký ra vào gần nhất:</div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {securityLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-2 rounded-lg bg-slate-50 text-[11px] flex items-center justify-between text-slate-600">
                  <span>{log.description}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
