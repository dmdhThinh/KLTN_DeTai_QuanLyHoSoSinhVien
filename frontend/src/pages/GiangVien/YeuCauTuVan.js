import React, { useState, useEffect, useCallback } from 'react'
import TeacherLayout from '../../components/TeacherLayout'
import { apiFetch, getGiangVienId } from '../../api'
import { formatVNTime, formatChatTime } from '../../utils/dayjs'

export default function YeuCauTuVanGiangVien() {
  const giangVienId = getGiangVienId()

  const [yeuCauList, setYeuCauList] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL') // ALL, CHO_XU_LY, DANG_XU_LY, DA_TRA_LOI

  // Modal phản hồi và conversation
  const [selectedYeuCau, setSelectedYeuCau] = useState(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [phanHoi, setPhanHoi] = useState('')
  const [tinNhanList, setTinNhanList] = useState([])
  const [tinNhanMoi, setTinNhanMoi] = useState('')

  // Modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Notification
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const result = await apiFetch(`/api/yeu-cau-tu-van/giang-vien/${giangVienId}`)
      setYeuCauList(result.data || [])
    } catch (error) {
      console.error('Lỗi load dữ liệu:', error)
      if (showLoading) {
        setNotification({ show: true, message: 'Lỗi khi tải dữ liệu', type: 'error' })
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
      }
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [giangVienId])

  useEffect(() => {
    loadData(true) // Lần đầu hiện loading
    
    // Auto-refresh mỗi 5 giây, không hiện loading
    const interval = setInterval(() => {
      loadData(false)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [loadData])

  // Lọc danh sách theo trạng thái
  const filteredList = filter === 'ALL' 
    ? yeuCauList 
    : yeuCauList.filter(yc => yc.trang_thai === filter)

  // Đánh dấu đang xử lý
  const handleMarkAsProcessing = async (yeuCauId) => {
    try {
      await apiFetch(`/api/yeu-cau-tu-van/${yeuCauId}/trang-thai`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trang_thai: 'DANG_XU_LY' })
      })
      setNotification({ show: true, message: 'Đã đánh dấu đang xử lý', type: 'success' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
      loadData(true)
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error)
      setNotification({ show: true, message: 'Lỗi khi cập nhật trạng thái', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    }
  }

  // Mở modal phản hồi (conversation thread)
  const handleOpenResponseModal = async (yeuCauId) => {
    try {
      // Load thông tin yêu cầu
      const result = await apiFetch(`/api/yeu-cau-tu-van/${yeuCauId}`)
      setSelectedYeuCau(result.data)
      
      // Load conversation thread
      const messages = await apiFetch(`/api/tin-nhan-tu-van/${yeuCauId}`)
      setTinNhanList(messages.data || [])
      
      setPhanHoi('')
      setTinNhanMoi('')
      setShowResponseModal(true)

      // Đánh dấu đã đọc tin nhắn của sinh viên → Badge giảm ngay
      if (result.data.so_tin_chua_doc_gv > 0) {
        await apiFetch(`/api/tin-nhan-tu-van/${yeuCauId}/danh-dau-da-doc`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nguoi_doc: 'GIANG_VIEN' })
        }).catch(() => {})
        
        // Cập nhật badge ngay lập tức
        if (window.refreshTuVanCount) {
          setTimeout(() => window.refreshTuVanCount(), 500)
        }
        
        // Reload danh sách để cập nhật số tin chưa đọc
        loadData(false)
      }
    } catch (error) {
      console.error('Lỗi load chi tiết:', error)
      setNotification({ show: true, message: 'Lỗi khi tải chi tiết yêu cầu', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    }
  }

  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (showResponseModal && tinNhanList.length > 0) {
      const messageContainer = document.getElementById('messageContainer')
      if (messageContainer) {
        setTimeout(() => {
          messageContainer.scrollTop = messageContainer.scrollHeight
        }, 100)
      }
    }
  }, [tinNhanList, showResponseModal])

  // ✅ Auto-refresh conversation khi modal đang mở để nhận tin nhắn mới
  useEffect(() => {
    if (!showResponseModal || !selectedYeuCau) return

    const loadMessages = async () => {
      try {
        const messages = await apiFetch(`/api/tin-nhan-tu-van/${selectedYeuCau.id}`)
        setTinNhanList(messages.data || [])
      } catch (error) {
        console.error('Lỗi load tin nhắn:', error)
      }
    }

    // Load ngay lập tức
    loadMessages()

    // Auto-refresh mỗi 3 giây khi modal đang mở
    const interval = setInterval(loadMessages, 3000)

    return () => clearInterval(interval)
  }, [showResponseModal, selectedYeuCau?.id])

  // Gửi tin nhắn trong conversation
  const handleGuiTinNhan = async (e) => {
    e.preventDefault()

    if (!tinNhanMoi.trim()) {
      setNotification({ show: true, message: 'Vui lòng nhập nội dung tin nhắn', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
      return
    }

    // Lưu nội dung tin nhắn để hiển thị ngay (optimistic update)
    const tinNhanTam = tinNhanMoi.trim()
    setTinNhanMoi('') // Xóa input ngay để UX tốt hơn

    try {
      await apiFetch('/api/tin-nhan-tu-van', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yeu_cau_id: selectedYeuCau.id,
          nguoi_gui: 'GIANG_VIEN',
          noi_dung: tinNhanTam
        })
      })

      // ✅ Reload conversation để lấy tin nhắn mới từ server
      const messages = await apiFetch(`/api/tin-nhan-tu-van/${selectedYeuCau.id}`)
      setTinNhanList(messages.data || [])
      
      // ✅ Đảm bảo modal vẫn mở và scroll xuống cuối
      setShowResponseModal(true)
      
      // Reload danh sách
      loadData(false)
      
      // Cập nhật badge ngay lập tức
      if (window.refreshTuVanCount) {
        setTimeout(() => window.refreshTuVanCount(), 500)
      }
      
      // Scroll xuống cuối sau khi tin nhắn được thêm
      setTimeout(() => {
        const messageContainer = document.getElementById('messageContainer')
        if (messageContainer) {
          messageContainer.scrollTop = messageContainer.scrollHeight
        }
      }, 200)
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error)
      // Nếu lỗi, khôi phục lại input
      setTinNhanMoi(tinNhanTam)
      setNotification({ show: true, message: 'Lỗi khi gửi tin nhắn', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    }
  }

  // Xem chi tiết
  const handleViewDetail = async (yeuCauId) => {
    try {
      const result = await apiFetch(`/api/yeu-cau-tu-van/${yeuCauId}`)
      setSelectedYeuCau(result.data)
      setShowDetailModal(true)

      // Đánh dấu đã đọc tin nhắn của sinh viên → Badge giảm ngay
      if (result.data.so_tin_chua_doc_gv > 0) {
        await apiFetch(`/api/tin-nhan-tu-van/${yeuCauId}/danh-dau-da-doc`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nguoi_doc: 'GIANG_VIEN' })
        }).catch(() => {})
        
        // Cập nhật badge ngay lập tức
        if (window.refreshTuVanCount) {
          setTimeout(() => window.refreshTuVanCount(), 500)
        }
        
        // Reload danh sách để cập nhật số tin chưa đọc
        loadData(false)
      }
    } catch (error) {
      console.error('Lỗi load chi tiết:', error)
      setNotification({ show: true, message: 'Lỗi khi tải chi tiết yêu cầu', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    }
  }

  // Render status badge
  const renderStatusBadge = (status) => {
    const badges = {
      'CHO_XU_LY': { bg: 'warning', text: 'Chờ xử lý' },
      'DANG_XU_LY': { bg: 'info', text: 'Đang xử lý' },
      'DA_TRA_LOI': { bg: 'success', text: 'Đã trả lời' },
      'DA_HUY': { bg: 'secondary', text: 'Đã hủy' }
    }
    const badge = badges[status] || { bg: 'secondary', text: status }
    return <span className={`badge bg-${badge.bg}`}>{badge.text}</span>
  }

  // Thống kê
  const stats = {
    total: yeuCauList.length,
    choXuLy: yeuCauList.filter(yc => yc.trang_thai === 'CHO_XU_LY').length,
    dangXuLy: yeuCauList.filter(yc => yc.trang_thai === 'DANG_XU_LY').length,
    daTraLoi: yeuCauList.filter(yc => yc.trang_thai === 'DA_TRA_LOI').length
  }

  return (
    <TeacherLayout title="Yêu cầu tư vấn">
      <div className="container-fluid">
        {/* Thống kê */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">Tổng yêu cầu</p>
                    <h4 className="mb-0">{stats.total}</h4>
                  </div>
                  <div className="text-primary fs-2">
                    <i className="bi bi-inbox"></i>
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
                    <p className="text-muted mb-1">Chờ xử lý</p>
                    <h4 className="mb-0 text-warning">{stats.choXuLy}</h4>
                  </div>
                  <div className="text-warning fs-2">
                    <i className="bi bi-clock"></i>
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
                    <p className="text-muted mb-1">Đang xử lý</p>
                    <h4 className="mb-0 text-info">{stats.dangXuLy}</h4>
                  </div>
                  <div className="text-info fs-2">
                    <i className="bi bi-hourglass-split"></i>
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
                    <p className="text-muted mb-1">Đã trả lời</p>
                    <h4 className="mb-0 text-success">{stats.daTraLoi}</h4>
                  </div>
                  <div className="text-success fs-2">
                    <i className="bi bi-check-circle"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <button
                  className={`nav-link ${filter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setFilter('ALL')}
                >
                  Tất cả ({stats.total})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${filter === 'CHO_XU_LY' ? 'active' : ''}`}
                  onClick={() => setFilter('CHO_XU_LY')}
                >
                  Chờ xử lý ({stats.choXuLy})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${filter === 'DANG_XU_LY' ? 'active' : ''}`}
                  onClick={() => setFilter('DANG_XU_LY')}
                >
                  Đang xử lý ({stats.dangXuLy})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${filter === 'DA_TRA_LOI' ? 'active' : ''}`}
                  onClick={() => setFilter('DA_TRA_LOI')}
                >
                  Đã trả lời ({stats.daTraLoi})
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Danh sách yêu cầu */}
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>STT</th>
                      <th>Sinh viên</th>
                      <th>Lớp HP</th>
                      <th>Tiêu đề</th>
                      <th>Thời gian gửi</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          Không có yêu cầu nào
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((yc, index) => (
                        <tr key={yc.id}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="small">
                              <div className="fw-bold">{yc.ten_sinh_vien}</div>
                              <div className="text-muted">{yc.ma_sv}</div>
                            </div>
                          </td>
                          <td>
                            <div className="small">
                              <div>{yc.ten_hoc_phan}</div>
                              <div className="text-muted">{yc.ma_lop_hoc_phan}</div>
                            </div>
                          </td>
                          <td>
                            <strong>{yc.tieu_de}</strong>
                            {yc.so_tin_chua_doc_gv > 0 && (
                              <span className="badge bg-danger ms-2">
                                {yc.so_tin_chua_doc_gv} tin mới
                              </span>
                            )}
                          </td>
                          <td>{formatVNTime(yc.thoi_gian_gui)}</td>
                          <td>{renderStatusBadge(yc.trang_thai)}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleViewDetail(yc.id)}
                                title="Xem chi tiết"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              {yc.trang_thai === 'CHO_XU_LY' && (
                                <button
                                  className="btn btn-outline-info"
                                  onClick={() => handleMarkAsProcessing(yc.id)}
                                  title="Đánh dấu đang xử lý"
                                >
                                  <i className="bi bi-hourglass"></i>
                                </button>
                              )}
                              {(yc.trang_thai === 'CHO_XU_LY' || yc.trang_thai === 'DANG_XU_LY') && (
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => handleOpenResponseModal(yc.id)}
                                  title="Phản hồi"
                                >
                                  <i className="bi bi-reply"></i>
                                </button>
                              )}
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
        )}
      </div>

      {/* Modal phản hồi */}
      {showResponseModal && selectedYeuCau && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Phản hồi yêu cầu tư vấn</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowResponseModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Thông tin yêu cầu */}
                <div className="bg-light p-3 rounded mb-3">
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <strong>Sinh viên:</strong> {selectedYeuCau.ten_sinh_vien} ({selectedYeuCau.ma_sv})
                    </div>
                    <div className="col-md-6">
                      <strong>Lớp:</strong> {selectedYeuCau.ten_hoc_phan} - {selectedYeuCau.ma_lop_hoc_phan}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Trạng thái:</strong> {renderStatusBadge(selectedYeuCau.trang_thai)}
                    </div>
                    <div className="col-md-6">
                      <strong>Tiêu đề:</strong> {selectedYeuCau.tieu_de}
                    </div>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="border rounded shadow-sm" style={{ height: '450px', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
                  {/* Danh sách tin nhắn */}
                  <div 
                    className="flex-grow-1 p-3 overflow-auto" 
                    style={{ 
                      backgroundColor: '#f0f2f5',
                      backgroundImage: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)'
                    }}
                    id="messageContainer"
                  >
                    {tinNhanList.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <i className="bi bi-chat-dots" style={{ fontSize: '3.5rem', opacity: 0.3 }}></i>
                        <p className="mt-3 fw-light">Bắt đầu cuộc trò chuyện</p>
                      </div>
                    ) : (
                      tinNhanList.map((tn, index) => (
                        <div
                          key={index}
                          className={`mb-2 d-flex ${tn.nguoi_gui === 'GIANG_VIEN' ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                          <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: tn.nguoi_gui === 'GIANG_VIEN' ? 'flex-end' : 'flex-start' }}>
                            <div className={`d-flex align-items-center gap-1 mb-1 ${tn.nguoi_gui === 'GIANG_VIEN' ? 'flex-row-reverse' : ''}`}>
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{ 
                                  width: '28px', 
                                  height: '28px', 
                                  fontSize: '0.75rem',
                                  backgroundColor: tn.nguoi_gui === 'GIANG_VIEN' ? '#198754' : '#0d6efd'
                                }}
                              >
                                {tn.nguoi_gui === 'GIANG_VIEN' ? 'GV' : 'SV'}
                              </div>
                              <div className="small">
                                <div className={`fw-semibold ${tn.nguoi_gui === 'GIANG_VIEN' ? 'text-end' : ''}`}>
                                  {tn.nguoi_gui === 'GIANG_VIEN' ? 'Bạn' : selectedYeuCau.ten_sinh_vien}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {formatChatTime(tn.thoi_gian_gui)}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`shadow-sm ${
                                tn.nguoi_gui === 'GIANG_VIEN'
                                  ? 'bg-success text-white'
                                  : 'bg-white text-dark'
                              }`}
                              style={{ 
                                whiteSpace: 'pre-wrap', 
                                wordBreak: 'break-word',
                                borderRadius: '20px',
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                padding: '10px 16px',
                                display: 'inline-block',
                                maxWidth: '100%'
                              }}
                            >
                              {tn.noi_dung}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Form gửi tin nhắn */}
                  {selectedYeuCau.trang_thai !== 'DA_HUY' && (
                    <form onSubmit={handleGuiTinNhan} className="border-top p-3 bg-white">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nhập tin nhắn phản hồi..."
                          value={tinNhanMoi}
                          onChange={(e) => setTinNhanMoi(e.target.value)}
                        />
                        <button type="submit" className="btn btn-success" disabled={!tinNhanMoi.trim()}>
                          <i className="bi bi-send me-1"></i>
                          Gửi
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowResponseModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết */}
      {showDetailModal && selectedYeuCau && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết yêu cầu tư vấn</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Sinh viên:</strong>
                    <div>{selectedYeuCau.ten_sinh_vien} ({selectedYeuCau.ma_sv})</div>
                    <div className="text-muted small">{selectedYeuCau.email_sinh_vien}</div>
                  </div>
                  <div className="col-md-6">
                    <strong>Lớp học phần:</strong>
                    <div>{selectedYeuCau.ten_hoc_phan}</div>
                    <div className="text-muted">{selectedYeuCau.ma_lop_hoc_phan}</div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Trạng thái:</strong>
                    <div>{renderStatusBadge(selectedYeuCau.trang_thai)}</div>
                  </div>
                  <div className="col-md-6">
                    <strong>Thời gian gửi:</strong>
                    <div>{formatVNTime(selectedYeuCau.thoi_gian_gui)}</div>
                  </div>
                </div>

                <hr />

                <div className="mb-3">
                  <strong>Tiêu đề:</strong>
                  <div className="mt-2">{selectedYeuCau.tieu_de}</div>
                </div>

                <div className="mb-3">
                  <strong>Nội dung:</strong>
                  <div className="mt-2 p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedYeuCau.noi_dung}
                  </div>
                </div>

                {selectedYeuCau.phan_hoi && (
                  <>
                    <hr />
                    <div className="mb-3">
                      <strong>Phản hồi:</strong>
                      <div className="text-muted small">
                        {formatVNTime(selectedYeuCau.thoi_gian_phan_hoi)}
                      </div>
                      <div className="mt-2 p-3 bg-success bg-opacity-10 rounded border border-success" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedYeuCau.phan_hoi}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
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
    </TeacherLayout>
  )
}
