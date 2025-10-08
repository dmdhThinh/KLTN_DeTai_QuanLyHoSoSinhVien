package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="HocPhan")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HocPhan {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(name="ma_hp", unique=true, nullable=false, length=20)
    private String maHp;

    @Column(name="ten_hp", nullable=false, length=100)
    private String tenHp;

    @Column(name="so_tin_chi")
    private Integer soTinChi;

    @ManyToOne @JoinColumn(name="khoa_id")
    private Khoa khoa;
}
