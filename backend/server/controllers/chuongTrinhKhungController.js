// controllers/chuongTrinhKhungControllers.js
import * as CTKModel from '../models/chuongTrinhKhung.js'

export async function getByHocKyNganh(req, res) {
  const { hoc_ky, nganh_id } = req.params
  const { sinh_vien_id } = req.query

  try {
    const result = await CTKModel.getChuongTrinhKhung({
      hoc_ky,
      nganh_id: parseInt(nganh_id),
      sinh_vien_id: sinh_vien_id ? parseInt(sinh_vien_id) : null
    })
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy chương trình khung', error: err.message })
  }
}