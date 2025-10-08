package fit.iuh.se.repo;

import fit.iuh.se.model.GiangVien;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GiangVienRepository extends JpaRepository<GiangVien, Integer> {
    GiangVien findByTaiKhoan_Id(Integer taiKhoanId);
}


