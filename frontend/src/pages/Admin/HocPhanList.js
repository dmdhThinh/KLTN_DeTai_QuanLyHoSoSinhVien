import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function HocPhanList() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [nganhId, setNganhId] = useState('')
  const [nganhs, setNganhs] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  // Khi filtered thay đổi, cập nhật tổng số trang và đảm bảo page hợp lệ
  useEffect(() => {
    const tp = Math.ceil((filtered?.length || 0) / limit) || 1
    setTotalPages(tp)
    if (page > tp) setPage(tp)
  }, [filtered, limit, page])

  
  // 🚀 Load dữ liệu ban đầu
  useEffect(() => {
    loadDropdowns()
    loadHocPhan()
  }, [])


  // ===== Load dropdown (Ngành)
  const loadDropdowns = async () => {
    try {
      const nganhData = await apiFetch('/api/nganh')
      if (Array.isArray(nganhData)) {
        setNganhs(nganhData.map(n => ({
          id: n.id,
          ten_nganh: n.ten_nganh || n.tenNganh
        })))
      }
    } catch (err) {
      console.error('Error loading dropdowns:', err)
    }
  }

  // ===== Load danh sách học phần
  const loadHocPhan = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/hocphan')
      setList(data || [])
      setFiltered(data || [])
    } catch {
      setList([])
      setFiltered([])
    } finally {
      setLoading(false)
    }
  }

  // Filter suggestions cho autocomplete
  const filteredSuggestions = search
    ? list.filter(hp => {
        const maHocPhan = (hp.maHocPhan || '').toLowerCase()
        const tenHocPhan = (hp.tenHocPhan || '').toLowerCase()
        const searchLower = search.toLowerCase()
        return maHocPhan.includes(searchLower) || tenHocPhan.includes(searchLower)
      }).slice(0, 10) // Giới hạn 10 kết quả
    : []

  const handleSearchChange = (value) => {
    setSearch(value)
    setShowSuggestions(true)
  }

  const handleSelectSuggestion = (hp) => {
    const searchValue = `${hp.maHocPhan} - ${hp.tenHocPhan}`
    setSearch(searchValue)
    setShowSuggestions(false)
    // Tự động filter sau khi chọn
    setTimeout(() => {
      let result = [...list]
      if (searchValue.trim()) {
        const keyword = searchValue.toLowerCase()
        result = result.filter(hp => {
          const tenHocPhan = (hp.tenHocPhan || '').toLowerCase()
          const maHocPhan = (hp.maHocPhan || '').toLowerCase()
          const fullString = `${maHocPhan} - ${tenHocPhan}`.toLowerCase()
          
          return tenHocPhan.includes(keyword) ||
                 maHocPhan.includes(keyword) ||
                 fullString.includes(keyword)
        })
      }
      if (nganhId) {
        result = result.filter(hp => String(hp.nganhId) === String(nganhId))
      }
      setFiltered(result)
      setPage(1)
    }, 0)
  }

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  // ===== Xử lý tìm kiếm & lọc
  const handleSubmit = (e) => {
    e.preventDefault()
    setShowSuggestions(false)
    let result = [...list]

    if (search.trim()) {
      const keyword = search.toLowerCase()
      result = result.filter(hp => {
        const tenHocPhan = (hp.tenHocPhan || '').toLowerCase()
        const maHocPhan = (hp.maHocPhan || '').toLowerCase()
        const fullString = `${maHocPhan} - ${tenHocPhan}`.toLowerCase()
        
        return tenHocPhan.includes(keyword) ||
               maHocPhan.includes(keyword) ||
               fullString.includes(keyword)
      })
    }

    if (nganhId) {
      result = result.filter(hp => String(hp.nganhId) === String(nganhId))
    }

    setFiltered(result)
    setPage(1)
  }

  // ===== Xử lý xoá
  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/hocphan/${id}`, { method: 'DELETE' })
      setMessage('✅ Đã xoá học phần thành công!')
      loadHocPhan()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Xoá thất bại: ' + err.message)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <AdminLayout title="Danh sách Học Phần">
      {message && <div className="alert alert-info text-center py-2">{message}</div>}

      {/* Xác nhận xoá */}
      {confirmDelete && (
        <div
          className="position-fixed top-50 start-50 translate-middle bg-white shadow rounded p-4 text-center"
          style={{ zIndex: 1055, minWidth: 400 }}
        >
          <div className="fw-semibold mb-3">Bạn có chắc muốn xoá học phần này?</div>
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
        <form
          onSubmit={handleSubmit}
          className="d-flex align-items-center gap-2 flex-wrap"
        >
          {/* 🔍 Tìm kiếm */}
          <div style={{ position: 'relative', width: 240 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo mã / tên học phần..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={handleSearchBlur}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                className="list-group"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #ced4da',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                  marginTop: '2px'
                }}
              >
                {filteredSuggestions.map(hp => (
                  <button
                    key={hp.id}
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={() => handleSelectSuggestion(hp)}
                    style={{ textAlign: 'left', cursor: 'pointer' }}
                  >
                    <div className="fw-semibold">{hp.maHocPhan}</div>
                    <div className="small text-muted">{hp.tenHocPhan}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 🎓 Chọn ngành */}
          <select
            className="form-select"
            style={{ width: 200 }}
            value={nganhId}
            onChange={(e) => setNganhId(e.target.value)}
          >
            <option value="">-- Tất cả ngành --</option>
            {nganhs.map(n => (
              <option key={n.id} value={n.id}>{n.ten_nganh}</option>
            ))}
          </select>

          <button className="btn btn-outline-primary" type="submit">
            Tìm kiếm
          </button>
        </form>

        <div className="ms-auto">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/hocphan/new')}
          >
            ➕ Thêm học phần
          </button>
        </div>
      </div>

      {/* Bảng danh sách học phần */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4 text-muted">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-4 text-muted">
              Không tìm thấy học phần nào phù hợp.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>Mã học phần</th>
                    <th>Tên học phần</th>
                    <th>Số tín chỉ</th>
                    <th>Khoa</th>
                    <th>Ngành</th>
                    <th style={{ width: 150 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice((page - 1) * limit, page * limit)
                    .map((hp, i) => (
                      <tr key={hp.id}>
                        <td>{(page - 1) * limit + i + 1}</td>
                      <td>{hp.maHocPhan}</td>
                      <td>{hp.tenHocPhan}</td>
                      <td>{hp.soTinChi}</td>
                      <td>{hp.tenKhoa || '—'}</td>
                      <td>{hp.tenNganh || '—'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => navigate(`/admin/hocphan/edit/${hp.id}`, { state: hp })}
                        >
                           Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setConfirmDelete(hp)}
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

      {/* Phân trang */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted small">Trang {page} / {totalPages}</div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Trước
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau →
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
