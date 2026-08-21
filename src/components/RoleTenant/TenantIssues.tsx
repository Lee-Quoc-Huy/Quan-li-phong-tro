import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Wrench, 
  Plus, 
  CheckCircle2, 
  Zap, 
  Droplet, 
  KeyRound, 
  Flame, 
  Layers 
} from 'lucide-react';
import { IssueTicket } from '../../types';

export const TenantIssues: React.FC = () => {
  const { currentUser, rooms, issues, createIssue } = useRental();
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

  const [isCreating, setIsCreating] = useState(false);
  const [category, setCategory] = useState<IssueTicket['category']>('nuoc');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<IssueTicket['urgency']>('medium');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80'
  );
  const [successNotice, setSuccessNotice] = useState(false);

  const myIssues = issues.filter((iss) => iss.roomId === myRoom.id || iss.tenantId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createIssue({
      category,
      title: title.trim(),
      description: description.trim(),
      urgency,
      photos: [selectedPhoto],
    });

    setTitle('');
    setDescription('');
    setIsCreating(false);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 4000);
  };

  const getCategoryIcon = (cat: IssueTicket['category']) => {
    switch (cat) {
      case 'dien':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'nuoc':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'khoa_cua':
        return <KeyRound className="w-4 h-4 text-purple-600" />;
      case 'dieu_hoa':
        return <Flame className="w-4 h-4 text-cyan-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sự Cố & Sửa Chữa
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Báo cáo hư hỏng tại phòng {myRoom.roomNumber} và theo dõi phản hồi từ chủ trọ
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Đóng mẫu' : 'Báo cáo sự cố mới'}</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Báo cáo sự cố đã được gửi tới chủ trọ thành công!</span>
        </div>
      )}

      {/* Creation Form */}
      {isCreating && (
        <form onSubmit={handleSubmit} className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 text-xs animate-in fade-in">
          <h2 className="font-bold text-slate-900 text-sm">Gửi Báo Cáo Hư Hỏng</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Hạng mục sự cố:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              >
                <option value="nuoc">Đường nước / Thiết bị vệ sinh</option>
                <option value="dien">Hệ thống điện / Đèn chiếu sáng</option>
                <option value="dieu_hoa">Điều hòa / Nóng lạnh</option>
                <option value="khoa_cua">Khóa cửa thông minh / Cửa sổ</option>
                <option value="khac">Khác (tường, trần, mùi...)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Tiêu đề ngắn gọn:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="vd: Vòi sen bị gãy ren nước chảy yếu..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold block">Mô tả chi tiết tình trạng:</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả cụ thể thời gian bắt đầu xảy ra và mức độ ảnh hưởng..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-2xs"
            >
              Gửi yêu cầu sửa chữa
            </button>
          </div>
        </form>
      )}

      {/* Issues List */}
      <div className="space-y-3">
        {myIssues.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            Phòng của bạn chưa gửi báo cáo sự cố nào.
          </div>
        ) : (
          myIssues.map((iss) => (
            <div
              key={iss.id}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    {getCategoryIcon(iss.category)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {iss.title}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Gửi lúc: {iss.createdAt}
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  iss.status === 'resolved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : iss.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {iss.status === 'resolved' ? 'Đã xử lý xong' : iss.status === 'in_progress' ? 'Đang sửa chữa' : 'Chờ chủ trọ tiếp nhận'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                {iss.description}
              </div>

              {iss.hostResponse && (
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 leading-relaxed border border-emerald-100 font-medium">
                  <strong>Chủ trọ phản hồi:</strong> {iss.hostResponse}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
