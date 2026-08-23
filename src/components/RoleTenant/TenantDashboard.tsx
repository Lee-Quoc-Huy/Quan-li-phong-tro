import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Lock, 
  Unlock, 
  Zap, 
  Droplet, 
  QrCode, 
  FileText, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Wallet,
  Wrench,
  DoorClosed,
  KeyRound
} from 'lucide-react';
import { VietQRModal } from '../Common/VietQRModal';
import { Invoice } from '../../types';

interface TenantDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({ onNavigateTab }) => {
  const { 
    currentUser, 
    rooms, 
    contracts, 
    invoices, 
    telemetry, 
    toggleRoomDoor, 
    settings,
    currentHouseName,
    issues,
    joinRequests
  } = useRental();

  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<Invoice | null>(null);

  // Active contract matching
  const myContractMatch = contracts.find(
    (c) => (c.tenantId === currentUser.id || (currentUser.phone && c.tenantPhone === currentUser.phone)) && c.status === 'active'
  );

  const cleanUserRoomId = currentUser.roomId && currentUser.roomId !== 'Chưa chọn phòng' && currentUser.roomId !== 'Chưa gán phòng' ? currentUser.roomId : undefined;

  // Find tenant's current room safely by ID, roomNumber, tenant name, or contract
  const matchedRoom = rooms.find(
    (r) => (cleanUserRoomId && (r.id === cleanUserRoomId || r.roomNumber === cleanUserRoomId)) ||
           r.currentTenantId === currentUser.id ||
           (currentUser.phone && r.currentTenantName && currentUser.name && r.currentTenantName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) ||
           (myContractMatch && (r.id === myContractMatch.roomId || r.roomNumber === myContractMatch.roomNumber))
  ) || (cleanUserRoomId ? rooms.find((r) => r.id === cleanUserRoomId || r.roomNumber === cleanUserRoomId) : undefined);

  // Find pending join request
  const pendingReq = joinRequests.find(
    (r) => (r.tenantId === currentUser.id || (currentUser.phone && r.tenantPhone === currentUser.phone)) && r.status === 'pending'
  );

