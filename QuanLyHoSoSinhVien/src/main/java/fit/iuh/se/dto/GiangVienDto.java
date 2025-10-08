package fit.iuh.se.dto;

import fit.iuh.se.model.GiangVien;

public class GiangVienDto {
    public Integer id;
    public String maGv;
    public String hoTen;
    public String email;
    public String soDienThoai;
    public Integer khoaId;

    public static GiangVienDto fromEntity(GiangVien gv) {
        if (gv == null) return null;
        GiangVienDto dto = new GiangVienDto();
        dto.id = gv.getId();
        dto.maGv = gv.getMaGv();
        dto.hoTen = gv.getHoTen();
        dto.email = gv.getEmail();
        dto.soDienThoai = gv.getSoDienThoai();
        dto.khoaId = gv.getKhoa() != null ? gv.getKhoa().getId() : null;
        return dto;
    }
}


