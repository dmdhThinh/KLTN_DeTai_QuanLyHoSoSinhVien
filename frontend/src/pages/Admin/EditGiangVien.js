import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function EditGiangVien() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])
  const [lops, setLops] = useState([])
  const [form, setForm] = useState(null)
  const [message, setMessage] = useState('')

  // 🧩 Load toàn bộ dữ liệu cần thiết
  useEffect(() => {
    // Load danh sách khoa
    apiFetch('/api/khoa')
      .then((data) => setKhoas(data || []))
      .catch(() => setKhoas([]))

    // Lấy thông tin giảng viên
    apiFetch(`/api/giangviens/${id}`)
      .then((data) => setForm(data))
      .catch(() => setForm({}))
  }, [id])

  // 🧩 Khi chọn Khoa → load Ngành
  useEffect(() => {
    if (form?.khoaId) {
      apiFetch(`/api/nganh?khoaId=${form.khoaId}`)
        .then((data) => setNganhs(data || []))
        .catch(() => setNganhs([]))
    } else {
      setNganhs([])
      setLops([])
    }
  }, [form?.khoaId])

  // 🧩 Khi chọn Ngành → load Lớp
  useEffect(() => {
    if (form?.nganhId) {
      apiFetch(`/api/lop?nganhId=${form.nganhId}`)
        .then((data) => setLops(data || []))
        .catch(() => setLops([]))
    } else {
      setLops([])
    }
  }, [form?.nganhId])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiFetch(`/api/giangviens/${id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      setMessage('✅ Cập nhật giảng viên thành công!')
      setTimeout(() => navigate('/admin/teachers'), 1000)
    } catch (err) {
      setMessage('❌ Lỗi: ' + err.message)
    }
  }

  if (!form) return <div className="text-center mt-5">⏳ Đang tải...</div>

  return (
    <AdminLayout title="Chỉnh sửa giảng viên">
      {message && <div className="alert alert-info text-center py-2">{message}</div>}

      <form
        onSubmit={handleSubmit}
        className="card shadow-sm mx-auto p-4"
        style={{ maxWidth: 700 }}
      >
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Mã giảng viên *</label>
            <input
              type="text"
              name="maGv"
              value={form.maGv || ''}
              onChange={handleChange}
              className="form-control"
              readOnly
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Họ tên *</label>
            <input
              type="text"
              name="hoTen"
              value={form.hoTen || ''}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Giới tính</label>
            <select
              name="gioiTinh"
              value={form.gioiTinh || ''}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Ngày sinh</label>
            <input
              type="date"
              name="ngaySinh"
              value={form.ngaySinh ? form.ngaySinh.split('T')[0] : ''}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Số điện thoại</label>
            <input
              type="text"
              name="soDienThoai"
              value={form.soDienThoai || ''}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Địa chỉ</label>
          <input
            type="text"
            name="diaChi"
            value={form.diaChi || ''}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Khoa - Ngành - Lớp */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label fw-semibold">Khoa *</label>
            <select
              name="khoaId"
              value={form.khoaId || ''}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Chọn Khoa --</option>
              {khoas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.tenKhoa}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label fw-semibold">Ngành</label>
            <select
              name="nganhId"
              value={form.nganhId || ''}
              onChange={handleChange}
              className="form-select"
              disabled={!form.khoaId}
            >
              <option value="">-- Chọn Ngành --</option>
              {nganhs.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.tenNganh}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label fw-semibold">Lớp</label>
            <select
              name="lopId"
              value={form.lopId || ''}
              onChange={handleChange}
              className="form-select"
              disabled={!form.nganhId}
            >
              <option value="">-- Chọn Lớp --</option>
              {lops.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.tenLop}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center mt-4">
          <button className="btn btn-primary px-4" type="submit">
            💾 Lưu thay đổi
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => navigate('/admin/teachers')}
          >
            Quay lại
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
