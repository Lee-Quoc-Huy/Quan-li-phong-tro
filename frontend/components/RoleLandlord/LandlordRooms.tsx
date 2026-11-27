import React, { useEffect, useRef, useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  DoorClosed, 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  Key,
  X,
  Building
} from 'lucide-react';
import { Room } from '../../types';
import { getRoomPhotoUrls, maxRoomPhotoBytes, maxRoomPhotos, roomPhotoTypes, roomPhotoUploadConfigured, uploadRoomPhoto } from '../../lib/roomPhotos';

function LocalPhotoPreview({ file, position }: { file: File; position: number }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const preview = URL.createObjectURL(file);
    setUrl(preview);
    return () => URL.revokeObjectURL(preview);
  }, [file]);

  return url ? <img src={url} alt={`Ảnh ${position}`} className="size-full object-cover" /> : null;
}

export const LandlordRooms: React.FC = () => {
  const { rooms, addRoom, updateRoom, deleteRoom, users, isSupabaseConnected } = useRental();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [areaM2, setAreaM2] = useState(25);
  const [basePrice, setBasePrice] = useState(3500000);
  const [amenities, setAmenities] = useState('Điều hòa, Nóng lạnh, Tủ lạnh, Giường đệm');
  const [photos, setPhotos] = useState<(string | File)[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const saveInProgress = useRef(false);
  const draftRoomId = useRef('');
  const canUpload = isSupabaseConnected && roomPhotoUploadConfigured;

  const openAddModal = () => {
    setEditingRoom(null);
    draftRoomId.current = `room_${crypto.randomUUID?.() ?? Date.now()}`;
    setPhotos([]);
    setPhotoError('');
    setRoomNumber(`P${rooms.length + 1}01`);
    setFloor(1);
    setAreaM2(25);
    setBasePrice(3500000);
    setAmenities('Điều hòa Inverter, Nóng lạnh, Tủ lạnh, Giường đệm');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Room) => {
    setEditingRoom(r);
    setPhotos(getRoomPhotoUrls(r.imageUrls));
    setPhotoError('');
    setRoomNumber(r.roomNumber);
    setFloor(r.floor);
    setAreaM2(r.areaM2);
    setBasePrice(r.basePrice);
    setAmenities(r.amenities.join(', '));
    setIsModalOpen(true);
  };

  const handlePhotoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from<File>(e.currentTarget.files ?? []);
    e.currentTarget.value = '';
    setPhotoError('');
    if (photos.length + files.length > maxRoomPhotos) {
      setPhotoError(`Mỗi phòng có tối đa ${maxRoomPhotos} ảnh.`);
      return;
    }
    if (files.some((file) => !roomPhotoTypes.includes(file.type) || file.size === 0 || file.size > maxRoomPhotoBytes)) {
      setPhotoError('Chọn ảnh JPG, PNG hoặc WebP tối đa 8 MB mỗi ảnh.');
      return;
    }
    setPhotos((current) => [...current, ...files]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saveInProgress.current) return;
    saveInProgress.current = true;
    setPhotoError('');
    setSaveStatus('Đang lưu phòng…');
    try {
      const imageUrls: string[] = [];
      for (const [index, photo] of photos.entries()) {
        if (typeof photo === 'string') {
          imageUrls.push(photo);
          continue;
        }
        setSaveStatus(`Đang tải ảnh ${index + 1}/${photos.length}…`);
        let url: string;
        try {
          url = await uploadRoomPhoto(photo);
        } catch {
          throw new Error(`Không tải được ảnh ${index + 1}. Hãy thử lưu lại hoặc gỡ ảnh này.`);
        }
        imageUrls.push(url);
        setPhotos((current) => current.map((item, itemIndex) => itemIndex === index ? url : item));
      }
      setSaveStatus('Đang lưu phòng…');
      const details = {
        roomNumber,
        floor: Number(floor),
        areaM2: Number(areaM2),
        basePrice: Number(basePrice),
        amenities: amenities.split(',').map((item) => item.trim()).filter(Boolean),
      };
      const saved = editingRoom
        ? await updateRoom(editingRoom.id, {
            ...details,
            ...(imageUrls.length || editingRoom.imageUrls?.length ? { imageUrls } : {}),
          })
        : await addRoom({
            ...details,
            ...(imageUrls.length ? { imageUrls } : {}),
            status: 'available',
            electricityMeterStart: 3000,
            waterMeterStart: 150,
          }, draftRoomId.current);
      if (!saved) throw new Error('Chưa lưu được phòng vào Supabase. Hãy thử lại.');
      setIsModalOpen(false);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Chưa lưu được phòng. Hãy thử lại.');
    } finally {
      saveInProgress.current = false;
      setSaveStatus('');
    }
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

                {/* Card Footer: Status & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    room.status === 'occupied' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {room.status === 'occupied' ? 'Đang cho thuê' : 'Đang trống'}
                  </span>

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
          <div role="dialog" aria-modal="true" aria-labelledby="room-form-title" className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="room-form-title" className="font-bold text-slate-900 text-base">
                {editingRoom ? `Chỉnh Sửa ${editingRoom.roomNumber}` : 'Thêm Phòng Trọ Mới'}
              </h3>
              <button
                type="button"
                aria-label="Đóng biểu mẫu phòng"
                disabled={Boolean(saveStatus)}
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <fieldset disabled={Boolean(saveStatus)} className="min-w-0 space-y-4">
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
                <label className="text-slate-700 font-semibold">Tiện nghi (phân cách bằng dấu phẩy):</label>
                <textarea
                  rows={2}
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="room-photos" className="block font-semibold text-slate-700">Ảnh phòng</label>
                <p id="room-photo-help" className="text-slate-600">
                  {canUpload
                    ? `Tối đa ${maxRoomPhotos} ảnh JPG, PNG hoặc WebP, 8 MB mỗi ảnh. Ảnh đầu tiên là ảnh bìa công khai khi phòng trống.`
                    : 'Cần cấu hình Cloudinary và Supabase để tải ảnh.'}
                </p>
                <input
                  id="room-photos"
                  type="file"
                  multiple
                  accept={roomPhotoTypes.join(',')}
                  disabled={!canUpload || photos.length >= maxRoomPhotos}
                  aria-describedby="room-photo-help"
                  onChange={handlePhotoSelection}
                  className="block w-full rounded-xl border border-slate-200 p-2 text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-teal-800 disabled:opacity-60"
                />
                {photos.length > 0 && (
                  <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {photos.map((photo, index) => (
                      <li key={index} className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                        {typeof photo === 'string'
                          ? <img src={photo} alt={`Ảnh ${index + 1}`} className="size-full object-cover" />
                          : <LocalPhotoPreview file={photo} position={index + 1} />}
                        <button
                          type="button"
                          aria-label={`Gỡ ảnh ${index + 1}`}
                          onClick={() => {
                            setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index));
                            setPhotoError('');
                          }}
                          className="absolute right-0 top-0 grid size-11 place-items-center rounded-bl-lg bg-slate-950/75 text-white hover:bg-slate-950"
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              </fieldset>

              {photoError && <p role="alert" className="text-sm text-rose-700">{photoError}</p>}
              {saveStatus && <p role="status" className="text-sm text-slate-700">{saveStatus}</p>}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  disabled={Boolean(saveStatus)}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={Boolean(saveStatus)}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-all disabled:opacity-50"
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
