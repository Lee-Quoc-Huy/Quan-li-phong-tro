import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  DoorClosed, 
  Plus, 
  Trash2, 
  Edit3, 
  Lock, 
  Unlock, 
  Users, 
  Key,
  X,
  Building
} from 'lucide-react';
import { Room } from '../../types';

export const LandlordRooms: React.FC = () => {
  const { rooms, addRoom, updateRoom, deleteRoom, toggleRoomDoor, users } = useRental();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [areaM2, setAreaM2] = useState(25);
  const [basePrice, setBasePrice] = useState(3500000);
  const [amenities, setAmenities] = useState('Điều hòa, Nóng lạnh, Tủ lạnh, Giường đệm, Khóa vân tay');
  const [doorPasscode, setDoorPasscode] = useState('123456');

  const openAddModal = () => {
    setEditingRoom(null);
    setRoomNumber(`P${rooms.length + 1}01`);
    setFloor(1);
    setAreaM2(25);
    setBasePrice(3500000);
    setAmenities('Điều hòa Inverter, Nóng lạnh, Tủ lạnh, Giường đệm, Khóa thông minh IoT');
    setDoorPasscode('123456');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Room) => {
    setEditingRoom(r);
    setRoomNumber(r.roomNumber);
    setFloor(r.floor);
    setAreaM2(r.areaM2);
    setBasePrice(r.basePrice);
    setAmenities(r.amenities.join(', '));
    setDoorPasscode(r.doorPasscode);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amenitiesArr = amenities.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingRoom) {
      updateRoom(editingRoom.id, {
        roomNumber,
        floor: Number(floor),
        areaM2: Number(areaM2),
        basePrice: Number(basePrice),
        amenities: amenitiesArr,
        doorPasscode,
      });
    } else {
      addRoom({
        roomNumber,
        floor: Number(floor),
        areaM2: Number(areaM2),
        basePrice: Number(basePrice),
        amenities: amenitiesArr,
        doorPasscode,
        status: 'available',
        doorLockState: 'locked',
        electricityMeterStart: 3000,
        waterMeterStart: 150,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý Phòng trọ
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tổng cộng {rooms.length} phòng • {rooms.filter(r => r.status === 'occupied').length} đang thuê
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2 shadow-2xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm phòng mới</span>
        </button>
      </div>

      {/* Room Grid or Empty State */}
      {rooms.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Building className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">Dãy trọ chưa có phòng nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Bắt đầu thiết lập hệ thống quản lý bằng cách tạo phòng trọ đầu tiên của bạn (số phòng, giá thuê, trang thiết bị).
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-2xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm phòng đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => {
            const tenant = users.find((u) => u.id === room.currentTenantId);

            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900">
                        {room.roomNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Tầng {room.floor} • {room.areaM2}m²
                      </span>
                    </div>

                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      room.status === 'occupied'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : room.status === 'available'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {room.status === 'occupied' ? 'Đang thuê' : room.status === 'available' ? 'Phòng trống' : 'Bảo trì'}
                    </span>
                  </div>

                  {/* Price & Tenant Info */}
                  <div className="mt-3 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Giá thuê:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {room.basePrice.toLocaleString('vi-VN')} đ/tháng
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Người thuê:</span>
                      <span className="font-semibold text-slate-800">
                        {tenant ? tenant.name : <em className="text-slate-400 font-normal">Chưa có người</em>}
                      </span>
                    </div>
                  </div>

                  {/* Amenities pills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {room.amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: IoT Lock & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Lock remote control */}
                  <button
                    onClick={() => toggleRoomDoor(room.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      room.doorLockState === 'locked'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                    title="Bấm để điều khiển khóa cửa từ xa"
                  >
                    {room.doorLockState === 'locked' ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đang khóa</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Đang mở</span>
                      </>
                    )}
                  </button>

                  {/* Edit & Delete buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(room)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Chỉnh sửa thông tin phòng"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const occupants = users.filter((u) => u.roomId === room.id);
                        const confirmText = occupants.length > 0
                          ? `Phòng ${room.roomNumber} đang có ${occupants.length} khách thuê (${occupants.map(o => o.name).join(', ')}). Bạn có chắc muốn xóa phòng này và giải phóng các khách thuê khỏi phòng không?`
                          : `Bạn có chắc chắn muốn xóa ${room.roomNumber}?`;
                        if (window.confirm(confirmText)) {
                          deleteRoom(room.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Xóa phòng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingRoom ? `Chỉnh Sửa ${editingRoom.roomNumber}` : 'Thêm Phòng Trọ Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Tên / Số phòng:</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Tầng lầu:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Diện tích (m²):</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={areaM2}
                    onChange={(e) => setAreaM2(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Giá thuê niêm yết (đ):</label>
                  <input
                    type="number"
                    required
                    step={100000}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-teal-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Mã PIN khóa cửa thông minh:</label>
                <input
                  type="text"
                  required
                  value={doorPasscode}
                  onChange={(e) => setDoorPasscode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-teal-500 focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Tiện nghi (phân cách bằng dấu phẩy):</label>
                <textarea
                  rows={2}
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-all"
                >
                  {editingRoom ? 'Lưu thay đổi' : 'Tạo phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
