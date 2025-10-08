package fit.iuh.se.repo;

import fit.iuh.se.model.SinhVien;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SinhVienRepository extends JpaRepository<SinhVien, Integer> {
    SinhVien findByMaSv(String maSv);
    SinhVien findByTaiKhoan_Id(Integer taiKhoanId);
}
