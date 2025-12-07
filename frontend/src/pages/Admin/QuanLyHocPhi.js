import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'
import dayjs from 'dayjs'

export default function QuanLyHocPhi() {
  const [data, setData] = useState([])
  const [thongKe, setThongKe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })
  
  // Filters
  const [filters, setFilters] = useState({
    hocKy: '',
    namHoc: '',
    tinhTrang: '',
    search: ''
  })

  // Modal cập nhật hạn nộp
  const [showModalHanNop, setShowModalHanNop] = useState(false)
  const [dotDangKyList, setDotDangKyList] = useState([])
  const [selectedDot, setSelectedDot] = useState('')
  const [hanNop, setHanNop] = useState('')
  
  // Notification và confirm
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })
  const [confirmAction, setConfirmAction] = useState(null)

  // Load dữ liệu
  useEffect(() => {
    loadData()
    loadThongKe()
    loadDotDangKy()
  }, [filters, pagination.page])

  const loadData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      })
      const result = await apiFetch(`/api/hoc-phi/admin/all?${params}`)
      setData(result.data || [])
      setPagination(result.pagination || {})
    } catch (error) {
      console.error('Lỗi load dữ liệu:', error)
      setNotification({ show: true, message: 'Lỗi khi tải dữ liệu học phí', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    } finally {
      setLoading(false)
    }
  }

  const loadThongKe = async () => {
    try {
      const result = await apiFetch('/api/hoc-phi/admin/thong-ke')
      setThongKe(result.data || {})
    } catch (error) {
      console.error('Lỗi load thống kê:', error)
    }
  }

  const loadDotDangKy = async () => {
    try {
      const result = await apiFetch('/api/dot-dang-ky')
      setDotDangKyList(result || [])
    } catch (error) {
      console.error('Lỗi load đợt đăng ký:', error)
    }
  }

  // Cập nhật trạng thái thanh toán
  const handleUpdateStatus = async (dangKyId, tinhTrang) => {
    setConfirmAction({
      title: 'Xác nhận cập nhật',
      message: `Xác nhận chuyển trạng thái sang "${tinhTrang}"?`,
      onConfirm: () => executeUpdateStatus(dangKyId, tinhTrang)
    })
  }
  
  const executeUpdateStatus = async (dangKyId, tinhTrang) => {
    setConfirmAction(null)

    try {
      await apiFetch(`/api/hoc-phi/${dangKyId}/trang-thai`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tinhTrang })
      })
      setNotification({ show: true, message: 'Cập nhật thành công!', type: 'success' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
      loadData()
      loadThongKe()
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error)
      setNotification({ show: true, message: 'Lỗi khi cập nhật trạng thái', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    }
  }

  // Cập nhật hạn nộp theo đợt
  const handleUpdateHanNopTheoDot = async () => {
    if (!selectedDot || !hanNop) {
      setNotification({ show: true, message: 'Vui lòng chọn đợt đăng ký và nhập hạn nộp', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
      return
    }
    
    setConfirmAction({
      title: 'Xác nhận cập nhật hạn nộp',
      message: 'Xác nhận cập nhật hạn nộp cho tất cả sinh viên trong đợt này?',
      onConfirm: executeUpdateHanNop
    })
  }
  
  const executeUpdateHanNop = async () => {
    setConfirmAction(null)

    try {
      const result = await apiFetch('/api/hoc-phi/admin/han-nop-dot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dotDangKyId: selectedDot,
          hanNop
        })
      })
      setNotification({ show: true, message: result.message || 'Cập nhật thành công!', type: 'success' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
      setShowModalHanNop(false)
      setSelectedDot('')
      setHanNop('')
      loadData()
    } catch (error) {
      console.error('Lỗi cập nhật hạn nộp:', error)
      setNotification({ show: true, message: 'Lỗi khi cập nhật hạn nộp', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    }
  }

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '0 đ'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  // Render status badge
  const renderStatusBadge = (status) => {
    const badges = {
      'Đã nộp': 'success',
      'Chưa nộp': 'warning',
      'Quá hạn': 'danger'
    }
    return (
      <span className={`badge bg-${badges[status] || 'secondary'}`}>
        {status}
      </span>
    )
  }

  return (
    <AdminLayout title="Quản lý học phí">
      <div className="container-fluid">
        {/* Thống kê tổng quan */}
        {thongKe && (
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Tổng học phí</p>
                      <h5 className="mb-0">{formatCurrency(thongKe.tongTien)}</h5>
                    </div>
                    <div className="text-primary fs-2">
                      <i className="bi bi-cash-stack"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Đã thu</p>
                      <h5 className="mb-0 text-success">{formatCurrency(thongKe.daThanhToan)}</h5>
                    </div>
                    <div className="text-success fs-2">
                      <i className="bi bi-check-circle"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Còn nợ</p>
                      <h5 className="mb-0 text-danger">{formatCurrency(thongKe.conNo)}</h5>
                    </div>
                    <div className="text-danger fs-2">
                      <i className="bi bi-exclamation-circle"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Tổng môn học</p>
                      <h5 className="mb-0">{thongKe.tongSoHocPhan}</h5>
                      <small className="text-muted">
                        <span className="text-success">{thongKe.soHocPhanDaNop} đã nộp</span> • 
                        <span className="text-warning ms-1">{thongKe.soHocPhanChuaNop} chưa nộp</span>
                      </small>
                    </div>
                    <div className="text-info fs-2">
                      <i className="bi bi-book"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label small">Học kỳ</label>
                <select
                  className="form-select"
                  value={filters.hocKy}
                  onChange={(e) => setFilters({ ...filters, hocKy: e.target.value })}
                >
                  <option value="">Tất cả</option>
                  <option value="HK1">HK1</option>
                  <option value="HK2">HK2</option>
                  <option value="HK3">HK3</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">Năm học</label>
                <select
                  className="form-select"
                  value={filters.namHoc}
                  onChange={(e) => setFilters({ ...filters, namHoc: e.target.value })}
                >
                  <option value="">Tất cả</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">Tình trạng</label>
                <select
                  className="form-select"
                  value={filters.tinhTrang}
                  onChange={(e) => setFilters({ ...filters, tinhTrang: e.target.value })}
                >
                  <option value="">Tất cả</option>
                  <option value="Đã nộp">Đã nộp</option>
                  <option value="Chưa nộp">Chưa nộp</option>
                  <option value="Quá hạn">Quá hạn</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">Tìm kiếm</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Mã SV hoặc tên SV..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowModalHanNop(true)}
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  Cập nhật hạn nộp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <h6 className="mb-0">Danh sách học phí ({pagination.total || 0})</h6>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>STT</th>
                      <th>Mã SV</th>
                      <th>Tên sinh viên</th>
                      <th>Mã HP</th>
                      <th>Tên học phần</th>
                      <th>TC</th>
                      <th>Học kỳ</th>
                      <th>Năm học</th>
                      <th>Học phí</th>
                      <th>Hạn nộp</th>
                      <th>Tình trạng</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="text-center text-muted py-4">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <tr key={item.dangKyId}>
                          <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                          <td>
                            <span className="badge bg-secondary">{item.maSv}</span>
                          </td>
                          <td>{item.hoTen}</td>
                          <td>{item.maHocPhan}</td>
                          <td>{item.tenHocPhan}</td>
                          <td className="text-center">{item.soTinChi}</td>
                          <td>{item.hocKy}</td>
                          <td>{item.namHoc}</td>
                          <td className="text-end fw-bold">{formatCurrency(item.soTien)}</td>
                          <td>
                            {item.hanNop ? dayjs(item.hanNop).format('DD/MM/YYYY') : (
                              <span className="text-muted">---</span>
                            )}
                          </td>
                          <td>{renderStatusBadge(item.trangThaiThucTe)}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleUpdateStatus(item.dangKyId, 'Đã nộp')}
                                disabled={item.tinhTrang === 'Đã nộp'}
                                title="Đánh dấu đã nộp"
                              >
                                <i className="bi bi-check"></i>
                              </button>
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => handleUpdateStatus(item.dangKyId, 'Chưa nộp')}
                                disabled={item.tinhTrang === 'Chưa nộp'}
                                title="Đánh dấu chưa nộp"
                              >
                                <i className="bi bi-clock"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {pagination.totalPages > 1 && (
            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} bản ghi
              </div>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                    >
                      Trước
                    </button>
                  </li>
                  {(() => {
                    const pages = []
                    const maxVisible = 5
                    const currentPage = pagination.page
                    const totalPages = pagination.totalPages
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                    
                    if (endPage - startPage < maxVisible - 1) {
                      startPage = Math.max(1, endPage - maxVisible + 1)
                    }
                    
                    if (startPage > 1) {
                      pages.push(
                        <li key={1} className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPagination({ ...pagination, page: 1 })}>1</button>
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
                          <button className="page-link" onClick={() => setPagination({ ...pagination, page: i })}>{i}</button>
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
                          <button className="page-link" onClick={() => setPagination({ ...pagination, page: totalPages })}>{totalPages}</button>
                        </li>
                      )
                    }
                    
                    return pages
                  })()}
                  <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Modal cập nhật hạn nộp */}
      {showModalHanNop && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cập nhật hạn nộp theo đợt</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModalHanNop(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Đợt đăng ký</label>
                  <select
                    className="form-select"
                    value={selectedDot}
                    onChange={(e) => setSelectedDot(e.target.value)}
                  >
                    <option value="">Chọn đợt đăng ký</option>
                    {dotDangKyList.map((dot) => (
                      <option key={dot.id} value={dot.id}>
                        {dot.ten_dot} ({dot.hoc_ky} - {dot.nam_hoc})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Hạn nộp</label>
                  <input
                    type="date"
                    className="form-control"
                    value={hanNop}
                    onChange={(e) => setHanNop(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModalHanNop(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateHanNopTheoDot}
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`position-fixed top-0 start-50 translate-middle-x mt-3`}
          style={{ zIndex: 9999 }}
        >
          <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show shadow-lg`} role="alert">
            <i className={`bi bi-${notification.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
            {notification.message}
            <button type="button" className="btn-close" onClick={() => setNotification({ show: false, message: '', type: '' })}></button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">⚠️ {confirmAction.title}</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmAction(null)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">{confirmAction.message}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>
                  Hủy
                </button>
                <button className="btn btn-primary" onClick={confirmAction.onConfirm}>
                  <i className="bi bi-check-circle me-1"></i> Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}