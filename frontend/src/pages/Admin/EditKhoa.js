import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function EditKhoa() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tenKhoa, setTenKhoa] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadKhoa()
  }, [id])

  const loadKhoa = async () => {
    try {
      const data = await apiFetch(`/api/khoa/${id}`)
      setTenKhoa(data.tenKhoa || '')
    } catch {
      setError('Không thể tải thông tin khoa.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tenKhoa.trim()) return setError('Tên khoa là bắt buộc.')
    setSubmitting(true)
    try {
      await apiFetch(`/api/khoa/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ten_khoa: tenKhoa })
      })
      setMessage('Cập nhật thành công!')
      setTimeout(() => navigate('/admin/khoa', { replace: true }), 1500)
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <AdminLayout title="Đang tải..." activeMenu="khoa">
        <div className="text-center mt-5">Đang tải dữ liệu...</div>
      </AdminLayout>
    )

  return (
    <AdminLayout activeMenu="khoa" title="Chỉnh sửa Khoa">
      {error && <div className="alert alert-danger text-center">{error}</div>}
      {message && <div className="alert alert-success text-center">{message}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Cập nhật thông tin khoa</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Tên khoa *</label>
              <input
                className="form-control"
                value={tenKhoa}
                onChange={(e) => setTenKhoa(e.target.value)}
              />
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
