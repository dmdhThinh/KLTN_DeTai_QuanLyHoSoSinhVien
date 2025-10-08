package fit.iuh.se.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name="HoatDongNgoaiKhoa")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoatDongNgoaiKhoa {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(name="ten_hoat_dong", nullable=false, length=100)
    private String tenHoatDong;

    @Column(name="ngay_to_chuc")
    private LocalDate ngayToChuc;

    @Column(name="dia_diem")
    private String diaDiem;

    @Column(name="mo_ta")
    private String moTa;
}
