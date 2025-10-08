package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="Nganh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Nganh {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(name="ten_nganh", nullable=false, length=100)
    private String tenNganh;

    @ManyToOne
    @JoinColumn(name="khoa_id")
    private Khoa khoa;
}
