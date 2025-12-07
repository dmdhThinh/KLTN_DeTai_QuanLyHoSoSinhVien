import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'
import DanhSachSinhVienModal from './DanhSachSinhVienModal'

export default function LopHocPhanList() {
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
  const [lopId, setLopId] = useState('') // Thêm state cho lớp học phần
  const [lops, setLops] = useState([]) // Thêm state cho danh sách lớp
  const [filteredLops, setFilteredLops] = useState([]) // Thêm state cho danh sách lớp đã lọc
  
  const [selectedLop, setSelectedLop] = useState(null) // Lớp đang chọn để xem DS
  const [showModal, setShowModal] = useState(false) // Modal DS sinh viên

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // 🚀 Load dữ liệu ban đầu
  useEffect(() => {
    loadDropdowns()
    loadLopHocPhan()
  }, [])


  // 🔹 Khi chọn Ngành → lọc lớp thuộc ngành đó
  useEffect(() => {
    if (!nganhId) {
      setFilteredLops(lops)
      setLopId('')
    } else {
      const filteredList = lops.filter(l => String(l.nganhId) === String(nganhId))
      setFilteredLops(filteredList)
      setLopId('') // reset lớp khi đổi ngành
    }
  }, [nganhId, lops])

  // ===== Load dropdown (Ngành & Lớp)
  const loadDropdowns = async () => {
    try {
      const nganhData = await apiFetch('/api/nganh')
      const lopData = await apiFetch('/api/lop') // Gọi API để lấy danh sách lớp
      if (Array.isArray(nganhData)) {
        setNganhs(nganhData.map(n => ({ id: n.id, ten_nganh: n.ten_nganh || n.tenNganh || 'Không xác định' })))
      } else {
        setNganhs([])
      }
      if (Array.isArray(lopData)) {
        setLops(lopData.map(l => ({ id: l.id, tenLop: l.tenLop || 'Không xác định', nganhId: l.nganhId })))
        setFilteredLops(lopData.map(l => ({ id: l.id, tenLop: l.tenLop || 'Không xác định', nganhId: l.nganhId })))
      } else {
        setLops([])
        setFilteredLops([])
      }
    } catch (err) {
      console.error('Error loading dropdowns:', err)
      setNganhs([])
      setLops([])
      setFilteredLops([])
    }
  }

  // ===== Load danh sách lớp học phần
  const loadLopHocPhan = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/lophocphan')
      console.log(data) 
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
    ? list.filter(lop => {
        const maLopHocPhan = (lop.maLopHocPhan || '').toLowerCase()
        const tenHocPhan = (lop.tenHocPhan || '').toLowerCase()
        const tenLop = (lop.tenLop || '').toLowerCase()
        const searchLower = search.toLowerCase()
        return maLopHocPhan.includes(searchLower) || 
               tenHocPhan.includes(searchLower) || 
               tenLop.includes(searchLower)
      }).slice(0, 10) // Giới hạn 10 kết quả
    : []

  const handleSearchChange = (value) => {
    setSearch(value)
    setShowSuggestions(true)
  }

  const handleSelectSuggestion = (lop) => {
    const searchValue = `${lop.maLopHocPhan} - ${lop.tenHocPhan}`
    setSearch(searchValue)
    setShowSuggestions(false)
    // useEffect sẽ tự động filter, nhưng cần đảm bảo format search đúng
  }

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  // ===== Xử lý tìm kiếm & lọc (tự động)
  useEffect(() => {
    let result = [...list]

    // Lọc theo tìm kiếm: mã lớp học phần, tên học phần, hoặc tên lớp
    if (search.trim()) {
      const keyword = search.toLowerCase()
      result = result.filter(lop => {
        const maLopHocPhan = (lop.maLopHocPhan || '').toLowerCase()
        const tenHocPhan = (lop.tenHocPhan || '').toLowerCase()
        const tenLop = (lop.tenLop || '').toLowerCase()
        // Tìm trong từng field riêng lẻ hoặc trong chuỗi "Mã - Tên"
        const fullString = `${maLopHocPhan} - ${tenHocPhan}`.toLowerCase()
        
        return maLopHocPhan.includes(keyword) || 
               tenHocPhan.includes(keyword) || 
               tenLop.includes(keyword) ||
               fullString.includes(keyword)
      })
    }

    // Lọc theo ngành
    if (nganhId) {
      result = result.filter(lop => String(lop.nganhId) === String(nganhId))
    }

    // Lọc theo lớp
    if (lopId) {
      result = result.filter(lop => String(lop.lopId) === String(lopId))
    }

    setFiltered(result)
    setCurrentPage(1) // Reset về trang 1 khi lọc
  }, [search, nganhId, lopId, list])

  // ===== Xử lý xoá
  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/lophocphan/${id}`, { method: 'DELETE' })
      setMessage('✅ Đã xoá lớp học phần thành công!')
      loadLopHocPhan()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Xoá thất bại: ' + err.message)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <AdminLayout title="Danh sách Lớp Học Phần">
      {message && (
        <div className="alert alert-info text-center py-2">{message}</div>
      )}

      {/* Xác nhận xoá */}
      {confirmDelete && (
        <div
          className="position-fixed top-50 start-50 translate-middle bg-white shadow rounded p-4 text-center"
          style={{ zIndex: 1055, minWidth: 400 }}
        >
          <div className="fw-semibold mb-3">Bạn có chắc muốn xoá lớp học phần này?</div>
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
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* 🔍 Tìm kiếm lớp học phần */}
          <div style={{ position: 'relative', width: 280 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo mã lớp, tên học phần, tên lớp..."
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
                {filteredSuggestions.map(lop => (
                  <button
                    key={lop.id}
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={() => handleSelectSuggestion(lop)}
                    style={{ textAlign: 'left', cursor: 'pointer' }}
                  >
                    <div className="fw-semibold">{lop.maLopHocPhan}</div>
                    <div className="small text-muted">{lop.tenHocPhan} {lop.tenLop ? `- ${lop.tenLop}` : ''}</div>
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

          {/* 🏫 Chọn lớp (lọc theo ngành) */}
          <select
            className="form-select"
            style={{ width: 200 }}
            value={lopId}
            onChange={(e) => setLopId(e.target.value)}
            disabled={!filteredLops.length}
          >
            <option value="">-- Tất cả lớp --</option>
            {filteredLops.map(l => (
              <option key={l.id} value={l.id}>{l.tenLop}</option>
            ))}
          </select>
        </div>

        <div className="ms-auto">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/lophocphan/new')}
          >
            ➕ Thêm lớp học phần
          </button>
        </div>
      </div>

      {/* Bảng danh sách lớp học phần */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4 text-muted">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-4 text-muted">
              Không tìm thấy lớp học phần nào phù hợp.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>Mã lớp học phần</th>
                    <th>Tên học phần</th>
                    <th>Tên lớp</th>
                    <th>Giảng viên</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th style={{ width: 150 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((lop, i) => (
                    <tr key={lop.id}>
                      <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td>{lop.maLopHocPhan}</td>
                      <td>{lop.tenHocPhan}</td>
                      <td>{lop.tenLop || '—'}</td>
                      <td>{lop.tenGiangVien || '—'}</td>
                      <td>{lop.ngayBatDau ? new Date(lop.ngayBatDau).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—'}</td>
                      <td>{lop.ngayKetThuc ? new Date(lop.ngayKetThuc).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—'}</td>
                      <td>
                        <div className="d-flex gap-1" style={{ whiteSpace: 'nowrap' }}>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Danh sách sinh viên"
                            onClick={() => {
                              setSelectedLop(lop)
                              setShowModal(true)
                            }}
                          >
                            <i className="bi bi-people"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => navigate(`/admin/sua-diem/${lop.id}`)}
                            title="Sửa điểm"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate(`/admin/lophocphan/edit/${lop.id}`, { state: lop })}
                            title="Sửa"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setConfirmDelete(lop)}
                            title="Xoá"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Phân trang */}
        {filtered.length > 0 && (() => {
          const totalPages = Math.ceil(filtered.length / itemsPerPage)
          const startIndex = (currentPage - 1) * itemsPerPage
          const endIndex = Math.min(currentPage * itemsPerPage, filtered.length)
          
          return (
            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Hiển thị {startIndex + 1} - {endIndex} / {filtered.length} bản ghi
              </div>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </button>
                  </li>
                  {(() => {
                    const pages = []
                    const maxVisible = 5
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                    
                    if (endPage - startPage < maxVisible - 1) {
                      startPage = Math.max(1, endPage - maxVisible + 1)
                    }
                    
                    if (startPage > 1) {
                      pages.push(
                        <li key={1} className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(1)}>1</button>
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
                        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i)}>{i}</button>
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
                        <li key={totalPages} className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
                        </li>
                      )
                    }
                    
                    return pages
                  })()}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )
        })()}
      </div>

      {/* Modal danh sách sinh viên */}
      <DanhSachSinhVienModal
        show={showModal}
        onHide={() => setShowModal(false)}
        lopHocPhan={selectedLop}
      />
    </AdminLayout>
  )
}