  // 1. Pending request state (Tenant entered host code, awaiting landlord approval)
  if (!matchedRoom && pendingReq) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Đã Kết Nối Dãy Trọ - Đang Chờ Phê Duyệt
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Yêu cầu tham gia dãy trọ của bạn đã được gửi thành công
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="flex items-center gap-3 border-b border-amber-200/60 pb-4">
            <div className="w-11 h-11 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Đang chờ chủ trọ duyệt
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-0.5">
                Chờ chủ trọ kích hoạt bàn giao phòng
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700 bg-white/80 p-4 rounded-xl border border-amber-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Mã chủ trọ đã nhập:</span>
              <span className="font-mono font-bold text-slate-900">{pendingReq.hostCodeInput}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dãy trọ:</span>
              <span className="font-semibold text-slate-900">{currentHouseName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phòng đăng ký:</span>
              <span className="font-semibold text-teal-700">{pendingReq.roomIdRequested || 'Chủ trọ tự xếp phòng'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thời gian gửi:</span>
              <span className="text-slate-600">{pendingReq.createdAt}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed italic">
            💡 <strong>Xác nhận kết nối:</strong> Tài khoản của bạn đã gửi yêu cầu thành công tới chủ trọ. Vui lòng nhắn tin hoặc liên hệ chủ nhà trọ để duyệt. Ngay khi chủ trọ bấm "Duyệt", thông tin phòng, chỉ số điện nước và khóa cửa sẽ hiển thị đầy đủ tại đây!
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab('join')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Xem chi tiết / Nhập lại Mã Chủ Trọ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unconnected state (No request and no room)
  if (!matchedRoom && !currentUser.roomId && !currentUser.landlordId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Chưa Bàn Giao Phòng
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tài khoản khách thuê chưa được bàn giao phòng
          </p>
        </div>

        <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Vui lòng nhập Mã chủ trọ để kết nối</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn chưa nhập mã kết nối của chủ trọ. Vào mục <strong>"Nhập mã chủ trọ"</strong>, điền mã 10 ký tự của chủ nhà cung cấp để nhận phòng và xem chỉ số điện nước.
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

  // Active room fallback object to guarantee rendering never crashes
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
  const myContract = contracts.find((c) => c.roomId === myRoom.id && c.status === 'active');
  const myTelemetry = telemetry[myRoom.id] || {
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

  const usedKwh = Math.max(0, myTelemetry.currentKwh - myRoom.electricityMeterStart);
  const usedWater = Math.max(0, myTelemetry.currentWaterM3 - myRoom.waterMeterStart);

  const myInvoices = invoices.filter((i) => i.roomId === myRoom.id || i.tenantId === currentUser.id);
  const pendingInvoice = myInvoices.find((i) => i.status === 'pending');
  const myActiveIssues = issues.filter((iss) => (iss.roomId === myRoom.id || iss.tenantId === currentUser.id));

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Xin chào, {currentUser.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              {myRoom.roomNumber}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Dãy trọ {currentHouseName} • Tầng {myRoom.floor} ({myRoom.areaM2}m²)
          </p>
        </div>

        {/* Quick Door Action */}
        <button
          onClick={() => toggleRoomDoor(myRoom.id)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-2xs transition-all border self-start sm:self-auto ${
            myRoom.doorLockState === 'locked'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
              : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
          }`}
        >
          {myRoom.doorLockState === 'locked' ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Cửa đang khóa (Bấm mở)</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              <span>Cửa đang mở (Bấm khóa)</span>
            </>
          )}
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Tiền phòng / Hóa đơn */}
        <div
          onClick={() => onNavigateTab('invoices')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            {pendingInvoice && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Chờ đóng
              </span>
            )}
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {pendingInvoice ? pendingInvoice.totalAmount.toLocaleString('vi-VN') : myRoom.basePrice.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {pendingInvoice ? 'Hóa đơn tháng này' : 'Tiền thuê niêm yết'}
            </div>
          </div>
        </div>

        {/* Card 2: Điện tiêu thụ */}
        <div
          onClick={() => onNavigateTab('telemetry')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              IoT Live
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {usedKwh.toFixed(1)} <span className="text-xs font-normal text-slate-500">kWh</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Điện dùng tháng này ({myTelemetry.powerWatts.toFixed(0)}W)
            </div>
          </div>
        </div>

        {/* Card 3: Nước sinh hoạt */}
        <div
          onClick={() => onNavigateTab('telemetry')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              IoT Live
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {usedWater.toFixed(1)} <span className="text-xs font-normal text-slate-500">m³</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Nước dùng tháng này ({myTelemetry.waterFlowRateLpm.toFixed(1)}L/p)
            </div>
          </div>
        </div>

        {/* Card 4: PIN & Khóa cửa */}
        <div
          onClick={() => onNavigateTab('door')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DoorClosed className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              PIN: {myRoom.doorPasscode}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight capitalize">
              {myRoom.doorLockState === 'locked' ? 'Đang Khóa' : 'Đang Mở'}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Khóa điện tử phòng {myRoom.roomNumber}
            </div>
          </div>
        </div>

      </div>

      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Hóa đơn phòng & VietQR */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Hóa đơn của bạn
            </h2>
            <button
              onClick={() => onNavigateTab('invoices')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Lịch sử</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingInvoice ? (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {pendingInvoice.monthYear}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Mã: {pendingInvoice.invoiceCode}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900 font-mono">
                    {pendingInvoice.totalAmount.toLocaleString('vi-VN')} đ
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Chờ thanh toán
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200 flex gap-2">
                <button
                  onClick={() => setSelectedInvoiceForPay(pendingInvoice)}
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Quét mã VietQR chuyển khoản</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              Bạn không có hóa đơn nào đang chờ thanh toán.
            </div>
          )}
        </div>

        {/* Right Column: Sự cố & Yêu cầu sửa chữa */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Yêu cầu sửa chữa gần đây
            </h2>
            <button
              onClick={() => onNavigateTab('issues')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Báo sự cố mới</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {myActiveIssues.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                Không có sự cố nào ghi nhận tại phòng của bạn.
              </div>
            ) : (
              myActiveIssues.slice(0, 3).map((iss) => (
                <div key={iss.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{iss.description}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      iss.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {iss.status === 'resolved' ? 'Đã sửa' : 'Đang xử lý'}
                    </span>
                  </div>
                  {iss.hostResponse && (
                    <div className="text-[11px] text-teal-800 font-medium">
                      Phản hồi: {iss.hostResponse}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* VietQR Modal */}
      {selectedInvoiceForPay && (
        <VietQRModal
          invoice={selectedInvoiceForPay}
          onClose={() => setSelectedInvoiceForPay(null)}
        />
      )}

    </div>
  );
};
