

USE QuanLySinhVien;

-- Tài khoản
CREATE TABLE TaiKhoan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Sinh viên','Giảng viên','Quản trị') NOT NULL,
    trang_thai ENUM('Hoạt động','Ngừng hoạt động') DEFAULT 'Hoạt động'
);

-- Khoa
CREATE TABLE Khoa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_khoa VARCHAR(100) NOT NULL
);

-- Ngành
CREATE TABLE Nganh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_nganh VARCHAR(100) NOT NULL,
    khoa_id INT,
    FOREIGN KEY (khoa_id) REFERENCES Khoa(id)
);

-- Lớp
CREATE TABLE Lop (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_lop VARCHAR(50) NOT NULL,
    khoa_id INT,
    nganh_id INT,
    FOREIGN KEY (khoa_id) REFERENCES Khoa(id),
    FOREIGN KEY (nganh_id) REFERENCES Nganh(id)
);

-- Giảng viên (cố vấn học tập)
CREATE TABLE GiangVien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_gv VARCHAR(20) UNIQUE NOT NULL,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    so_dien_thoai VARCHAR(20),
    khoa_id INT,
    tai_khoan_id INT UNIQUE,
    FOREIGN KEY (khoa_id) REFERENCES Khoa(id),
    FOREIGN KEY (tai_khoan_id) REFERENCES TaiKhoan(id)
);

-- Sinh viên
CREATE TABLE SinhVien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_sv VARCHAR(20) UNIQUE NOT NULL,
    ho_ten VARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh ENUM('Nam','Nữ','Khác'),
    email VARCHAR(100),
    so_dien_thoai VARCHAR(20),
    dia_chi TEXT,
    anh_the VARCHAR(255), -- ảnh thẻ
    khoa_hoc VARCHAR(10), -- ví dụ: K47
    khoa_id INT,
    nganh_id INT,
    lop_id INT,
    co_van_id INT,
    tai_khoan_id INT UNIQUE,
    FOREIGN KEY (khoa_id) REFERENCES Khoa(id),
    FOREIGN KEY (nganh_id) REFERENCES Nganh(id),
    FOREIGN KEY (lop_id) REFERENCES Lop(id),
    FOREIGN KEY (co_van_id) REFERENCES GiangVien(id),
    FOREIGN KEY (tai_khoan_id) REFERENCES TaiKhoan(id)
);

-- Học phần
CREATE TABLE HocPhan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_hp VARCHAR(20) UNIQUE NOT NULL,
    ten_hp VARCHAR(100) NOT NULL,
    so_tin_chi INT NOT NULL,
    khoa_id INT,
    FOREIGN KEY (khoa_id) REFERENCES Khoa(id)
);

-- Kết quả học tập
CREATE TABLE KetQuaHocTap (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT,
    hoc_phan_id INT,
    hoc_ky VARCHAR(20),
    nam_hoc VARCHAR(10),
    diem_qua_trinh DECIMAL(4,2),
    diem_thi DECIMAL(4,2),
    diem_tong_ket DECIMAL(4,2),
    hoc_luc VARCHAR(20),
    FOREIGN KEY (sinh_vien_id) REFERENCES SinhVien(id),
    FOREIGN KEY (hoc_phan_id) REFERENCES HocPhan(id)
);

-- Kế hoạch học tập
CREATE TABLE KeHoachHocTap (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT,
    hoc_phan_id INT,
    trang_thai ENUM('Đã đăng ký','Đang học','Đã hoàn thành','Chưa đạt') DEFAULT 'Đã đăng ký',
    FOREIGN KEY (sinh_vien_id) REFERENCES SinhVien(id),
    FOREIGN KEY (hoc_phan_id) REFERENCES HocPhan(id)
);

-- Đăng ký học phần
CREATE TABLE DangKyHocPhan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT,
    hoc_phan_id INT,
    hoc_ky VARCHAR(20),
    nam_hoc VARCHAR(10),
    trang_thai ENUM('Thành công','Thất bại') DEFAULT 'Thành công',
    FOREIGN KEY (sinh_vien_id) REFERENCES SinhVien(id),
    FOREIGN KEY (hoc_phan_id) REFERENCES HocPhan(id)
);

