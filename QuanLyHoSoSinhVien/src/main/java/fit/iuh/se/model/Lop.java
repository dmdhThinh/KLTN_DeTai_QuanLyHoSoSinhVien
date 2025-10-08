package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="Lop")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lop {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(name="ten_lop", nullable=false, length=50)
    private String tenLop;

    @ManyToOne @JoinColumn(name="khoa_id")
    private Khoa khoa;

    @ManyToOne @JoinColumn(name="nganh_id")
    private Nganh nganh;
}
