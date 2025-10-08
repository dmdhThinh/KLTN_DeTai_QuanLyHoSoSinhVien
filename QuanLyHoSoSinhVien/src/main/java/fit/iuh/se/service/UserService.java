package fit.iuh.se.service;

import fit.iuh.se.model.TaiKhoan;

public interface UserService {
    TaiKhoan login(String username, String password);
}
