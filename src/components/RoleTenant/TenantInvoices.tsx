import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  DollarSign, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Droplet, 
  Sparkles,
  FileCheck,
  KeyRound
} from 'lucide-react';
import { VietQRModal } from '../Common/VietQRModal';
import { Invoice } from '../../types';

interface TenantInvoicesProps {
  onNavigateTab: (tab: string) => void;
}

export const TenantInvoices: React.FC<TenantInvoicesProps> = ({ onNavigateTab }) => {
  const { currentUser, rooms, invoices, contracts } = useRental();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');

  if (!currentUser.roomId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hóa Đơn & VietQR
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Xem và thanh toán hóa đơn tiền phòng hàng tháng
          </p>
        </div>

        <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Vui lòng nhập Mã chủ trọ và nhận phòng</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn chưa có phòng được gán. Vui lòng vào mục <strong>"Nhập mã chủ trọ"</strong> để kết nối và nhận hóa đơn.
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

  const myRoom = rooms.find((r) => r.id === currentUser.roomId) || rooms[0];
  const myContract = contracts.find((c) => c.roomId === myRoom.id && c.status === 'active');
  
  const myInvoices = invoices.filter((i) => i.roomId === myRoom.id || i.tenantId === currentUser.id);
  const filteredInvoices = myInvoices.filter((i) => {
    if (filterStatus === 'pending') return i.status === 'pending';
    if (filterStatus === 'paid') return i.status === 'paid' || i.status === 'verified_by_host';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hóa đơn phòng {myRoom.roomNumber}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Lịch sử hóa đơn tiền phòng và thanh toán chuyển khoản qua VietQR
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({myInvoices.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chờ thanh toán ({myInvoices.filter((i) => i.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'paid' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đã thanh toán ({myInvoices.filter((i) => i.status !== 'pending').length})
          </button>
        </div>
      </div>

      {/* Multi-month Prepayment Info Banner */}
      {(myContract?.prepaidMonthsRemaining || 0) > 0 && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-purple-900">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <strong>Gói trả trước đang hoạt động:</strong> Còn {myContract?.prepaidMonthsRemaining} tháng miễn tiền phòng (tới {myContract?.prepaidUntil}). Các hóa đơn tiếp theo chỉ tính tiền điện/nước thực tế.
            </div>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            Không tìm thấy hóa đơn nào trong danh mục này.
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-900 text-sm">
                    {inv.monthYear}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    ({inv.invoiceCode})
                  </span>
                  {inv.isRentPrepaid && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-200">
                      Đã trả trước tiền phòng
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
                  <span>Tiền phòng: <strong className="text-slate-700 font-mono">{inv.isRentPrepaid ? 0 : inv.rentAmount.toLocaleString('vi-VN')} đ</strong></span>
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

              <div className="flex items-center gap-4">
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
                        <CheckCircle2 className="w-3 h-3" /> Chủ trọ đã xác nhận
                      </span>
                    ) : (
                      <span className="text-blue-700 font-semibold flex items-center gap-1 justify-end">
                        <FileCheck className="w-3 h-3" /> Đã bấm chuyển khoản
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all ${
                    inv.status === 'pending'
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>{inv.status === 'pending' ? 'Thanh toán VietQR' : 'Xem VietQR'}</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* VietQR Modal */}
      {selectedInvoice && (
        <VietQRModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

    </div>
  );
};
