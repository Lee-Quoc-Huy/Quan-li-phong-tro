-- ==============================================================================
-- CƠ SỞ DỮ LIỆU QUẢN LÝ PHÒNG TRỌ (CHUẨN SƠ ĐỒ ERD_Quan_Ly_Phong_Tro.drawio)
-- Tương thích 100% với Supabase (PostgreSQL) & Hệ thống Web Quản Lý Phòng Trọ
-- ==============================================================================

-- Bật extension tạo UUID (nếu cần)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. BẢNG CHỦ_TRỌ (Landlord)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS chu_tro (
    ma_chu_tro VARCHAR(50) PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    sdt VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE,
    dia_chi TEXT,
    cccd VARCHAR(30),
    password_hash TEXT,
    avatar TEXT,
    host_code VARCHAR(20),
    ngay_tao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    trang_thai VARCHAR(30) DEFAULT 'active'
);

ALTER TABLE chu_tro ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE chu_tro ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE chu_tro ADD COLUMN IF NOT EXISTS cccd VARCHAR(30);

-- ==============================================================================
-- 2. BẢNG NGƯỜI_THUÊ (Tenant)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS nguoi_thue (
    ma_nt VARCHAR(50) PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    sdt VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    cccd VARCHAR(30),
    ngay_sinh DATE,
    dia_chi TEXT,
    password_hash TEXT,
    avatar TEXT,
    ma_phong VARCHAR(50),
    ma_chu_tro VARCHAR(50),
    trang_thai VARCHAR(30) DEFAULT 'active'
);

ALTER TABLE nguoi_thue ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE nguoi_thue ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE nguoi_thue ADD COLUMN IF NOT EXISTS cccd VARCHAR(30);

-- ==============================================================================
-- 3. BẢNG QUẢN_TRỊ_VIÊN (Root Admin)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS quan_tri_vien (
    ma_qtv VARCHAR(50) PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    sdt VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    cccd VARCHAR(30),
    vai_tro VARCHAR(50) DEFAULT 'admin',
    password_hash TEXT,
    avatar TEXT,
    trang_thai VARCHAR(30) DEFAULT 'active'
);

ALTER TABLE quan_tri_vien ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE quan_tri_vien ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE quan_tri_vien ADD COLUMN IF NOT EXISTS cccd VARCHAR(30);

-- ==============================================================================
-- 4. BẢNG KHU_TRỌ (Rental Property / Cluster)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS khu_tro (
    ma_khu VARCHAR(50) PRIMARY KEY,
    ma_chu_tro VARCHAR(50),
    ten_khu VARCHAR(150) NOT NULL,
    dia_chi TEXT,
    mo_ta TEXT
);

-- ==============================================================================
-- 5. BẢNG PHÒNG (Rooms)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS phong (
    ma_phong VARCHAR(50) PRIMARY KEY,
    ma_chu_tro VARCHAR(50),
    ma_khu VARCHAR(50),
    so_phong VARCHAR(50) NOT NULL,
    loai_phong VARCHAR(100),
    dien_tich NUMERIC(8,2),
    gia_thue NUMERIC(15,2) NOT NULL,
    mo_ta TEXT,
    trang_thai VARCHAR(30) DEFAULT 'available',
    chi_so_dien_dau NUMERIC(10,2) DEFAULT 0,
    chi_so_nuoc_dau NUMERIC(10,2) DEFAULT 0
);

-- ==============================================================================
-- 6. BẢNG THIẾT_BỊ (Equipment / Room Amenities)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS thiet_bi (
    ma_tb VARCHAR(50) PRIMARY KEY,
    ma_phong VARCHAR(50),
    ten_tb VARCHAR(100) NOT NULL,
    loai_tb VARCHAR(50),
    ngay_lap DATE DEFAULT CURRENT_DATE,
    trang_thai VARCHAR(30) DEFAULT 'hoat_dong'
);

-- ==============================================================================
-- 7. BẢNG DỊCH_VỤ (Services & Utility Pricing)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS dich_vu (
    ma_dv VARCHAR(50) PRIMARY KEY,
    ten_dv VARCHAR(100) NOT NULL,
    don_gia NUMERIC(12,2) NOT NULL,
    ghi_chu TEXT
);

-- ==============================================================================
-- 8. BẢNG HỢP_ĐỒNG_THUÊ (Rental Contracts)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS hop_dong_thue (
    ma_hd VARCHAR(50) PRIMARY KEY,
    ma_phong VARCHAR(50),
    ma_nguoi_thue VARCHAR(50),
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    tien_coc NUMERIC(15,2) DEFAULT 0,
    tien_thue_thang NUMERIC(15,2),
    trang_thai VARCHAR(30) DEFAULT 'active'
);

