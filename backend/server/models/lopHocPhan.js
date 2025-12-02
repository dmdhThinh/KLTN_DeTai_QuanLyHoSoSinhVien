import { pool } from '../config/db.js';

export async function createLopHocPhan(data) {
    const {
        maLopHocPhan,
        hocPhanId,
        giangVienId,
        lopId,
        hocKy,
        namHoc,
        trangThai,
        ngayBatDau,
        ngayKetThuc,
        soTuanHoc
    } = data;

    try {
        const [result] = await pool.execute(
            `INSERT INTO LopHocPhan 
            (ma_lop_hoc_phan, hoc_phan_id, giang_vien_id, lop_id, hoc_ky, nam_hoc, trang_thai, ngay_bat_dau, ngay_ket_thuc, so_tuan_hoc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                maLopHocPhan,
                hocPhanId || null,
                giangVienId || null,
                lopId || null,
                hocKy || null,
                namHoc || null,
                trangThai || 'Chờ sinh viên đăng ký',
                ngayBatDau || null,
                ngayKetThuc || null,
                soTuanHoc || null
            ]
        );
        return result;
    } catch (err) {
        console.error('❌ Error creating LopHocPhan:', err);
        throw err;
    }
}


export async function getAllLopHocPhan() {
    try {
        const [rows] = await pool.execute(`
           SELECT 
    lhp.id,
    lhp.ma_lop_hoc_phan AS maLopHocPhan,
    hp.ten_hoc_phan AS tenHocPhan,
    gv.ho_ten AS tenGiangVien,
    lhp.hoc_ky AS hocKy,
    lhp.nam_hoc AS namHoc,
    l.ten_lop AS tenLop,
    lhp.ngay_bat_dau AS ngayBatDau,
    lhp.ngay_ket_thuc AS ngayKetThuc,
    lhp.lop_id AS lopId,
    l.nganh_id AS nganhId,
    l.khoa_id AS khoaId
FROM LopHocPhan lhp
JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
JOIN GiangVien gv ON gv.id = lhp.giang_vien_id
JOIN Lop l ON l.id = lhp.lop_id
ORDER BY lhp.nam_hoc DESC, lhp.hoc_ky ASC, lhp.ma_lop_hoc_phan ASC

        `);
        return rows;
    } catch (err) {
        console.error('❌ Error fetching LopHocPhan list:', err);
        throw err;
    }
}

export async function getLopHocPhanById(id) {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                lhp.id,
                lhp.ma_lop_hoc_phan AS maLopHocPhan,
                lhp.hoc_phan_id AS hocPhanId,
                lhp.giang_vien_id AS giangVienId,
                lhp.lop_id AS lopId,
                lhp.hoc_ky AS hocKy,
                lhp.nam_hoc AS namHoc,
                lhp.trang_thai AS trangThai,
                lhp.ngay_bat_dau AS ngayBatDau,
                lhp.ngay_ket_thuc AS ngayKetThuc,
                lhp.so_tuan_hoc AS soTuanHoc,
                lhp.si_so_toi_da AS siSoToiDa,
                lhp.trang_thai_dk AS trangThaiDk,
                hp.ten_hoc_phan AS tenHocPhan,
                hp.ma_hoc_phan AS maHocPhan,
                hp.so_tin_chi AS soTinChi,
                gv.ho_ten AS tenGiangVien,
                l.ten_lop AS tenLop
            FROM LopHocPhan lhp
            LEFT JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
            LEFT JOIN GiangVien gv ON gv.id = lhp.giang_vien_id
            LEFT JOIN Lop l ON l.id = lhp.lop_id
            WHERE lhp.id = ?
        `, [id]);
        return rows[0];
    } catch (err) {
        console.error('❌ Error fetching LopHocPhan by ID:', err);
        throw err;
    }
}

