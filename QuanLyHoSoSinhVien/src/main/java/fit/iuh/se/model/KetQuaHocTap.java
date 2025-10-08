package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="KetQuaHocTap")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KetQuaHocTap {
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

    @Column(name="diem_qua_trinh")
    private Double diemQuaTrinh;
    @Column(name="diem_thi")
    private Double diemThi;
    @Column(name="diem_tong_ket")
    private Double diemTongKet;

    @Column(name="hoc_luc")
    private String hocLuc;
}
