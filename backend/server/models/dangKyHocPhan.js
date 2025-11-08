import { pool } from '../config/db.js'

function bizError(message, detail) { const e = new Error(message); e.code = 'BUSINESS'; e.detail = detail; return e }

// ------ Đợt hiện tại ------
export async function getCurrentDot() {
  const [rows] = await pool.execute(
    `SELECT * FROM DotDangKy
     WHERE trang_thai = 'DANG_MO'
       AND NOW() BETWEEN thoi_gian_mo AND thoi_gian_dong
     ORDER BY thoi_gian_mo DESC
     LIMIT 1`
  )
  return rows[0] || null
}

// ------ Danh sách LHP khả dụng trong kỳ ------
export async function listAvailableLHP({ sinh_vien_id, hoc_ky, nam_hoc, dot_dang_ky_id }) {
  // Lấy danh sách học phần mà sinh viên ĐÃ đăng ký trong đợt này
  const [registeredHP] = await pool.execute(
    `SELECT DISTINCT lhp.hoc_phan_id
     FROM DangKyHocPhan d
     JOIN LopHocPhan lhp ON lhp.id = d.lop_hoc_phan_id
     WHERE d.sinh_vien_id = ? AND d.dot_dang_ky_id = ? AND d.trang_thai_dk <> 'HUY'`,
    [sinh_vien_id, dot_dang_ky_id || null]
  )
  const registeredHPIds = registeredHP.map(r => r.hoc_phan_id)
  
  // Lấy TẤT CẢ lớp học phần đang mở đăng ký trong kỳ
  const [lhps] = await pool.execute(
    `SELECT lhp.*, hp.ten_hoc_phan AS ten_hoc_phan,
            (SELECT COUNT(*) FROM DangKyHocPhan d
              WHERE d.lop_hoc_phan_id = lhp.id AND d.trang_thai_dk <> 'HUY') AS so_dk
     FROM LopHocPhan lhp
     JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
     WHERE lhp.hoc_ky = ? AND lhp.nam_hoc = ? AND lhp.trang_thai_dk = 'MO_DK'`,
    [hoc_ky, nam_hoc]
  )

  const out = []
  for (const l of lhps) {
    const remain = (l.si_so_toi_da ?? 50) - (l.so_dk ?? 0)

    // Check đã đăng ký học phần này chưa
    const daCoHocPhan = registeredHPIds.includes(l.hoc_phan_id)

    // check xung đột lịch với các lớp đã DK trong cùng đợt (nếu truyền vào), nếu không thì check với tất cả đang active của SV
    const params = [l.id, sinh_vien_id]
    let conflictSql =
      `SELECT 1 FROM DangKyHocPhan d
         JOIN LopHocPhan l2 ON l2.id = d.lop_hoc_phan_id
         JOIN LichHoc a ON a.lop_hoc_phan_id = l2.id
         JOIN LichHoc b ON b.lop_hoc_phan_id = ?
       WHERE d.sinh_vien_id = ?
         AND d.trang_thai_dk <> 'HUY'
         AND a.thu = b.thu
         AND a.tiet_bat_dau <= b.tiet_ket_thuc
         AND b.tiet_bat_dau <= a.tiet_ket_thuc`
    if (dot_dang_ky_id) {
      conflictSql += ` AND d.dot_dang_ky_id = ?`
      params.push(dot_dang_ky_id)
    }
    conflictSql += ` LIMIT 1`
    const [conflictRows] = await pool.execute(conflictSql, params)

    // check điều kiện (an toàn: nếu bảng điểm chưa có thì coi là đạt)
    const prereqOk = await safeCheckPrereq({ sinh_vien_id, hoc_phan_id: l.hoc_phan_id, dot_dang_ky_id })

    out.push({
      ...l,
      slot_con: remain,
      xung_dot_lich: conflictRows.length > 0,
      du_dieu_kien: prereqOk,
      da_dang_ky_hoc_phan: daCoHocPhan // Thêm flag này
    })
  }
  return out
}

