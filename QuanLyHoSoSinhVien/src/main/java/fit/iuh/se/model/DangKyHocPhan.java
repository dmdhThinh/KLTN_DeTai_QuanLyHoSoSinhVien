package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="DangKyHocPhan")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DangKyHocPhan {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne @JoinColumn(name="sinh_vien_id")
    private SinhVien sinhVien;

    @ManyToOne @JoinColumn(name="hoc_phan_id")
    private HocPhan hocPhan;

    @Column(name="hoc_ky")
    private String hocKy;
    @Column(name="nam_hoc")
    private String namHoc;
    @Column(name="trang_thai")
    private String trangThai;
}
