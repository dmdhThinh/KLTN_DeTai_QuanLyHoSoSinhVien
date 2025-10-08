package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="ThamGiaHoatDong")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThamGiaHoatDong {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne @JoinColumn(name="sinh_vien_id")
    private SinhVien sinhVien;

    @ManyToOne @JoinColumn(name="hoat_dong_id")
    private HoatDongNgoaiKhoa hoatDong;

    @Column(name="vai_tro")
    private String vaiTro;
}