// ------ Đăng ký của SV ------
export async function listMyRegistrations({ sinh_vien_id, dot_dang_ky_id, hoc_ky, nam_hoc }) {
  const params = [sinh_vien_id]
  let sql =
    `SELECT d.*, 
            lhp.ma_lop_hoc_phan, lhp.hoc_ky, lhp.nam_hoc, lhp.trang_thai AS trang_thai_lhp,
            hp.ten_hoc_phan, hp.so_tin_chi AS so_tc,
            (hp.so_tin_chi * 1000000) AS hoc_phi,
            hocphi.han_nop,
            hocphi.lan_thu
       FROM DangKyHocPhan d
       JOIN LopHocPhan lhp ON lhp.id = d.lop_hoc_phan_id
       JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
       LEFT JOIN HocPhi hocphi ON hocphi.dang_ky_id = d.id
      WHERE d.sinh_vien_id = ? AND d.trang_thai_dk <> 'HUY'`
  if (dot_dang_ky_id) {
    sql += ` AND d.dot_dang_ky_id = ?`
    params.push(dot_dang_ky_id)
  }
  // Filter theo học kỳ và năm học nếu có
  if (hoc_ky) {
    sql += ` AND lhp.hoc_ky = ?`
    params.push(hoc_ky)
  }
  if (nam_hoc) {
    sql += ` AND lhp.nam_hoc = ?`
    params.push(nam_hoc)
  }
  sql += ` ORDER BY d.thoi_diem_dk DESC`
  const [rows] = await pool.execute(sql, params)
  return rows
}

