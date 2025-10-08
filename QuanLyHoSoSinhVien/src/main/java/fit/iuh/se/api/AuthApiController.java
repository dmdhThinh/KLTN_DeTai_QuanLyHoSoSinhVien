package fit.iuh.se.api;

import fit.iuh.se.dto.auth.LoginRequest;
import fit.iuh.se.dto.auth.LoginResponse;
import fit.iuh.se.model.TaiKhoan;
import fit.iuh.se.model.SinhVien;
import fit.iuh.se.model.GiangVien;
import fit.iuh.se.repo.SinhVienRepository;
import fit.iuh.se.repo.GiangVienRepository;
import fit.iuh.se.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthApiController {
    private final UserService userService;
    private final SinhVienRepository sinhVienRepository;
    private final GiangVienRepository giangVienRepository;

    public AuthApiController(UserService userService, SinhVienRepository sinhVienRepository,
            GiangVienRepository giangVienRepository) {
        this.userService = userService;
        this.sinhVienRepository = sinhVienRepository;
        this.giangVienRepository = giangVienRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        TaiKhoan user = userService.login(request.username, request.password);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        // For now, return a dummy token containing username; replace with JWT later
        String token = "token-" + user.getUsername();
        Integer svId = null;
        Integer gvId = null;
        SinhVien sv = sinhVienRepository.findByTaiKhoan_Id(user.getId());
        if (sv != null)
            svId = sv.getId();
        GiangVien gv = giangVienRepository.findByTaiKhoan_Id(user.getId());
        if (gv != null)
            gvId = gv.getId();
        return ResponseEntity.ok(new LoginResponse(token, svId, gvId, user.getRole()));
    }
}
