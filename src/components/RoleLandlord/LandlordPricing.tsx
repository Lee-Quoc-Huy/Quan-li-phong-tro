import React, { useState, useEffect } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  DollarSign, 
  Zap, 
  Droplet, 
  Wifi, 
  Check, 
  Send, 
  Bell, 
  Table, 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  MapPin,
  HelpCircle,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const LandlordPricing: React.FC = () => {
  const { 
    settings, 
    updatePricing, 
    notifications, 
    broadcastNotice,
    testGoogleSheetConnection,
    syncAllTenantsToGoogleSheet,
    updateGoogleSheetSettings
  } = useRental();

  const [houseName, setHouseName] = useState(settings.houseName || '');
  const [houseAddress, setHouseAddress] = useState(settings.houseAddress || '');
  const [electricityRate, setElectricityRate] = useState(settings.electricityRate);
  const [waterRate, setWaterRate] = useState(settings.waterRate);
  const [garbageFee, setGarbageFee] = useState(settings.garbageFee);
  const [internetFee, setInternetFee] = useState(settings.internetFee);
  const [serviceFee, setServiceFee] = useState(settings.serviceFee);

  // Google Sheet Webhook states
  const [webhookUrl, setWebhookUrl] = useState(
    settings.googleSheetWebhookUrl || ''
  );
  const [syncEnabled, setSyncEnabled] = useState(settings.googleSheetSyncEnabled !== false);
  const [isTestingSync, setIsTestingSync] = useState(false);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [noticeSentSuccess, setNoticeSentSuccess] = useState(false);

  const appsScriptTemplate = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    
    // Tự động tạo hàng tiêu đề nếu sheet còn trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Mã phòng", "Họ và tên khách", "Số điện thoại", "Số CCCD", 
        "Ngày bắt đầu", "Hạn hợp đồng", "Giá thuê (VNĐ)", "Tiền cọc (VNĐ)", "Trạng thái", "Cập nhật lúc"
      ]);
    }
    
    // 1. Nếu là lệnh đồng bộ toàn bộ (sync_all)
    if (payload.action === "sync_all" && payload.data && Array.isArray(payload.data)) {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      payload.data.forEach(function(t) {
        sheet.appendRow([
          t.roomNumber || "",
          t.tenantName || t.name || "",
          t.phone || "",
          t.identityCard || t.idCard || "---",
          t.startDate || "",
          t.endDate || "Vô thời hạn",
          t.price || t.monthlyRent || 0,
          t.deposit || t.depositAmount || 0,
          t.status || "Đang thuê",
          new Date().toLocaleString("vi-VN")
        ]);
      });
    } 
    // 2. Nếu là lệnh thêm khách / hợp đồng mới (ADD / new_contract)
    else if (payload.action === "ADD" || payload.action === "new_contract") {
      var t = payload.data || payload.tenant || {};
      sheet.appendRow([
        t.roomNumber || "",
        t.tenantName || t.name || "",
        t.phone || "",
        t.identityCard || t.idCard || "---",
        t.startDate || "",
        t.endDate || "Vô thời hạn",
        t.price || t.monthlyRent || 0,
        t.deposit || t.depositAmount || 0,
        t.status || "Đang thuê",
        new Date().toLocaleString("vi-VN")
      ]);
    }
    // 3. Nếu là lệnh xóa khách / trả phòng (DELETE)
    else if (payload.action === "DELETE") {
      var targetId = payload.tenant ? (payload.tenant.id || payload.tenant.phone) : "";
      var rows = sheet.getDataRange().getValues();
      for (var i = rows.length - 1; i >= 1; i--) {
        if (rows[i][2] == targetId || rows[i][0] == targetId) {
          sheet.deleteRow(i + 1);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(appsScriptTemplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  useEffect(() => {
    setHouseName(settings.houseName || '');
    setHouseAddress(settings.houseAddress || '');
    setElectricityRate(settings.electricityRate);
    setWaterRate(settings.waterRate);
    setGarbageFee(settings.garbageFee);
    setInternetFee(settings.internetFee);
    setServiceFee(settings.serviceFee);
    setWebhookUrl(settings.googleSheetWebhookUrl || '');
    setSyncEnabled(settings.googleSheetSyncEnabled !== false);
  }, [settings]);

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricing({
      houseName: houseName.trim() || settings.houseName,
      houseAddress: houseAddress.trim() || settings.houseAddress,
      electricityRate: Number(electricityRate),
      waterRate: Number(waterRate),
      garbageFee: Number(garbageFee),
      internetFee: Number(internetFee),
      serviceFee: Number(serviceFee),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveGoogleSheetConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoogleSheetSettings(webhookUrl, syncEnabled);
    setSyncFeedback({
      success: true,
      message: 'Đã lưu cấu hình Google Sheet Webhook thành công!',
    });
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleTestConnection = async () => {
    setIsTestingSync(true);
    setSyncFeedback(null);
    const res = await testGoogleSheetConnection(webhookUrl);
    setIsTestingSync(false);
    setSyncFeedback(res);
    setTimeout(() => setSyncFeedback(null), 6000);
  };

  const handleSyncAll = async () => {
    setIsBatchSyncing(true);
    setSyncFeedback(null);
    const res = await syncAllTenantsToGoogleSheet();
    setIsBatchSyncing(false);
    setSyncFeedback({
      success: res.success,
      message: res.message,
    });
    setTimeout(() => setSyncFeedback(null), 6000);
  };

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeBody.trim()) return;
    broadcastNotice(noticeTitle.trim(), noticeBody.trim(), 'normal');
    setNoticeTitle('');
    setNoticeBody('');
    setNoticeSentSuccess(true);
    setTimeout(() => setNoticeSentSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Giá, Thông báo & Tích Hợp Google Sheet
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Thiết lập đơn giá dịch vụ điện nước, kết nối Google Apps Script và phát tin tức
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã lưu bảng giá mới! Khách thuê đã được tự động thông báo.</span>
        </div>
      )}

      {noticeSentSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã phát sóng thông báo tới toàn bộ người thuê trọ!</span>
        </div>
      )}

      {/* Google Sheet Integration Feature Card */}
      <div className="p-5 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white rounded-2xl border border-emerald-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  Đồng Bộ Google Sheet Riêng Của Chủ Trọ
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  webhookUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {webhookUrl ? 'Đã Kết Nối' : 'Chưa Kết Nối'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Tự động đẩy thông tin khách thuê sang Google Sheet mỗi 5 phút hoặc ngay khi có hợp đồng mới.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showGuide ? 'Ẩn hướng dẫn' : 'Xem hướng dẫn cài đặt'}</span>
              {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={handleSyncAll}
              disabled={isBatchSyncing || !webhookUrl}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBatchSyncing ? 'animate-spin' : ''}`} />
              <span>{isBatchSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
            </button>
          </div>
        </div>

        {/* Detailed Guide Accordion */}
        {showGuide && (
          <div className="p-4 rounded-xl bg-white border border-emerald-200/90 text-xs text-slate-700 space-y-3 animate-in fade-in">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Hướng dẫn 3 bước kết nối Google Sheet cá nhân của bạn:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                <div className="font-bold text-emerald-800">Bước 1: Tạo Google Sheet</div>
                <p className="text-[11px] text-slate-600">
                  Mở <b>Google Sheets</b> trên tài khoản cá nhân, tạo một trang tính mới.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                <div className="font-bold text-emerald-800">Bước 2: Dán mã Apps Script</div>
                <p className="text-[11px] text-slate-600">
                  Vào <b>Tiện ích mở rộng $\rightarrow$ Apps Script</b>, dán đoạn mã bên dưới rồi bấm <b>Triển khai (Web App)</b> với quyền truy cập <b>"Bất kỳ ai"</b>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                <div className="font-bold text-emerald-800">Bước 3: Dán link Webhook</div>
                <p className="text-[11px] text-slate-600">
                  Dán đường link <code className="text-emerald-700 font-mono">.../exec</code> vào ô bên dưới và bấm <b>Lưu Cấu Hình</b>.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-slate-800">Mã Google Apps Script (Sẵn sàng sao chép):</span>
                <button
                  type="button"
                  onClick={copyAppsScript}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-emerald-700" />}
                  <span>{copiedCode ? 'Đã sao chép mã!' : 'Sao chép mã Apps Script'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48">
                {appsScriptTemplate}
              </pre>
            </div>
          </div>
        )}

        {syncFeedback && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            syncFeedback.success 
              ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}>
            {syncFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{syncFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveGoogleSheetConfig} className="space-y-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-semibold block">
                Google Apps Script Webhook URL (Bản triển khai web của Chủ trọ):
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {settings.googleSheetLastSync ? `Đồng bộ lần cuối: ${settings.googleSheetLastSync}` : 'Chưa đồng bộ'}
              </span>
            </div>
            <input
              type="url"
              required
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 font-mono text-slate-900 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncEnabled}
                onChange={(e) => setSyncEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-slate-800 font-medium">Bật tự động đồng bộ mỗi 5 phút và khi phát sinh hợp đồng mới</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingSync || !webhookUrl}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-500 ${isTestingSync ? 'animate-bounce' : ''}`} />
                <span>{isTestingSync ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-2xs"
              >
                Lưu Cấu Hình Webhook
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pricing Configuration Form */}
        <form onSubmit={handleSavePricing} className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-teal-600" />
            Thông Tin Dãy Trọ & Biểu Phí Dịch Vụ
          </h2>

          <div className="space-y-3 p-3 bg-teal-50/50 rounded-xl border border-teal-100">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Tên Dãy Trọ của bạn:</label>
              <input
                type="text"
                required
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                placeholder="Ví dụ: Trọ 1, Nhà Trọ Hoa Mai, ..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-teal-300 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Địa chỉ Dãy Trọ:</label>
              <input
                type="text"
                value={houseAddress}
                onChange={(e) => setHouseAddress(e.target.value)}
                placeholder="Số 123 Đường Số 1, Quận 9, TP.HCM"
                className="w-full px-3 py-2 rounded-xl bg-white border border-teal-200 text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Giá Điện (VNĐ / kWh):</label>
              <input
                type="number"
                step={100}
                required
                value={electricityRate}
                onChange={(e) => setElectricityRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Giá Nước (VNĐ / m³):</label>
              <input
                type="number"
                step={1000}
                required
                value={waterRate}
                onChange={(e) => setWaterRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Wifi Internet / phòng:</label>
              <input
                type="number"
                step={10000}
                required
                value={internetFee}
                onChange={(e) => setInternetFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Rác & Vệ sinh / phòng:</label>
              <input
                type="number"
                step={5000}
                required
                value={garbageFee}
                onChange={(e) => setGarbageFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold block">Phí quản lý & dịch vụ chung / phòng:</label>
            <input
              type="number"
              step={5000}
              required
              value={serviceFee}
              onChange={(e) => setServiceFee(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-all"
            >
              Lưu & Cập Nhật Biểu Phí
            </button>
          </div>
        </form>

        {/* Broadcast Notice Form & History */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-teal-600" />
            Gửi Thông Báo Tới Khách Thuê
          </h2>

          <form onSubmit={handleSendNotice} className="space-y-3">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Tiêu đề thông báo:</label>
              <input
                type="text"
                required
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="vd: Lịch cắt điện bảo trì ngày 15/08..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Nội dung chi tiết:</label>
              <textarea
                rows={3}
                required
                value={noticeBody}
                onChange={(e) => setNoticeBody(e.target.value)}
                placeholder="Nhập nội dung gửi tới điện thoại của toàn bộ khách thuê..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Phát sóng thông báo ngay</span>
            </button>
          </form>

          {/* History */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="font-semibold text-slate-800">Lịch sử thông báo gần đây:</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <div className="flex items-center justify-between font-semibold text-slate-900 text-xs">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