export async function updateLopHocPhan(id, data) {
    const {
        maLopHocPhan,
        hocPhanId,
        giangVienId,
        lopId,
        hocKy,
        namHoc,
        trangThai,
        ngayBatDau,
        ngayKetThuc,
        soTuanHoc
    } = data;

    try {
        const [result] = await pool.execute(
            `UPDATE LopHocPhan 
             SET 
                ma_lop_hoc_phan = ?, 
                hoc_phan_id = ?, 
                giang_vien_id = ?, 
                lop_id = ?, 
                hoc_ky = ?, 
                nam_hoc = ?, 
                trang_thai = ?, 
                ngay_bat_dau = ?, 
                ngay_ket_thuc = ?, 
                so_tuan_hoc = ?
             WHERE id = ?`,
            [
                maLopHocPhan,
                hocPhanId,
                giangVienId,
                lopId,
                hocKy,
                namHoc,
                trangThai,
                ngayBatDau || null,
                ngayKetThuc || null,
                soTuanHoc || null,
                id
            ]
        );
        return result;
    } catch (err) {
        console.error('❌ Error updating LopHocPhan:', err);
        throw err;
    }
}


export async function deleteLopHocPhan(id) {
    try {
        const [result] = await pool.execute('DELETE FROM LopHocPhan WHERE id = ?', [id]);
        return result;
    } catch (err) {
        console.error('❌ Error deleting LopHocPhan:', err);
        throw err;
    }
}
export async function getLopHocPhanByGiangVien(giangVienId) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        lhp.id,
        lhp.ma_lop_hoc_phan AS maLopHocPhan,
        hp.ten_hoc_phan AS tenHocPhan,
        hp.so_tin_chi AS soTinChi,
        l.ten_lop AS tenLop,
        lhp.hoc_ky AS hocKy,
        lhp.nam_hoc AS namHoc,
        COUNT(DISTINCT dk.sinh_vien_id) AS siSo
      FROM LopHocPhan lhp
      JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      JOIN Lop l ON lhp.lop_id = l.id
      LEFT JOIN DangKyHocPhan dk ON dk.lop_hoc_phan_id = lhp.id 
        AND dk.trang_thai_dk = 'THANH_CONG'
      WHERE lhp.giang_vien_id = ?
      GROUP BY lhp.id, lhp.ma_lop_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi, l.ten_lop, lhp.hoc_ky, lhp.nam_hoc
      ORDER BY lhp.nam_hoc DESC, lhp.hoc_ky DESC, lhp.ma_lop_hoc_phan ASC
    `, [giangVienId]);
    return rows;
  } catch (err) {
    console.error('❌ Lỗi model getLopHocPhanByGiangVien:', err);
    throw err;
  }
}

// ✅ Lấy danh sách sinh viên trong lớp học phần với giới tính và SĐT
export async function getSinhVienByLopHocPhan(lopHocPhanId) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        d.id as dang_ky_id,
        d.sinh_vien_id,
        sv.ma_sv,
        sv.ho_ten,
        sv.ngay_sinh,
        sv.gioi_tinh,
        sv.so_dien_thoai,
        sv.email,
        d.loai_dang_ky,
        d.thoi_diem_dk,
        d.trang_thai_dk
      FROM DangKyHocPhan d
      JOIN SinhVien sv ON sv.id = d.sinh_vien_id
      WHERE d.lop_hoc_phan_id = ?
        AND d.trang_thai_dk <> 'HUY'
      ORDER BY sv.ma_sv
    `, [lopHocPhanId]);
    return rows;
  } catch (err) {
    console.error('❌ Lỗi model getSinhVienByLopHocPhan:', err);
    throw err;
  }
}

