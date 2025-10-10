import { getSinhVienDetailById } from '../models/sinhvien.js'

export async function getById(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ message: 'ID không hợp lệ' })
    const data = await getSinhVienDetailById(id)
    if (!data) return res.status(404).json({ message: 'Không tìm thấy sinh viên' })
    return res.json(data)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Lỗi máy chủ' })
  }
}
