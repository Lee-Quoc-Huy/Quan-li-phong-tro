import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Building2, 
  Users, 
  DoorClosed, 
  DollarSign, 
  Wrench, 
  ShieldAlert, 
  QrCode, 
  Lock, 
  Unlock, 
  Check, 
  Send, 
  Sparkles, 
  Wallet,
  Clock,
  ArrowRight,
  FileCheck,
  Bell
} from 'lucide-react';
import { AIInsightCard } from '../Common/AIInsightCard';

interface LandlordDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({ onNavigateTab }) => {
  const { 
    settings, 
    rooms, 
    invoices, 
    issues, 
    joinRequests, 
    notifications,
    toggleMainGate, 
    triggerEmergencyAlarm, 
    generateAIInvoicesBatch,
    broadcastNotice 
  } = useRental();

  const [quickNoticeText, setQuickNoticeText] = useState('');
  const [noticeSent, setNoticeSent] = useState(false);
  const [isGeneratingInvoices, setIsGeneratingInvoices] = useState(false);
  const [aiInvoiceResult, setAiInvoiceResult] = useState<{ count: number; totalSum: number } | null>(null);

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;

  const totalRevenueMonth = invoices.reduce((acc, inv) => acc + (inv.status !== 'pending' ? inv.totalAmount : 0), 0);
  const pendingInvoices = invoices.filter((i) => i.status === 'pending');
  const pendingRevenue = pendingInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  const pendingJoinRequests = joinRequests.filter((r) => r.status === 'pending');
  const activeIssues = issues.filter((i) => i.status !== 'resolved');

  const handleSendQuickNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoticeText.trim()) return;
    broadcastNotice('Thông báo từ Chủ nhà', quickNoticeText.trim(), 'normal');
    setQuickNoticeText('');
    setNoticeSent(true);
    setTimeout(() => setNoticeSent(false), 3000);
  };

  const handleRunAIAutoInvoices = () => {
    setIsGeneratingInvoices(true);
    setTimeout(() => {
      const res = generateAIInvoicesBatch();
      setAiInvoiceResult(res);
      setIsGeneratingInvoices(false);
      setTimeout(() => setAiInvoiceResult(null), 5000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header: Title and Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tổng quan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tình hình dãy trọ trong tháng 08/2026
          </p>
        </div>

        {/* Quick Toolbar: Gate & AI */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => toggleMainGate()}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              settings.mainGateState === 'locked'
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            {settings.mainGateState === 'locked' ? (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cổng chính: Đang Khóa</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-600" />
                <span>Cổng chính: Đang Mở</span>
              </>
            )}
          </button>

          <button
            onClick={handleRunAIAutoInvoices}
            disabled={isGeneratingInvoices}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
          >
            {isGeneratingInvoices ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>AI Lập hóa đơn</span>
          </button>
        </div>
      </div>

      {/* AI Invoice Success Notification */}
      {aiInvoiceResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Đã lập thành công <strong>{aiInvoiceResult.count} hóa đơn</strong> với tổng <strong>{aiInvoiceResult.totalSum.toLocaleString('vi-VN')} đ</strong>!
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('invoices')}
            className="font-bold underline text-emerald-700 hover:text-emerald-800"
          >
            Xem hóa đơn
          </button>
        </div>
      )}

      {/* 4 Metric Cards Row matching the reference screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Doanh thu đã thu */}
        <div 
          onClick={() => onNavigateTab('invoices')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {totalRevenueMonth.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Doanh thu đã thu (08/2026)
            </div>
          </div>
        </div>

        {/* Card 2: Chờ xác nhận đã chuyển khoản */}
        <div 
          onClick={() => onNavigateTab('invoices')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {pendingInvoices.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Chờ xác nhận đã chuyển khoản
            </div>
          </div>
        </div>

        {/* Card 3: Phòng đang thuê */}
        <div 
          onClick={() => onNavigateTab('rooms')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {occupiedRooms}/{totalRooms}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Phòng đang thuê ({availableRooms} phòng trống)
            </div>
          </div>
        </div>

        {/* Card 4: Sự cố đang chờ xử lý */}
        <div 
          onClick={() => onNavigateTab('issues')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeIssues.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Sự cố đang chờ xử lý
            </div>
          </div>
        </div>

      </div>

      {/* 2-Column Section: Sự cố gần đây & Thông báo đã gửi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Sự cố gần đây */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Sự cố gần đây
            </h2>
            <button
              onClick={() => onNavigateTab('issues')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {issues.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Không có sự cố nào ghi nhận.
              </div>
            ) : (
              issues.slice(0, 4).map((issue) => (
                <div 
                  key={issue.id}
                  onClick={() => onNavigateTab('issues')}
                  className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs">
                      {issue.roomNumber} · {issue.tenantName}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      issue.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : issue.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {issue.status === 'resolved' ? 'Đã xử lý' : issue.status === 'in_progress' ? 'Đang sửa' : 'Chờ xử lý'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-1">
                    {issue.description}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {issue.createdAt}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Thông báo đã gửi */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Thông báo đã gửi
            </h2>
            <button
              onClick={() => onNavigateTab('pricing')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 4).map((n) => (
              <div 
                key={n.id}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-xs truncate max-w-[200px]">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {n.timestamp}
                  </span>
                </div>
                <div className="text-xs text-slate-600 line-clamp-2">
                  {n.message}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Notice Sender Input */}
          <form onSubmit={handleSendQuickNotice} className="pt-2 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              required
              value={quickNoticeText}
              onChange={(e) => setQuickNoticeText(e.target.value)}
              placeholder="Gửi thông báo nhanh tới toàn bộ dãy trọ..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:bg-white"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shrink-0 flex items-center gap-1 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </button>
          </form>
          {noticeSent && (
            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Đã gửi thông báo thành công!
            </div>
          )}
        </div>

      </div>

      {/* Pending Tenant Join Requests Alert if any */}
      {pendingJoinRequests.length > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">
                Có {pendingJoinRequests.length} khách thuê mới gửi yêu cầu kết nối
              </div>
              <div className="text-[11px] text-amber-800">
                {pendingJoinRequests.map(r => `${r.tenantName} (${r.tenantPhone})`).join(', ')}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('tenants')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 self-start sm:self-auto shadow-2xs"
          >
            Xét duyệt ngay
          </button>
        </div>
      )}

    </div>
  );
};
