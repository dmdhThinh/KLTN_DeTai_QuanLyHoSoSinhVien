// src/pages/Admin/AddStudent.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSinhVien } from '../../api'
import AdminLayout from '../../components/AdminLayout'

function CenterError({ message, onClose }) {
  if (!message) return null
  return (
    <div className="position-fixed top-50 start-50 translate-middle" style={{ zIndex: 1055 }}>
      <div className="card shadow-lg border-danger" style={{ maxWidth: 520 }}>
        <div className="card-body text-center">
          <div className="fw-semibold text-danger mb-2">Có lỗi xảy ra</div>
          <div className="mb-3">{message}</div>
          <button className="btn btn-danger" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}

export default function AddStudent() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    ma_sv: '', ho_ten: '', ngay_sinh: '', gioi_tinh: 'Nam',
    email: '', so_dien_thoai: '', dia_chi: '', khoa_hoc: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))

  const validate = () => {
    if (!form.ma_sv || !form.ho_ten || !form.ngay_sinh)
      return 'Vui lòng nhập đầy đủ: Mã sinh viên, Họ tên, Ngày sinh.'
    const birthYear = Number(String(form.ngay_sinh).slice(0, 4))
    const currentYear = new Date().getFullYear()
    if (!birthYear || currentYear - birthYear <= 18)
      return 'Tuổi phải lớn hơn 18 (tính theo năm).'
    return ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    const msg = validate()
    if (msg) return setError(msg)
    setSubmitting(true)
    try {
      await createSinhVien(form)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Không thể tạo sinh viên')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout activeMenu="students" title="Thêm sinh viên">
      <CenterError message={error} onClose={() => setError('')} />

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Thông tin sinh viên</h5>
          <form className="row g-3" onSubmit={onSubmit}>
            <div className="col-md-4">
              <label className="form-label">Mã sinh viên *</label>
              <input className="form-control" value={form.ma_sv} onChange={update('ma_sv')} />
            </div>
            <div className="col-md-8">
              <label className="form-label">Họ tên *</label>
              <input className="form-control" value={form.ho_ten} onChange={update('ho_ten')} />
            </div>

            <div className="col-md-4">
              <label className="form-label">Ngày sinh *</label>
              <input type="date" className="form-control" value={form.ngay_sinh} onChange={update('ngay_sinh')} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Giới tính</label>
              <select className="form-select" value={form.gioi_tinh} onChange={update('gioi_tinh')}>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Khóa học</label>
              <input className="form-control" value={form.khoa_hoc} onChange={update('khoa_hoc')} placeholder="VD: K47" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" value={form.email} onChange={update('email')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Số điện thoại</label>
              <input className="form-control" value={form.so_dien_thoai} onChange={update('so_dien_thoai')} />
            </div>
            <div className="col-12">
              <label className="form-label">Địa chỉ</label>
              <input className="form-control" value={form.dia_chi} onChange={update('dia_chi')} />
            </div>

            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Lưu sinh viên'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
