import { pool } from '../config/db.js'

function bizError(message, detail) { const e = new Error(message); e.code = 'BUSINESS'; e.detail = detail; return e }

// ------ Đợt hiện tại ------
export async function getCurrentDot() {
  const [rows] = await pool.execute(
    `SELECT * FROM DotDangKy
     WHERE trang_thai = 'DANG_MO'
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
  const registeredHPIds = new Set(registeredHP.map(r => r.hoc_phan_id))
  
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

  if (lhps.length === 0) return []

  // Tối ưu: Gom tất cả kiểm tra xung đột lịch vào 1 query duy nhất
  // Kiểm tra trùng lịch với TẤT CẢ môn đã đăng ký trong cùng HỌC KỲ (không chỉ cùng đợt)
  const lhpIds = lhps.map(l => l.id)
  const conflictSql = `
    SELECT DISTINCT 
      b.lop_hoc_phan_id AS conflicted_lhp_id,
      hp.ten_hoc_phan,
      hp.ma_hoc_phan,
      l2.ma_lop_hoc_phan,
      a.thu,
      a.tiet_bat_dau,
      a.tiet_ket_thuc,
      a.phong
    FROM DangKyHocPhan d
         JOIN LopHocPhan l2 ON l2.id = d.lop_hoc_phan_id
         JOIN HocPhan hp ON hp.id = l2.hoc_phan_id
         JOIN LichHoc a ON a.lop_hoc_phan_id = l2.id
         JOIN LichHoc b ON b.lop_hoc_phan_id IN (${lhpIds.map(() => '?').join(',')})
    WHERE d.sinh_vien_id = ?
      AND d.trang_thai_dk <> 'HUY'
      AND l2.hoc_ky = ?
      AND l2.nam_hoc = ?
      AND a.thu = b.thu
      AND a.tiet_bat_dau <= b.tiet_ket_thuc
      AND b.tiet_bat_dau <= a.tiet_ket_thuc
  `
  // Thứ tự params phải khớp với query: ...lhpIds (IN clause), sinh_vien_id, hoc_ky, nam_hoc
  const conflictParams = [...lhpIds, sinh_vien_id, hoc_ky, nam_hoc]
  const [conflictRows] = await pool.execute(conflictSql, conflictParams)
  const conflictedLhpIds = new Set(conflictRows.map(r => r.conflicted_lhp_id))
  
  // Tạo map để lưu thông tin chi tiết về lớp bị trùng
  const conflictDetailMap = new Map()
  for (const row of conflictRows) {
    if (!conflictDetailMap.has(row.conflicted_lhp_id)) {
      conflictDetailMap.set(row.conflicted_lhp_id, [])
    }
    conflictDetailMap.get(row.conflicted_lhp_id).push({
      ten_hoc_phan: row.ten_hoc_phan,
      ma_hoc_phan: row.ma_hoc_phan,
      ma_lop_hoc_phan: row.ma_lop_hoc_phan,
      thu: row.thu,
      tiet_bat_dau: row.tiet_bat_dau,
      tiet_ket_thuc: row.tiet_ket_thuc,
      phong: row.phong
    })
  }

  // Tối ưu: Gom tất cả kiểm tra điều kiện tiên quyết vào 1 query duy nhất
  const uniqueHocPhanIds = [...new Set(lhps.map(l => l.hoc_phan_id))]
  const prereqMap = new Map() // Map<hoc_phan_id, { ok: boolean, missingPrereqs: [], missingTcCondition: null }>
  
  // Lấy thông tin ngành của sinh viên
  const [svRows] = await pool.execute(
    `SELECT nganh_id FROM SinhVien WHERE id = ?`,
    [sinh_vien_id]
  )
  const nganhId = svRows[0]?.nganh_id
  
  try {
    // Lấy tất cả luật điều kiện cho các học phần kèm thông tin học phần
    // LEFT JOIN để lấy cả các record chỉ có điều kiện số tín chỉ (hoc_phan_lien_quan_id = NULL)
    const [allRules] = await pool.execute(
      `SELECT dk.*, hp.ma_hoc_phan, hp.ten_hoc_phan
       FROM DieuKienHocPhan dk
       LEFT JOIN HocPhan hp ON hp.id = dk.hoc_phan_lien_quan_id
       WHERE dk.hoc_phan_id IN (${uniqueHocPhanIds.map(() => '?').join(',')})`,
      uniqueHocPhanIds
    )
    
    // Lấy điều kiện số tín chỉ bắt buộc cho các học phần
    const [tcConditions] = await pool.execute(
      `SELECT hoc_phan_id, MAX(so_tc_bat_buoc_toi_thieu) AS so_tc_bat_buoc_toi_thieu
       FROM DieuKienHocPhan
       WHERE hoc_phan_id IN (${uniqueHocPhanIds.map(() => '?').join(',')})
         AND so_tc_bat_buoc_toi_thieu IS NOT NULL
       GROUP BY hoc_phan_id`,
      uniqueHocPhanIds
    )
    const tcConditionMap = new Map(tcConditions.map(tc => [tc.hoc_phan_id, tc.so_tc_bat_buoc_toi_thieu]))
    
    // Tính tổng số tín chỉ bắt buộc mà sinh viên đã học (nếu có môn cần điều kiện TC)
    let tongTcBatBuoc = 0
    if (tcConditionMap.size > 0 && nganhId) {
      const [tcRows] = await pool.execute(
        `SELECT COALESCE(SUM(hp.so_tin_chi), 0) AS tong_tc_bat_buoc
         FROM DangKyHocPhan dk
         JOIN LopHocPhan lhp ON lhp.id = dk.lop_hoc_phan_id
         JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
         JOIN ChuongTrinhKhung ctk ON ctk.hoc_phan_id = hp.id
         WHERE dk.sinh_vien_id = ?
           AND ctk.nganh_id = ?
           AND ctk.loai_mon = 'BAT_BUOC'
           AND dk.trang_thai_dk <> 'HUY'`,
        [sinh_vien_id, nganhId]
      )
      tongTcBatBuoc = tcRows[0]?.tong_tc_bat_buoc || 0
    }
    
    // Lấy các HP SV đã HỌC XONG (có điểm trong KetQuaHocTap)
    // KHÔNG quan tâm đạt hay rớt, CHỈ cần đã có điểm
    // KHÔNG check trong DangKyHocPhan vì có thể đang đăng ký nhưng chưa có điểm
    const [hasScore] = await pool.execute(
      `SELECT DISTINCT hoc_phan_id FROM KetQuaHocTap
       WHERE sinh_vien_id = ?`,
      [sinh_vien_id]
    )
    const studiedSet = new Set(hasScore.map(r => r.hoc_phan_id))

    // Lấy các HP SV đang đăng ký cùng đợt (cho song hành)
    const coRegParams = [sinh_vien_id]
    let coRegSql = `
      SELECT DISTINCT lhp.hoc_phan_id
      FROM DangKyHocPhan d 
      JOIN LopHocPhan lhp ON lhp.id = d.lop_hoc_phan_id
      WHERE d.sinh_vien_id = ? AND d.trang_thai_dk <> 'HUY'
    `
    if (dot_dang_ky_id) {
      coRegSql += ` AND d.dot_dang_ky_id = ?`
      coRegParams.push(dot_dang_ky_id)
    }
    const [coRegs] = await pool.execute(coRegSql, coRegParams)
    const coSet = new Set(coRegs.map(r => r.hoc_phan_id))

    // Kiểm tra điều kiện cho từng học phần và thu thập môn còn thiếu
    for (const hpId of uniqueHocPhanIds) {
      const rules = allRules.filter(r => r.hoc_phan_id === hpId)
      const soTcBatBuocToiThieu = tcConditionMap.get(hpId) || null
      
      if (rules.length === 0 && !soTcBatBuocToiThieu) {
        prereqMap.set(hpId, { ok: true, missingPrereqs: [], missingTcCondition: null })
        continue
      }

      const missingPrereqs = []
      for (const r of rules) {
        // Bỏ qua các record chỉ có điều kiện số tín chỉ (hoc_phan_lien_quan_id = NULL)
        if (!r.hoc_phan_lien_quan_id) {
          continue
        }
        
        let isSatisfied = false
        
        if (r.loai === 'a' || r.loai === 'b') {
          // Học trước (a) hoặc Tiên quyết (b): chỉ cần đã học (đã đăng ký hoặc có điểm)
          isSatisfied = studiedSet.has(r.hoc_phan_lien_quan_id)
        } else if (r.loai === 'c') {
          // Song hành (c): đã học HOẶC đang đăng ký cùng đợt
          isSatisfied = studiedSet.has(r.hoc_phan_lien_quan_id) || coSet.has(r.hoc_phan_lien_quan_id)
        }
        
        if (!isSatisfied) {
          const loaiText = r.loai === 'a' ? 'Học trước' : r.loai === 'b' ? 'Tiên quyết' : 'Song hành'
          missingPrereqs.push({
            ma_hoc_phan: r.ma_hoc_phan,
            ten_hoc_phan: r.ten_hoc_phan,
            loai: r.loai,
            loai_text: loaiText
          })
        }
      }
      
      // Kiểm tra điều kiện số tín chỉ bắt buộc
      let missingTcCondition = null
      if (soTcBatBuocToiThieu && tongTcBatBuoc < soTcBatBuocToiThieu) {
        missingTcCondition = {
          so_tc_bat_buoc_toi_thieu: soTcBatBuocToiThieu,
          tong_tc_bat_buoc_hien_tai: tongTcBatBuoc,
          con_thieu: soTcBatBuocToiThieu - tongTcBatBuoc
        }
      }
      
      prereqMap.set(hpId, {
        ok: missingPrereqs.length === 0 && !missingTcCondition,
        missingPrereqs,
        missingTcCondition
      })
    }
  } catch (err) {
    // Nếu có lỗi (bảng không tồn tại), coi như tất cả đều đạt
    for (const hpId of uniqueHocPhanIds) {
      prereqMap.set(hpId, { ok: true, missingPrereqs: [], missingTcCondition: null })
    }
  }

  // Tạo kết quả
  const out = []
  for (const l of lhps) {
    const remain = (l.si_so_toi_da ?? 50) - (l.so_dk ?? 0)
    const daCoHocPhan = registeredHPIds.has(l.hoc_phan_id)
    const xungDotLich = conflictedLhpIds.has(l.id)
    const conflictDetails = conflictDetailMap.get(l.id) || []
    const prereqInfo = prereqMap.get(l.hoc_phan_id) || { ok: true, missingPrereqs: [], missingTcCondition: null }
    const duDieuKien = prereqInfo.ok

    out.push({
      ...l,
      slot_con: remain,
      xung_dot_lich: xungDotLich,
      conflict_details: conflictDetails, // Thêm thông tin chi tiết về trùng lịch
      du_dieu_kien: duDieuKien,
      missing_prereqs: prereqInfo.missingPrereqs, // Thêm danh sách môn cần học trước
      missing_tc_condition: prereqInfo.missingTcCondition, // Thêm thông tin điều kiện số tín chỉ
      da_dang_ky_hoc_phan: daCoHocPhan
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
  // Khi có dot_dang_ky_id, vẫn hiển thị cả các bản ghi có dot_dang_ky_id = NULL (do admin thêm vào khi không có đợt)
  if (dot_dang_ky_id) {
    sql += ` AND (d.dot_dang_ky_id = ? OR d.dot_dang_ky_id IS NULL)`
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
    
    // 3) Kiểm tra đã đăng ký học phần này (bất kỳ lớp nào) trong CÙNG HỌC KỲ + NĂM HỌC này chưa
    // (Cho phép học lại môn của các kỳ trước, chỉ chặn trùng trong cùng kỳ hiện tại)
    const [existingHP] = await conn.execute(
      `SELECT d.id, d.trang_thai_dk, lhp2.ma_lop_hoc_phan, lhp2.hoc_ky, lhp2.nam_hoc 
       FROM DangKyHocPhan d
       JOIN LopHocPhan lhp2 ON lhp2.id = d.lop_hoc_phan_id
       WHERE d.sinh_vien_id = ? 
         AND lhp2.hoc_phan_id = ? 
         AND lhp2.hoc_ky = ? 
         AND lhp2.nam_hoc = ?
         AND d.trang_thai_dk <> 'HUY'
       LIMIT 1`,
      [sinh_vien_id, lhp.hoc_phan_id, lhp.hoc_ky, lhp.nam_hoc]
    )
    if (existingHP.length) throw bizError('Bạn đã đăng ký học phần này trong học kỳ này rồi')

    // 3) Sĩ số (đếm bản ghi đăng ký thực sự tồn tại, vì hủy = xóa dòng)
    const [[{ so_dk }]] = await conn.execute(
      `SELECT COUNT(*) AS so_dk FROM DangKyHocPhan WHERE lop_hoc_phan_id = ?`,
      [lop_hoc_phan_id]
    )
    const remain = (lhp.si_so_toi_da ?? 50) - so_dk
    if (remain <= 0) throw bizError('Lớp đã đủ sĩ số')

    // 4) Trùng lịch - kiểm tra với TẤT CẢ môn trong cùng HỌC KỲ (không chỉ cùng đợt)
    const [conflictRows] = await conn.execute(
      `SELECT 
         hp.ten_hoc_phan,
         hp.ma_hoc_phan,
         l2.ma_lop_hoc_phan,
         a.thu,
         a.tiet_bat_dau,
         a.tiet_ket_thuc,
         a.phong
       FROM DangKyHocPhan d
       JOIN LopHocPhan l2 ON l2.id = d.lop_hoc_phan_id
       JOIN HocPhan hp ON hp.id = l2.hoc_phan_id
       JOIN LichHoc a ON a.lop_hoc_phan_id = l2.id
       JOIN LichHoc b ON b.lop_hoc_phan_id = ?
      WHERE d.sinh_vien_id = ?
        AND d.trang_thai_dk <> 'HUY'
        AND l2.hoc_ky = ?
        AND l2.nam_hoc = ?
        AND a.thu = b.thu
        AND a.tiet_bat_dau <= b.tiet_ket_thuc
        AND b.tiet_bat_dau <= a.tiet_ket_thuc
      LIMIT 1`,
      [lop_hoc_phan_id, sinh_vien_id, lhp.hoc_ky, lhp.nam_hoc]
    )
    if (conflictRows.length) {
      const conflict = conflictRows[0]
      const detail = `${conflict.ten_hoc_phan} (${conflict.ma_hoc_phan}) - Lớp: ${conflict.ma_lop_hoc_phan}, Thứ ${conflict.thu}, tiết ${conflict.tiet_bat_dau}-${conflict.tiet_ket_thuc}, phòng ${conflict.phong}`
      throw bizError(`Trùng lịch với lớp đã đăng ký: ${detail}`)
    }

    // 5) Tiên quyết/song hành và điều kiện số tín chỉ
    const prereqResult = await safeCheckPrereq({ conn, sinh_vien_id, hoc_phan_id: lhp.hoc_phan_id, dot_dang_ky_id: dot.id })
    
    if (!prereqResult.ok) {
      const errorMessages = []
      
      // Thông báo về môn còn thiếu
      if (prereqResult.missingPrereqs && prereqResult.missingPrereqs.length > 0) {
        const missingList = prereqResult.missingPrereqs.map(m => 
          `${m.ten_hoc_phan} (${m.ma_hoc_phan}) - ${m.loai_text}`
        ).join(', ')
        errorMessages.push(`Cần hoàn thành: ${missingList}`)
        console.log(`   - Môn còn thiếu: ${missingList}`)
      }
      
      // Thông báo về số tín chỉ còn thiếu
      if (prereqResult.missingTcCondition) {
        const tcMsg = `Bạn cần ít nhất ${prereqResult.missingTcCondition.so_tc_bat_buoc_toi_thieu} tín chỉ bắt buộc. Hiện tại bạn có ${prereqResult.missingTcCondition.tong_tc_bat_buoc_hien_tai} TC, còn thiếu ${prereqResult.missingTcCondition.con_thieu} TC.`
        errorMessages.push(tcMsg)
        console.log(`   - ${tcMsg}`)
      }
      
      throw bizError(`Bạn chưa đủ điều kiện đăng ký môn này. ${errorMessages.join(' ')}`)
    }
    
    console.log(`   ✅ Đủ điều kiện, cho phép đăng ký\n`)

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

    // 9) Tạo bản ghi HocPhi tự động với hạn nộp từ đợt
    // Lấy hạn nộp chung từ một bản ghi HocPhi khác trong cùng đợt (nếu có)
    const [hanNopRows] = await conn.execute(
      `SELECT h.han_nop 
       FROM HocPhi h
       JOIN DangKyHocPhan dk ON dk.id = h.dang_ky_id
       WHERE dk.dot_dang_ky_id = ? AND h.han_nop IS NOT NULL
       LIMIT 1`,
      [dot.id]
    )
    const hanNopChung = hanNopRows[0]?.han_nop || null

    // Lấy số tín chỉ và tính học phí
    const [hpInfo] = await conn.execute(
      `SELECT so_tin_chi FROM HocPhan WHERE id = ?`,
      [lhp.hoc_phan_id]
    )
    const soTien = (hpInfo[0]?.so_tin_chi || 0) * 1000000

    // Tạo bản ghi HocPhi
    await conn.execute(
      `INSERT INTO HocPhi 
        (sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc, so_tien, tinh_trang, dang_ky_id, lop_hoc_phan_id, han_nop, lan_thu)
       VALUES (?, ?, ?, ?, ?, 'Chưa nộp', ?, ?, ?, 1)`,
      [
        sinh_vien_id,
        lhp.hoc_phan_id,
        lhp.hoc_ky,
        lhp.nam_hoc,
        soTien,
        ins.insertId,
        lop_hoc_phan_id,
        hanNopChung
      ]
    )

    // 10) Ghi log
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
        // Kiểm tra trạng thái lớp học phần
    const [lhpRows] = await conn.execute(`SELECT trang_thai FROM LopHocPhan WHERE id = ?`, [d.lop_hoc_phan_id])
    const lhp = lhpRows[0]
    if (lhp && lhp.trang_thai === 'Chấp nhận mở lớp') {
      throw bizError('Không thể hủy đăng ký. Lớp đã được chấp nhận mở lớp.')
    }

    // (Tùy chọn) kiểm tra đợt vẫn đang mở nếu bạn muốn
    const [dots] = await conn.execute(`SELECT * FROM DotDangKy WHERE id = ?`, [d.dot_dang_ky_id])
    const dot = dots[0]
    if (!dot || dot.trang_thai !== 'DANG_MO') throw bizError('Đợt đã đóng, không thể hủy')  // giống logic cũ

    // Ghi log trước khi xóa (log sẽ bị xóa theo CASCADE nếu bạn bật CASCADE, hoặc bạn có thể bỏ dòng này)
    await conn.execute(
      `INSERT INTO LichSuDangKyHP(dang_ky_id, hanh_dong, ghi_chu) VALUES(?, 'HUY', 'Hủy qua API')`,
      [dangKyId]
    )

    // Xóa bản ghi HocPhi liên quan
    await conn.execute(`DELETE FROM HocPhi WHERE dang_ky_id = ?`, [dangKyId])

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
  } catch (err) {
    // Log lỗi để debug
    console.error('❌ Lỗi kiểm tra điều kiện tiên quyết:', err)
    // Chỉ bỏ qua nếu là lỗi bảng không tồn tại, còn lại throw lại
    if (err.code === 'ER_NO_SUCH_TABLE' || err.message?.includes('doesn\'t exist')) {
      console.warn('Bảng không tồn tại, bỏ qua kiểm tra điều kiện tiên quyết')
      return { ok: true, missingPrereqs: [] }
    }
    // Các lỗi khác throw lại
    throw err
  }
}

async function checkPrereq({ conn, sinh_vien_id, hoc_phan_id, dot_dang_ky_id }) {
  const ex = conn || pool

  // Lấy thông tin ngành của sinh viên
  const [svRows] = await ex.execute(
    `SELECT nganh_id FROM SinhVien WHERE id = ?`,
    [sinh_vien_id]
  )
  const nganhId = svRows[0]?.nganh_id

  // Lấy luật điều kiện kèm thông tin học phần (bao gồm điều kiện số tín chỉ)
  // LEFT JOIN để lấy cả các record chỉ có điều kiện số tín chỉ (hoc_phan_lien_quan_id = NULL)
  const [rules] = await ex.execute(
    `SELECT dk.*, hp.ma_hoc_phan, hp.ten_hoc_phan
     FROM DieuKienHocPhan dk
     LEFT JOIN HocPhan hp ON hp.id = dk.hoc_phan_lien_quan_id
     WHERE dk.hoc_phan_id = ?`,
    [hoc_phan_id]
  )
  
  // Lấy điều kiện số tín chỉ bắt buộc (nếu có)
  const [tcCondition] = await ex.execute(
    `SELECT MAX(so_tc_bat_buoc_toi_thieu) AS so_tc_bat_buoc_toi_thieu
     FROM DieuKienHocPhan
     WHERE hoc_phan_id = ? AND so_tc_bat_buoc_toi_thieu IS NOT NULL`,
    [hoc_phan_id]
  )
  const soTcBatBuocToiThieu = tcCondition[0]?.so_tc_bat_buoc_toi_thieu || null
  
  if (!rules.length && !soTcBatBuocToiThieu) {
    return { ok: true, missingPrereqs: [], missingTcCondition: null }
  }

  // Các HP SV đã HỌC XONG (có điểm trong KetQuaHocTap)
  // KHÔNG quan tâm đạt hay rớt, CHỈ cần đã có điểm
  // KHÔNG check trong DangKyHocPhan vì có thể đang đăng ký nhưng chưa có điểm
  const [hasScore] = await ex.execute(
    `SELECT DISTINCT hoc_phan_id FROM KetQuaHocTap
     WHERE sinh_vien_id = ?`,
    [sinh_vien_id]
  )
  const studiedSet = new Set(hasScore.map(r => r.hoc_phan_id))

  // Các HP SV đang đăng ký cùng đợt (cho song hành 'c')
  const coRegs = dot_dang_ky_id ? await ex.execute(
    `SELECT DISTINCT lhp.hoc_phan_id
       FROM DangKyHocPhan d JOIN LopHocPhan lhp ON lhp.id = d.lop_hoc_phan_id
      WHERE d.sinh_vien_id = ? AND d.dot_dang_ky_id = ? AND d.trang_thai_dk <> 'HUY'`,
    [sinh_vien_id, dot_dang_ky_id]
  ) : [[], []]
  const coSet = new Set(coRegs[0].map(r => r.hoc_phan_id))

  // Kiểm tra từng điều kiện và thu thập môn còn thiếu
  const missingPrereqs = []
  for (const r of rules) {
    // Bỏ qua các record chỉ có điều kiện số tín chỉ (hoc_phan_lien_quan_id = NULL)
    if (!r.hoc_phan_lien_quan_id) {
      continue
    }
    
    let isSatisfied = false
    
    if (r.loai === 'a' || r.loai === 'b') {
      // Học trước (a) hoặc Tiên quyết (b): phải đã học xong (có điểm)
      isSatisfied = studiedSet.has(r.hoc_phan_lien_quan_id)
    } else if (r.loai === 'c') {
      // Song hành (c): đã học xong (có điểm) HOẶC đang đăng ký cùng đợt
      isSatisfied = studiedSet.has(r.hoc_phan_lien_quan_id) || coSet.has(r.hoc_phan_lien_quan_id)
    }
    
    if (!isSatisfied) {
      const loaiText = r.loai === 'a' ? 'Học trước' : r.loai === 'b' ? 'Tiên quyết' : 'Song hành'
      missingPrereqs.push({
        ma_hoc_phan: r.ma_hoc_phan,
        ten_hoc_phan: r.ten_hoc_phan,
        loai: r.loai,
        loai_text: loaiText
      })
    }
  }

  // Kiểm tra điều kiện số tín chỉ bắt buộc (nếu có)
  let missingTcCondition = null
  if (soTcBatBuocToiThieu && nganhId) {
    // Tính tổng số tín chỉ bắt buộc mà sinh viên đã học
    const [tcRows] = await ex.execute(
      `SELECT COALESCE(SUM(hp.so_tin_chi), 0) AS tong_tc_bat_buoc
       FROM DangKyHocPhan dk
       JOIN LopHocPhan lhp ON lhp.id = dk.lop_hoc_phan_id
       JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
       JOIN ChuongTrinhKhung ctk ON ctk.hoc_phan_id = hp.id
       WHERE dk.sinh_vien_id = ?
         AND ctk.nganh_id = ?
         AND ctk.loai_mon = 'BAT_BUOC'
         AND dk.trang_thai_dk <> 'HUY'`,
      [sinh_vien_id, nganhId]
    )
    const tongTcBatBuoc = tcRows[0]?.tong_tc_bat_buoc || 0
    
    if (tongTcBatBuoc < soTcBatBuocToiThieu) {
      missingTcCondition = {
        so_tc_bat_buoc_toi_thieu: soTcBatBuocToiThieu,
        tong_tc_bat_buoc_hien_tai: tongTcBatBuoc,
        con_thieu: soTcBatBuocToiThieu - tongTcBatBuoc
      }
    }
  }

  return {
    ok: missingPrereqs.length === 0 && !missingTcCondition,
    missingPrereqs,
    missingTcCondition
  }
}

function getTenHocKy(hocKy) {
  if (!hocKy) return ''
  const match = hocKy.match(/HK(\d+)/i)
  if (match) {
    const num = parseInt(match[1])
    const nam = Math.ceil(num / 2)
    const ky = num % 2 === 0 ? 2 : 1
    return `Năm ${nam} - Học kỳ ${ky}`
  }
  return hocKy
}

// NEW: Gom “môn học phần đang chờ đăng ký” (group by hoc_phan_id)
// === MÔN HỌC PHẦN ĐANG CHỜ ĐĂNG KÝ (gom theo hoc_phan_id) ===
export async function listPendingCourses({ sinh_vien_id, hoc_ky, nam_hoc, dot_dang_ky_id }) {
   // Lấy thông tin ngành/khoa của sinh viên
  const [svRows] = await pool.execute(
    `SELECT nganh_id, khoa_id, khoa_hoc FROM SinhVien WHERE id = ?`,
    [sinh_vien_id]
  )
  const sv = svRows[0]
  if (!sv) return []
  
  // --- LOGIC TÍNH HỌC KỲ THEO TIẾN ĐỘ (giống ý tưởng cũ): 
  // với khóa K21 -> năm bắt đầu ~ 2021, từ đó suy ra SV đang ở HK mấy trong CTK
  let targetHocKy = null
  if (sv.khoa_hoc && nam_hoc && hoc_ky) {
    const kNum = parseInt(sv.khoa_hoc.replace(/\D/g, ''), 10) || 0
    if (kNum > 0) {
      const startYear = 2000 + kNum
      const currentYear = parseInt(nam_hoc.split('-')[0], 10) || 0

      if (currentYear >= startYear) {
        const yearDiff = currentYear - startYear // Năm 1 = 0, Năm 2 = 1...

        let semesterIndex = 0
        if (hoc_ky === 'HK1') semesterIndex = yearDiff * 2 + 1
        else if (hoc_ky === 'HK2') semesterIndex = yearDiff * 2 + 2
        else if (hoc_ky === 'HK3') semesterIndex = yearDiff * 2 + 3

        if (semesterIndex > 0) {
          targetHocKy = `HK${semesterIndex}`
          console.log(
            `[PendingCourses] ${sinh_vien_id} - khoa ${sv.khoa_hoc} (${startYear}), nam_hoc=${nam_hoc}, hoc_ky=${hoc_ky} -> CTK hoc_ky=${targetHocKy}`
          )
        }
      }
    }
  }

  const hocKyCtdt = targetHocKy || hoc_ky
  
  // Lấy danh sách học phần đã đăng ký (loại bỏ khỏi danh sách chờ đăng ký)
  // 1. Môn đã đăng ký THÀNH CÔNG ở các kỳ TRƯỚC
  // 2. Môn đang đăng ký ở kỳ HIỆN TẠI (trạng thái khác HUY)
  const [registered] = await pool.execute(
    `SELECT DISTINCT lhp.hoc_phan_id
     FROM DangKyHocPhan d
     JOIN LopHocPhan lhp ON lhp.id = d.lop_hoc_phan_id
     WHERE d.sinh_vien_id = ?
       AND (
         (d.trang_thai_dk = 'THANH_CONG' AND NOT (lhp.hoc_ky = ? AND lhp.nam_hoc = ?))
         OR (lhp.hoc_ky = ? AND lhp.nam_hoc = ? AND d.trang_thai_dk <> 'HUY')
       )`,
    [sinh_vien_id, hoc_ky, nam_hoc, hoc_ky, nam_hoc]
  )
  const registeredHPIds = registered.map(r => r.hoc_phan_id)
  
  // Xây dựng query động: dùng cùng logic loại môn với Chương trình khung (theo đúng học kỳ đang chọn)
  let sql = `SELECT hp.id AS hoc_phan_id, hp.ma_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi AS tc,
            COUNT(lhp.id)                   AS tong_so_lop,
            SUM(lhp.trang_thai_dk='MO_DK')  AS so_lop_mo_dk,
            ctk.hoc_ky                      AS hoc_ky_ctdt,
            -- Loại môn trong CTK: BAT_BUOC / TU_CHON (ưu tiên BAT_BUOC nếu có nhiều dòng)
            CASE WHEN MAX(ctk.loai_mon) = 'BAT_BUOC' OR MIN(ctk.loai_mon) = 'BAT_BUOC'
                 THEN 'BAT_BUOC'
                 ELSE MAX(ctk.loai_mon)
            END                             AS loai_mon
     FROM LopHocPhan lhp
     JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
     JOIN ChuongTrinhKhung ctk ON ctk.hoc_phan_id = hp.id 
          AND (ctk.nganh_id = ? OR ctk.nganh_id IS NULL)
          AND ctk.hoc_ky = ?
    WHERE lhp.hoc_ky = ? AND lhp.nam_hoc = ?
      AND (hp.nganh_id = ? OR hp.nganh_id IS NULL)`
      
  const params = [sv.nganh_id, hocKyCtdt, hoc_ky, nam_hoc, sv.nganh_id]

  sql += ` GROUP BY hp.id, hp.ma_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi, ctk.hoc_ky
           ORDER BY hp.ten_hoc_phan`

  const [rows] = await pool.execute(sql, params)

  // Tổng TC theo chương trình khung (KHÔNG loại các môn đã đăng ký/đạt)
  const tongTcBatBuoc = rows
    .filter(r => r.loai_mon === 'BAT_BUOC')
    .reduce((sum, r) => sum + (r.tc || 0), 0)
  const tongTcTuChon = rows
    .filter(r => r.loai_mon === 'TU_CHON')
    .reduce((sum, r) => sum + (r.tc || 0), 0)
  const tongTc = tongTcBatBuoc + tongTcTuChon

  // Danh sách "môn đang chờ đăng ký": loại bỏ học phần SV đã đăng ký thành công
  const items = rows
    .filter(hp => !registeredHPIds.includes(hp.hoc_phan_id))
    .map(row => ({
      ...row,
      ten_hoc_ky_ctdt: getTenHocKy(row.hoc_ky_ctdt),
      bat_buoc: row.loai_mon === 'BAT_BUOC'
    }))

  return {
    items,
    tong_tc: tongTc,
    tong_tc_bat_buoc: tongTcBatBuoc,
    tong_tc_tu_chon: tongTcTuChon
  }
}

// === LẤY TẤT CẢ MÔN CỦA HỌC KỲ (cho phép học vượt) ===
// Hiển thị TẤT CẢ môn có lớp học phần mở đăng ký trong học kỳ/năm học đó
// Bao gồm cả môn của các năm sau (học vượt)
export async function listAllCoursesBySemester({ sinh_vien_id, hoc_ky, nam_hoc }) {
  // Lấy thông tin ngành/khoa của sinh viên
  const [svRows] = await pool.execute(
    `SELECT nganh_id, khoa_id, khoa_hoc FROM SinhVien WHERE id = ?`,
    [sinh_vien_id]
  )
  const sv = svRows[0]
  if (!sv) return { items: [], tong_tc: 0, tong_tc_bat_buoc: 0, tong_tc_tu_chon: 0 }

  // Lấy danh sách học phần đã đăng ký (loại bỏ khỏi danh sách chờ đăng ký)
  // 1. Môn đã đăng ký THÀNH CÔNG ở các kỳ TRƯỚC
  // 2. Môn đang đăng ký ở kỳ HIỆN TẠI (trạng thái khác HUY)
  const [registered] = await pool.execute(
    `SELECT DISTINCT lhp.hoc_phan_id
     FROM DangKyHocPhan d
     JOIN LopHocPhan lhp ON lhp.id = d.lop_hoc_phan_id
     WHERE d.sinh_vien_id = ?
       AND (
         (d.trang_thai_dk = 'THANH_CONG' AND NOT (lhp.hoc_ky = ? AND lhp.nam_hoc = ?))
         OR (lhp.hoc_ky = ? AND lhp.nam_hoc = ? AND d.trang_thai_dk <> 'HUY')
       )`,
    [sinh_vien_id, hoc_ky, nam_hoc, hoc_ky, nam_hoc]
  )
  const registeredHPIds = registered.map(r => r.hoc_phan_id)

  // Lấy TẤT CẢ môn có lớp học phần mở đăng ký trong học kỳ/năm học đó
  // LEFT JOIN với ChuongTrinhKhung để lấy thông tin loại môn (nếu có)
  // Không filter theo học kỳ trong CTK để cho phép học vượt
  let sql = `SELECT hp.id AS hoc_phan_id, hp.ma_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi AS tc,
            COUNT(DISTINCT lhp.id)                   AS tong_so_lop,
            SUM(CASE WHEN lhp.trang_thai_dk='MO_DK' THEN 1 ELSE 0 END)  AS so_lop_mo_dk,
            -- Lấy học kỳ trong CTK (có thể là HK của năm sau - học vượt)
            MAX(ctk.hoc_ky)                      AS hoc_ky_ctdt,
            -- Loại môn: ưu tiên BAT_BUOC nếu có
            CASE 
              WHEN MAX(CASE WHEN ctk.loai_mon = 'BAT_BUOC' THEN 1 ELSE 0 END) = 1 
              THEN 'BAT_BUOC'
              WHEN MAX(ctk.loai_mon) IS NOT NULL
              THEN MAX(ctk.loai_mon)
              ELSE 'TU_CHON'
            END                             AS loai_mon
     FROM LopHocPhan lhp
     JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
     LEFT JOIN ChuongTrinhKhung ctk ON ctk.hoc_phan_id = hp.id 
          AND (ctk.nganh_id = ? OR ctk.nganh_id IS NULL)
    WHERE lhp.hoc_ky = ? AND lhp.nam_hoc = ?
      AND (hp.nganh_id = ? OR hp.nganh_id IS NULL)
      AND lhp.trang_thai_dk = 'MO_DK'`
      
  const params = [sv.nganh_id, hoc_ky, nam_hoc, sv.nganh_id]

  sql += ` GROUP BY hp.id, hp.ma_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi
           ORDER BY hp.ten_hoc_phan`

  const [rows] = await pool.execute(sql, params)

  // Lọc bỏ các môn đã đăng ký thành công ở các kỳ trước
  const filteredRows = rows.filter(hp => !registeredHPIds.includes(hp.hoc_phan_id))

  // Tổng TC (tính từ tất cả môn, không phân biệt năm)
  const tongTcBatBuoc = filteredRows
    .filter(r => r.loai_mon === 'BAT_BUOC')
    .reduce((sum, r) => sum + (r.tc || 0), 0)
  const tongTcTuChon = filteredRows
    .filter(r => r.loai_mon === 'TU_CHON' || !r.loai_mon)
    .reduce((sum, r) => sum + (r.tc || 0), 0)
  const tongTc = tongTcBatBuoc + tongTcTuChon

  // Trả về các môn chưa đăng ký (bao gồm cả môn của các năm sau - học vượt)
  const items = filteredRows.map(row => ({
    ...row,
    ten_hoc_ky_ctdt: row.hoc_ky_ctdt ? getTenHocKy(row.hoc_ky_ctdt) : '',
      bat_buoc: row.loai_mon === 'BAT_BUOC'
    }))

  return {
    items,
    tong_tc: tongTc,
    tong_tc_bat_buoc: tongTcBatBuoc,
    tong_tc_tu_chon: tongTcTuChon
  }
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