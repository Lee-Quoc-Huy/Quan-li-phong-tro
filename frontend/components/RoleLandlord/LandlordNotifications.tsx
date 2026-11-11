import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Bell, 
  Send, 
  Sparkles, 
  Check, 
  Volume2, 
  AlertTriangle, 
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { draftNotificationWithAI } from '../../services/aiService';
import { AppNotification } from '../../types';

export const LandlordNotifications: React.FC = () => {
  const { notifications, broadcastNotice, settings } = useRental();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<AppNotification['priority']>('normal');
  const [targetAudience, setTargetAudience] = useState<'all' | 'unpaid'>('all');
  
  // AI Drafting tool
  const [aiTopic, setAiTopic] = useState('Nhắc đóng tiền phòng và tiền điện nước cuối tháng');
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [successSent, setSuccessSent] = useState(false);

  const handleAiDraft = async () => {
    if (!aiTopic.trim()) return;
    setIsAiDrafting(true);
    try {
      const res = await draftNotificationWithAI(aiTopic.trim(), settings.houseName);
      setTitle(res.title);
      setMessage(res.message);
    } catch (e) {
      // fallback
    } finally {
      setIsAiDrafting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    broadcastNotice(title.trim(), message.trim(), priority);
    setTitle('');
    setMessage('');
    setSuccessSent(true);
    setTimeout(() => setSuccessSent(false), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" /> Hệ thống truyền thanh & thông báo
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100">
            Phát Sóng Thông Báo Đến Toàn Bộ Khách Thuê
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Soạn thảo thông báo bảo trì, lịch đóng tiền, thông báo vệ sinh, tích hợp AI tự động soạn thảo mẫu chuẩn.
          </p>
        </div>
      </div>

      {successSent && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Đã phát sóng thông báo thành công! Tất cả khách thuê phòng đều nhận được cảnh báo ngay lập tức.</span>
        </div>
      )}

      {/* Grid: Composer & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Broadcast Form */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
          
          {/* AI Drafting Assistant Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" /> Trợ Lý AI Soạn Thảo Thông Báo Chuyên Nghiệp
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">Gemini AI</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Nhập chủ đề (vd: Cắt điện 2 tiếng để bảo trì, Khử khuẩn dãy trọ...)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-black/50 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAiDraft}
                disabled={isAiDrafting}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isAiDrafting ? <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Tạo Mẫu AI
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mức độ ưu tiên:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-slate-100 focus:border-amber-500 outline-none"
                >
                  <option value="normal">Bình thường (Tin tức chung)</option>
                  <option value="high">Quan trọng (Nhắc thanh toán)</option>
                  <option value="urgent">Khẩn cấp (Sự cố an ninh / kỹ thuật)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Đối tượng nhận:</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-slate-100 focus:border-amber-500 outline-none"
                >
                  <option value="all">Toàn bộ khách trong dãy trọ</option>
                  <option value="unpaid">Chỉ các phòng chưa đóng tiền</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tiêu đề thông báo:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Lịch bảo dưỡng bồn nước tầng mái..."
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-slate-700 text-slate-100 font-bold focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Nội dung chi tiết:</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập nội dung đầy đủ gửi đến ứng dụng của người thuê phòng..."
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-slate-700 text-slate-100 focus:border-amber-500 outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-950/40 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Phát Sóng Thông Báo Ngay
              </button>
            </div>

          </form>
        </div>

        {/* Right: Notification History Feed */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400" /> Nhật Ký Phát Sóng
          </h3>

          <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-black/40 border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{n.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">{n.timestamp}</span>
                </div>
                <p className="text-slate-400 leading-relaxed">{n.message}</p>
                <div className="text-[10px] text-amber-400 font-medium pt-1">
                  Phát bởi: {n.senderName}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
