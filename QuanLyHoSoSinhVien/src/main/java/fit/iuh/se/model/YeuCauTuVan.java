package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="YeuCauTuVan")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YeuCauTuVan {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne @JoinColumn(name="sinh_vien_id")
    private SinhVien sinhVien;

    @ManyToOne @JoinColumn(name="co_van_id")
    private GiangVien coVan;

    @Column(name="noi_dung")
    private String noiDung;

    @Column(name="ngay_gui")
    private LocalDateTime ngayGui;

    @Column(name="trang_thai")
    private String trangThai;
}
