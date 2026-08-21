import React from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  FileCheck, 
  Building, 
  User, 
  ShieldCheck
} from 'lucide-react';

export const TenantContract: React.FC = () => {
  const { currentUser, rooms, contracts, settings } = useRental();

  const defaultUnassignedRoom = {
    id: 'room_unassigned',
    roomNumber: 'Chưa vào phòng',
    floor: 1,
    areaM2: 0,
    basePrice: 0,
    amenities: [],
    status: 'available' as const,
    doorLockState: 'locked' as const,
    doorPasscode: '---',
    securityStatus: 'secure' as const,
    electricityMeterStart: 0,
    waterMeterStart: 0,
  };

  const myRoom = rooms.find((r) => r.id === currentUser.roomId) || rooms.find((r) => r.currentTenantId === currentUser.id) || rooms[0] || defaultUnassignedRoom;
  const contract = contracts.find((c) => c.roomId === myRoom.id && c.status === 'active') || contracts[0];

  if (!contract) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hợp Đồng Điện Tử
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Thông tin hợp đồng thuê phòng số hóa giữa bạn và chủ nhà
          </p>
        </div>

        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileCheck className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-800">Chưa có hợp đồng nào được ký</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Khi chủ nhà lập hợp đồng thuê phòng cho bạn, toàn bộ điều khoản và chữ ký số sẽ hiển thị tại đây.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hợp Đồng Điện Tử
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Thông tin hợp đồng thuê phòng số hóa giữa bạn và chủ nhà
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Đang có hiệu lực</span>
        </div>
      </div>

      {/* Contract Document View */}
      <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-slate-800">
        
        {/* Title */}
        <div className="text-center pb-5 border-b border-slate-100 space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </div>
          <div className="text-[11px] text-slate-400">Độc lập - Tự do - Hạnh phúc</div>
          <h2 className="text-xl font-bold text-slate-900 pt-2">
            HỢP ĐỒNG THUÊ PHÒNG TRỌ
          </h2>
          <div className="text-xs text-slate-500">
            Mã HĐ: <span className="font-mono text-teal-700 font-bold">{contract.contractCode}</span> • Ngày ký: {contract.signedAt}
          </div>
        </div>

        {/* Parties involved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Party A */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Building className="w-4 h-4 text-teal-600" /> BÊN CHO THUÊ (BÊN A)
            </div>
            <div><strong>Chủ nhà:</strong> {contract.landlordName}</div>
            <div><strong>Dãy trọ:</strong> {settings.houseName}</div>
            <div><strong>Địa chỉ:</strong> {settings.houseAddress}</div>
            <div><strong>Mã chủ trọ:</strong> <span className="font-mono font-bold text-teal-700">{settings.hostCode}</span></div>
          </div>

          {/* Party B */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <User className="w-4 h-4 text-teal-600" /> BÊN THUÊ PHÒNG (BÊN B)
            </div>
            <div><strong>Khách thuê:</strong> {contract.tenantName}</div>
            <div><strong>Số CCCD:</strong> <span className="font-mono">{contract.tenantIdCard}</span></div>
            <div><strong>Số điện thoại:</strong> <span className="font-mono">{contract.tenantPhone}</span></div>
            <div><strong>Phòng:</strong> <span className="text-teal-700 font-bold">{contract.roomNumber}</span> (Tầng {myRoom.floor}, {myRoom.areaM2}m²)</div>
          </div>

        </div>

        {/* Financial info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400">Tiền đặt cọc:</div>
            <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
              {contract.depositAmount.toLocaleString('vi-VN')} đ
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400">Giá thuê/tháng:</div>
            <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
              {contract.monthlyRent.toLocaleString('vi-VN')} đ
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400">Ngày bắt đầu:</div>
            <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
              {contract.startDate}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400">Ngày hết hạn:</div>
            <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
              {contract.endDate}
            </div>
          </div>
        </div>

        {/* Signature note */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          Hợp đồng này được khởi tạo và lưu trữ trên hệ thống số hóa Quản lí nhà trọ.
        </div>

      </div>

    </div>
  );
};
