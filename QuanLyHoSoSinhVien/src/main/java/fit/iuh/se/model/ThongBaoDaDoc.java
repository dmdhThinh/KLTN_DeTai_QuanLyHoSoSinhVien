package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ThongBao_DaDoc")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongBaoDaDoc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne @JoinColumn(name="sinh_vien_id")
    private SinhVien sinhVien;

    @ManyToOne @JoinColumn(name="thong_bao_id")
    private ThongBao thongBao;

    @Column(name="da_doc")
    private String daDoc;

    @Column(name="ngay_doc")
    private LocalDateTime ngayDoc;
}
