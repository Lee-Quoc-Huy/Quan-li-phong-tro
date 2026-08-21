import React, { useState } from 'react';
import { Invoice } from '../../types';
import { useRental } from '../../context/RentalContext';
import { 
  QrCode, 
  Copy, 
  CheckCircle2, 
  X, 
  Building2, 
  Calendar,
  Zap, 
  Droplet, 
  Share2,
  Check,
  Receipt,
  FileCheck
} from 'lucide-react';

interface VietQRModalProps {
  invoice: Invoice;
  onClose: () => void;
  mode?: 'landlord' | 'tenant';
}

export const VietQRModal: React.FC<VietQRModalProps> = ({ invoice, onClose, mode }) => {
  const { currentUser, payInvoice, confirmInvoicePayment, contracts } = useRental();
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedFullMessage, setCopiedFullMessage] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [hostVerifiedDone, setHostVerifiedDone] = useState(false);

  const isLandlord = mode ? mode === 'landlord' : currentUser.role === 'landlord' || currentUser.role === 'admin';

  const contract = contracts.find((c) => c.roomId === invoice.roomId && c.status === 'active');
  const baseMonthlyRent = contract?.monthlyRent || invoice.rentAmount || 5000000;

  const additionalRent = isLandlord ? 0 : (selectedMonths - 1) * baseMonthlyRent;
  const grandTotal = isLandlord ? invoice.totalAmount : invoice.totalAmount + additionalRent;

  const transferContentText = isLandlord 
    ? invoice.bankInfo.transferContent 
    : (invoice.bankInfo.transferContent + (selectedMonths > 1 ? ` TT${selectedMonths}THANG` : ''));

  const qrUrl = `https://api.vietqr.io/image/${invoice.bankInfo.bankCode}-${invoice.bankInfo.accountNumber}-compact2.png?amount=${grandTotal}&addInfo=${encodeURIComponent(transferContentText)}&accountName=${encodeURIComponent(invoice.bankInfo.accountName)}`;

  const handleCopy = (text: string, type: 'account' | 'content') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  const handleCopyFullMessage = () => {
    const msg = `[QUẢN LÍ NHÀ TRỌ - THÔNG BÁO TIỀN PHÒNG]
Kính gửi bạn ${invoice.tenantName} (${invoice.roomNumber}),
Chi tiết hóa đơn kỳ ${invoice.monthYear}:
- Tiền phòng: ${invoice.isRentPrepaid ? '0 đ (Đã trả trước)' : `${invoice.rentAmount.toLocaleString('vi-VN')} đ`}
- Tiền điện (${invoice.electricityUsed} kWh): ${invoice.electricityTotal.toLocaleString('vi-VN')} đ
- Tiền nước (${invoice.waterUsed} m³): ${invoice.waterTotal.toLocaleString('vi-VN')} đ
- Dịch vụ + Rác + Wifi: ${(invoice.serviceFee + invoice.garbageFee + invoice.internetFee).toLocaleString('vi-VN')} đ
${invoice.extraFee ? `- Phí khác (${invoice.extraFeeReason || 'Phát sinh'}): ${invoice.extraFee.toLocaleString('vi-VN')} đ\n` : ''}👉 TỔNG THANH TOÁN: ${invoice.totalAmount.toLocaleString('vi-VN')} đ

THÔNG TIN CHUYỂN KHOẢN:
- Ngân hàng: ${invoice.bankInfo.bankName} (${invoice.bankInfo.bankCode})
- Số tài khoản: ${invoice.bankInfo.accountNumber}
- Chủ tài khoản: ${invoice.bankInfo.accountName}
- Nội dung CK: ${invoice.bankInfo.transferContent}`;

    navigator.clipboard.writeText(msg);
    setCopiedFullMessage(true);
    setTimeout(() => setCopiedFullMessage(false), 2500);
  };

  const handleTenantConfirmPaid = () => {
    setIsProcessing(true);
    setTimeout(() => {
      payInvoice(invoice.id, selectedMonths);
      setIsProcessing(false);
      setPaymentDone(true);
      setTimeout(() => {
        onClose();
      }, 1600);
    }, 1000);
  };

  const handleLandlordVerifyPaid = () => {
    setIsProcessing(true);
    setTimeout(() => {
      confirmInvoicePayment(invoice.id);
      setIsProcessing(false);
      setHostVerifiedDone(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 border border-teal-200/60 rounded-xl text-teal-700">
              {isLandlord ? <Receipt className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {isLandlord ? `Mã VietQR Thu Tiền • Phòng ${invoice.roomNumber}` : 'Thanh Toán VietQR'}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isLandlord 
                    ? 'bg-teal-100 text-teal-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isLandlord ? 'Mã QR nhận tiền của Chủ nhà' : 'Tự động ghi nhận'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Khách thuê: <strong className="text-slate-800 font-semibold">{invoice.tenantName}</strong> • Mã HĐ: <span className="font-mono text-slate-600 font-medium">{invoice.invoiceCode}</span> • Kỳ: {invoice.monthYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentDone ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Giao dịch đã báo chuyển khoản thành công!</h4>
            <p className="text-sm text-slate-600 max-w-md">
              Hệ thống đã tự động gửi thông báo thanh toán {grandTotal.toLocaleString('vi-VN')} đ tới Chủ trọ để đối soát.
            </p>
          </div>
        ) : hostVerifiedDone ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Đã duyệt thu tiền thành công!</h4>
            <p className="text-sm text-slate-600 max-w-md">
              Hóa đơn {invoice.invoiceCode} phòng {invoice.roomNumber} đã được cập nhật sang trạng thái Đã thu tiền.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Landlord Info Tip */}
            {isLandlord ? (
              <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200 text-xs text-teal-900 flex items-start justify-between gap-3">
                <div className="leading-relaxed">
                  <strong>Mã QR nhận tiền của bạn:</strong> Khách thuê quét mã này sẽ chuyển khoản chính xác <strong>{invoice.totalAmount.toLocaleString('vi-VN')} đ</strong> vào tài khoản ngân hàng của bạn.
                </div>
                <button
                  type="button"
                  onClick={handleCopyFullMessage}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] flex items-center gap-1 transition-all shadow-2xs"
                >
                  {copiedFullMessage ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedFullMessage ? 'Đã chép tin nhắn!' : 'Chép tin gửi khách'}</span>
                </button>
              </div>
            ) : (
              /* Tenant: Multi-month prepayment option */
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <Calendar className="w-4 h-4" /> Đóng trước tiền phòng
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    (Điện nước vẫn chốt theo tháng)
                  </span>
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { months: 1, label: '1 Tháng', note: 'Hiện tại' },
                    { months: 2, label: '2 Tháng', note: '+1T trước' },
                    { months: 3, label: '3 Tháng', note: '+2T trước' },
                    { months: 6, label: '6 Tháng', note: '+5T trước' },
                  ].map((item) => (
                    <button
                      key={item.months}
                      onClick={() => setSelectedMonths(item.months)}
                      type="button"
                      className={`p-2 rounded-lg text-left transition-all border ${
                        selectedMonths === item.months
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.note}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code & Banking details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              
              {/* QR Image Box */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-900">
                <div className="text-center mb-1">
                  <div className="font-bold text-xs text-blue-900 tracking-wider">VIETQR 247 NAPAS</div>
                  <div className="text-[10px] text-slate-500">
                    {isLandlord ? 'Mã QR thanh toán phòng ' + invoice.roomNumber : 'Mở app Ngân hàng quét mã'}
                  </div>
                </div>
                <img
                  src={qrUrl}
                  alt="VietQR Code"
                  referrerPolicy="no-referrer"
                  className="w-44 h-44 object-contain rounded-lg my-1 border border-slate-200 bg-white shadow-2xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="w-full flex items-center justify-between text-xs font-bold text-slate-800 border-t border-slate-200 pt-1.5 mt-1">
                  <span>Số tiền:</span>
                  <span className="text-teal-700 font-mono font-bold">{grandTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <span>Ngân hàng nhận tiền:</span>
                  </div>
                  <div className="font-semibold text-slate-800 pl-6">
                    {invoice.bankInfo.bankName} ({invoice.bankInfo.bankCode})
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 pl-6">Số tài khoản:</span>
                    <button
                      onClick={() => handleCopy(invoice.bankInfo.accountNumber, 'account')}
                      className="flex items-center gap-1 text-teal-700 hover:text-teal-800 font-mono font-bold"
                    >
                      {invoice.bankInfo.accountNumber}
                      {copiedAccount ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 pl-6">Chủ tài khoản:</span>
                    <span className="font-semibold text-slate-800">{invoice.bankInfo.accountName}</span>
                  </div>
                </div>

                {/* Transfer Content */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500">Cú pháp chuyển khoản:</div>
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {transferContentText}
                    </span>
                    <button
                      onClick={() => handleCopy(transferContentText, 'content')}
                      className="text-teal-700 hover:text-teal-800 text-xs flex items-center gap-1 font-medium"
                    >
                      {copiedContent ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Fee breakdown summary */}
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-700">
                    <span>Tiền phòng {selectedMonths > 1 && !isLandlord ? `(${selectedMonths} tháng)` : ''}:</span>
                    <span className="font-medium font-mono">
                      {invoice.isRentPrepaid ? '0 đ (Đã trả trước)' : `${(invoice.rentAmount + additionalRent).toLocaleString('vi-VN')} đ`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Điện ({invoice.electricityUsed} kWh):</span>
                    <span className="font-mono">{invoice.electricityTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span className="flex items-center gap-1"><Droplet className="w-3 h-3 text-blue-500" /> Nước ({invoice.waterUsed} m³):</span>
                    <span className="font-mono">{invoice.waterTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="border-t border-teal-200/60 pt-1 flex justify-between font-bold text-teal-900 text-xs">
                    <span>Tổng hóa đơn:</span>
                    <span className="font-mono">{grandTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={onClose}
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Đóng
              </button>

              {isLandlord ? (
                /* Landlord Action */
                invoice.status !== 'verified_by_host' ? (
                  <button
                    onClick={handleLandlordVerifyPaid}
                    disabled={isProcessing}
                    type="button"
                    className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang duyệt...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Duyệt xác nhận đã thu tiền ({invoice.totalAmount.toLocaleString('vi-VN')} đ)
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex-2 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Đã duyệt thu tiền
                  </div>
                )
              ) : (
                /* Tenant Action */
                <button
                  onClick={handleTenantConfirmPaid}
                  disabled={isProcessing}
                  type="button"
                  className="flex-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xác nhận...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Tôi đã chuyển khoản ({grandTotal.toLocaleString('vi-VN')} đ)
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
