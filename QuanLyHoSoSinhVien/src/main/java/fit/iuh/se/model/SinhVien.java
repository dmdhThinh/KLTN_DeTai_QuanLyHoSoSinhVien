package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name="SinhVien")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SinhVien {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(name="ma_sv", unique=true, nullable=false, length=20)
    private String maSv;

    @Column(name="ho_ten", nullable=false, length=100)
    private String hoTen;

    @Column(name="ngay_sinh")
    private LocalDate ngaySinh;

    @Column(name="gioi_tinh")
    private String gioiTinh;

    private String email;
    @Column(name="so_dien_thoai")
    private String soDienThoai;
    @Column(name="dia_chi")
    private String diaChi;
    @Column(name="anh_the")
    private String anhThe;
    @Column(name="khoa_hoc")
    private String khoaHoc;

    @ManyToOne @JoinColumn(name="khoa_id")
    private Khoa khoa;

    @ManyToOne @JoinColumn(name="nganh_id")
    private Nganh nganh;

    @ManyToOne @JoinColumn(name="lop_id")
    private Lop lop;

    @ManyToOne @JoinColumn(name="co_van_id")
    private GiangVien coVan;

    @OneToOne @JoinColumn(name="tai_khoan_id")
    private TaiKhoan taiKhoan;
}
