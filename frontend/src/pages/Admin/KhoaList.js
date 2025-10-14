import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function KhoaList() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    loadKhoa()
  }, [])

  const loadKhoa = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/khoa')
      setList(data || [])
      setFiltered(data || [])
    } catch {
      setList([])
      setFiltered([])
    } finally {
      setLoading(false)
    }
  }

  // 🔎 Lọc danh sách theo từ khóa
  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase()
    setSearch(keyword)
    if (!keyword.trim()) {
      setFiltered(list)
    } else {
      const filteredList = list.filter((khoa) =>
        khoa.tenKhoa.toLowerCase().includes(keyword)
      )
      setFiltered(filteredList)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/khoa/${id}`, { method: 'DELETE' })
      setMessage('✅ Đã xoá khoa thành công!')
      loadKhoa()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Xoá thất bại: ' + err.message)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <AdminLayout title="Danh sách Khoa">
      {message && (
        <div className="alert alert-info text-center py-2">{message}</div>
      )}

      {confirmDelete && (
        <div
          className="position-fixed top-50 start-50 translate-middle bg-white shadow rounded p-4 text-center"
          style={{ zIndex: 1055, minWidth: 400 }}
        >
          <div className="fw-semibold mb-3">Bạn có chắc muốn xoá khoa này?</div>
          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-danger"
              onClick={() => {
                handleDelete(confirmDelete.id)
                setConfirmDelete(null)
              }}
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

      {/* Thanh công cụ */}
      <div className="d-flex align-items-center mb-3 flex-wrap gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm theo tên khoa..."
          value={search}
          onChange={handleSearch}
          style={{ maxWidth: 280 }}
        />
        <div className="ms-auto">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/khoa/new')}
          >
            ➕ Thêm khoa
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4 text-muted">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-4 text-muted">
              {search ? 'Không tìm thấy khoa nào phù hợp.' : 'Chưa có khoa nào.'}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>Tên khoa</th>
                    <th style={{ width: 150 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((khoa, i) => (
                    <tr key={khoa.id}>
                      <td>{i + 1}</td>
                      <td>{khoa.tenKhoa}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() =>
                            navigate(`/admin/khoa/edit/${khoa.id}`)
                          }
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setConfirmDelete(khoa)}
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
