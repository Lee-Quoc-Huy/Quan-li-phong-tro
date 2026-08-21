import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Users, 
  Check, 
  X, 
  DoorClosed, 
  Phone, 
  CreditCard, 
  Clock, 
  LogOut,
  Calendar,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LandlordTenants: React.FC = () => {
  const { 
    users, 
    rooms, 
    joinRequests, 
    approveJoinRequest, 
    rejectJoinRequest, 
    checkoutTenant, 
    contracts,
    settings,
    syncAllTenantsToGoogleSheet
  } = useRental();

  const [selectedRoomForApprove, setSelectedRoomForApprove] = useState<{ [reqId: string]: string }>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const pendingRequests = joinRequests.filter((r) => r.status === 'pending');
  const activeTenants = users.filter((u) => u.role === 'tenant' && u.roomId);
  const availableRooms = rooms.filter((r) => r.status === 'available');

  const handleSyncToGoogleSheet = async () => {
    setIsSyncing(true);
    setFeedback(null);
    const res = await syncAllTenantsToGoogleSheet();
    setIsSyncing(false);
    setFeedback({
      success: res.success,
      message: res.message,
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Khách thuê & Hợp đồng
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeTenants.length} khách đang thuê • {pendingRequests.length} yêu cầu chờ duyệt
          </p>
        </div>

        {/* Google Sheet Sync Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncToGoogleSheet}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-2xs"
            title="Đồng bộ danh sách khách thuê sang Google Sheet của bạn"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Google Sheet'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
          feedback.success 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          {feedback.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Pending Approval Section */}
      {pendingRequests.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-700" />
              <h2 className="font-bold text-slate-900 text-sm">
                Yêu Cầu Gia Nhập Đang Chờ Duyệt ({pendingRequests.length})
              </h2>
            </div>
            <span className="text-[11px] text-amber-800 font-medium hidden sm:inline-block">
              ⚡ Tự động thêm dòng vào Google Sheet khi duyệt
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => {
              const currentChosenRoom = selectedRoomForApprove[req.id] || req.roomIdRequested || (availableRooms[0]?.id || 'room_101');

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-white border border-amber-200 text-xs shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{req.tenantName}</div>
                      <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {req.tenantPhone}
                      </div>
                      <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" /> CCCD: <span className="font-mono text-slate-700">{req.tenantIdCard}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                      Mã: {req.hostCodeInput}
                    </span>
                  </div>

                  {/* Room selector */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Gán phòng ở:
                    </label>
                    <select
                      value={currentChosenRoom}
                      onChange={(e) =>
                        setSelectedRoomForApprove({
                          ...selectedRoomForApprove,
                          [req.id]: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs outline-none"
                    >
                      {availableRooms.map((rm) => (
                        <option key={rm.id} value={rm.id}>
                          {rm.roomNumber} (Tầng {rm.floor} - {rm.basePrice.toLocaleString('vi-VN')} đ)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Approve / Reject buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => approveJoinRequest(req.id, currentChosenRoom)}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                    >
                      <Check className="w-4 h-4" /> Duyệt vào phòng (Ghi Sheet)
                    </button>
                    <button
                      onClick={() => rejectJoinRequest(req.id)}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Tenants List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-base">
              Danh Sách Khách Đang Thuê
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {activeTenants.length} người
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Trả phòng sẽ tự động gửi lệnh xóa khách trên Google Sheet
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {activeTenants.map((t) => {
            const room = rooms.find((r) => r.id === t.roomId);
            const contract = contracts.find((c) => c.roomId === t.roomId && c.status === 'active');

            return (
              <div
                key={t.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t.name}</div>
                    <div className="text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                      <span>SĐT: <strong className="text-slate-700">{t.phone}</strong></span>
                      <span>CCCD: <strong className="text-slate-700 font-mono">{t.idCard}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {room && (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                      <span className="text-slate-400 mr-1">Phòng:</span>
                      <strong className="text-slate-900">{room.roomNumber}</strong> (Tầng {room.floor})
                    </div>
                  )}

                  {contract && (
                    <div className="text-slate-500 text-[11px] hidden sm:block">
                      <span className="text-slate-400">Hợp đồng:</span> {contract.startDate} → {contract.endDate}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm(`Xác nhận trả phòng cho khách ${t.name}? Dữ liệu khách cũng sẽ được tự động xóa khỏi Google Sheet.`)) {
                        checkoutTenant(t.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold transition-colors flex items-center gap-1"
                    title="Trả phòng và xóa khách khỏi Google Sheet"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Trả phòng (Xóa Sheet)</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
