package fit.iuh.se.dto;

import fit.iuh.se.model.TaiKhoan;

public class TaiKhoanDto {
    public Integer id;
    public String username;
    public String role;
    public String trangThai;

    public static TaiKhoanDto fromEntity(TaiKhoan tk) {
        if (tk == null) return null;
        TaiKhoanDto dto = new TaiKhoanDto();
        dto.id = tk.getId();
        dto.username = tk.getUsername();
        dto.role = tk.getRole();
        dto.trangThai = tk.getTrangThai();
        return dto;
    }
}


