import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

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

export default function EditNganh() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [khoas, setKhoas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [nganh, khoaList] = await Promise.all([
        apiFetch(`/api/nganh/${id}`),
        apiFetch('/api/khoa')
      ])
      setForm({
        ma_nganh: nganh.maNganh,
        ten_nganh: nganh.tenNganh,
        khoa_id: nganh.khoaId || ''
      })
      setKhoas(khoaList || [])
    } catch {
      setError('Không thể tải dữ liệu ngành.')
    } finally {
      setLoading(false)
    }
  }

  const update = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))

  const validate = () => {
    if (!form.ma_nganh || !form.ten_nganh || !form.khoa_id)
      return 'Vui lòng nhập đầy đủ: Mã ngành, Tên ngành, và chọn Khoa.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    const msg = validate()
    if (msg) return setError(msg)
    setSubmitting(true)
    try {
      await apiFetch(`/api/nganh/${id}`, {
        method: 'PUT',
        body: JSON.stringify(form)
      })
      setMessage('Cập nhật thành công!')
      setTimeout(() => navigate('/admin/nganh', { replace: true }), 1500)
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <AdminLayout title="Đang tải..." activeMenu="departments">
        <div className="text-center mt-5">Đang tải dữ liệu...</div>
      </AdminLayout>
    )

  return (
    <AdminLayout title="Chỉnh sửa Ngành" activeMenu="departments">
      <CenterError message={error} onClose={() => setError('')} />
      {message && <div className="alert alert-success text-center py-2">{message}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Cập nhật thông tin Ngành</h5>
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <label className="form-label">Mã ngành *</label>
              <input className="form-control" value={form.ma_nganh} onChange={update('ma_nganh')} />
            </div>
            <div className="col-md-8">
              <label className="form-label">Tên ngành *</label>
              <input className="form-control" value={form.ten_nganh} onChange={update('ten_nganh')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Khoa *</label>
              <select className="form-select" value={form.khoa_id} onChange={update('khoa_id')}>
                <option value="">-- Chọn Khoa --</option>
                {khoas.map((khoa) => (
                  <option key={khoa.id} value={khoa.id}>{khoa.tenKhoa}</option>
                ))}
              </select>
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
