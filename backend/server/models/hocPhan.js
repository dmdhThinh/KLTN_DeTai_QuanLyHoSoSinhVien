import { pool } from '../config/db.js'

// 🧱 CREATE
export async function createHocPhan(data) {
  const { maHocPhan, tenHocPhan, soTinChi, moTa, khoaId, nganhId, hocKy } = data
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [result] = await conn.execute(
      `INSERT INTO HocPhan (ma_hoc_phan, ten_hoc_phan, so_tin_chi, mo_ta, khoa_id, nganh_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [maHocPhan, tenHocPhan, soTinChi || 3, moTa || null, khoaId, nganhId]
    )
    
    // Nếu có học kỳ -> thêm vào chương trình khung
    if (hocKy) {
      await conn.execute(
        `INSERT INTO ChuongTrinhKhung (hoc_ky, nganh_id, hoc_phan_id, loai_mon)
         VALUES (?, ?, ?, ?)`,
        [hocKy, nganhId || null, result.insertId, 'BAT_BUOC']
      )
    }

    await conn.commit()
    return result
  } catch (err) {
    await conn.rollback()
    console.error('❌ Error creating HocPhan:', err)
    throw err
  } finally {
    conn.release()
  }
}

// 📋 READ ALL
export async function getAllHocPhan() {
  try {
    const [rows] = await pool.execute(`
      SELECT hp.id,
       hp.ma_hoc_phan AS maHocPhan,
       hp.ten_hoc_phan AS tenHocPhan,
       hp.so_tin_chi AS soTinChi,
       hp.mo_ta AS moTa,
       k.ten_khoa AS tenKhoa,
       n.ten_nganh AS tenNganh,
       hp.khoa_id AS khoaId,
       hp.nganh_id AS nganhId
FROM HocPhan hp
LEFT JOIN Khoa k ON k.id = hp.khoa_id
LEFT JOIN Nganh n ON n.id = hp.nganh_id
      ORDER BY hp.id ASC
    `)
    return rows
  } catch (err) {
    console.error('❌ Error fetching HocPhan list:', err)
    throw err
  }
}

// 🔍 READ BY ID
export async function getHocPhanById(id) {
  try {
    const [rows] = await pool.execute(`SELECT * FROM HocPhan WHERE id = ?`, [id])
    return rows[0]
  } catch (err) {
    console.error('❌ Error fetching HocPhan by ID:', err)
    throw err
  }
}

//  UPDATE
export async function updateHocPhan(id, data) {
  const { maHocPhan, tenHocPhan, soTinChi, moTa, khoaId } = data
  try {
    const [result] = await pool.execute(
      `UPDATE HocPhan
       SET ma_hoc_phan = ?, ten_hoc_phan = ?, so_tin_chi = ?, mo_ta = ?, khoa_id = ?
       WHERE id = ?`,
      [maHocPhan, tenHocPhan, soTinChi || 3, moTa || null, khoaId, id]
    )
    return result
  } catch (err) {
    console.error('❌ Error updating HocPhan:', err)
    throw err
  }
}

// 🗑️ DELETE
export async function deleteHocPhan(id) {
  try {
    const [result] = await pool.execute('DELETE FROM HocPhan WHERE id = ?', [id])
    return result
  } catch (err) {
    console.error('❌ Error deleting HocPhan:', err)
    throw err
  }
}
