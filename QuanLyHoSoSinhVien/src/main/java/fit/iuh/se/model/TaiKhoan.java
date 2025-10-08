package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TaiKhoan")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaiKhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable=false, unique=true, length=50)
    private String username;

    @Column(name="password_hash", nullable=false, length=255)
    private String passwordHash;

    @Column(nullable=false, length=20)
    private String role;

    @Column(name="trang_thai", length=20)
    private String trangThai;
}
