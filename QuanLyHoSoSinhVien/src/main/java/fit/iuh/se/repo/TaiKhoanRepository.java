package fit.iuh.se.repo;

import fit.iuh.se.model.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {
    Optional<TaiKhoan> findByUsernameAndPasswordHashAndTrangThai(String username, String passwordHash, String trangThai);
}
