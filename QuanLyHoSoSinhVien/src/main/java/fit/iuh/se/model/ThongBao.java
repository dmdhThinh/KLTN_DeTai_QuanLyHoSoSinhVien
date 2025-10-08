package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="ThongBao")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongBao {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(name="tieu_de", nullable=false, length=200)
    private String tieuDe;

    @Column(name="noi_dung")
    private String noiDung;

    @Column(name="ngay_gui")
    private LocalDateTime ngayGui;
}
