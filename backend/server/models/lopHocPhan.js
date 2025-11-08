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
                trangThai || 'Đang học',
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
    lhp.ngay_ket_thuc AS ngayKetThuc
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
        COUNT(DISTINCT dk.sinh_vien_id) AS siSo
      FROM LopHocPhan lhp
      JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      JOIN Lop l ON lhp.lop_id = l.id
      LEFT JOIN DangKyHocPhan dk ON dk.lop_hoc_phan_id = lhp.id 
        AND dk.trang_thai_dk = 'THANH_CONG'
      WHERE lhp.giang_vien_id = ?
      GROUP BY lhp.id
    `, [giangVienId]);
    return rows;
  } catch (err) {
    console.error('❌ Lỗi model getLopHocPhanByGiangVien:', err);
    throw err;
  }
}
