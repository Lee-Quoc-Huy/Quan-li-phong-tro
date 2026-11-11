# Backend Server - Hệ Thống Quản Lý Phòng Trọ

Thư mục này chứa mã nguồn Backend của hệ thống:

## 1. Tệp tin chính
- `server.ts`:
  - Khởi tạo Express server trên cổng `process.env.PORT || 3000`.
  - Tích hợp Gemini AI API (`@google/genai`) phân tích chỉ số điện nước bất thường (`/api/ai/analyze-utility`).
  - Trợ lý AI tạo thông báo điều chỉnh biểu phí và vận hành dãy trọ (`/api/ai/generate-smart-announcement`).
  - Kiểm tra trạng thái hệ thống (`/api/health`).
  - Tích hợp Vite middlewares ở chế độ Development và phục vụ static build (`dist`) ở chế độ Production.

## 2. Khởi chạy:
- Development: `npm run dev`
- Production Build: `npm run build`
- Production Start: `npm start`