// ------ Đăng ký lớp ------
export async function registerLHP({
  sinh_vien_id,
  lop_hoc_phan_id,
  dot_dang_ky_id,
  loai_dang_ky = 'HOC_MOI'
}) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // 1) Lấy đợt đang mở (hoặc theo id truyền vào)
    let dot = null
    if (dot_dang_ky_id) {
      const [r] = await conn.execute(`SELECT * FROM DotDangKy WHERE id = ?`, [dot_dang_ky_id])
      dot = r[0] || null
    } else {
      const [r] = await conn.execute(
        `SELECT * FROM DotDangKy
           WHERE trang_thai = 'DANG_MO'
             AND NOW() BETWEEN thoi_gian_mo AND thoi_gian_dong
         ORDER BY thoi_gian_mo DESC LIMIT 1`
      )
      dot = r[0] || null
    }
    if (!dot) throw bizError('Ngoài thời gian đăng ký hoặc không có đợt đang mở')

    // 2) Lớp học phần + khóa hàng
    const [lhpRows] = await conn.execute(
      `SELECT lhp.*, hp.ten_hoc_phan
         FROM LopHocPhan lhp
         JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
        WHERE lhp.id = ? FOR UPDATE`,
      [lop_hoc_phan_id]
    )
    const lhp = lhpRows[0]
    if (!lhp) throw bizError('Không tìm thấy lớp học phần')
    if (lhp.trang_thai_dk !== 'MO_DK') throw bizError('Lớp chưa mở đăng ký hoặc đã khóa', { trang_thai_dk: lhp.trang_thai_dk })
    
    // 3) Kiểm tra đã đăng ký học phần này (bất kỳ lớp nào) trong đợt này chưa
    const [existingHP] = await conn.execute(
      `SELECT 1 FROM DangKyHocPhan d
       JOIN LopHocPhan lhp2 ON lhp2.id = d.lop_hoc_phan_id
       WHERE d.sinh_vien_id = ? AND lhp2.hoc_phan_id = ? AND d.dot_dang_ky_id = ?
       LIMIT 1`,
      [sinh_vien_id, lhp.hoc_phan_id, dot.id]
    )
    if (existingHP.length) throw bizError('Bạn đã đăng ký học phần này rồi')

    // 3) Sĩ số (đếm bản ghi đăng ký thực sự tồn tại, vì hủy = xóa dòng)
    const [[{ so_dk }]] = await conn.execute(
      `SELECT COUNT(*) AS so_dk FROM DangKyHocPhan WHERE lop_hoc_phan_id = ?`,
      [lop_hoc_phan_id]
    )
    const remain = (lhp.si_so_toi_da ?? 50) - so_dk
    if (remain <= 0) throw bizError('Lớp đã đủ sĩ số')

    // 4) Trùng lịch (không còn lọc theo trang_thai_dk)
    const [conflictRows] = await conn.execute(
      `SELECT 1
         FROM DangKyHocPhan d
         JOIN LopHocPhan l2 ON l2.id = d.lop_hoc_phan_id
         JOIN LichHoc a ON a.lop_hoc_phan_id = l2.id
         JOIN LichHoc b ON b.lop_hoc_phan_id = ?
        WHERE d.sinh_vien_id = ? AND d.dot_dang_ky_id = ?
          AND a.thu = b.thu
          AND a.tiet_bat_dau <= b.tiet_ket_thuc
          AND b.tiet_bat_dau <= a.tiet_ket_thuc
        LIMIT 1`,
      [lop_hoc_phan_id, sinh_vien_id, dot.id]
    )
    if (conflictRows.length) throw bizError('Trùng lịch với lớp đã đăng ký')

    // 5) Tiên quyết/song hành
    const prereqOk = await safeCheckPrereq({ conn, sinh_vien_id, hoc_phan_id: lhp.hoc_phan_id, dot_dang_ky_id: dot.id })
    if (!prereqOk) throw bizError('Chưa thỏa điều kiện tiên quyết/học trước/song hành')

    // 6) Chống trùng đăng ký trong cùng đợt
    const [dup] = await conn.execute(
      `SELECT 1 FROM DangKyHocPhan
        WHERE sinh_vien_id = ? AND lop_hoc_phan_id = ? AND dot_dang_ky_id = ?
        LIMIT 1`,
      [sinh_vien_id, lop_hoc_phan_id, dot.id]
    )
    if (dup.length) throw bizError('Đã đăng ký lớp này trong đợt hiện tại')

    // 7) Tạo đăng ký (bỏ cột trang_thai_dk khỏi danh sách cột insert)
    const [ins] = await conn.execute(
      `INSERT INTO DangKyHocPhan
        (sinh_vien_id, lop_hoc_phan_id, hoc_phan_id, loai_dang_ky, thoi_diem_dk, dot_dang_ky_id)
       SELECT ?,            ?,              lhp.hoc_phan_id, ?,            NOW(),       ?
         FROM LopHocPhan lhp WHERE lhp.id = ?`,
      [sinh_vien_id, lop_hoc_phan_id, loai_dang_ky, dot.id, lop_hoc_phan_id]
    )

    // 8) Tăng sĩ số hiển thị (nếu bạn có dùng cột đếm trong LHP)
    await conn.execute(`UPDATE LopHocPhan SET si_so_da_dk = si_so_da_dk + 1 WHERE id = ?`, [lop_hoc_phan_id])

    // 9) Ghi log
    await conn.execute(
      `INSERT INTO LichSuDangKyHP(dang_ky_id, hanh_dong, ghi_chu) VALUES(?, 'THEM', 'Đăng ký qua API')`,
      [ins.insertId]
    )

    await conn.commit()
    return { id: ins.insertId, message: 'Đăng ký thành công', dot_dang_ky_id: dot.id }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}



