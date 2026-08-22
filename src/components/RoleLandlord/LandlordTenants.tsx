import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { Contract } from '../../types';
import { 
  Users, 
  Check, 
  X, 
  Phone, 
  CreditCard, 
  Clock, 
  LogOut, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Edit3,
  Eye,
  Building,
  User,
  ShieldCheck,
  Printer,
  Calendar,
  DollarSign,
  Plus,
  Trash2
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
    updateContract,
    deleteContract,
    createContractCustom,
    settings,
    currentUser,
    syncAllTenantsToGoogleSheet
  } = useRental();

  const [activeTab, setActiveTab] = useState<'tenants' | 'requests' | 'contracts'>('tenants');
  const [selectedRoomForApprove, setSelectedRoomForApprove] = useState<{ [reqId: string]: string }>({});
  const [customRoomInputs, setCustomRoomInputs] = useState<{ [reqId: string]: string }>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Modals state
  const [viewContract, setViewContract] = useState<Contract | null>(null);
  const [editContract, setEditContract] = useState<Contract | null>(null);

  const pendingRequests = joinRequests.filter((r) => r.status === 'pending');
  const activeTenants = users.filter((u) => u.role === 'tenant' && u.roomId);
  const availableRooms = rooms.filter((r) => r.status === 'available');

  const defaultLandlordName = currentUser.role === 'landlord' ? currentUser.name : (settings.accountName || 'Chủ trọ');

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

  const handleSaveEditedContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContract) return;

    updateContract(editContract.id, {
      landlordName: editContract.landlordName,
      tenantName: editContract.tenantName,
      tenantPhone: editContract.tenantPhone,
      tenantIdCard: editContract.tenantIdCard,
      roomNumber: editContract.roomNumber,
      monthlyRent: Number(editContract.monthlyRent),
      depositAmount: Number(editContract.depositAmount),
      startDate: editContract.startDate,
      endDate: editContract.endDate,
      terms: editContract.terms,
    });

    setFeedback({
      success: true,
      message: `Đã cập nhật thông tin Hợp đồng ${editContract.contractCode} thành công!`,
    });
    setEditContract(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Khách Thuê & Hợp Đồng
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý thông tin cư dân, hợp đồng thuê và các yêu cầu kết nối phòng
          </p>
        </div>

        {/* Sync Button */}
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

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'tenants'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh Sách Khách Thuê ({activeTenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all relative shrink-0 ${
            activeTab === 'requests'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Yêu Cầu Gia Nhập</span>
          {pendingRequests.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'requests' ? 'bg-white text-teal-700' : 'bg-amber-500 text-white'
            }`}>
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'contracts'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tất Cả Hợp Đồng ({contracts.length})</span>
        </button>
      </div>

      {/* TAB 1: Danh sách khách thuê đang ở */}
      {activeTab === 'tenants' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-base">
                Khách Đang Thuê Phòng
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {activeTenants.length} người
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
              Quản lý hợp đồng & thông tin khách hàng trực tiếp
            </span>
          </div>

          {activeTenants.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <div>Chưa có khách thuê nào ở phòng.</div>
            </div>
          ) : (
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

                    <div className="flex flex-wrap items-center gap-3">
                      {room && (
                        <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                          <span className="text-slate-400 mr-1">Phòng:</span>
                          <strong className="text-slate-900">{room.roomNumber}</strong> (Tầng {room.floor})
                        </div>
                      )}

                      {contract ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewContract(contract)}
                            className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold transition-colors flex items-center gap-1.5"
                            title="Xem chi tiết hợp đồng điện tử"
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-600" />
                            <span>Xem Hợp Đồng</span>
                          </button>

                          <button
                            onClick={() => setEditContract({
                              ...contract,
                              landlordName: contract.landlordName || defaultLandlordName
                            })}
                            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold transition-colors flex items-center gap-1.5 text-xs"
                            title="Chỉnh sửa thông tin chủ trọ / điều khoản hợp đồng"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Sửa HĐ</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Xác nhận xóa hợp đồng [${contract.contractCode}] của ${contract.tenantName}?`)) {
                                deleteContract(contract.id);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition-colors flex items-center gap-1.5 text-xs"
                            title="Xóa / Hủy hợp đồng này"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Xóa HĐ</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Chưa tạo hợp đồng</span>
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
                        <span>Trả phòng</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Yêu cầu gia nhập */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Yêu cầu gia nhập chờ duyệt ({pendingRequests.length})</span>
            </div>
            <span className="text-amber-800 font-medium hidden sm:inline-block">
              Duyệt sẽ tự động gán phòng, khởi tạo Hợp đồng điện tử và đồng bộ Google Sheet
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">Không có yêu cầu gia nhập nào đang chờ</div>
              <div>Khi khách thuê nhập Mã chủ trọ của bạn trên ứng dụng, yêu cầu sẽ hiển thị tại đây.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => {
                // Ensure room options list is never empty
                const roomList = rooms.length > 0 ? rooms : [
                  { id: 'room_101', roomNumber: 'Phòng 101', floor: 1, status: 'available', basePrice: 2500000 },
                  { id: 'room_102', roomNumber: 'Phòng 102', floor: 1, status: 'available', basePrice: 2500000 },
                  { id: 'room_103', roomNumber: 'Phòng 103', floor: 1, status: 'available', basePrice: 2800000 },
                  { id: 'room_201', roomNumber: 'Phòng 201', floor: 2, status: 'available', basePrice: 2600000 },
                ];

                // Auto select first available room if default requested room is occupied or invalid
                const firstAvailableRoom = roomList.find((r) => r.status === 'available');
                let defaultRoomChoice = selectedRoomForApprove[req.id];
                if (!defaultRoomChoice) {
                  const reqRoomObj = roomList.find((r) => r.id === req.roomIdRequested || r.roomNumber === req.roomIdRequested);
                  if (reqRoomObj && reqRoomObj.status === 'available') {
                    defaultRoomChoice = reqRoomObj.id;
                  } else if (firstAvailableRoom) {
                    defaultRoomChoice = firstAvailableRoom.id;
                  } else {
                    defaultRoomChoice = 'custom';
                  }
                }

                const currentChosenRoom = defaultRoomChoice;
                const isCustomSelected = currentChosenRoom === 'custom';

                // Real-time calculation: Check if chosen room is already occupied
                let targetRoomObj = roomList.find((r) => r.id === currentChosenRoom || r.roomNumber === currentChosenRoom);
                if (isCustomSelected) {
                  const typedInput = (customRoomInputs[req.id] || '').trim().toLowerCase();
                  if (typedInput) {
                    const formattedTyped = typedInput.startsWith('phòng') ? typedInput : `phòng ${typedInput}`;
                    targetRoomObj = roomList.find(
                      (r) => r.roomNumber.toLowerCase() === typedInput || r.roomNumber.toLowerCase() === formattedTyped
                    );
                  } else {
                    targetRoomObj = undefined;
                  }
                }

                const isTargetOccupied = targetRoomObj?.status === 'occupied';
                const occupantName = targetRoomObj?.currentTenantName;

                const handleApprove = () => {
                  if (isTargetOccupied) {
                    alert(`Phòng này đã có người thuê (${occupantName || 'Khách thuê'}). Không thể cho thuê phòng đã có người!`);
                    return;
                  }

                  let finalRoomTarget = currentChosenRoom;
                  if (isCustomSelected) {
                    finalRoomTarget = customRoomInputs[req.id]?.trim() || 'Phòng 101';
                  }
                  approveJoinRequest(req.id, finalRoomTarget);
                  setFeedback({
                    success: true,
                    message: `Đã phê duyệt nhận phòng & tự động khởi tạo Hợp đồng điện tử cho ${req.tenantName}!`,
                  });
                  setTimeout(() => setFeedback(null), 5000);
                };

                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="text-base font-bold text-slate-900">{req.tenantName}</div>
                        <div className="text-slate-500 flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {req.tenantPhone}
                        </div>
                        <div className="text-slate-500 flex items-center gap-1.5 mt-1">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" /> CCCD: <span className="font-mono text-slate-700">{req.tenantIdCard}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold font-mono inline-block">
                          Mã kết nối: {req.hostCodeInput}
                        </span>
                        <div className="text-[10px] text-slate-400">{req.createdAt}</div>
                      </div>
                    </div>

                    {/* Room selection */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Chọn phòng bàn giao & Lập HĐ:
                        </label>
                        <span className="text-[10px] text-teal-700 font-medium">
                          {roomList.filter((r) => r.status === 'available').length} phòng trống
                        </span>
                      </div>

                      <select
                        value={currentChosenRoom}
                        onChange={(e) =>
                          setSelectedRoomForApprove({
                            ...selectedRoomForApprove,
                            [req.id]: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-teal-500 font-semibold"
                      >
                        {roomList.map((rm) => (
                          <option 
                            key={rm.id} 
                            value={rm.id}
                            disabled={rm.status === 'occupied'}
                            className={rm.status === 'occupied' ? 'text-rose-600 bg-rose-50 font-normal' : 'text-slate-900 font-semibold'}
                          >
                            {rm.roomNumber.startsWith('Phòng') ? rm.roomNumber : `Phòng ${rm.roomNumber}`}{' '}
                            {rm.status === 'available'
                              ? '🟢 (Còn trống)'
                              : `🔴 (Đã có người: ${rm.currentTenantName || 'Khách thuê'}) - ĐÃ THUÊ`}
                          </option>
                        ))}
                        <option value="custom">+ Tự nhập số phòng mới...</option>
                      </select>

                      {isCustomSelected && (
                        <div className="pt-1">
                          <input
                            type="text"
                            placeholder="VD: 101, 202, Phòng 301..."
                            value={customRoomInputs[req.id] || ''}
                            onChange={(e) =>
                              setCustomRoomInputs({
                                ...customRoomInputs,
                                [req.id]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white border border-teal-300 text-slate-900 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Hệ thống sẽ kiểm tra xem phòng này đã có người ở chưa trước khi lập HĐ.
                          </p>
                        </div>
                      )}

                      {/* Warning if room is occupied */}
                      {isTargetOccupied && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-semibold flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <div>Phòng này hiện đã có người ở (<strong>{occupantName || 'Khách thuê'}</strong>).</div>
                            <div className="text-[10px] text-rose-700 font-normal mt-0.5">
                              Hệ thống không cho phép duyệt cho thuê phòng đã có khách. Vui lòng chọn phòng trống khác.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2.5 pt-1">
                      <button
                        onClick={handleApprove}
                        disabled={isTargetOccupied || (isCustomSelected && !customRoomInputs[req.id]?.trim())}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isTargetOccupied ? 'Phòng Đã Có Người' : 'Duyệt Nhận Phòng & Lập HĐ'}</span>
                      </button>
                      
                      <button
                        onClick={() => rejectJoinRequest(req.id)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition-colors"
                        title="Từ chối yêu cầu gia nhập"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Tất cả hợp đồng */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-base">
              Danh Sách Hợp Đồng Thuê Điện Tử
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Tổng số: {contracts.length} hợp đồng
            </span>
          </div>

          {contracts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Chưa có hợp đồng nào trong hệ thống.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{c.contractCode}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">Phòng {c.roomNumber}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {c.status === 'active' ? 'Đang hiệu lực' : 'Đã kết thúc'}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600">
                    <div><strong>Bên A (Chủ trọ):</strong> {c.landlordName || defaultLandlordName}</div>
                    <div><strong>Bên B (Khách):</strong> {c.tenantName} ({c.tenantPhone})</div>
                    <div><strong>Tiền thuê:</strong> {c.monthlyRent.toLocaleString('vi-VN')} đ/tháng</div>
                    <div><strong>Tiền cọc:</strong> {c.depositAmount.toLocaleString('vi-VN')} đ</div>
                    <div><strong>Thời hạn:</strong> {c.startDate} → {c.endDate}</div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => setViewContract(c)}
                      className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-600" /> Xem HĐ
                    </button>
                    <button
                      onClick={() => setEditContract({
                        ...c,
                        landlordName: c.landlordName || defaultLandlordName
                      })}
                      className="flex-1 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-amber-800 font-semibold text-xs flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" /> Sửa HĐ
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa hợp đồng [${c.contractCode}] không?`)) {
                          deleteContract(c.id);
                        }
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-rose-700 font-semibold text-xs flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Xóa HĐ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW CONTRACT MODAL */}
      {viewContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-lg">
                  Hợp Đồng Thuê Phòng Điện Tử
                </h3>
              </div>
              <button
                onClick={() => setViewContract(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="space-y-5 text-xs text-slate-800 max-h-[60vh] overflow-y-auto pr-2">
              <div className="text-center space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="text-[10px] text-slate-400">Độc lập - Tự do - Hạnh phúc</div>
                <h2 className="text-lg font-bold text-slate-900 pt-1">
                  HỢP ĐỒNG THUÊ PHÒNG TRỌ
                </h2>
                <div className="text-slate-500 font-mono">
                  Mã HĐ: <strong className="text-teal-700">{viewContract.contractCode}</strong> • Ngày ký: {viewContract.signedAt}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1 pb-1 border-b border-slate-200">
                    <Building className="w-3.5 h-3.5 text-teal-600" /> BÊN CHO THUÊ (BÊN A)
                  </div>
                  <div><strong>Chủ trọ:</strong> {viewContract.landlordName || defaultLandlordName}</div>
                  <div><strong>Dãy trọ:</strong> {settings.houseName}</div>
                  <div><strong>Địa chỉ:</strong> {settings.houseAddress}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1 pb-1 border-b border-slate-200">
                    <User className="w-3.5 h-3.5 text-teal-600" /> BÊN THUÊ PHÒNG (BÊN B)
                  </div>
                  <div><strong>Khách thuê:</strong> {viewContract.tenantName}</div>
                  <div><strong>SĐT:</strong> {viewContract.tenantPhone}</div>
                  <div><strong>CCCD:</strong> {viewContract.tenantIdCard}</div>
                  <div><strong>Phòng:</strong> <strong className="text-teal-700">{viewContract.roomNumber}</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400">Tiền cọc:</div>
                  <div className="font-bold text-slate-900">{viewContract.depositAmount.toLocaleString('vi-VN')} đ</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400">Giá thuê:</div>
                  <div className="font-bold text-slate-900">{viewContract.monthlyRent.toLocaleString('vi-VN')} đ</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400">Bắt đầu:</div>
                  <div className="font-bold text-slate-900">{viewContract.startDate}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400">Hết hạn:</div>
                  <div className="font-bold text-slate-900">{viewContract.endDate}</div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="font-bold text-slate-900">Điều khoản hợp đồng:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                  {viewContract.terms.map((term, i) => (
                    <li key={i}>{term}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> In / Export
              </button>
              <button
                onClick={() => setViewContract(null)}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CONTRACT MODAL */}
      {editContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Chỉnh Sửa Hợp Đồng [{editContract.contractCode}]
                </h3>
              </div>
              <button
                onClick={() => setEditContract(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedContract} className="space-y-4">
              {/* Landlord Info */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-amber-700" /> Thông tin Bên Cho Thuê (Bên A)
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Tên Chủ Trọ:</label>
                  <input
                    type="text"
                    required
                    value={editContract.landlordName}
                    onChange={(e) => setEditContract({ ...editContract, landlordName: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-amber-500 font-semibold"
                  />
                  <p className="text-[10px] text-slate-500">
                    Tên này sẽ hiển thị làm Bên A trong hợp đồng điện tử của khách thuê.
                  </p>
                </div>
              </div>

              {/* Tenant Info */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" /> Thông tin Bên Thuê (Bên B)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-semibold block">Họ tên Khách thuê:</label>
                    <input
                      type="text"
                      required
                      value={editContract.tenantName}
                      onChange={(e) => setEditContract({ ...editContract, tenantName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-semibold block">Số CCCD:</label>
                    <input
                      type="text"
                      required
                      value={editContract.tenantIdCard}
                      onChange={(e) => setEditContract({ ...editContract, tenantIdCard: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Financial & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Tiền thuê / tháng (đ):</label>
                  <input
                    type="number"
                    required
                    value={editContract.monthlyRent}
                    onChange={(e) => setEditContract({ ...editContract, monthlyRent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Tiền cọc (đ):</label>
                  <input
                    type="number"
                    required
                    value={editContract.depositAmount}
                    onChange={(e) => setEditContract({ ...editContract, depositAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Ngày bắt đầu:</label>
                  <input
                    type="date"
                    required
                    value={editContract.startDate}
                    onChange={(e) => setEditContract({ ...editContract, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Ngày hết hạn:</label>
                  <input
                    type="date"
                    required
                    value={editContract.endDate}
                    onChange={(e) => setEditContract({ ...editContract, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditContract(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-2xs"
                >
                  Lưu Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
