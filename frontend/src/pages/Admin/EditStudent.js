// src/pages/Admin/EditStudent.js
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch, getSinhVienById } from '../../api'

// ===================== COMPONENT HIỂN THỊ LỖI =====================
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

// ===================== TRANG CHỈNH SỬA SINH VIÊN =====================
export default function EditStudent() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState(null)
  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])
  const [lops, setLops] = useState([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // ✅ Load dropdown dữ liệu
  useEffect(() => {
    (async () => {
      try {
        const [khoaData, nganhData, lopData] = await Promise.all([
          apiFetch('/api/khoa'),
          apiFetch('/api/nganh'),
          apiFetch('/api/lop')
        ])
        setKhoas(khoaData || [])
        setNganhs(nganhData || [])
        setLops(lopData || [])
      } catch (err) {
        console.error('Lỗi tải dropdown:', err)
      }
    })()
  }, [])

  // ✅ Load dữ liệu sinh viên theo ID
  useEffect(() => {
    (async () => {
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
          khoa_hoc: data.khoaHoc || '',
          lop_id: data.lopId || '',
          khoa_id: data.khoaId || '',
          nganh_id: data.nganhId || '',
          anh_the: data.anhThe || ''
        })
      } catch (err) {
        setError('Không thể tải dữ liệu sinh viên.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  // ✅ Cập nhật giá trị form
  const update = (k) => (e) => {
    const v = e.target.value
    setForm((s) => {
      if (k === 'khoa_id') return { ...s, khoa_id: v, nganh_id: '', lop_id: '' }
      if (k === 'nganh_id') return { ...s, nganh_id: v, lop_id: '' }
      return { ...s, [k]: v }
    })
  }

  // ✅ Lọc ngành theo khoa
  const nganhsByKhoa = useMemo(() => {
    if (!form?.khoa_id) return nganhs
    return nganhs.filter(n => String(n.khoaId) === String(form.khoa_id))
  }, [form?.khoa_id, nganhs])

  // ✅ Lọc lớp theo ngành
  const lopsByNganh = useMemo(() => {
    if (!form?.nganh_id) return []
    return lops.filter(l => String(l.nganhId) === String(form.nganh_id))
  }, [form?.nganh_id, lops])

  // ✅ Submit cập nhật
  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await apiFetch(`/api/sinhviens/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          lop_id: Number(form.lop_id)
        })
      })
      setMessage('✅ Cập nhật sinh viên thành công!')
      setTimeout(() => navigate('/admin/students', { replace: true }), 1500)
    } catch (err) {
      setError(err.message || 'Không thể cập nhật sinh viên')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Đang tải..." activeMenu="students">
        <div className="text-center mt-5">Đang tải dữ liệu...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeMenu="students" title="Chỉnh sửa sinh viên">
      <CenterError message={error} onClose={() => setError('')} />
      {message && <div className="alert alert-success text-center py-2">{message}</div>}

      <div className="d-flex justify-content-center">
        <div className="card shadow-sm w-100" style={{ maxWidth: 1370 }}>
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

              {/* ✅ Cascading: Khoa → Ngành → Lớp */}
              <div className="col-md-4">
                <label className="form-label">Khoa *</label>
                <select className="form-select" value={form.khoa_id} onChange={update('khoa_id')}>
                  <option value="">-- Chọn Khoa --</option>
                  {khoas.map(k => (<option key={k.id} value={k.id}>{k.tenKhoa}</option>))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Ngành *</label>
                <select className="form-select" value={form.nganh_id} onChange={update('nganh_id')} disabled={!nganhsByKhoa.length}>
                  <option value="">{nganhsByKhoa.length ? '-- Chọn Ngành --' : '— Chưa có ngành —'}</option>
                  {nganhsByKhoa.map(n => (<option key={n.id} value={n.id}>{n.tenNganh}</option>))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Lớp *</label>
                <select className="form-select" value={form.lop_id} onChange={update('lop_id')} disabled={!lopsByNganh.length}>
                  <option value="">{lopsByNganh.length ? '-- Chọn Lớp --' : '— Chưa có lớp —'}</option>
                  {lopsByNganh.map(l => (<option key={l.id} value={l.id}>{l.tenLop}</option>))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Ảnh thẻ</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) setForm(s => ({ ...s, anh_the: file.name }))
                  }}
                />
                {form.anh_the && (
                  <small className="text-muted">
                    Ảnh hiện tại: <strong>{form.anh_the}</strong>
                  </small>
                )}
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
      </div>
    </AdminLayout>
  )
}