package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="HoSoHanhChinh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoSoHanhChinh {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne @JoinColumn(name="sinh_vien_id")
    private SinhVien sinhVien;

    @Column(name="loai_ho_so")
    private String loaiHoSo;

    @Column(name="ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name="trang_thai")
    private String trangThai;

    @Column(name="ghi_chu")
    private String ghiChu;
}
