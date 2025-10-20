import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function AddGiangVien() {
  const navigate = useNavigate()
  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])
  const [lops, setLops] = useState([])
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    maGv: '',
    hoTen: '',
    email: '',
    soDienThoai: '',
    gioiTinh: '',
    ngaySinh: '',
    diaChi: '',
    khoaId: '',
    nganhId: '',
    lopId: '',
  })

  // 🧩 Load danh sách khoa ban đầu
  useEffect(() => {
    apiFetch('/api/khoa')
      .then((data) => setKhoas(data || []))
      .catch(() => setKhoas([]))
  }, [])

  // 🧩 Khi chọn khoa → load ngành theo khoa
  useEffect(() => {
    if (form.khoaId) {
      apiFetch(`/api/nganh?khoaId=${form.khoaId}`)
        .then((data) => setNganhs(data || []))
        .catch(() => setNganhs([]))
    } else {
      setNganhs([])
      setLops([])
    }
  }, [form.khoaId])

  // 🧩 Khi chọn ngành → load lớp theo ngành
  useEffect(() => {
    if (form.nganhId) {
      apiFetch(`/api/lop?nganhId=${form.nganhId}`)
        .then((data) => setLops(data || []))
        .catch(() => setLops([]))
    } else {
      setLops([])
    }
  }, [form.nganhId])

  // 🧩 Cập nhật giá trị form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // 🧩 Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!form.maGv || !form.hoTen || !form.khoaId)
        return setMessage('❌ Vui lòng nhập đầy đủ Mã GV, Họ tên, và chọn Khoa.')

      await apiFetch('/api/giangviens', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setMessage('✅ Thêm giảng viên thành công!')
      setTimeout(() => navigate('/admin/teachers'), 1000)
    } catch (err) {
      setMessage('❌ Lỗi: ' + err.message)
    }
  }

  return (
    <AdminLayout title="Thêm giảng viên">
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
              value={form.maGv}
              onChange={handleChange}
              className="form-control"
              placeholder="VD: GV001"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Họ tên *</label>
            <input
              type="text"
              name="hoTen"
              value={form.hoTen}
              onChange={handleChange}
              className="form-control"
              placeholder="Nhập họ và tên"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Giới tính</label>
            <select
              name="gioiTinh"
              value={form.gioiTinh}
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
              value={form.ngaySinh}
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
              value={form.email}
              onChange={handleChange}
              className="form-control"
              placeholder="email@domain.com"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold">Số điện thoại</label>
            <input
              type="text"
              name="soDienThoai"
              value={form.soDienThoai}
              onChange={handleChange}
              className="form-control"
              placeholder="VD: 0901234567"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Địa chỉ</label>
          <input
            type="text"
            name="diaChi"
            value={form.diaChi}
            onChange={handleChange}
            className="form-control"
            placeholder="Nhập địa chỉ"
          />
        </div>

        {/* Khoa / Ngành / Lớp */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label fw-semibold">Khoa *</label>
            <select
              name="khoaId"
              value={form.khoaId}
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
              value={form.nganhId}
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
              value={form.lopId}
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
            ➕ Thêm giảng viên
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
