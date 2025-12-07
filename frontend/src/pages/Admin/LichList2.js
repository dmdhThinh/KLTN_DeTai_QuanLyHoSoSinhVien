import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function LichList2() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [nganhId, setNganhId] = useState('')
  const [nganhs, setNganhs] = useState([])
  const [lopHocPhans, setLopHocPhans] = useState([])
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
    loadLopHocPhan()
    loadLichHoc()
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

  // ===== Load danh sách lớp học phần
  const loadLopHocPhan = async () => {
    try {
      const data = await apiFetch('/api/lophocphan')
      if (Array.isArray(data)) {
        setLopHocPhans(data)
      }
    } catch (err) {
      console.error('Error loading lop hoc phan:', err)
    }
  }

  // ===== Load danh sách lịch học
  const loadLichHoc = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/lich-admin')
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
    ? lopHocPhans.filter(lhp => {
        const maLopHocPhan = (lhp.maLopHocPhan || lhp.ma_lop_hoc_phan || '').toLowerCase()
        const tenHocPhan = (lhp.tenHocPhan || lhp.ten_hoc_phan || '').toLowerCase()
        const searchLower = search.toLowerCase()
        return maLopHocPhan.includes(searchLower) || tenHocPhan.includes(searchLower)
      }).slice(0, 10) // Giới hạn 10 kết quả
    : []

  const handleSearchChange = (value) => {
    setSearch(value)
    setShowSuggestions(true)
  }

  const handleSelectSuggestion = (lhp) => {
    const searchValue = `${lhp.maLopHocPhan || lhp.ma_lop_hoc_phan} - ${lhp.tenHocPhan || lhp.ten_hoc_phan}`
    setSearch(searchValue)
    setShowSuggestions(false)
    // Tự động filter sau khi chọn
    setTimeout(() => {
      let result = [...list]
      if (searchValue.trim()) {
        const keyword = searchValue.toLowerCase()
        result = result.filter(lh => {
          const tenHocPhan = (lh.tenHocPhan || '').toLowerCase()
          const maLopHocPhan = (lh.maLopHocPhan || '').toLowerCase()
          const maHocPhan = (lh.maHocPhan || '').toLowerCase()
          const fullString = `${maLopHocPhan} - ${tenHocPhan}`.toLowerCase()
          
          return tenHocPhan.includes(keyword) ||
                 maLopHocPhan.includes(keyword) ||
                 maHocPhan.includes(keyword) ||
                 fullString.includes(keyword)
        })
      }
      if (nganhId) {
        const lopHocPhanIdsByNganh = lopHocPhans
          .filter(lhp => lhp.nganhId && String(lhp.nganhId) === String(nganhId))
          .map(lhp => lhp.id)
        result = result.filter(lh => 
          lh.lopHocPhanId && lopHocPhanIdsByNganh.includes(lh.lopHocPhanId)
        )
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
      result = result.filter(lh => {
        const tenHocPhan = (lh.tenHocPhan || '').toLowerCase()
        const maLopHocPhan = (lh.maLopHocPhan || '').toLowerCase()
        const maHocPhan = (lh.maHocPhan || '').toLowerCase()
        const fullString = `${maLopHocPhan} - ${tenHocPhan}`.toLowerCase()
        
        return tenHocPhan.includes(keyword) ||
               maLopHocPhan.includes(keyword) ||
               maHocPhan.includes(keyword) ||
               fullString.includes(keyword)
      })
    }

    if (nganhId) {
      // Lọc theo ngành: lấy danh sách lớp học phần thuộc ngành đó
      const lopHocPhanIdsByNganh = lopHocPhans
        .filter(lhp => lhp.nganhId && String(lhp.nganhId) === String(nganhId))
        .map(lhp => lhp.id)
      
      // Lọc lịch học có lopHocPhanId thuộc danh sách trên
      result = result.filter(lh => 
        lh.lopHocPhanId && lopHocPhanIdsByNganh.includes(lh.lopHocPhanId)
      )
    }

    setFiltered(result)
    setPage(1)
  }

  // ===== Xử lý xoá
  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/lich-admin/${id}`, { method: 'DELETE' })
      setMessage('✅ Đã xoá lịch học thành công!')
      loadLichHoc()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Xoá thất bại: ' + (err.message || 'Lỗi không xác định'))
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Hàm chuyển đổi thứ
  const getThuLabel = (thu) => {
    const thuMap = {
      2: 'Thứ 2',
      3: 'Thứ 3',
      4: 'Thứ 4',
      5: 'Thứ 5',
      6: 'Thứ 6',
      7: 'Thứ 7',
      8: 'Chủ nhật'
    }
    return thuMap[thu] || thu
  }

  // Hàm render badge loại với màu sắc
  const renderLoaiBadge = (loai) => {
    const badgeConfig = {
      'lythuyet': { label: 'Lý thuyết', color: 'secondary' },
      'thuchanh': { label: 'Thực hành', color: 'success' },
      'tructuyen': { label: 'Trực tuyến', color: 'info' },
      'thi': { label: 'Thi', color: 'warning' }
    }
    const config = badgeConfig[loai] || { label: loai, color: 'secondary' }
    return (
      <span className={`badge bg-${config.color}`}>
        {config.label}
      </span>
    )
  }

  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedData = filtered.slice(startIndex, endIndex)

  return (
    <AdminLayout title="Danh sách Lịch học">
      {message && <div className="alert alert-info text-center py-2">{message}</div>}

      {/* Xác nhận xoá */}
      {confirmDelete && (
        <div
          className="position-fixed top-50 start-50 translate-middle bg-white shadow rounded p-4 text-center"
          style={{ zIndex: 1055, minWidth: 400 }}
        >
          <div className="fw-semibold mb-3">Bạn có chắc muốn xoá lịch học này?</div>
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
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Thanh tìm kiếm và filter */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label small">Tìm theo mã / tên lớp học phần</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm theo mã / tên lớp học phần..."
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
                      {filteredSuggestions.map(lhp => (
                        <button
                          key={lhp.id}
                          type="button"
                          className="list-group-item list-group-item-action"
                          onClick={() => handleSelectSuggestion(lhp)}
                          style={{ textAlign: 'left', cursor: 'pointer' }}
                        >
                          <div className="fw-semibold">{lhp.maLopHocPhan || lhp.ma_lop_hoc_phan}</div>
                          <div className="small text-muted">{lhp.tenHocPhan || lhp.ten_hoc_phan}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-5">
                <label className="form-label small">Tìm theo ngành</label>
                <select
                  className="form-select"
                  value={nganhId}
                  onChange={(e) => setNganhId(e.target.value)}
                >
                  <option value="">Tất cả ngành</option>
                  {nganhs.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.ten_nganh}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">
                  Tìm kiếm
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Nút thêm mới */}
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/admin/quan-ly-lich-hoc/new')}
        >
          <i className="bi bi-plus-circle me-2"></i>Thêm lịch học
        </button>
      </div>

      {/* Bảng danh sách */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Mã lớp học phần</th>
                      <th>Tên học phần</th>
                      <th>Thứ</th>
                      <th>Ca</th>
                      <th>Tiết</th>
                      <th>Phòng</th>
                      <th>Cơ sở</th>
                      <th>Loại</th>
                      <th style={{ width: '150px' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center text-muted py-4">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item, index) => (
                        <tr key={item.id}>
                          <td>{startIndex + index + 1}</td>
                          <td>{item.maLopHocPhan || '-'}</td>
                          <td>{item.tenHocPhan || '-'}</td>
                          <td>{item.ngayHoc ? new Date(item.ngayHoc).toLocaleDateString('vi-VN') : (item.thu ? getThuLabel(item.thu) : '-')}</td>
                          <td>{item.ca || '-'}</td>
                          <td>
                            {item.tietBatDau && item.tietKetThuc
                              ? `${item.tietBatDau}-${item.tietKetThuc}`
                              : '-'}
                          </td>
                          <td>{item.phong || '-'}</td>
                          <td>{item.coSo || '-'}</td>
                          <td>
                            {renderLoaiBadge(item.loai)}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => navigate(`/admin/quan-ly-lich-hoc/edit/${item.id}`)}
                                title="Sửa"
                              >
                                Sửa
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setConfirmDelete({ id: item.id })}
                                title="Xoá"
                              >
                                Xoá
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Hiển thị {startIndex + 1} - {Math.min(endIndex, filtered.length)} / {filtered.length} bản ghi
              </div>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Trước
                    </button>
                  </li>
                  {(() => {
                    const pages = []
                    const maxVisible = 5
                    let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                    
                    if (endPage - startPage < maxVisible - 1) {
                      startPage = Math.max(1, endPage - maxVisible + 1)
                    }
                    
                    if (startPage > 1) {
                      pages.push(
                        <li key={1} className={`page-item ${page === 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(1)}>1</button>
                        </li>
                      )
                      if (startPage > 2) {
                        pages.push(
                          <li key="ellipsis1" className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )
                      }
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(i)}>{i}</button>
                        </li>
                      )
                    }
                    
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <li key="ellipsis2" className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )
                      }
                      pages.push(
                        <li key={totalPages} className={`page-item ${page === totalPages ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(totalPages)}>{totalPages}</button>
                        </li>
                      )
                    }
                    
                    return pages
                  })()}
                  <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}

