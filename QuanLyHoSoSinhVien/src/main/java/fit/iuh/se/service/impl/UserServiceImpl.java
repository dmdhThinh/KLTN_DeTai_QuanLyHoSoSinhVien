package fit.iuh.se.service.impl;

import fit.iuh.se.model.TaiKhoan;
import fit.iuh.se.repo.TaiKhoanRepository;
import fit.iuh.se.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final TaiKhoanRepository repo;

    @Override
    public TaiKhoan login(String username, String password) {
        // dùng plain text để khớp dữ liệu mẫu; khi cần bảo mật thì thay BCrypt
        return repo.findByUsernameAndPasswordHashAndTrangThai(username, password, "Hoạt động")
                .orElse(null);
    }
}
