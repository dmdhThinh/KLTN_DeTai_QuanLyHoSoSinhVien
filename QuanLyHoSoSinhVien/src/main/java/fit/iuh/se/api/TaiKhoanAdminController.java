package fit.iuh.se.api;

import fit.iuh.se.dto.TaiKhoanDto;
import fit.iuh.se.dto.admin.CreateTaiKhoanRequest;
import fit.iuh.se.dto.admin.UpdateTaiKhoanRequest;
import fit.iuh.se.model.TaiKhoan;
import fit.iuh.se.repo.TaiKhoanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/tai-khoans")
public class TaiKhoanAdminController {
    private final TaiKhoanRepository taiKhoanRepository;

    public TaiKhoanAdminController(TaiKhoanRepository taiKhoanRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
    }

    @GetMapping
    public List<TaiKhoanDto> getAll() {
        return taiKhoanRepository.findAll().stream()
                .map(TaiKhoanDto::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaiKhoanDto> getById(@PathVariable Integer id) {
        Optional<TaiKhoan> tk = taiKhoanRepository.findById(id);
        return tk.map(value -> ResponseEntity.ok(TaiKhoanDto.fromEntity(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TaiKhoanDto> create(@RequestBody CreateTaiKhoanRequest req) {
        TaiKhoan tk = new TaiKhoan();
        tk.setUsername(req.username);
        tk.setPasswordHash(req.password); // TODO: hash later
        tk.setRole(req.role);
        tk.setTrangThai(req.trangThai);
        TaiKhoan saved = taiKhoanRepository.save(tk);
        return ResponseEntity.status(HttpStatus.CREATED).body(TaiKhoanDto.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaiKhoanDto> update(@PathVariable Integer id, @RequestBody UpdateTaiKhoanRequest req) {
        Optional<TaiKhoan> existing = taiKhoanRepository.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        TaiKhoan tk = existing.get();
        if (req.password != null) tk.setPasswordHash(req.password); // TODO: hash later
        if (req.role != null) tk.setRole(req.role);
        if (req.trangThai != null) tk.setTrangThai(req.trangThai);
        TaiKhoan saved = taiKhoanRepository.save(tk);
        return ResponseEntity.ok(TaiKhoanDto.fromEntity(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!taiKhoanRepository.existsById(id)) return ResponseEntity.notFound().build();
        taiKhoanRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}