// ------ Hủy đăng ký ------
export async function cancelRegistration({ dangKyId }) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // Khóa dòng đăng ký cần hủy
    const [rows] = await conn.execute(`SELECT * FROM DangKyHocPhan WHERE id = ? FOR UPDATE`, [dangKyId])
    const d = rows[0]
    if (!d) throw bizError('Không tìm thấy đăng ký')

    // (Tùy chọn) kiểm tra đợt vẫn đang mở nếu bạn muốn
    const [dots] = await conn.execute(`SELECT * FROM DotDangKy WHERE id = ?`, [d.dot_dang_ky_id])
    const dot = dots[0]
    if (!dot || dot.trang_thai !== 'DANG_MO') throw bizError('Đợt đã đóng, không thể hủy')  // giống logic cũ

    // Ghi log trước khi xóa (log sẽ bị xóa theo CASCADE nếu bạn bật CASCADE, hoặc bạn có thể bỏ dòng này)
    await conn.execute(
      `INSERT INTO LichSuDangKyHP(dang_ky_id, hanh_dong, ghi_chu) VALUES(?, 'HUY', 'Hủy qua API')`,
      [dangKyId]
    )

    // Xóa đăng ký
    await conn.execute(`DELETE FROM DangKyHocPhan WHERE id = ?`, [dangKyId])

    // Giảm sĩ số hiển thị
    await conn.execute(
      `UPDATE LopHocPhan SET si_so_da_dk = GREATEST(si_so_da_dk - 1, 0) WHERE id = ?`,
      [d.lop_hoc_phan_id]
    )

    await conn.commit()
    return { message: 'Đã hủy đăng ký' }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}


// ===== Helpers =====
async function safeCheckPrereq({ conn, sinh_vien_id, hoc_phan_id, dot_dang_ky_id }) {
  // Nếu thiếu bảng KetQuaHocTap trong DB của bạn → coi như đạt điều kiện (tránh vỡ API)
  try {
    return await checkPrereq({ conn, sinh_vien_id, hoc_phan_id, dot_dang_ky_id })
  } catch {
    return true
  }
}

async function checkPrereq({ conn, sinh_vien_id, hoc_phan_id, dot_dang_ky_id }) {
  const ex = conn || pool

  // Lấy luật điều kiện
  const [rules] = await ex.execute(
    `SELECT * FROM DieuKienHocPhan WHERE hoc_phan_id = ?`,
    [hoc_phan_id]
  )
  if (!rules.length) return true

  // Các HP SV đã qua
  const [passed] = await ex.execute(
    `SELECT DISTINCT hoc_phan_id FROM KetQuaHocTap
      WHERE sinh_vien_id = ? AND (ket_qua = 'DAT' OR diem_tong_ket >= 5)`,
    [sinh_vien_id]
  )
  const passedSet = new Set(passed.map(r => r.hoc_phan_id))

  // Các HP SV đang đăng ký cùng đợt (cho song hành 'c')
  const [coRegs] = await ex.execute(
    `SELECT DISTINCT lhp.hoc_phan_id
       FROM DangKyHocPhan d JOIN LopHocPhan lhp ON lhp.id = d.lop_hoc_phan_id
      WHERE d.sinh_vien_id = ? AND d.dot_dang_ky_id = ? AND d.trang_thai_dk <> 'HUY'`,
    [sinh_vien_id, dot_dang_ky_id]
  )
  const coSet = new Set(coRegs.map(r => r.hoc_phan_id))

  for (const r of rules) {
    if (r.loai === 'a' || r.loai === 'b') {
      if (!passedSet.has(r.hoc_phan_lien_quan_id)) return false
    } else if (r.loai === 'c') {
      if (!passedSet.has(r.hoc_phan_lien_quan_id) && !coSet.has(r.hoc_phan_lien_quan_id)) return false
    }
  }
  return true
}
// NEW: Gom “môn học phần đang chờ đăng ký” (group by hoc_phan_id)
// === MÔN HỌC PHẦN ĐANG CHỜ ĐĂNG KÝ (gom theo hoc_phan_id) ===
export async function listPendingCourses({ sinh_vien_id, hoc_ky, nam_hoc, dot_dang_ky_id }) {
   // Lấy thông tin ngành/khoa của sinh viên
  const [svRows] = await pool.execute(
    `SELECT nganh_id, khoa_id FROM SinhVien WHERE id = ?`,
    [sinh_vien_id]
  )
  const sv = svRows[0]
  if (!sv) return []
  
  // Lấy danh sách học phần đã đăng ký THÀNH CÔNG (để loại ra)
  // Filter: chỉ lấy HP thuộc ngành của SV HOẶC HP chung (nganh_id IS NULL)
  const [registered] = await pool.execute(
    `SELECT DISTINCT lhp.hoc_phan_id
     FROM DangKyHocPhan d
     JOIN LopHocPhan lhp ON lhp.id = d.lop_hoc_phan_id
     WHERE d.sinh_vien_id = ? AND d.trang_thai_dk = 'THANH_CONG'`,
    [sinh_vien_id]
  )
  const registeredHPIds = registered.map(r => r.hoc_phan_id)
  
  // Lấy các HP có mở lớp trong kỳ + tổng số lớp/đã mở đăng ký
  const [rows] = await pool.execute(
    `SELECT hp.id AS hoc_phan_id, hp.ma_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi AS tc,
            COUNT(lhp.id)                   AS tong_so_lop,
            SUM(lhp.trang_thai_dk='MO_DK')  AS so_lop_mo_dk
     FROM LopHocPhan lhp
     JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
    WHERE lhp.hoc_ky = ? AND lhp.nam_hoc = ?
      AND (hp.nganh_id = ? OR hp.nganh_id IS NULL)
    GROUP BY hp.id, hp.ma_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi
    ORDER BY hp.ten_hoc_phan`,
    [hoc_ky, nam_hoc, sv.nganh_id]
  )
    
  // Loại bỏ những học phần đã đăng ký thành công
  return rows.filter(hp => !registeredHPIds.includes(hp.hoc_phan_id))
}

