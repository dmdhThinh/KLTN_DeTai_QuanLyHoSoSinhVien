package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="Khoa")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Khoa {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(name="ten_khoa", nullable=false, length=100)
    private String tenKhoa;
}
