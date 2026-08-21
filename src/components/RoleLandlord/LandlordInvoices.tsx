import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  DollarSign, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Zap, 
  Droplet, 
  Check, 
  X, 
  Receipt,
  FileCheck
} from 'lucide-react';
import { VietQRModal } from '../Common/VietQRModal';
import { Invoice } from '../../types';

export const LandlordInvoices: React.FC = () => {
  const { 
    rooms, 
    users, 
    invoices, 
    createManualInvoice, 
    generateAIInvoicesBatch, 
    verifyPaymentByHost,
    settings 
  } = useRental();

  const [selectedInvoiceForQR, setSelectedInvoiceForQR] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  // Form State for manual invoice
  const [targetType, setTargetType] = useState<'single' | 'all'>('single');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || 'room_101');
  const [monthYear, setMonthYear] = useState('Tháng 08/2026');
  const [elecStart, setElecStart] = useState(3800);
  const [elecEnd, setElecEnd] = useState(3968);
  const [waterStart, setWaterStart] = useState(200);
  const [waterEnd, setWaterEnd] = useState(219);
  const [customExtraFee, setCustomExtraFee] = useState(0);
  const [customExtraFeeReason, setCustomExtraFeeReason] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'pending') return inv.status === 'pending';
    if (filter === 'paid') return inv.status === 'paid' || inv.status === 'verified_by_host';
    return true;
  });

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();

    if (targetType === 'single') {
      const room = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
      const tenant = users.find((u) => u.id === room.currentTenantId) || users[0];

      createManualInvoice({
        roomId: room.id,
        roomNumber: room.roomNumber,
        tenantId: tenant.id,
        tenantName: tenant.name,
        monthYear,
        rentAmount: room.basePrice,
        electricityStart: Number(elecStart),
        electricityEnd: Number(elecEnd),
        waterStart: Number(waterStart),
        waterEnd: Number(waterEnd),
        extraFee: Number(customExtraFee),
        extraFeeReason: customExtraFeeReason,
        isRentPrepaid: false,
        aiGenerated: false,
      });
    } else {
      rooms.filter((r) => r.status === 'occupied').forEach((room) => {
        const tenant = users.find((u) => u.id === room.currentTenantId) || users[0];
        createManualInvoice({
          roomId: room.id,
          roomNumber: room.roomNumber,
          tenantId: tenant.id,
          tenantName: tenant.name,
          monthYear,
          rentAmount: room.basePrice,
          electricityStart: room.electricityMeterStart,
          electricityEnd: room.electricityMeterStart + 120,
          waterStart: room.waterMeterStart,
          waterEnd: room.waterMeterStart + 15,
          extraFee: Number(customExtraFee),
          extraFeeReason: customExtraFeeReason,
          isRentPrepaid: false,
          aiGenerated: false,
        });
      });
    }

    setIsModalOpen(false);
  };

  const handleRunAIAuto = () => {
    setIsAIProcessing(true);
    setTimeout(() => {
      generateAIInvoicesBatch();
      setIsAIProcessing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý Hóa đơn & Thu tiền
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi hóa đơn từng phòng, mã thanh toán VietQR và trạng thái đóng tiền
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunAIAuto}
            disabled={isAIProcessing}
            className="px-3.5 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
          >
            {isAIProcessing ? (
              <div className="w-3.5 h-3.5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-teal-600" />
            )}
            <span>AI Lập hóa đơn tự động</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo hóa đơn thủ công</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({invoices.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'pending'
              ? 'bg-amber-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chờ thanh toán ({invoices.filter(i => i.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'paid'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đã thanh toán ({invoices.filter(i => i.status !== 'pending').length})
        </button>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices.map((inv) => (
          <div
            key={inv.id}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-900 text-sm">
                  {inv.roomNumber} · {inv.tenantName}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  ({inv.invoiceCode})
                </span>
                {inv.aiGenerated && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-medium border border-teal-200">
                    AI Auto
                  </span>
                )}
                {inv.isRentPrepaid && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-200">
                    Đã trả trước tiền phòng
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
                <span>Tháng: <strong className="text-slate-700">{inv.monthYear}</strong></span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Điện: {inv.electricityUsed} kWh ({inv.electricityTotal.toLocaleString('vi-VN')} đ)
                </span>
                <span className="flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-blue-500" />
                  Nước: {inv.waterUsed} m³ ({inv.waterTotal.toLocaleString('vi-VN')} đ)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="text-right">
                <div className="text-base font-bold text-slate-900 font-mono">
                  {inv.totalAmount.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[10px]">
                  {inv.status === 'pending' ? (
                    <span className="text-amber-600 font-semibold flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" /> Chưa thanh toán
                    </span>
                  ) : inv.status === 'verified_by_host' ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3 h-3" /> Đã duyệt thu
                    </span>
                  ) : (
                    <span className="text-blue-700 font-semibold flex items-center gap-1 justify-end">
                      <FileCheck className="w-3 h-3" /> Khách báo đã CK
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedInvoiceForQR(inv)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  title="Mã QR nhận tiền gửi cho khách thuê"
                >
                  <QrCode className="w-3.5 h-3.5 text-teal-600" />
                  <span>Mã QR thu tiền</span>
                </button>

                {inv.status !== 'verified_by_host' && (
                  <button
                    onClick={() => verifyPaymentByHost(inv.id)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Duyệt đã thu tiền</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Manual Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Tạo Hóa Đơn Mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Hình thức:</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                  >
                    <option value="single">Tạo cho 1 phòng</option>
                    <option value="all">Tạo hàng loạt cho cả dãy</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Kỳ hóa đơn:</label>
                  <input
                    type="text"
                    required
                    value={monthYear}
                    onChange={(e) => setMonthYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                  />
                </div>
              </div>

              {targetType === 'single' && (
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Chọn phòng:</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} ({r.basePrice.toLocaleString('vi-VN')} đ/tháng)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Số điện đầu - cuối (kWh):</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={elecStart}
                      onChange={(e) => setElecStart(Number(e.target.value))}
                      className="w-1/2 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                    />
                    <input
                      type="number"
                      value={elecEnd}
                      onChange={(e) => setElecEnd(Number(e.target.value))}
                      className="w-1/2 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Số nước đầu - cuối (m³):</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={waterStart}
                      onChange={(e) => setWaterStart(Number(e.target.value))}
                      className="w-1/2 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                    />
                    <input
                      type="number"
                      value={waterEnd}
                      onChange={(e) => setWaterEnd(Number(e.target.value))}
                      className="w-1/2 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-2xs"
                >
                  Tạo và gửi VietQR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VietQR Modal */}
      {selectedInvoiceForQR && (
        <VietQRModal
          invoice={selectedInvoiceForQR}
          mode="landlord"
          onClose={() => setSelectedInvoiceForQR(null)}
        />
      )}

    </div>
  );
};