-- ==============================================================================
-- 9. BẢNG HÓA_ĐƠN (Invoices)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS hoa_don (
    ma_hdon VARCHAR(50) PRIMARY KEY,
    ma_hd VARCHAR(50),
    thang_nam VARCHAR(20) NOT NULL,
    chi_so_cu NUMERIC(10,2),
    chi_so_moi NUMERIC(10,2),
    tong_tien NUMERIC(15,2) NOT NULL,
    ngay_lap DATE DEFAULT CURRENT_DATE,
    trang_thai VARCHAR(30) DEFAULT 'pending'
);

-- ==============================================================================
-- 10. BẢNG THANH_TOÁN (Payment Records / VietQR)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS thanh_toan (
    ma_tt VARCHAR(50) PRIMARY KEY,
    ma_hdon VARCHAR(50),
    so_tien NUMERIC(15,2) NOT NULL,
    phuong_thuc VARCHAR(50) DEFAULT 'vietqr',
    ma_gd_vietqr VARCHAR(100),
    ngay_thanh_toan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    trang_thai VARCHAR(30) DEFAULT 'completed'
);

-- ==============================================================================
-- 11. BẢNG ĐĂNG_KÝ (Room Join Requests / Registrations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS dang_ky (
    ma_dk VARCHAR(50) PRIMARY KEY,
    ma_nt VARCHAR(50),
    ma_phong VARCHAR(50),
    ngay_hen DATE,
    ngay_di DATE,
    trang_thai VARCHAR(30) DEFAULT 'pending'
);

-- ==============================================================================
-- 12. BẢNG PHIẾU_THU (Income Vouchers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS phieu_thu (
    ma_pt VARCHAR(50) PRIMARY KEY,
    ma_hd VARCHAR(50),
    ma_nt VARCHAR(50),
    ngay_thu TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    so_tien NUMERIC(15,2) NOT NULL,
    ghi_chu TEXT
);

-- ==============================================================================
-- 13. BẢNG PHIẾU_CHI (Expense Vouchers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS phieu_chi (
    ma_pc VARCHAR(50) PRIMARY KEY,
    ma_khu VARCHAR(50),
    ngay_chi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    noi_dung TEXT NOT NULL,
    so_tien NUMERIC(15,2) NOT NULL,
    loai_chi VARCHAR(50)
);

-- ==============================================================================
-- 14. BẢNG CHỈ_SỐ (Utility Readings / Electricity & Water)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS chi_so (
    ma_cs VARCHAR(50) PRIMARY KEY,
    ma_phong VARCHAR(50),
    thang_nam VARCHAR(20) NOT NULL,
    chi_so_dien NUMERIC(10,2) NOT NULL,
    chi_so_nuoc NUMERIC(10,2) NOT NULL,
    ngay_ghi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    nguoi_ghi VARCHAR(100)
);

-- ==============================================================================
-- 15. BẢNG PHẢN_HỒI (Feedback & Complaints)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS phan_hoi (
    ma_ph VARCHAR(50) PRIMARY KEY,
    ma_nt VARCHAR(50),
    ngay_ph TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    noi_dung TEXT NOT NULL,
    trang_thai VARCHAR(30) DEFAULT 'moi'
);

-- ==============================================================================
-- 16. BẢNG BẢO_TRÌ (Maintenance / Repair Tickets)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS bao_tri (
    ma_bt VARCHAR(50) PRIMARY KEY,
    ma_phong VARCHAR(50),
    ma_nt VARCHAR(50),
    ngay_yc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mo_ta_su_co TEXT NOT NULL,
    trang_thai VARCHAR(30) DEFAULT 'cho_xu_ly'
);

-- ==============================================================================
-- BẢNG PHỤ TRỢ: PROFILES (Tương thích đồng bộ và View đa chiều)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    avatar TEXT,
    age INT DEFAULT 25,
    id_card VARCHAR(30),
    hometown VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    host_code VARCHAR(20),
    landlord_id VARCHAR(50),
    house_name VARCHAR(150),
    house_address TEXT,
    room_id VARCHAR(50),
    license_tier VARCHAR(20) DEFAULT 'standard',
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_card VARCHAR(30);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- ==============================================================================
-- BẬT CHÍNH SÁCH BẢO MẬT HÀNG (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE chu_tro ENABLE ROW LEVEL SECURITY;
ALTER TABLE nguoi_thue ENABLE ROW LEVEL SECURITY;
ALTER TABLE quan_tri_vien ENABLE ROW LEVEL SECURITY;
ALTER TABLE khu_tro ENABLE ROW LEVEL SECURITY;
ALTER TABLE phong ENABLE ROW LEVEL SECURITY;
ALTER TABLE thiet_bi ENABLE ROW LEVEL SECURITY;
ALTER TABLE dich_vu ENABLE ROW LEVEL SECURITY;
ALTER TABLE hop_dong_thue ENABLE ROW LEVEL SECURITY;
ALTER TABLE hoa_don ENABLE ROW LEVEL SECURITY;
ALTER TABLE thanh_toan ENABLE ROW LEVEL SECURITY;
ALTER TABLE dang_ky ENABLE ROW LEVEL SECURITY;
ALTER TABLE phieu_thu ENABLE ROW LEVEL SECURITY;
ALTER TABLE phieu_chi ENABLE ROW LEVEL SECURITY;
ALTER TABLE chi_so ENABLE ROW LEVEL SECURITY;
ALTER TABLE phan_hoi ENABLE ROW LEVEL SECURITY;
ALTER TABLE bao_tri ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Cho phép khóa anon key có thể Đọc/Ghi dữ liệu (sau khi xác thực mật khẩu từ client)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anon public access chu_tro" ON chu_tro;
    DROP POLICY IF EXISTS "Anon public access nguoi_thue" ON nguoi_thue;
    DROP POLICY IF EXISTS "Anon public access quan_tri_vien" ON quan_tri_vien;
    DROP POLICY IF EXISTS "Anon public access khu_tro" ON khu_tro;
    DROP POLICY IF EXISTS "Anon public access phong" ON phong;
    DROP POLICY IF EXISTS "Anon public access thiet_bi" ON thiet_bi;
    DROP POLICY IF EXISTS "Anon public access dich_vu" ON dich_vu;
    DROP POLICY IF EXISTS "Anon public access hop_dong_thue" ON hop_dong_thue;
    DROP POLICY IF EXISTS "Anon public access hoa_don" ON hoa_don;
    DROP POLICY IF EXISTS "Anon public access thanh_toan" ON thanh_toan;
    DROP POLICY IF EXISTS "Anon public access dang_ky" ON dang_ky;
    DROP POLICY IF EXISTS "Anon public access phieu_thu" ON phieu_thu;
    DROP POLICY IF EXISTS "Anon public access phieu_chi" ON phieu_chi;
    DROP POLICY IF EXISTS "Anon public access chi_so" ON chi_so;
    DROP POLICY IF EXISTS "Anon public access phan_hoi" ON phan_hoi;
    DROP POLICY IF EXISTS "Anon public access bao_tri" ON bao_tri;
    DROP POLICY IF EXISTS "Anon public access profiles" ON profiles;

    CREATE POLICY "Anon public access chu_tro" ON chu_tro FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access nguoi_thue" ON nguoi_thue FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access quan_tri_vien" ON quan_tri_vien FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access khu_tro" ON khu_tro FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access phong" ON phong FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access thiet_bi" ON thiet_bi FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access dich_vu" ON dich_vu FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access hop_dong_thue" ON hop_dong_thue FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access hoa_don" ON hoa_don FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access thanh_toan" ON thanh_toan FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access dang_ky" ON dang_ky FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access phieu_thu" ON phieu_thu FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access phieu_chi" ON phieu_chi FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access chi_so" ON chi_so FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access phan_hoi" ON phan_hoi FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access bao_tri" ON bao_tri FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Anon public access profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ==============================================================================
-- KHỞI TẠO TÀI KHOẢN QUẢN TRỊ VIÊN GỐC (ROOT ADMIN)
-- Mật khẩu ban đầu mặc định: Admin@2026! (Băm SHA-256 kèm muối)
-- ==============================================================================
INSERT INTO quan_tri_vien (
    ma_qtv, ho_ten, sdt, email, cccd, vai_tro, password_hash, trang_thai
) VALUES (
    'admin_root',
    'Quản Trị Viên Tối Cao',
    '0918889999',
    '60.wuy.lii.06@gmail.com',
    '001200000001',
    'admin',
    '271ce2ddbf399b3952460a8e28d05465b48ed033e11bddd4920da03c9d3370f0',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    cccd = EXCLUDED.cccd;

INSERT INTO profiles (
    id, name, email, phone, role, id_card, password_hash, status, license_tier
) VALUES (
    'admin_root',
    'Quản Trị Viên Tối Cao',
    '60.wuy.lii.06@gmail.com',
    '0918889999',
    'admin',
    '001200000001',
    '271ce2ddbf399b3952460a8e28d05465b48ed033e11bddd4920da03c9d3370f0',
    'active',
    'enterprise'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    id_card = EXCLUDED.id_card;

-- Dữ liệu mẫu dịch vụ ban đầu
INSERT INTO dich_vu (ma_dv, ten_dv, don_gia, ghi_chu) VALUES
('dv_dien', 'Điện sinh hoạt', 3500, 'Tính theo kWh đồng hồ'),
('dv_nuoc', 'Nước sinh hoạt', 25000, 'Tính theo m3 đồng hồ'),
('dv_rac', 'Thu gom rác', 40000, 'Cố định hàng tháng/phòng'),
('dv_wifi', 'Internet Wifi tốc độ cao', 80000, 'Cố định hàng tháng/phòng')
ON CONFLICT (ma_dv) DO NOTHING;
