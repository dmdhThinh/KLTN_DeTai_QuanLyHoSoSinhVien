package fit.iuh.se.api;

import fit.iuh.se.dto.SinhVienDto;
import fit.iuh.se.model.SinhVien;
import fit.iuh.se.repo.SinhVienRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sinhviens")
public class SinhVienApiController {
    private final SinhVienRepository sinhVienRepository;

    public SinhVienApiController(SinhVienRepository sinhVienRepository) {
        this.sinhVienRepository = sinhVienRepository;
    }

    @GetMapping
    public List<SinhVienDto> getAll() {
        return sinhVienRepository.findAll().stream()
                .map(SinhVienDto::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SinhVienDto> getById(@PathVariable("id") Integer id) {
        Optional<SinhVien> sv = sinhVienRepository.findById(id);
        return sv.map(value -> ResponseEntity.ok(SinhVienDto.fromEntity(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        if (!sinhVienRepository.existsById(id))
            return ResponseEntity.notFound().build();
        sinhVienRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<SinhVienDto> create(@RequestBody SinhVienDto body) {
        SinhVien sv = new SinhVien();
        sv.setMaSv(body.maSv);
        sv.setHoTen(body.hoTen);
        sv.setNgaySinh(body.ngaySinh);
        sv.setGioiTinh(body.gioiTinh);
        sv.setEmail(body.email);
        sv.setSoDienThoai(body.soDienThoai);
        sv.setDiaChi(body.diaChi);
        sv.setAnhThe(body.anhThe);
        sv.setKhoaHoc(body.khoaHoc);
        SinhVien saved = sinhVienRepository.save(sv);
        return ResponseEntity.status(HttpStatus.CREATED).body(SinhVienDto.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SinhVienDto> update(@PathVariable("id") Integer id, @RequestBody SinhVienDto body) {
        Optional<SinhVien> existing = sinhVienRepository.findById(id);
        if (existing.isEmpty())
            return ResponseEntity.notFound().build();
        SinhVien sv = existing.get();
        sv.setMaSv(body.maSv);
        sv.setHoTen(body.hoTen);
        sv.setNgaySinh(body.ngaySinh);
        sv.setGioiTinh(body.gioiTinh);
        sv.setEmail(body.email);
        sv.setSoDienThoai(body.soDienThoai);
        sv.setDiaChi(body.diaChi);
        sv.setAnhThe(body.anhThe);
        sv.setKhoaHoc(body.khoaHoc);
        SinhVien saved = sinhVienRepository.save(sv);
        return ResponseEntity.ok(SinhVienDto.fromEntity(saved));
    }
}