// === CHI TIẾT LỊCH CỦA 1 LỚP HỌC PHẦN (cho modal “Xem”) ===
export async function getClassSchedule(lopHocPhanId) {
  // Header lớp + giảng viên + thời gian
  const [h] = await pool.execute(
    `SELECT lhp.id, lhp.ma_lop_hoc_phan, lhp.hoc_ky, lhp.nam_hoc,
            lhp.ngay_bat_dau, lhp.ngay_ket_thuc, hp.ten_hoc_phan,
            gv.ho_ten AS giang_vien, lhp.si_so_toi_da,
            (SELECT COUNT(*) FROM DangKyHocPhan d 
              WHERE d.lop_hoc_phan_id = lhp.id AND d.trang_thai_dk <> 'HUY') AS da_dang_ky
       FROM LopHocPhan lhp
       JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
       JOIN GiangVien gv ON gv.id = lhp.giang_vien_id
      WHERE lhp.id = ?`,
    [lopHocPhanId]
  )
  const header = h[0] || null
  if (!header) return { header: null, lich: [] }

  // Lịch chi tiết (ngày/thu/tiết/phòng/cơ sở/loại)
  const [lich] = await pool.execute(
    `SELECT id, thu, ca, tiet_bat_dau, tiet_ket_thuc, phong, co_so, ngay_hoc, loai, ghi_chu
       FROM LichHoc
      WHERE lop_hoc_phan_id = ?
      ORDER BY (CASE thu WHEN 2 THEN 1 WHEN 3 THEN 2 WHEN 4 THEN 3 WHEN 5 THEN 4 WHEN 6 THEN 5 WHEN 7 THEN 6 WHEN 8 THEN 7 ELSE 8 END),
               tiet_bat_dau`,
    [lopHocPhanId]
  )
  return { header, lich }
}

// === LẤY DANH SÁCH SINH VIÊN ĐÃ ĐĂNG KÝ 1 LỚP HỌC PHẦN (cho giảng viên nhập điểm) ===
export async function getStudentsByLopHocPhan(lopHocPhanId) {
  const [rows] = await pool.execute(
    `SELECT 
      d.id as dang_ky_id,
      d.sinh_vien_id,
      sv.ma_sv,
      sv.ho_ten,
      sv.ngay_sinh,
      sv.email,
      d.loai_dang_ky,
      d.thoi_diem_dk,
      d.trang_thai_dk
    FROM DangKyHocPhan d
    JOIN SinhVien sv ON sv.id = d.sinh_vien_id
    WHERE d.lop_hoc_phan_id = ?
      AND d.trang_thai_dk <> 'HUY'
    ORDER BY sv.ma_sv`,
    [lopHocPhanId]
  )
  return rows
}
