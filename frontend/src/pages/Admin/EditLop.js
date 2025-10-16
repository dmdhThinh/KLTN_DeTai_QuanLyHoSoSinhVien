import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function EditLop() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tenLop, setTenLop] = useState('')
  const [khoaId, setKhoaId] = useState('')
  const [nganhId, setNganhId] = useState('')
  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadKhoas()
    loadNganhs()
    loadLop()
  }, [id])

  const loadKhoas = async () => {
    try {
      const data = await apiFetch('/api/khoa')
      setKhoas(data || [])
    } catch {
      setKhoas([])
    }
  }

  const loadNganhs = async () => {
    try {
      const data = await apiFetch('/api/nganh')
      setNganhs(data || [])
    } catch {
      setNganhs([])
    }
  }

  const loadLop = async () => {
    try {
      const data = await apiFetch(`/api/lop/${id}`)
      setTenLop(data.tenLop || '')
      setKhoaId(data.khoaId || '')
      setNganhId(data.nganhId || '')
    } catch {
      setError('Không thể tải thông tin lớp.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tenLop.trim()) return setError('Tên lớp là bắt buộc.')
    setSubmitting(true)
    try {
      await apiFetch(`/api/lop/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ten_lop: tenLop, khoa_id: khoaId, nganh_id: nganhId })
      })
      setMessage('Cập nhật thành công!')
      setTimeout(() => navigate('/admin/lop', { replace: true }), 1500)
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <AdminLayout title="Đang tải..." activeMenu="lop">
        <div className="text-center mt-5">Đang tải dữ liệu...</div>
      </AdminLayout>
    )

  return (
    <AdminLayout activeMenu="lop" title="Chỉnh sửa Lớp">
      {error && <div className="alert alert-danger text-center">{error}</div>}
      {message && <div className="alert alert-success text-center">{message}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Cập nhật thông tin lớp</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Tên lớp *</label>
              <input
                className="form-control"
                value={tenLop}
                onChange={(e) => setTenLop(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Khoa *</label>
              <select
                className="form-select"
                value={khoaId}
                onChange={(e) => setKhoaId(e.target.value)}
              >
                <option value="">-- Chọn khoa --</option>
                {khoas.map((k) => (
                  <option key={k.id} value={k.id}>{k.tenKhoa}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Ngành *</label>
              <select
                className="form-select"
                value={nganhId}
                onChange={(e) => setNganhId(e.target.value)}
              >
                <option value="">-- Chọn ngành --</option>
                {nganhs.map((n) => (
                  <option key={n.id} value={n.id}>{n.tenNganh}</option>
                ))}
              </select>
            </div>

            <div className="col-12 d-flex justify-content-end">
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
