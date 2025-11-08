import * as DkModel from '../models/dangKyHocPhan.js'

// GET /api/dkhp/dot/current
export async function getCurrentDot(req, res) {
  try {
    const dot = await DkModel.getCurrentDot()
    if (!dot) return res.status(404).json({ message: 'Không có đợt đăng ký đang mở' })
    res.json(dot)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy đợt hiện tại', error: err.message })
  }
}

// GET /api/dkhp/available?sinh_vien_id=&hoc_ky=&nam_hoc=&dot_dang_ky_id=
export async function listAvailableLHP(req, res) {
  try {
    const { sinh_vien_id, hoc_ky, nam_hoc, dot_dang_ky_id } = req.query
    if (!sinh_vien_id || !hoc_ky || !nam_hoc) {
      return res.status(400).json({ message: 'Thiếu sinh_vien_id, hoc_ky, nam_hoc' })
    }
    const rows = await DkModel.listAvailableLHP({
      sinh_vien_id: +sinh_vien_id,
      hoc_ky,
      nam_hoc,
      dot_dang_ky_id: dot_dang_ky_id ? +dot_dang_ky_id : null
    })
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách lớp khả dụng', error: err.message })
  }
}

// GET /api/dkhp/my?sinh_vien_id=&dot_dang_ky_id=&hoc_ky=&nam_hoc=
export async function listMyRegistrations(req, res) {
  try {
    const { sinh_vien_id, dot_dang_ky_id, hoc_ky, nam_hoc } = req.query
    if (!sinh_vien_id) return res.status(400).json({ message: 'Thiếu sinh_vien_id' })
    const rows = await DkModel.listMyRegistrations({
      sinh_vien_id: +sinh_vien_id,
      dot_dang_ky_id: dot_dang_ky_id ? +dot_dang_ky_id : null,
      hoc_ky: hoc_ky || null,
      nam_hoc: nam_hoc || null
    })
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy đăng ký của SV', error: err.message })
  }
}

// POST /api/dkhp/register
export async function registerLHP(req, res) {
  try {
    const { sinh_vien_id, lop_hoc_phan_id, dot_dang_ky_id, loai_dang_ky } = req.body
    if (!sinh_vien_id || !lop_hoc_phan_id) {
      return res.status(400).json({ message: 'Thiếu sinh_vien_id hoặc lop_hoc_phan_id' })
    }
    const out = await DkModel.registerLHP({
      sinh_vien_id: +sinh_vien_id,
      lop_hoc_phan_id: +lop_hoc_phan_id,
      dot_dang_ky_id: dot_dang_ky_id ? +dot_dang_ky_id : null,
      loai_dang_ky: loai_dang_ky || 'HOC_MOI'
    })
    res.status(201).json(out)
  } catch (err) {
    const code = err.code === 'BUSINESS' ? 409 : 500
    res.status(code).json({ message: err.message, detail: err.detail })
  }
}

// DELETE /api/dkhp/register/:dangKyId
export async function cancelRegistration(req, res) {
  try {
    const { dangKyId } = req.params
    const out = await DkModel.cancelRegistration({ dangKyId: +dangKyId })
    res.json(out)
  } catch (err) {
    const code = err.code === 'BUSINESS' ? 409 : 500
    res.status(code).json({ message: err.message, detail: err.detail })
  }
}
// NEW: server gom “môn học phần đang chờ đăng ký”
export async function listPendingCourses(req, res) {
  try {
    const { sinh_vien_id, hoc_ky, nam_hoc, dot_dang_ky_id } = req.query
    if (!sinh_vien_id || !hoc_ky || !nam_hoc) {
      return res.status(400).json({ message: 'Thiếu sinh_vien_id, hoc_ky, nam_hoc' })
    }
    const rows = await DkModel.listPendingCourses({
      sinh_vien_id: +sinh_vien_id,
      hoc_ky, nam_hoc,
      dot_dang_ky_id: dot_dang_ky_id ? +dot_dang_ky_id : null
    })
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy môn chờ đăng ký', error: err.message })
  }
}

// NEW: chi tiết lịch của 1 lớp học phần
export async function getClassSchedule(req, res) {
  try {
    const { lopHocPhanId } = req.params
    const rows = await DkModel.getClassSchedule(+lopHocPhanId)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy lịch lớp', error: err.message })
  }
}

// Lấy danh sách sinh viên đã đăng ký 1 lớp học phần (cho giảng viên nhập điểm)
export async function getStudentsByLopHocPhan(req, res) {
  try {
    const { lopHocPhanId } = req.params
    const rows = await DkModel.getStudentsByLopHocPhan(+lopHocPhanId)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sinh viên', error: err.message })
  }
}