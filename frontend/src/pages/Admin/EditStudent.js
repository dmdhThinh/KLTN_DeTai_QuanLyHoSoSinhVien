import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch, getSinhVienById } from '../../api'

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

export default function EditStudent() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadStudent()
  }, [id])

  const loadStudent = async () => {
    try {
      const data = await getSinhVienById(id)
      setForm({
        ma_sv: data.maSv,
        ho_ten: data.hoTen,
        ngay_sinh: data.ngaySinh,
        gioi_tinh: data.gioiTinh || 'Nam',
        email: data.email || '',
        so_dien_thoai: data.soDienThoai || '',
        dia_chi: data.diaChi || '',
        khoa_hoc: data.khoaHoc || ''
      })
    } catch {
      setError('Không thể tải dữ liệu sinh viên.')
    } finally {
      setLoading(false)
    }
  }

  const update = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))

  const validate = () => {
    if (!form.ma_sv || !form.ho_ten || !form.ngay_sinh)
      return 'Vui lòng nhập đầy đủ: Mã SV, Họ tên, Ngày sinh.'
    const birthYear = Number(String(form.ngay_sinh).slice(0, 4))
    const currentYear = new Date().getFullYear()
    if (currentYear - birthYear <= 18) return 'Tuổi phải lớn hơn 18.'
    return ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    const msg = validate()
    if (msg) return setError(msg)
    setSubmitting(true)
    try {
      await apiFetch(`/api/sinhviens/${id}`, {
        method: 'PUT',
        body: JSON.stringify(form)
      })
      setMessage('Cập nhật thành công!')
      setTimeout(() => navigate('/admin/students', { replace: true }), 1500)
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <AdminLayout title="Đang tải..." activeMenu="students"><div className="text-center mt-5">Đang tải dữ liệu...</div></AdminLayout>

  return (
    <AdminLayout title="Chỉnh sửa sinh viên" activeMenu="students">
      <CenterError message={error} onClose={() => setError('')} />
      {message && <div className="alert alert-success text-center py-2">{message}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Cập nhật thông tin sinh viên</h5>
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
              <input className="form-control" value={form.khoa_hoc} onChange={update('khoa_hoc')} />
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
                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