// ✅ Admin: Thêm sinh viên vào lớp
export async function addStudentToClass(lopHocPhanId, mssv) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Tìm sinh viên ID
    const [svRows] = await conn.execute('SELECT id FROM SinhVien WHERE ma_sv = ?', [mssv]);
    if (svRows.length === 0) {
      throw new Error('Không tìm thấy sinh viên với MSSV này');
    }
    const sinhVienId = svRows[0].id;

    // 2. Lấy thông tin lớp và sĩ số tối đa
    const [lhpRows] = await conn.execute(
      'SELECT id, si_so_toi_da, hoc_phan_id, hoc_ky, nam_hoc FROM LopHocPhan WHERE id = ?', 
      [lopHocPhanId]
    );
    if (lhpRows.length === 0) {
      throw new Error('Lớp học phần không tồn tại');
    }
    const lhp = lhpRows[0];

    // 3. Đếm số lượng đã đăng ký
    const [countRows] = await conn.execute(
      `SELECT COUNT(*) as total FROM DangKyHocPhan 
       WHERE lop_hoc_phan_id = ? AND trang_thai_dk = 'THANH_CONG'`,
      [lopHocPhanId]
    );
    const currentCount = countRows[0].total;

    if (currentCount >= lhp.si_so_toi_da) {
      throw new Error(`Lớp đã đầy (${currentCount}/${lhp.si_so_toi_da})`);
    }

    // 4. Kiểm tra đã đăng ký chưa (bao gồm cả lớp khác của cùng môn trong cùng kỳ?)
    // Ở đây admin thêm trực tiếp vào lớp này, nên chỉ check trùng trong lớp này hoặc môn này
    // Check trùng môn trong cùng học kỳ
    const [existRows] = await conn.execute(
      `SELECT d.id, l.ma_lop_hoc_phan 
       FROM DangKyHocPhan d
       JOIN LopHocPhan l ON d.lop_hoc_phan_id = l.id
       WHERE d.sinh_vien_id = ? 
         AND l.hoc_phan_id = ?
         AND l.hoc_ky = ? 
         AND l.nam_hoc = ?
         AND d.trang_thai_dk = 'THANH_CONG'`,
      [sinhVienId, lhp.hoc_phan_id, lhp.hoc_ky, lhp.nam_hoc]
    );

    if (existRows.length > 0) {
      throw new Error(`Sinh viên đã đăng ký môn này ở lớp ${existRows[0].ma_lop_hoc_phan}`);
    }

    // 5. Insert
    await conn.execute(
      `INSERT INTO DangKyHocPhan (sinh_vien_id, lop_hoc_phan_id, hoc_phan_id, thoi_diem_dk, trang_thai_dk, loai_dang_ky)
       VALUES (?, ?, ?, NOW(), 'THANH_CONG', 'HOC_MOI')`, // Mặc định HOC_MOI, admin có thể sửa sau nếu cần
      [sinhVienId, lopHocPhanId, lhp.hoc_phan_id]
    );

    await conn.commit();
    return { success: true, message: 'Thêm sinh viên thành công' };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ✅ Admin: Xóa sinh viên khỏi lớp
export async function removeStudentFromClass(lopHocPhanId, sinhVienId) {
  try {
    // 1. Lấy thông tin lớp học phần để biết môn học + học kỳ
    const [lhpRows] = await pool.execute(
      'SELECT hoc_phan_id, hoc_ky, nam_hoc FROM LopHocPhan WHERE id = ?',
      [lopHocPhanId]
    );
    
    if (lhpRows.length === 0) {
      throw new Error('Lớp học phần không tồn tại');
    }
    const lhp = lhpRows[0];

    // 2. Check điểm trong bảng KetQuaHocTap
    // Bảng KetQuaHocTap lưu theo (sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc)
    const [diemRows] = await pool.execute(
      `SELECT id FROM KetQuaHocTap 
       WHERE sinh_vien_id = ? 
         AND hoc_phan_id = ? 
         AND hoc_ky = ? 
         AND nam_hoc = ?`,
      [sinhVienId, lhp.hoc_phan_id, lhp.hoc_ky, lhp.nam_hoc]
    );

    if (diemRows.length > 0) {
      throw new Error('Sinh viên này đã có điểm, không thể xóa khỏi lớp!');
    }

    // 3. Xóa bản ghi DangKyHocPhan
    const [result] = await pool.execute(
      `DELETE FROM DangKyHocPhan 
       WHERE lop_hoc_phan_id = ? AND sinh_vien_id = ?`,
      [lopHocPhanId, sinhVienId]
    );

    if (result.affectedRows === 0) {
      // Có thể sinh viên đã đăng ký nhưng bị hủy? Hoặc chưa từng đăng ký?
      // Check thử xem có bản ghi nào không
      return { success: false, message: 'Sinh viên không có trong lớp này hoặc đã bị hủy' };
    }

    return { success: true };
  } catch (err) {
    console.error('❌ Lỗi model removeStudentFromClass:', err);
    throw err;
  }
}