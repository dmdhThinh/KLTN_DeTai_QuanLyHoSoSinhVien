# Quản lý hồ sơ sinh viên

Hệ thống web hỗ trợ nhà trường quản lý hồ sơ, đào tạo và học tập của sinh viên. Ứng dụng có **3 vai trò**: Quản trị, Giảng viên và Sinh viên — mỗi role một giao diện, quyền hạn và luồng nghiệp vụ riêng.

- **Frontend:** React (port `3000`)
- **Backend:** Node.js + Express (port `8080`)
- **CSDL:** MySQL 8
- **Lưu file:** Amazon S3 (ảnh thẻ, tin tức, đính kèm)

---

## Tài khoản demo

Đăng nhập tại trang `/login`. **Tên đăng nhập** là mã số (sinh viên / giảng viên) hoặc tài khoản quản trị.

| Vai trò | Tên đăng nhập | Mật khẩu | Vào trang |
|--------|----------------|----------|-----------|
| **Sinh viên** | `121220255` | `123456` | `/student` |
| **Giảng viên** | `1481312` | `123456` | `/teacher` |
| **Quản trị** | `admin01` | `123456` | `/admin` |

Mật khẩu mặc định khi tạo tài khoản mới cũng là `123456`. Lần đăng nhập đầu có thể bắt buộc **đổi mật khẩu** trước khi vào hệ thống.

---

## Ba vai trò

### 1. Sinh viên (`121220255`)

Sinh viên xem và thao tác trên **hồ sơ của chính mình**, không quản lý người khác.

**Chức năng chính**

- **Tổng quan:** dashboard, thông tin cá nhân, ảnh thẻ.
- **Lịch học / lịch thi:** thời khóa biểu theo lớp học phần đã đăng ký.
- **Kết quả học tập:** điểm thành phần, điểm tổng kết, GPA.
- **Chương trình khung:** lộ trình học phần theo ngành, tiến độ hoàn thành.
- **Đăng ký học phần (ĐKHP):** đăng ký / hủy trong đợt mở; kiểm tra sĩ số, trùng lịch, học phần tiên quyết.
- **Công nợ:** học phí, khoản phải nộp, trạng thái thanh toán.
- **Điểm rèn luyện:** kết quả rèn luyện theo học kỳ.
- **Học bổng:** xem điều kiện / kết quả xét (nếu đủ điều kiện).
- **Tin tức:** thông báo nhà trường (ảnh, video, file đính kèm).
- **Yêu cầu tư vấn:** gửi câu hỏi tới giảng viên lớp học phần, theo dõi trả lời.
- **AI ChatBot hỗ trợ tính điểm và tư vấn học tập.**
- **Đổi mật khẩu.**

**Cách demo nhanh:** đăng nhập `121220255` / `123456` → xem lịch và điểm → vào ĐKHP (khi đang có đợt) → mở tin tức / công nợ / tư vấn.

---

### 2. Giảng viên (`1481312`)

Giảng viên phụ trách **lớp học phần được phân công**, không chỉnh danh mục khoa / ngành / học phí toàn trường.

**Chức năng chính**

- **Tổng quan:** thông tin giảng viên.
- **Lớp học phần:** danh sách LHP đang dạy.
- **Sinh viên trong lớp:** danh sách SV theo từng LHP.
- **Lịch giảng dạy:** lịch theo ca, phòng, cơ sở.
- **Nhập điểm:** nhập điểm quá trình / giữa kỳ / cuối kỳ trong đợt cho phép. Điểm đã lưu thường **không tự sửa**; cần quản trị nếu phải chỉnh.
- **Tin tức:** xem thông báo gửi giảng viên.
- **Yêu cầu tư vấn:** nhận, trả lời, đổi trạng thái yêu cầu từ sinh viên.
- **Đổi mật khẩu.**

**Cách demo nhanh:** đăng nhập `1481312` / `123456` → mở lớp học phần → nhập điểm (nếu đang mở đợt) → xem lịch dạy → trả lời tư vấn.

---

### 3. Quản trị (`admin01`)

Quản trị viên vận hành **toàn bộ hệ thống**: danh mục, người dùng, đào tạo, tài chính, xét duyệt.

**Người dùng & hồ sơ**

- Tài khoản: khóa / mở, phân quyền.
- Sinh viên, giảng viên: thêm, sửa, xóa, import Excel, upload ảnh thẻ (S3).

**Danh mục nhà trường**

- Khoa, ngành, lớp hành chính.
- Học phần, lớp học phần, phân công giảng viên.
- Lịch học / buổi học, lịch nghỉ.

**Đào tạo & đăng ký**

- Đợt đăng ký học phần (mở / đóng).
- Sửa điểm đã chốt (khi giảng viên không được sửa).
- Import / quản lý điểm rèn luyện.
- Import / quản lý chứng chỉ tiếng Anh.
- Xét học bổng, xét tốt nghiệp.

**Truyền thông & tài chính**

- Tin tức / thông báo (ảnh, video, file).
- Học phí, công nợ.
- Theo dõi yêu cầu tư vấn toàn hệ thống.

**Cách demo nhanh:** đăng nhập `admin01` / `123456` → thêm/sửa sinh viên → mở đợt ĐKHP → quản lý LHP & lịch → xem học phí / học bổng / tốt nghiệp.

---

## Phân quyền tóm tắt

| Việc | Sinh viên | Giảng viên | Quản trị |
|------|:---------:|:----------:|:--------:|
| Xem hồ sơ / điểm / lịch của mình | Có | Có (lớp mình dạy) | Toàn hệ thống |
| Đăng ký học phần | Có | — | Mở đợt, cấu hình |
| Nhập điểm | — | Có (đợt mở) | Sửa điểm đã lưu |
| Quản lý khoa, ngành, lớp, học phần | — | — | Có |
| Học phí, học bổng, tốt nghiệp | Xem phần mình | — | Quản lý / xét |
| Tư vấn | Gửi | Trả lời | Giám sát |
| Tin tức | Đọc | Đọc | Đăng / sửa / xóa |

---

## Chạy local

Cần **Node.js**, **MySQL 8**. Tạo database `quanlysinhvien` và import `backend/CSDL.sql` (hoặc dùng RDS đã nạp sẵn).

**Backend** — file `backend/.env`:

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `PORT=8080`, `CORS_ORIGIN=http://localhost:3000`
- `JWT_SECRET`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME` (upload ảnh/file)

```bash
cd backend
npm install
npm run dev
```

API: `http://localhost:8080`

**Frontend**

```bash
cd frontend
npm install
npm start
```

Giao diện: `http://localhost:3000` (proxy sẵn sang backend `8080`).

---

## Cấu trúc thư mục

```
QuanLyHoSoSinhVien/
├── backend/          # Express API, models, upload S3
│   ├── CSDL.sql      # Schema + dữ liệu mẫu
│   └── server/
└── frontend/         # React
    └── src/pages/    # Admin, GiangVien, SinhVien
```