-- Học phí
CREATE TABLE HocPhi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT,
    hoc_phan_id INT,
    hoc_ky VARCHAR(20),
    nam_hoc VARCHAR(10),
    so_tien DECIMAL(12,2),
    tinh_trang ENUM('Chưa nộp','Đã nộp','Quá hạn') DEFAULT 'Chưa nộp',
    FOREIGN KEY (sinh_vien_id) REFERENCES SinhVien(id),
    FOREIGN KEY (hoc_phan_id) REFERENCES HocPhan(id)
);

-- Thông báo
CREATE TABLE ThongBao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tieu_de VARCHAR(200) NOT NULL,
    noi_dung TEXT,
    ngay_gui TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trạng thái đọc thông báo
CREATE TABLE ThongBao_DaDoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT,
    thong_bao_id INT,
    da_doc ENUM('Chưa đọc','Đã đọc') DEFAULT 'Chưa đọc',
    ngay_doc TIMESTAMP NULL,
    FOREIGN KEY (sinh_vien_id) REFERENCES SinhVien(id),
    FOREIGN KEY (thong_bao_id) REFERENCES ThongBao(id)
);

-- Hồ sơ hành chính
CREATE TABLE HoSoHanhChinh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT,
    loai_ho_so VARCHAR(100),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trang_thai ENUM('Chờ duyệt','Đang xử lý','Hoàn thành','Từ chối') DEFAULT 'Chờ duyệt',
    ghi_chu TEXT,
    FOREIGN KEY (sinh_vien_id) REFERENCES SinhVien(id)
);

-- Rèn luyện
CREATE TABLE RenLuyen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT,
    hoc_ky VARCHAR(20),
    nam_hoc VARCHAR(10),
    diem INT,
    nhan_xet TEXT,
    FOREIGN KEY (sinh_vien_id) REFERENCES SinhVien(id)
);

-- Hoạt động ngoại khóa
CREATE TABLE HoatDongNgoaiKhoa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_hoat_dong VARCHAR(100) NOT NULL,
    ngay_to_chuc DATE,
    dia_diem VARCHAR(100),
    mo_ta TEXT
);

-- Sinh viên tham gia hoạt động ngoại khóa
CREATE TABLE ThamGiaHoatDong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT,
    hoat_dong_id INT,
    vai_tro VARCHAR(50),
    FOREIGN KEY (sinh_vien_id) REFERENCES SinhVien(id),
    FOREIGN KEY (hoat_dong_id) REFERENCES HoatDongNgoaiKhoa(id)
);

-- Yêu cầu tư vấn học tập
CREATE TABLE YeuCauTuVan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sinh_vien_id INT,
    co_van_id INT,
    noi_dung TEXT,
    ngay_gui TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trang_thai ENUM('Chờ phản hồi','Đã phản hồi') DEFAULT 'Chờ phản hồi',
    FOREIGN KEY (sinh_vien_id) REFERENCES SinhVien(id),
    FOREIGN KEY (co_van_id) REFERENCES GiangVien(id)
);

USE QuanLySinhVien;

-- 1. Tài khoản mẫu
INSERT INTO TaiKhoan (username, password_hash, role, trang_thai) VALUES
('admin01', '123456', 'Quản trị', 'Hoạt động'),
('gv001', '123456', 'Giảng viên', 'Hoạt động'),
('sv001', '123456', 'Sinh viên', 'Hoạt động');

-- 2. Khoa
INSERT INTO Khoa (ten_khoa) VALUES
('Công nghệ thông tin'),
('Kinh tế'),
('Cơ khí');

-- 3. Ngành
INSERT INTO Nganh (ten_nganh, khoa_id) VALUES
('Khoa học máy tính', 1),
('Hệ thống thông tin', 1),
('Quản trị kinh doanh', 2);

-- 4. Lớp
INSERT INTO Lop (ten_lop, khoa_id, nganh_id) VALUES
('CNTT01', 1, 1),
('HTTT01', 1, 2),
('QTKD01', 2, 3);

