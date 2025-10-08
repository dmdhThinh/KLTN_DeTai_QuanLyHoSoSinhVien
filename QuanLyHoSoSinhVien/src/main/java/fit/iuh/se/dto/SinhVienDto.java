package fit.iuh.se.dto;

import fit.iuh.se.model.SinhVien;

import java.time.LocalDate;

public class SinhVienDto {
    public Integer id;
    public String maSv;
    public String hoTen;
    public LocalDate ngaySinh;
    public String gioiTinh;
    public String email;
    public String soDienThoai;
    public String diaChi;
    public String anhThe;
    public String khoaHoc;
    public Integer khoaId;
    public Integer nganhId;
    public Integer lopId;
    public Integer coVanId;
    public String khoa;
    public String nganh;
    public String lop;

    public static SinhVienDto fromEntity(SinhVien sv) {
        if (sv == null)
            return null;
        SinhVienDto dto = new SinhVienDto();
        dto.id = sv.getId();
        dto.maSv = sv.getMaSv();
        dto.hoTen = sv.getHoTen();
        dto.ngaySinh = sv.getNgaySinh();
        dto.gioiTinh = sv.getGioiTinh();
        dto.email = sv.getEmail();
        dto.soDienThoai = sv.getSoDienThoai();
        dto.diaChi = sv.getDiaChi();
        dto.anhThe = sv.getAnhThe();
        dto.khoaHoc = sv.getKhoaHoc();
        dto.khoaId = sv.getKhoa() != null ? sv.getKhoa().getId() : null;
        dto.nganhId = sv.getNganh() != null ? sv.getNganh().getId() : null;
        dto.lopId = sv.getLop() != null ? sv.getLop().getId() : null;
        dto.khoa = sv.getKhoa() != null ? sv.getKhoa().getTenKhoa() : null;
        dto.nganh = sv.getNganh() != null ? sv.getNganh().getTenNganh() : null;
        dto.lop = sv.getLop() != null ? sv.getLop().getTenLop() : null;
        dto.coVanId = sv.getCoVan() != null ? sv.getCoVan().getId() : null;
        return dto;
    }
}
