# Frontend - Hệ Thống Quản Lý Phòng Trọ

Thư mục này chứa toàn bộ mã nguồn giao diện người dùng React 19 + TypeScript + Tailwind CSS.

## Cấu trúc thư mục:
- `components/`:
  - `Auth/`: Màn hình Đăng nhập, Đăng ký, Đổi mật khẩu qua CCCD & Email.
  - `Common/`: Hồ sơ cá nhân (upload ảnh vào SQL), VietQR thanh toán, thông báo, AI Insight card.
  - `RoleAdmin/`: Bảng điều khiển quản trị viên tối cao, quản lý người dùng, xem mã SQL.
  - `RoleLandlord/`: Phân hệ dành cho Chủ trọ (Quản lý phòng, hợp đồng, chỉ số điện nước, hóa đơn, bảo trì, thu chi).
  - `RoleTenant/`: Phân hệ dành cho Khách thuê (Hợp đồng, hóa đơn & QR chuyển khoản, báo hỏng sửa chữa, phản ánh).
- `context/`: `AuthContext.tsx` và `RentalContext.tsx` quản lý state toàn cục và xác thực.
- `lib/`: `supabase.ts` (kết nối Supabase SQL, hash SHA-256 mật khẩu, upload ảnh Base64) và `security.ts`.
- `services/`: `aiService.ts` kết nối API AI phân tích dữ liệu.
- `App.tsx`: Điều hướng phân quyền giữa Admin, Chủ trọ và Khách thuê.
- `main.tsx`: Điểm khởi chạy ứng dụng React.
- `index.css`: Cấu hình Tailwind CSS.
- `types.ts`: Định nghĩa TypeScript interfaces chuẩn theo 16 thực thể ERD.
