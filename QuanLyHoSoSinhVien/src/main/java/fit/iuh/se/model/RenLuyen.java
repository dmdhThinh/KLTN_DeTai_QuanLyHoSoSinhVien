package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="RenLuyen")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RenLuyen {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne @JoinColumn(name="sinh_vien_id")
    private SinhVien sinhVien;

    @Column(name="hoc_ky")
    private String hocKy;
    @Column(name="nam_hoc")
    private String namHoc;

    private Integer diem;
    @Column(name="nhan_xet")
    private String nhanXet;
}
