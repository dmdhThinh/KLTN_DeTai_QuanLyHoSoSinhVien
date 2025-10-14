import React, { useState } from 'react'
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

export default function AddKhoa() {
  const navigate = useNavigate()
  const [tenKhoa, setTenKhoa] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tenKhoa.trim()) return setError('Vui lòng nhập tên khoa.')
    setSubmitting(true)
    try {
      await apiFetch('/api/khoa', {
        method: 'POST',
        body: JSON.stringify({ ten_khoa: tenKhoa })
      })
      navigate('/admin/khoa', { replace: true })
    } catch (err) {
      setError(err.message || 'Không thể thêm khoa.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout activeMenu="khoa" title="Thêm Khoa">
      <CenterError message={error} onClose={() => setError('')} />

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Thông tin Khoa</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Tên khoa *</label>
              <input
                className="form-control"
                value={tenKhoa}
                onChange={(e) => setTenKhoa(e.target.value)}
                placeholder="VD: Công nghệ thông tin"
              />
            </div>

            <div className="col-12 d-flex justify-content-end">
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Lưu khoa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
