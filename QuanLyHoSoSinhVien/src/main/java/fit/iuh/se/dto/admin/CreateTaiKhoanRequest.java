package fit.iuh.se.dto.admin;

public class CreateTaiKhoanRequest {
    public String username;
    public String password; // plain for now; service should hash
    public String role;      // "Quản trị", "Giảng viên", "Sinh viên"
    public String trangThai; // e.g. "Hoạt động"
}


