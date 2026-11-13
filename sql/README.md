# CSDL Quản Lý Phòng Trọ (Supabase PostgreSQL)

Thư mục này chứa toàn bộ mã nguồn cơ sở dữ liệu SQL theo đúng sơ đồ thực thể liên kết (ERD 16 bảng).

## 1. Tệp tin chính
- `supabase_schema.sql`: Toàn bộ câu lệnh DDL khởi tạo 16 bảng quan hệ, thiết lập RLS (Row Level Security), phân quyền truy cập, các chỉ mục (indexes), và tài khoản Quản trị viên khởi tạo (`admin@gmail.com`).

## 2. 16 Bảng theo sơ đồ ERD:
1. `quan_tri_vien`: Quản trị viên tối cao hệ thống.
2. `chu_tro`: Danh sách các chủ nhà trọ.
3. `nguoi_thue`: Danh sách khách thuê phòng trọ.
4. `khu_tro`: Quản lý các tòa nhà, dãy trọ.
5. `phong`: Các phòng trọ chi tiết (giá thuê, diện tích, trạng thái).
6. `thiet_bi`: Thiết bị, nội thất trong từng phòng hoặc khu trọ.
7. `dich_vu`: Biểu phí dịch vụ (điện, nước, rác, wifi...).
8. `hop_dong_thue`: Hợp đồng thuê phòng giữa chủ trọ và người thuê.
9. `hoa_don`: Hóa đơn tiền trọ, điện nước hàng tháng.
10. `thanh_toan`: Nhật ký thanh toán hóa đơn.
11. `dang_ky`: Khách hàng đăng ký xem phòng hoặc giữ chỗ.
12. `phieu_thu`: Các phiếu thu tiền ngoài hóa đơn.
13. `phieu_chi`: Phiếu chi phí sửa chữa, vận hành của chủ trọ.
14. `chi_so`: Nhật ký chốt chỉ số điện/nước hàng tháng.
15. `phan_hoi`: Đánh giá, góp ý của khách thuê.
16. `bao_tri`: Phiếu yêu cầu sửa chữa, bảo trì trang thiết bị.

## 3. Cách chạy:
1. Mở trang quản trị dự án trên [Supabase](https://supabase.com).
2. Vào mục **SQL Editor** ở thanh menu bên trái.
3. Mở file `supabase_schema.sql`, sao chép toàn bộ nội dung và dán vào SQL Editor.
4. Nhấn **Run** để khởi tạo toàn bộ CSDL.
