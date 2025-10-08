package fit.iuh.se.dto.auth;

public class LoginResponse {
    public String token;
    public Integer sinhVienId;
    public Integer giangVienId;
    public String role;

    public LoginResponse() {
    }

    public LoginResponse(String token, Integer sinhVienId, Integer giangVienId, String role) {
        this.token = token;
        this.sinhVienId = sinhVienId;
        this.giangVienId = giangVienId;
        this.role = role;
    }
}
