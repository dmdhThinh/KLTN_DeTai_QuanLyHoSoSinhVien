import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'
import { formatVNTime, formatChatTime } from '../../utils/dayjs'

export default function YeuCauTuVanAdmin() {
  const [yeuCauList, setYeuCauList] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Chi tiết yêu cầu và conversation
  const [selectedYeuCau, setSelectedYeuCau] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [tinNhanList, setTinNhanList] = useState([])
  const [tinNhanMoi, setTinNhanMoi] = useState('')
  
  // Notification
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      
      // Load danh sách yêu cầu gửi tới Admin
      const yeuCau = await apiFetch('/api/yeu-cau-tu-van/admin/all')
      setYeuCauList(yeuCau.data || [])
    } catch (error) {
      console.error('Lỗi load dữ liệu:', error)
      if (showLoading) {
        setNotification({ show: true, message: 'Lỗi khi tải dữ liệu', type: 'error' })
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
      }
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(true)
    
    // Auto-refresh mỗi 5 giây
    const interval = setInterval(() => {
      loadData(false)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [loadData])

  // Xem chi tiết yêu cầu
  const handleViewDetail = async (yeuCau) => {
    try {
      setSelectedYeuCau(yeuCau)
      
      // Load tin nhắn
      const response = await apiFetch(`/api/tin-nhan-tu-van/${yeuCau.id}`)
      setTinNhanList(response.data || [])
      
      setShowDetailModal(true)
      
      // Đánh dấu đã đọc (admin)
      try {
        await apiFetch(`/api/tin-nhan-tu-van/${yeuCau.id}/danh-dau-da-doc`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nguoi_doc: 'ADMIN' })
        })
        
        // Refresh danh sách để cập nhật badge
        loadData(false)
      } catch (err) {
        console.error('Lỗi đánh dấu đã đọc:', err)
      }
    } catch (error) {
      console.error('Lỗi load chi tiết:', error)
      setNotification({ show: true, message: 'Lỗi khi tải chi tiết yêu cầu', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    }
  }

  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (showDetailModal && tinNhanList.length > 0) {
      const messageContainer = document.getElementById('messageContainer')
      if (messageContainer) {
        setTimeout(() => {
          messageContainer.scrollTop = messageContainer.scrollHeight
        }, 100)
      }
    }
  }, [tinNhanList, showDetailModal])

  // ✅ Auto-refresh conversation khi modal đang mở để nhận tin nhắn mới
  useEffect(() => {
    if (!showDetailModal || !selectedYeuCau) return

    const loadMessages = async () => {
      try {
        const response = await apiFetch(`/api/tin-nhan-tu-van/${selectedYeuCau.id}`)
        setTinNhanList(response.data || [])
      } catch (error) {
        console.error('Lỗi load tin nhắn:', error)
      }
    }

    // Load ngay lập tức
    loadMessages()

    // Auto-refresh mỗi 3 giây khi modal đang mở
    const interval = setInterval(loadMessages, 3000)

    return () => clearInterval(interval)
  }, [showDetailModal, selectedYeuCau?.id])

  // Gửi tin nhắn phản hồi
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
          nguoi_gui: 'ADMIN',
          noi_dung: tinNhanTam
        })
      })

      // ✅ Reload tin nhắn để lấy tin nhắn mới từ server
      const response = await apiFetch(`/api/tin-nhan-tu-van/${selectedYeuCau.id}`)
      setTinNhanList(response.data || [])
      
      // ✅ Đảm bảo modal vẫn mở và scroll xuống cuối
      setShowDetailModal(true)
      
      // Refresh danh sách
      loadData(false)
      
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
      
      if (selectedYeuCau?.id === yeuCauId) {
        setSelectedYeuCau({ ...selectedYeuCau, trang_thai: 'DANG_XU_LY' })
      }
      loadData(false)
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error)
      setNotification({ show: true, message: 'Lỗi khi cập nhật trạng thái', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    }
  }

  const renderStatusBadge = (trangThai) => {
    const statusMap = {
      'CHO_XU_LY': { text: 'Chờ xử lý', class: 'bg-warning text-dark' },
      'DANG_XU_LY': { text: 'Đang xử lý', class: 'bg-info text-white' },
      'DA_TRA_LOI': { text: 'Đã trả lời', class: 'bg-success' },
      'DA_HUY': { text: 'Đã hủy', class: 'bg-secondary' }
    }
    const status = statusMap[trangThai] || { text: trangThai, class: 'bg-secondary' }
    return <span className={`badge ${status.class}`}>{status.text}</span>
  }

  if (loading) {
    return (
      <AdminLayout activeMenu="tu-van" title="Yêu cầu tư vấn">
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeMenu="tu-van" title="Yêu cầu tư vấn từ Sinh viên">
      <div className="card">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-chat-left-text me-2"></i>
            Danh sách yêu cầu tư vấn ({yeuCauList.length})
          </h5>
        </div>
        
        <div className="card-body">
          {yeuCauList.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
              <p className="mt-3">Chưa có yêu cầu tư vấn nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '5%' }}>STT</th>
                    <th style={{ width: '15%' }}>Sinh viên</th>
                    <th style={{ width: '10%' }}>Lớp</th>
                    <th style={{ width: '25%' }}>Tiêu đề</th>
                    <th style={{ width: '15%' }}>Thời gian</th>
                    <th style={{ width: '10%' }}>Trạng thái</th>
                    <th style={{ width: '10%' }}>Tin nhắn</th>
                    <th style={{ width: '10%' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {yeuCauList.map((yc, index) => (
                    <tr key={yc.id} className={yc.so_tin_chua_doc > 0 ? 'table-warning' : ''}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="fw-bold">{yc.ten_sinh_vien}</div>
                        <small className="text-muted">{yc.ma_sv}</small>
                      </td>
                      <td>
                        <small>{yc.ten_lop || '-'}</small>
                      </td>
                      <td>
                        <div className="fw-semibold">{yc.tieu_de}</div>
                        {yc.tin_nhan_cuoi && (
                          <small className="text-muted">
                            {yc.tin_nhan_cuoi.substring(0, 50)}...
                          </small>
                        )}
                      </td>
                      <td>
                        <small>{formatVNTime(yc.thoi_gian_gui)}</small>
                      </td>
                      <td>{renderStatusBadge(yc.trang_thai)}</td>
                      <td className="text-center">
                        {yc.so_tin_chua_doc > 0 && (
                          <span className="badge bg-danger rounded-pill">
                            {yc.so_tin_chua_doc}
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewDetail(yc)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          Xem
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

      {/* Modal chi tiết yêu cầu */}
      {showDetailModal && selectedYeuCau && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content" style={{ maxHeight: '90vh' }}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-chat-left-text me-2"></i>
                  {selectedYeuCau.tieu_de}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
              </div>
              
              <div className="modal-body">
                {/* Thông tin sinh viên */}
                <div className="card mb-3">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-2">
                          <strong>Sinh viên:</strong> {selectedYeuCau.ten_sinh_vien} ({selectedYeuCau.ma_sv})
                        </p>
                        <p className="mb-2">
                          <strong>Email:</strong> {selectedYeuCau.email_sinh_vien}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-2">
                          <strong>Lớp:</strong> {selectedYeuCau.ten_lop || '-'}
                        </p>
                        <p className="mb-2">
                          <strong>Thời gian:</strong> {formatVNTime(selectedYeuCau.thoi_gian_gui)}
                        </p>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div>
                        <strong>Trạng thái:</strong> {renderStatusBadge(selectedYeuCau.trang_thai)}
                      </div>
                      {selectedYeuCau.trang_thai === 'CHO_XU_LY' && (
                        <button
                          className="btn btn-sm btn-info text-white"
                          onClick={() => handleMarkAsProcessing(selectedYeuCau.id)}
                        >
                          <i className="bi bi-hourglass-split me-1"></i>
                          Đánh dấu đang xử lý
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conversation thread */}
                <div className="border rounded p-3 mb-3" style={{ backgroundColor: '#f8f9fa', maxHeight: '400px', overflowY: 'auto' }}>
                  {tinNhanList.map((tn) => {
                    const isAdmin = tn.nguoi_gui === 'ADMIN' || tn.nguoi_gui === 'GIANG_VIEN'
                    return (
                      <div key={tn.id} className="mb-2" style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
                        <div className="d-flex align-items-start gap-1" style={{ maxWidth: '75%' }}>
                          {!isAdmin && (
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                                 style={{ minWidth: '28px', height: '28px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {selectedYeuCau.ten_sinh_vien?.charAt(0) || 'S'}
                            </div>
                          )}
                          
                          <div>
                            <div 
                              className="rounded px-3 py-2"
                              style={{
                                display: 'inline-block',
                                maxWidth: '100%',
                                backgroundColor: isAdmin ? '#0d6efd' : '#e9ecef',
                                color: isAdmin ? 'white' : 'black',
                                borderRadius: '20px',
                                padding: '10px 16px'
                              }}
                            >
                              {tn.noi_dung}
                            </div>
                            <div className={`small text-muted mt-1 ${isAdmin ? 'text-end' : ''}`}>
                              {formatVNTime(tn.thoi_gian_gui)}
                            </div>
                          </div>

                          {isAdmin && (
                            <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" 
                                 style={{ minWidth: '28px', height: '28px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              A
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Form gửi tin nhắn */}
                <form onSubmit={handleGuiTinNhan}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập tin nhắn phản hồi..."
                      value={tinNhanMoi}
                      onChange={(e) => setTinNhanMoi(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-send me-1"></i>
                      Gửi
                    </button>
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 9999 }}>
          <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show shadow-lg`} role="alert">
            <i className={`bi bi-${notification.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
            {notification.message}
            <button type="button" className="btn-close" onClick={() => setNotification({ show: false, message: '', type: '' })}></button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
