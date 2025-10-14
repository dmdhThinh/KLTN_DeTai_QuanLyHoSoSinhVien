import React, { useState, useEffect } from 'react'
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

export default function AddNganh() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ ma_nganh: '', ten_nganh: '', khoa_id: '' })
  const [khoas, setKhoas] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadKhoas()
  }, [])

  const loadKhoas = async () => {
    try {
      const data = await apiFetch('/api/khoa')
      setKhoas(data || [])
    } catch {
      setKhoas([])
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
      await apiFetch('/api/nganh', {
        method: 'POST',
        body: JSON.stringify(form)
      })
      navigate('/admin/nganh', { replace: true })
    } catch (err) {
      setError(err.message || 'Không thể thêm ngành.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout activeMenu="departments" title="Thêm Ngành">
      <CenterError message={error} onClose={() => setError('')} />

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Thông tin Ngành</h5>
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
                {submitting ? 'Đang lưu...' : 'Lưu ngành'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
