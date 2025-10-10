# Backend API - Hệ thống Quản lý Sinh viên

## Mô tả
Backend API được xây dựng bằng Node.js và Express.js để quản lý hệ thống sinh viên, giảng viên, khoa, ngành và học phần.

## Công nghệ sử dụng
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

## Cấu trúc thư mục
```
backend/
├── config.env                 # File cấu hình môi trường
├── package.json              # Dependencies và scripts
├── nodemon.json              # Cấu hình nodemon
└── server/
    ├── index.js              # File chính của server
    ├── config/
    │   ├── database.js       # Cấu hình kết nối database
    │   └── auth.js           # Cấu hình JWT authentication
    ├── controllers/
    │   ├── authController.js
    │   ├── sinhVienController.js
    │   ├── giangVienController.js
    │   ├── khoaController.js
    │   └── hocPhanController.js
    ├── models/
    │   ├── TaiKhoan.js
    │   ├── SinhVien.js
    │   ├── GiangVien.js
    │   ├── Khoa.js
    │   └── HocPhan.js
    ├── routes/
    │   ├── index.js
    │   ├── auth.js
    │   ├── sinhVien.js
    │   ├── giangVien.js
    │   ├── khoa.js
    │   └── hocPhan.js
    └── utils/
        └── helpers.js        # Các hàm tiện ích
```

## Cài đặt

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Cấu hình database
Cập nhật file `config.env` với thông tin database của bạn:
```env
# Database Configuration
DB_HOST=quanlysinhvien.cr0w0a6goyvz.ap-southeast-1.rds.amazonaws.com
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=QuanLySinhVien
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Chạy database
Chạy file SQL để tạo database và bảng:
```bash
mysql -h quanlysinhvien.cr0w0a6goyvz.ap-southeast-1.rds.amazonaws.com -u root -p < CSDL.sql
```

### 4. Chạy server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký (chỉ admin)
- `PUT /api/auth/change-password` - Đổi mật khẩu
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile

### Sinh viên
- `GET /api/sinh-vien` - Lấy danh sách sinh viên
- `GET /api/sinh-vien/:id` - Lấy thông tin sinh viên
- `POST /api/sinh-vien` - Tạo sinh viên mới (admin)
- `PUT /api/sinh-vien/:id` - Cập nhật sinh viên
- `DELETE /api/sinh-vien/:id` - Xóa sinh viên (admin)
- `GET /api/sinh-vien/:id/ket-qua-hoc-tap` - Lấy kết quả học tập
- `GET /api/sinh-vien/:id/hoc-phi` - Lấy thông tin học phí
- `GET /api/sinh-vien/:id/thong-ke` - Lấy thống kê sinh viên

### Giảng viên
- `GET /api/giang-vien` - Lấy danh sách giảng viên
- `GET /api/giang-vien/:id` - Lấy thông tin giảng viên
- `POST /api/giang-vien` - Tạo giảng viên mới (admin)
- `PUT /api/giang-vien/:id` - Cập nhật giảng viên
- `DELETE /api/giang-vien/:id` - Xóa giảng viên (admin)
- `GET /api/giang-vien/:id/sinh-vien-co-van` - Lấy sinh viên cố vấn
- `GET /api/giang-vien/:id/yeu-cau-tu-van` - Lấy yêu cầu tư vấn
- `GET /api/giang-vien/:id/thong-ke` - Lấy thống kê giảng viên

### Khoa
- `GET /api/khoa` - Lấy danh sách khoa
- `GET /api/khoa/:id` - Lấy thông tin khoa
- `POST /api/khoa` - Tạo khoa mới (admin)
- `PUT /api/khoa/:id` - Cập nhật khoa (admin)
- `DELETE /api/khoa/:id` - Xóa khoa (admin)
- `GET /api/khoa/:id/nganh` - Lấy danh sách ngành
- `GET /api/khoa/:id/lop` - Lấy danh sách lớp
- `GET /api/khoa/:id/thong-ke` - Lấy thống kê khoa

### Học phần
- `GET /api/hoc-phan` - Lấy danh sách học phần
- `GET /api/hoc-phan/:id` - Lấy thông tin học phần
- `POST /api/hoc-phan` - Tạo học phần mới (admin)
- `PUT /api/hoc-phan/:id` - Cập nhật học phần (admin)
- `DELETE /api/hoc-phan/:id` - Xóa học phần (admin)
- `GET /api/hoc-phan/:id/sinh-vien-dang-ky` - Lấy sinh viên đăng ký
- `GET /api/hoc-phan/:id/ket-qua-hoc-tap` - Lấy kết quả học tập
- `GET /api/hoc-phan/:id/thong-ke` - Lấy thống kê học phần

## Authentication

API sử dụng JWT (JSON Web Token) để xác thực. Để truy cập các endpoint được bảo vệ, bạn cần:

1. Đăng nhập để lấy token
2. Gửi token trong header `Authorization: Bearer <token>`

## Response Format

Tất cả API responses đều có format:
```json
{
  "success": true/false,
  "message": "Mô tả kết quả",
  "data": {} // Dữ liệu trả về (nếu có)
}
```

## Error Handling

API có xử lý lỗi toàn cục và trả về các mã lỗi HTTP phù hợp:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- Password hashing với bcryptjs
- JWT authentication
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation

## Development

### Scripts
- `npm start` - Chạy server production
- `npm run dev` - Chạy server development với nodemon

### Environment Variables
Tất cả cấu hình được lưu trong file `config.env`. Không commit file này vào git.

## Database Schema

Database được thiết kế với các bảng chính:
- `TaiKhoan` - Quản lý tài khoản
- `SinhVien` - Thông tin sinh viên
- `GiangVien` - Thông tin giảng viên
- `Khoa` - Thông tin khoa
- `Nganh` - Thông tin ngành
- `Lop` - Thông tin lớp
- `HocPhan` - Thông tin học phần
- `KetQuaHocTap` - Kết quả học tập
- `DangKyHocPhan` - Đăng ký học phần
- `HocPhi` - Học phí
- Và các bảng khác...

## License
MIT
