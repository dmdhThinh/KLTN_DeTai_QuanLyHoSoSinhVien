import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
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

export default function EditHocPhan() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const passedHocPhan = location.state // dữ liệu truyền từ list

  // 🧩 State form
  const [maHocPhan, setMaHocPhan] = useState('')
  const [tenHocPhan, setTenHocPhan] = useState('')
  const [soTinChi, setSoTinChi] = useState(3)
  const [moTa, setMoTa] = useState('')
  const [khoaId, setKhoaId] = useState('')
  const [nganhId, setNganhId] = useState('')

  // 🗂️ Data lists
  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 🚀 Load dropdown
  useEffect(() => {
    loadKhoas()
    loadNganhs()

    if (passedHocPhan) {
      // ✅ Nếu có dữ liệu truyền qua, set luôn form
      setMaHocPhan(passedHocPhan.maHocPhan || '')
      setTenHocPhan(passedHocPhan.tenHocPhan || '')
      setSoTinChi(passedHocPhan.soTinChi || 3)
      setMoTa(passedHocPhan.moTa || '')
      setKhoaId(passedHocPhan.khoaId || '')
      setNganhId(passedHocPhan.nganhId || '')
      setLoading(false)
    } else {
      // ⚙️ Nếu reload trang trực tiếp, gọi API lấy lại
      loadHocPhan()
    }
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

  const loadHocPhan = async () => {
    setLoading(true)
    try {
      const hp = await apiFetch(`/api/hocphan/${id}`)
      if (!hp) throw new Error('Không tìm thấy học phần.')
      setMaHocPhan(hp.maHocPhan || '')
      setTenHocPhan(hp.tenHocPhan || '')
      setSoTinChi(hp.soTinChi || 3)
      setMoTa(hp.moTa || '')
      setKhoaId(hp.khoaId || '')
      setNganhId(hp.nganhId || '')
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu học phần.')
    } finally {
      setLoading(false)
    }
  }

  const filteredNganhs = nganhs.filter(n => n.khoaId == khoaId || n.khoa_id == khoaId)

  // 🧾 Gửi cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!maHocPhan.trim() || !tenHocPhan.trim()) return setError('Vui lòng nhập mã và tên học phần.')
    if (!khoaId || !nganhId) return setError('Vui lòng chọn khoa và ngành.')

    setSubmitting(true)
    try {
      await apiFetch(`/api/hocphan/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          maHocPhan,
          tenHocPhan,
          soTinChi,
          moTa,
          khoaId,
          nganhId
        })
      })
      navigate('/admin/hocphan', { replace: true })
    } catch (err) {
      setError(err.message || 'Không thể cập nhật học phần.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <AdminLayout title="Chỉnh sửa Học Phần">
        <div className="text-center p-5 text-muted">Đang tải dữ liệu...</div>
      </AdminLayout>
    )

  return (
    <AdminLayout activeMenu="hocphan" title="Chỉnh sửa Học Phần">
      <CenterError message={error} onClose={() => setError('')} />

      <div className="d-flex justify-content-center">
        <div className="card shadow-sm w-100" style={{ maxWidth: 1000 }}>
          <div className="card-body">
            <h5 className="mb-3">Cập nhật Học Phần</h5>
            <form onSubmit={handleSubmit} className="row g-3">
              
              {/* Mã học phần */}
              <div className="col-md-6">
                <label className="form-label">Mã học phần *</label>
                <input
                  className="form-control"
                  value={maHocPhan}
                  onChange={(e) => setMaHocPhan(e.target.value)}
                />
              </div>

              {/* Tên học phần */}
              <div className="col-md-6">
                <label className="form-label">Tên học phần *</label>
                <input
                  className="form-control"
                  value={tenHocPhan}
                  onChange={(e) => setTenHocPhan(e.target.value)}
                />
              </div>

              {/* Số tín chỉ */}
              <div className="col-md-4">
                <label className="form-label">Số tín chỉ *</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={soTinChi}
                  onChange={(e) => setSoTinChi(e.target.value)}
                />
              </div>

              {/* Khoa */}
              <div className="col-md-4">
                <label className="form-label">Khoa *</label>
                <select
                  className="form-select"
                  value={khoaId}
                  onChange={(e) => {
                    setKhoaId(e.target.value)
                    setNganhId('')
                  }}
                >
                  <option value="">-- Chọn khoa --</option>
                  {khoas.map(k => (
                    <option key={k.id} value={k.id}>
                      {k.tenKhoa || k.ten_khoa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngành */}
              <div className="col-md-4">
                <label className="form-label">Ngành *</label>
                <select
                  className="form-select"
                  value={nganhId}
                  onChange={(e) => setNganhId(e.target.value)}
                  disabled={!khoaId}
                >
                  <option value="">-- Chọn ngành --</option>
                  {filteredNganhs.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.tenNganh || n.ten_nganh}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mô tả */}
              <div className="col-12">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                ></textarea>
              </div>

              {/* Submit */}
              <div className="col-12 d-flex justify-content-end">
                <button className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Cập nhật học phần'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
