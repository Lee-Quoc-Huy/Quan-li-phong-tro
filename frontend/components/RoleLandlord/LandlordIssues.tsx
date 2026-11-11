import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Send, 
  Flame, 
  Droplet, 
  Zap, 
  KeyRound, 
  Layers 
} from 'lucide-react';
import { IssueTicket } from '../../types';

export const LandlordIssues: React.FC = () => {
  const { issues, updateIssueStatus } = useRental();

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [targetStatus, setTargetStatus] = useState<IssueTicket['status']>('in_progress');

  const pendingIssues = issues.filter((i) => i.status === 'pending');
  const inProgressIssues = issues.filter((i) => i.status === 'in_progress');
  const resolvedIssues = issues.filter((i) => i.status === 'resolved');

  const handleUpdate = (e: React.FormEvent, issueId: string) => {
    e.preventDefault();
    updateIssueStatus(issueId, targetStatus, responseNote.trim() || undefined);
    setSelectedIssueId(null);
    setResponseNote('');
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
            Sự cố & Sửa chữa
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tiếp nhận báo cáo hư hỏng từ khách và cập nhật tiến trình khắc phục
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold text-xs border border-amber-200">
            {pendingIssues.length} Chờ xử lý
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 font-semibold text-xs border border-blue-200">
            {inProgressIssues.length} Đang sửa
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200">
            {resolvedIssues.length} Đã xong
          </span>
        </div>
      </div>

      {/* Issues Queue */}
      <div className="space-y-3.5">
        {issues.map((iss) => (
          <div
            key={iss.id}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl">
                  {getCategoryIcon(iss.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {iss.roomNumber} · {iss.tenantName}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({iss.createdAt})
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] capitalize mt-0.5">
                    Hạng mục: {iss.category.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${
                iss.status === 'resolved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : iss.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {iss.status === 'resolved' ? 'Đã xử lý xong' : iss.status === 'in_progress' ? 'Đang sửa chữa' : 'Chờ tiếp nhận'}
              </span>
            </div>

            {/* Description */}
            <div className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
              {iss.description}
            </div>

            {/* Landlord Response if any */}
            {iss.hostResponse && (
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 leading-relaxed border border-emerald-100">
                <strong>Phản hồi của Chủ trọ:</strong> {iss.hostResponse}
              </div>
            )}

            {/* Action Bar / Form */}
            {selectedIssueId === iss.id ? (
              <form onSubmit={(e) => handleUpdate(e, iss.id)} className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full sm:w-1/3">
                    <label className="text-slate-700 font-semibold block mb-1">Cập nhật trạng thái:</label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                    >
                      <option value="in_progress">Đang sửa chữa</option>
                      <option value="resolved">Đã khắc phục xong</option>
                      <option value="pending">Chờ thợ đến</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="text-slate-700 font-semibold block mb-1">Tin nhắn phản hồi cho khách:</label>
                    <input
                      type="text"
                      value={responseNote}
                      onChange={(e) => setResponseNote(e.target.value)}
                      placeholder="vd: Thợ điện đã thay bóng mới, khách kiểm tra lại nhé..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedIssueId(null)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 text-white font-bold shadow-2xs"
                  >
                    Lưu cập nhật
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSelectedIssueId(iss.id);
                    setTargetStatus(iss.status);
                    setResponseNote(iss.hostResponse || '');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                >
                  Cập nhật tiến độ & Phản hồi
                </button>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
};