-- 5. Giảng viên
INSERT INTO GiangVien (ma_gv, ho_ten, email, so_dien_thoai, khoa_id, tai_khoan_id) VALUES
('GV001', 'Nguyễn Văn A', 'nva@iuh.edu.vn', '0901234567', 1, 2);

-- 6. Sinh viên
INSERT INTO SinhVien (ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, so_dien_thoai, dia_chi, anh_the, khoa_hoc, khoa_id, nganh_id, lop_id, co_van_id, tai_khoan_id)
VALUES
('SV001', 'Trần Thị B', '2003-05-12', 'Nữ', 'ttb@iuh.edu.vn', '0912345678', '123 Lê Lợi, Q.1, TP.HCM', 'anh_sv001.jpg', 'K47', 1, 1, 1, 1, 3);

-- 7. Học phần
INSERT INTO HocPhan (ma_hp, ten_hp, so_tin_chi, khoa_id) VALUES
('HP001', 'Lập trình Java', 3, 1),
('HP002', 'Cơ sở dữ liệu', 3, 1),
('HP003', 'Kinh tế vi mô', 2, 2);

-- 8. Đăng ký học phần (SV001 đăng ký 2 môn)
INSERT INTO DangKyHocPhan (sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc, trang_thai) VALUES
(1, 1, 'HK1', '2025-2026', 'Thành công'),
(1, 2, 'HK1', '2025-2026', 'Thành công');

-- 9. Kết quả học tập (tạm nhập điểm cho SV001)
INSERT INTO KetQuaHocTap (sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc, diem_qua_trinh, diem_thi, diem_tong_ket, hoc_luc) VALUES
(1, 1, 'HK1', '2025-2026', 8.0, 7.5, 7.8, 'Khá'),
(1, 2, 'HK1', '2025-2026', 7.0, 8.0, 7.5, 'Khá');

-- 10. Học phí
INSERT INTO HocPhi (sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc, so_tien, tinh_trang) VALUES
(1, 1, 'HK1', '2025-2026', 1200000, 'Chưa nộp'),
(1, 2, 'HK1', '2025-2026', 1200000, 'Đã nộp');

-- 11. Thông báo
INSERT INTO ThongBao (tieu_de, noi_dung) VALUES
('Thông báo đăng ký học phần HK1', 'Sinh viên tiến hành đăng ký học phần từ ngày 10/09/2025 đến 20/09/2025.'),
('Thông báo nộp học phí', 'Hạn chót nộp học phí HK1 là ngày 15/10/2025.');

-- 12. Trạng thái đọc thông báo
INSERT INTO ThongBao_DaDoc (sinh_vien_id, thong_bao_id, da_doc) VALUES
(1, 1, 'Đã đọc'),
(1, 2, 'Chưa đọc');

-- 13. Hồ sơ hành chính
INSERT INTO HoSoHanhChinh (sinh_vien_id, loai_ho_so, trang_thai, ghi_chu) VALUES
(1, 'Giấy xác nhận sinh viên', 'Hoàn thành', 'Đã ký và đóng dấu');

-- 14. Rèn luyện
INSERT INTO RenLuyen (sinh_vien_id, hoc_ky, nam_hoc, diem, nhan_xet) VALUES
(1, 'HK1', '2025-2026', 80, 'Tham gia tích cực hoạt động đoàn hội');

-- 15. Hoạt động ngoại khóa
INSERT INTO HoatDongNgoaiKhoa (ten_hoat_dong, ngay_to_chuc, dia_diem, mo_ta) VALUES
('Hội thảo AI', '2025-11-20', 'Hội trường A', 'Chia sẻ về AI và ứng dụng trong CNTT');

-- 16. Sinh viên tham gia hoạt động
INSERT INTO ThamGiaHoatDong (sinh_vien_id, hoat_dong_id, vai_tro) VALUES
(1, 1, 'Người tham gia');

-- 17. Yêu cầu tư vấn
INSERT INTO YeuCauTuVan (sinh_vien_id, co_van_id, noi_dung, trang_thai) VALUES
(1, 1, 'Em muốn được tư vấn về kế hoạch học tập.', 'Chờ phản hồi');


