import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  KeyRound, 
  Building, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';

export const TenantJoinHost: React.FC = () => {
  const { currentUser, settings, submitHostCode, joinRequests, rooms } = useRental();
  const [code, setCode] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('room_101');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const myPendingRequest = joinRequests.find(
    (r) => r.tenantId === currentUser.id && r.status === 'pending'
  );

  const availableRooms = rooms.filter((r) => r.status === 'available');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const res = submitHostCode(code, currentUser.id, selectedRoom);
    setFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gia Nhập Dãy Trọ
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Nhập mã định danh của Chủ trọ để liên kết tài khoản và nhận quyền truy cập phòng
          </p>
        </div>
      </div>

      {/* Current Host Connection Card */}
      {currentUser.landlordId ? (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-emerald-700 font-semibold">
                Trạng thái: ĐÃ LIÊN KẾT THÀNH CÔNG
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Khách trọ: <span className="text-teal-700">{currentUser.name}</span> đang thuê trọ tại <span className="text-teal-700">{settings.houseName}</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400">Mã chủ trọ:</span>
              <div className="font-mono font-bold text-teal-700 mt-1">{settings.hostCode}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400">Địa chỉ dãy trọ:</span>
              <div className="font-semibold text-slate-800 mt-1">{settings.houseAddress}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400">Phòng ở:</span>
              <div className="font-mono font-bold text-slate-900 mt-1">
                {rooms.find((r) => r.id === currentUser.roomId)?.roomNumber || 'P103'}
              </div>
            </div>
          </div>
        </div>
      ) : myPendingRequest ? (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
            <Clock className="w-4 h-4" />
            <span>Yêu cầu đang chờ Chủ trọ xét duyệt</span>
          </div>
          <p>
            Bạn đã nhập mã <strong>{myPendingRequest.hostCodeInput}</strong>. Chủ trọ sẽ sớm phê duyệt và bàn giao phòng cho bạn.
          </p>
        </div>
      ) : null}

      {/* Input Code Form */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 max-w-xl text-xs">
        <h3 className="font-bold text-slate-900 text-sm">
          Nhập Mã Chủ Trọ (Host Code)
        </h3>

        {feedback && (
          <div className={`p-3 rounded-xl flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-700 font-semibold block">Mã định danh Chủ nhà (10 ký tự):</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="vd: TROXANH889"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm uppercase outline-none focus:border-teal-500 focus:bg-white"
            />
            <span className="text-[11px] text-slate-400">
              Gợi ý mã mẫu của hệ thống: <strong className="font-mono text-teal-700">{settings.hostCode}</strong>
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi Yêu Cầu Kết Nối</span>
          </button>
        </form>
      </div>

    </div>
  );
};
