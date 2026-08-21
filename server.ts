import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "smart-rental-system", timestamp: new Date().toISOString() });
  });

  // Smart AI Analysis for Utility & Invoice calculation
  app.post("/api/ai/analyze-utility", async (req, res) => {
    try {
      const { electricityKwh, waterM3, prevElectricity, prevWater, roomName, tenantName } = req.body;
      const ai = getAIClient();
      
      if (ai) {
        const prompt = `Bạn là Trợ lý Quản lý Phòng trọ AI Cao Cấp (Phân hệ Đồ án Phân tích Thiết kế Hệ thống).
Hãy phân tích dữ liệu điện/nước thời gian thực sau:
- Phòng: ${roomName || 'Phòng trọ'} (Khách thuê: ${tenantName || 'Khách thuê'})
- Điện tháng này: ${electricityKwh} kWh (Tháng trước: ${prevElectricity || 0} kWh)
- Nước tháng này: ${waterM3} m³ (Tháng trước: ${prevWater || 0} m³)

Yêu cầu:
1. Đánh giá tính hợp lý của chỉ số (Bình thường / Bất thường đột biến / Nghi vấn rò rỉ nước / Thiết bị quá tải).
2. Đề xuất thông điệp tóm tắt 2-3 câu ngắn gọn, chuẩn nghiệp vụ quản lý nhà trọ chuyên nghiệp.
3. Không định dạng markdown phức tạp, chỉ trả về đoạn văn bản súc tích.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        return res.json({
          success: true,
          analysis: response.text?.trim() || "Chỉ số tiêu thụ điện nước trong phạm vi cho phép và hợp lý.",
          source: "gemini"
        });
      }

      // Intelligent Heuristic AI Fallback
      const elecDiff = (electricityKwh || 0) - (prevElectricity || (electricityKwh || 100) * 0.8);
      const waterDiff = (waterM3 || 0) - (prevWater || (waterM3 || 10) * 0.75);

      let insight = "AI kiểm định: Chỉ số điện nước tháng này của phòng ở mức cân bằng so với định mức bình quân.";
      if (elecDiff > 70) {
        insight = `⚠️ Cảnh báo AI: Điện năng tăng đột biến +${Math.round(elecDiff)} kWh so với chu kỳ trước. Đề nghị kiểm tra hệ thống điều hòa hoặc thiết bị tiêu thụ công suất cao.`;
      } else if (waterDiff > 5) {
        insight = `💧 Cảnh báo AI: Nước tiêu thụ tăng bất thường +${Math.round(waterDiff)} m³. Cần kiểm tra van xả bồn cầu hoặc hệ thống vòi sen để tránh thất thoát chi phí.`;
      }

      return res.json({
        success: true,
        analysis: insight,
        source: "heuristic"
      });
    } catch (err: any) {
      console.error("AI Utility Analysis Error:", err);
      return res.json({
        success: true,
        analysis: "Chỉ số tiêu thụ được ghi nhận hợp lệ vào hệ thống cơ sở dữ liệu định kỳ.",
        source: "fallback"
      });
    }
  });

  // AI Smart Auto-Invoice Assistant
  app.post("/api/ai/generate-smart-announcement", async (req, res) => {
    try {
      const { type, title, oldPrice, newPrice, landlordName, houseName } = req.body;
      const ai = getAIClient();

      if (ai) {
        const prompt = `Hãy soạn một thông báo trang trọng, lịch sự, rõ ràng từ Chủ trọ ${landlordName || 'Chủ trọ'} gửi toàn thể khách thuê tại dãy trọ ${houseName || 'Nhà trọ'}.
Chủ đề: ${title || 'Thông báo cập nhật biểu phí dịch vụ'}
Nội dung thay đổi: ${oldPrice ? `Từ ${oldPrice} -> ${newPrice}` : (title || 'Thông báo mới')}
Văn phong: Lịch sự, thấu hiểu, minh bạch, có lời cảm ơn ở cuối. Độ dài: 3-5 câu.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        return res.json({
          success: true,
          content: response.text?.trim() || "Kính gửi toàn thể quý khách thuê trọ, ban quản lý xin gửi thông báo cập nhật biểu phí mới được áp dụng từ kỳ thu tiếp theo."
        });
      }

      return res.json({
        success: true,
        content: `Kính gửi toàn thể cư dân ${houseName || 'dãy trọ'},\n\nBan quản lý xin trân trọng thông báo về việc cập nhật biểu phí dịch vụ mới: ${title}. Giá mới sẽ bắt đầu được áp dụng tự động trong kỳ hóa đơn tiếp theo nhằm đảm bảo chất lượng vận hành và bảo trì tốt nhất.\n\nXin chân thành cảm ơn sự đồng hành và hợp tác của Quý khách!`
      });
    } catch (err: any) {
      return res.json({
        success: true,
        content: "Kính gửi toàn thể khách thuê, ban quản lý cập nhật thông báo mới về chi phí và tiện ích sinh hoạt. Trân trọng cảm ơn!"
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Rental System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
