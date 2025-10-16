import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api'
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

export default function AddLop() {
  const navigate = useNavigate()
  const [tenLop, setTenLop] = useState('')
  const [khoaId, setKhoaId] = useState('')
  const [nganhId, setNganhId] = useState('')
  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadKhoas()
    loadNganhs()
  }, [])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tenLop.trim()) return setError('Vui lòng nhập tên lớp.')
    setSubmitting(true)
    try {
      await apiFetch('/api/lop', {
        method: 'POST',
        body: JSON.stringify({ ten_lop: tenLop, khoa_id: khoaId, nganh_id: nganhId })
      })
      navigate('/admin/lop', { replace: true })
    } catch (err) {
      setError(err.message || 'Không thể thêm lớp.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout activeMenu="lop" title="Thêm Lớp">
      <CenterError message={error} onClose={() => setError('')} />

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Thông tin Lớp</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Tên lớp *</label>
              <input
                className="form-control"
                value={tenLop}
                onChange={(e) => setTenLop(e.target.value)}
                placeholder="VD: CNTT01"
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
                {submitting ? 'Đang lưu...' : 'Lưu lớp'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
