package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="GiangVien")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiangVien {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(name="ma_gv", unique=true, nullable=false, length=20)
    private String maGv;

    @Column(name="ho_ten", nullable=false, length=100)
    private String hoTen;

    private String email;
    @Column(name="so_dien_thoai")
    private String soDienThoai;

    @ManyToOne @JoinColumn(name="khoa_id")
    private Khoa khoa;

    @OneToOne @JoinColumn(name="tai_khoan_id")
    private fit.iuh.se.model.TaiKhoan taiKhoan;
}
