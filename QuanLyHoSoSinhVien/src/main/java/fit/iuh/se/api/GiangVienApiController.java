package fit.iuh.se.api;

import fit.iuh.se.dto.GiangVienDto;
import fit.iuh.se.model.GiangVien;
import fit.iuh.se.repo.GiangVienRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/giangviens")
public class GiangVienApiController {
    private final GiangVienRepository giangVienRepository;

    public GiangVienApiController(GiangVienRepository giangVienRepository) {
        this.giangVienRepository = giangVienRepository;
    }

    @GetMapping
    public List<GiangVienDto> getAll() {
        return giangVienRepository.findAll().stream()
                .map(GiangVienDto::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GiangVienDto> getById(@PathVariable("id") Integer id) {
        Optional<GiangVien> gv = giangVienRepository.findById(id);
        return gv.map(value -> ResponseEntity.ok(GiangVienDto.fromEntity(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GiangVienDto> create(@RequestBody GiangVienDto body) {
        GiangVien gv = new GiangVien();
        gv.setMaGv(body.maGv);
        gv.setHoTen(body.hoTen);
        gv.setEmail(body.email);
        gv.setSoDienThoai(body.soDienThoai);
        GiangVien saved = giangVienRepository.save(gv);
        return ResponseEntity.status(HttpStatus.CREATED).body(GiangVienDto.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GiangVienDto> update(@PathVariable("id") Integer id, @RequestBody GiangVienDto body) {
        Optional<GiangVien> existing = giangVienRepository.findById(id);
        if (existing.isEmpty())
            return ResponseEntity.notFound().build();
        GiangVien gv = existing.get();
        gv.setMaGv(body.maGv);
        gv.setHoTen(body.hoTen);
        gv.setEmail(body.email);
        gv.setSoDienThoai(body.soDienThoai);
        GiangVien saved = giangVienRepository.save(gv);
        return ResponseEntity.ok(GiangVienDto.fromEntity(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        if (!giangVienRepository.existsById(id))
            return ResponseEntity.notFound().build();
        giangVienRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
