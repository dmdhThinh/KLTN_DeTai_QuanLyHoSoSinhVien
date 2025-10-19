import {pool} from '../config/db.js'

// ✅ Lấy tất cả ngành
export const getAllNganh = async () => {
  const [rows] = await pool.execute('SELECT * FROM nganh ORDER BY id DESC')
  return rows
}

// ✅ Lấy ngành theo ID
export const getNganhById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM nganh WHERE id = ?', [id])
  return rows[0]
}

// ✅ Thêm ngành mới
export const createNganh = async (data) => {
  const { tenNganh, maNganh, khoaId } = data
  const [result] = await pool.execute(
    'INSERT INTO nganh (tenNganh, maNganh, khoaId) VALUES (?, ?, ?)',
    [tenNganh, maNganh, khoaId]
  )
  return result
}

// ✅ Cập nhật ngành
export const updateNganh = async (id, data) => {
  const { tenNganh, maNganh, khoaId } = data
  const [result] = await pool.execute(
    'UPDATE nganh SET tenNganh = ?, maNganh = ?, khoaId = ? WHERE id = ?',
    [tenNganh, maNganh, khoaId, id]
  )
  return result
}

// ✅ Xoá ngành
export const deleteNganh = async (id) => {
  const [result] = await pool.execute('DELETE FROM nganh WHERE id = ?', [id])
  return result
}

// ✅ Tìm ngành theo tên (dùng cho import kiểm tra)
export const findNganhByTen = async (tenNganh) => {
  const [rows] = await pool.execute('SELECT * FROM nganh WHERE tenNganh = ?', [tenNganh])
  return rows[0]
}

export default {
  getAllNganh,
  getNganhById,
  createNganh,
  updateNganh,
  deleteNganh,
  findNganhByTen
}
