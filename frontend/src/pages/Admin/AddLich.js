import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function AddLich() {
  const navigate = useNavigate()
  const [lich, setLich] = useState({
    lop_hoc_phan_id: '',
    giang_vien_id: '',
    ngay_hoc: '', 
    thu: '',
    ca: '',
    tiet_bat_dau: '',
    tiet_ket_thuc: '',
    phong: '',
    co_so: '',
    loai: 'lythuyet',
  })
  const [lopHocPhans, setLopHocPhans] = useState([])
  const [giangViens, setGiangViens] = useState([])
  const [existingLich, setExistingLich] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // 🔹 Tải danh sách lớp học phần
  useEffect(() => {
    apiFetch('/api/lophocphan')
      .then((data) => setLopHocPhans(data || []))
      .catch((err) => console.error(err))
  }, [])

  // 🔹 Tải danh sách giảng viên
useEffect(() => {
  apiFetch('/api/giangviens')
    .then((response) => setGiangViens(response.data || [])) // Extract the 'data' array
    .catch((err) => {
      console.error('❌ Lỗi tải giảng viên:', err);
      setGiangViens([]); // Fallback to empty array on error
    });
}, []);

  // 🔹 Khi chọn lớp học phần → tải lịch hiện có để kiểm tra trùng
  useEffect(() => {
    if (lich.lop_hoc_phan_id) {
      apiFetch(`/api/lich-admin?lopHocPhanId=${lich.lop_hoc_phan_id}`)
        .then((data) => setExistingLich(data || []))
        .catch(() => setExistingLich([]))
    }
  }, [lich.lop_hoc_phan_id])

  // 🔹 Cập nhật form
  const handleChange = (e) => {
    const { name, value } = e.target
    setLich((prev) => ({ ...prev, [name]: value }))
  }

  // 🔹 Kiểm tra trùng tiết
  const checkConflict = () => {
    if (!lich.thu || !lich.ca || !lich.tiet_bat_dau || !lich.tiet_ket_thuc) return false
    return existingLich.some((item) => {
      if (Number(item.thu) !== Number(lich.thu) || item.ca !== lich.ca) return false
      const start = Number(lich.tiet_bat_dau)
      const end = Number(lich.tiet_ket_thuc)
      const iStart = Number(item.tietBatDau)
      const iEnd = Number(item.tietKetThuc)
      return !(end < iStart || start > iEnd)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (checkConflict()) {
      setError('❌ Tiết học bị trùng với lịch đã có trong cùng ngày và ca!')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ...lich,
        ngay_hoc: lich.ngay_hoc || null,
        lop_hoc_phan_id: Number(lich.lop_hoc_phan_id),
        giang_vien_id: Number(lich.giang_vien_id),
      }

      await apiFetch('/api/lich-admin', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setMessage('✅ Thêm lịch học thành công!')
      setTimeout(() => navigate('/admin/lich'), 1500)
    } catch (err) {
      console.error(err)
      setError('Không thể thêm lịch học. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Thêm lịch học mới" activeMenu="lich">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <h5 className="mb-3">📅 Thêm lịch học mới</h5>

          {error && <div className="alert alert-danger text-center">{error}</div>}
          {message && <div className="alert alert-success text-center">{message}</div>}

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
  <label className="form-label">Ngày học (nếu chỉ áp dụng 1 buổi)</label>
  <input
    type="date"
    name="ngay_hoc"
    className="form-control"
    value={lich.ngay_hoc || ''}
    onChange={handleChange}
  />
  <small className="text-muted">
    Nếu chọn ngày, lịch chỉ hiển thị trong tuần có ngày đó.
  </small>
</div>
            {/* Lớp học phần */}
            <div>
              <label className="form-label">Lớp học phần</label>
              <select
                className="form-select"
                name="lop_hoc_phan_id"
                value={lich.lop_hoc_phan_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn lớp học phần --</option>
                {lopHocPhans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.maLopHocPhan} - {l.tenHocPhan}
                  </option>
                ))}
              </select>
            </div>

            {/* Giảng viên */}
            <div>
  <label className="form-label">Giảng viên phụ trách</label>
  <select
    className="form-select"
    name="giang_vien_id"
    value={lich.giang_vien_id}
    onChange={handleChange}
    required
  >
    <option value="">-- Chọn giảng viên --</option>
    {Array.isArray(giangViens) && giangViens.length > 0 ? (
      giangViens.map((gv) => (
        <option key={gv.id} value={gv.id}>
          {gv.hoTen || gv.ho_ten}
        </option>
      ))
    ) : (
      <option value="" disabled>Không có giảng viên</option>
    )}
  </select>
</div>

            {/* Thứ */}
            <div>
              <label className="form-label">Thứ</label>
              <input
                type="number"
                min="2"
                max="8"
                name="thu"
                className="form-control"
                value={lich.thu}
                onChange={handleChange}
                required
              />
            </div>

            {/* Ca */}
            <div>
              <label className="form-label">Ca học</label>
              <select
                className="form-select"
                name="ca"
                value={lich.ca}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn ca học --</option>
                <option value="sáng">Sáng</option>
                <option value="chiều">Chiều</option>
                <option value="tối">Tối</option>
              </select>
            </div>

            {/* Tiết học */}
            <div className="row">
              <div className="col">
                <label className="form-label">Tiết bắt đầu</label>
                <input
                  type="number"
                  name="tiet_bat_dau"
                  className="form-control"
                  value={lich.tiet_bat_dau}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col">
                <label className="form-label">Tiết kết thúc</label>
                <input
                  type="number"
                  name="tiet_ket_thuc"
                  className="form-control"
                  value={lich.tiet_ket_thuc}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phòng */}
            <div>
              <label className="form-label">Phòng học</label>
              <input
                type="text"
                name="phong"
                className="form-control"
                value={lich.phong}
                onChange={handleChange}
              />
            </div>

            {/* Cơ sở */}
            <div>
              <label className="form-label">Cơ sở</label>
              <input
                type="text"
                name="co_so"
                className="form-control"
                value={lich.co_so}
                onChange={handleChange}
              />
            </div>

            {/* Loại lịch */}
            <div>
              <label className="form-label">Loại lịch</label>
              <select
                name="loai"
                className="form-select"
                value={lich.loai}
                onChange={handleChange}
              >
                <option value="lythuyet">Lý thuyết</option>
                <option value="thuchanh">Thực hành</option>
                <option value="tructuyen">Trực tuyến</option>
                <option value="thi">Thi</option>
              </select>
            </div>

            <div className="d-flex justify-content-between mt-3">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '💾 Đang lưu...' : '💾 Thêm lịch học'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/lich')}
              >
                ⬅ Quay lại
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