CREATE TABLE HocPhan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_hoc_phan VARCHAR(50) NOT NULL UNIQUE,
  ten_hoc_phan VARCHAR(255) NOT NULL,
  so_tin_chi INT DEFAULT 3,
  mo_ta TEXT,
  khoa_id INT,
  FOREIGN KEY (khoa_id) REFERENCES Khoa(id)
);


CREATE TABLE LopHocPhan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma_lop_hoc_phan VARCHAR(50) NOT NULL,
  hoc_phan_id INT NOT NULL,
  giang_vien_id INT NOT NULL,
  lop_id INT NOT NULL,                     -- 🔹 lớp sinh viên học môn này
  hoc_ky VARCHAR(20) DEFAULT 'HK1/2025',
  nam_hoc VARCHAR(10) DEFAULT '2025-2026', -- 🔹 thêm năm học cho dễ lọc
  trang_thai ENUM('Đang học','Đã kết thúc','Chưa mở') DEFAULT 'Đang học',
  FOREIGN KEY (hoc_phan_id) REFERENCES HocPhan(id),
  FOREIGN KEY (giang_vien_id) REFERENCES GiangVien(id),
  FOREIGN KEY (lop_id) REFERENCES Lop(id)
  
);
CREATE TABLE LichHocNgoaiLe (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lich_hoc_id INT NOT NULL,          -- tham chiếu mẫu trong LichHoc
  ngay_hoc DATE NOT NULL,            -- buổi học cụ thể
  phong VARCHAR(50) NULL,
  co_so VARCHAR(50) NULL,
  ghi_chu VARCHAR(255) NULL,
  FOREIGN KEY (lich_hoc_id) REFERENCES LichHoc(id)
);


-- Bảng lịch học

CREATE TABLE LichHoc (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lop_hoc_phan_id INT NOT NULL,
  thu INT NOT NULL,                         -- Thứ trong tuần (2-8)
  ca ENUM('sáng','chiều','tối') NOT NULL,
  tiet_bat_dau INT NOT NULL,
  tiet_ket_thuc INT NOT NULL,
  phong VARCHAR(50),
  co_so VARCHAR(50),
  ngay_hoc DATE NULL,                       -- 🔹 nếu có ngày học cụ thể
  loai ENUM('lythuyet','thuchanh','tructuyen','thi') DEFAULT 'lythuyet',
  ghi_chu VARCHAR(255) NULL,
  FOREIGN KEY (lop_hoc_phan_id) REFERENCES LopHocPhan(id)
);

-- Môn học
INSERT INTO HocPhan (ma_hoc_phan, ten_hoc_phan, so_tin_chi, khoa_id)
VALUES ('HP001', 'Lập trình WWW (Java)', 3, 1);

-- Lớp học phần cho lớp CNTT01
INSERT INTO LopHocPhan (ma_lop_hoc_phan, hoc_phan_id, giang_vien_id, lop_id, hoc_ky, nam_hoc)
VALUES ('DHKTPM18BTT', 1, 2, 1, 'HK1', '2025-2026');

-- Lịch học cụ thể
INSERT INTO LichHoc (lop_hoc_phan_id, thu, ca, tiet_bat_dau, tiet_ket_thuc, phong, co_so, loai)
VALUES
(1, 2, 'sáng', 1, 3, 'V7.02', 'Cơ sở 1', 'lythuyet'),
(1, 4, 'chiều', 7, 9, 'H8.03', 'Cơ sở 1', 'thuchanh');

/*

ALTER TABLE LopHocPhan
ADD COLUMN ngay_bat_dau DATE NULL,
ADD COLUMN ngay_ket_thuc DATE NULL,
ADD COLUMN so_tuan_hoc INT DEFAULT 15;

UPDATE LopHocPhan
SET ngay_bat_dau = '2025-09-15', ngay_ket_thuc = '2025-12-30', so_tuan_hoc = 15
WHERE id = 1;
ALTER TABLE Nganh
ADD COLUMN ma_nganh VARCHAR(20) AFTER id;
*/





