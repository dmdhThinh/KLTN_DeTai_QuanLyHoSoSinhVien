import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function NganhList() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [khoaId, setKhoaId] = useState('')
  const [khoas, setKhoas] = useState([])
  const [message, setMessage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  // 🚀 Lấy danh sách ngành & khoa
  useEffect(() => {
    loadKhoas()
    loadNganh()
  }, [])

  const loadKhoas = async () => {
    try {
      const data = await apiFetch('/api/khoa')
      console.log('API Response:', data) // Log the response
      setKhoas(data || [])
    } catch {
      setKhoas([])
    }
  }

  const loadNganh = async (filterName = query, filterKhoa = khoaId) => {
    setLoading(true)
    try {
      const q = encodeURIComponent(filterName)
      const url = `/api/nganh?q=${q}${filterKhoa ? `&khoaId=${filterKhoa}` : ''}`
      const data = await apiFetch(url)
      console.log('API Response:', data) // Log the response
      setList(data || [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadNganh(query, khoaId)
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/nganh/${id}`, { method: 'DELETE' })
      setMessage('Đã xoá ngành thành công!')
      setConfirmDelete(null)
      loadNganh()
      console.log('Xoá ngành thành công:', id)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Xoá thất bại: ' + err.message)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <AdminLayout activeMenu="departments" title="Danh sách Ngành">
      {message && <div className="alert alert-info text-center py-2">{message}</div>}

      {/* Hộp xác nhận xoá */}
      {confirmDelete && (
        <div className="position-fixed top-50 start-50 translate-middle bg-white shadow rounded p-4 text-center"
          style={{ zIndex: 1055, minWidth: 400 }}>
          <div className="fw-semibold mb-3">Bạn có chắc muốn xoá ngành này?</div>
          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-danger"
              onClick={() => handleDelete(confirmDelete.id)}
            >
              Xoá
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setConfirmDelete(null)}
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Thanh tìm kiếm */}
      <div className="d-flex align-items-center mb-3 gap-2 flex-wrap">
        <form onSubmit={handleSearch} className="d-flex gap-2 flex-wrap">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên ngành..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 250 }}
          />
          <select
            className="form-select"
            style={{ width: 220 }}
            value={khoaId}
            onChange={(e) => setKhoaId(e.target.value)}
          >
            <option value="">-- Tất cả khoa --</option>
            {khoas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.tenKhoa}
              </option>
            ))}
          </select>
          <button className="btn btn-outline-primary" type="submit">
            Tìm kiếm
          </button>
        </form>

        <div className="ms-auto">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/nganh/new')}
          >
            ➕ Thêm ngành
          </button>
        </div>
      </div>

      {/* Bảng danh sách */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4 text-muted">Đang tải...</div>
          ) : list.length === 0 ? (
            <div className="text-center p-4 text-muted">Không có ngành nào.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Mã ngành</th>
                    <th>Tên ngành</th>
                    <th>Khoa</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((nganh, i) => (
                    <tr key={nganh.id}>
                      <td>{i + 1}</td>
                      <td>{nganh.maNganh}</td>
                      <td>{nganh.tenNganh}</td>
                      <td>{nganh.tenKhoa || '—'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => navigate(`/admin/nganh/edit/${nganh.id}`)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setConfirmDelete(nganh)}
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
