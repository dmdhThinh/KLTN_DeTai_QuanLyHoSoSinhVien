import React, { useState, useEffect, useCallback } from 'react'
import StudentLayout from '../../components/StudentLayout'
import { apiFetch, getSinhVienId } from '../../api'
import { AlertModal } from '../../components/Modal'
import dayjs from 'dayjs'

export default function YeuCauTuVan() {
  const sinhVienId = getSinhVienId()

  const [lopHocPhanList, setLopHocPhanList] = useState([])
  const [yeuCauList, setYeuCauList] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Form gửi yêu cầu
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    loai_nguoi_nhan: 'GIANG_VIEN', // Mới: chọn gửi tới ai
    lop_hoc_phan_id: '',
    giang_vien_id: '',
    tieu_de: '',
    noi_dung: ''
  })

  // Chi tiết yêu cầu và conversation
  const [selectedYeuCau, setSelectedYeuCau] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [tinNhanList, setTinNhanList] = useState([])
  const [tinNhanMoi, setTinNhanMoi] = useState('')
  
  // Notification và confirm modals
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' })
  const [confirmCancel, setConfirmCancel] = useState(null)

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      
      // Load danh sách lớp học phần
      const lopHocPhan = await apiFetch(`/api/yeu-cau-tu-van/lop-hoc-phan/${sinhVienId}`)
      setLopHocPhanList(lopHocPhan.data || [])

      // Load danh sách yêu cầu
      const yeuCau = await apiFetch(`/api/yeu-cau-tu-van/sinh-vien/${sinhVienId}`)
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
  }, [sinhVienId])

  useEffect(() => {
    loadData(true) // Lần đầu hiện loading
    
    // Auto-refresh mỗi 5 giây, không hiện loading
    const interval = setInterval(() => {
      loadData(false)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [loadData])

  // Chọn lớp học phần → tự động điền giảng viên
  const handleSelectLopHocPhan = (e) => {
    const lopId = e.target.value
    const lop = lopHocPhanList.find(l => l.lop_hoc_phan_id === Number(lopId))
    
    setFormData({
      ...formData,
      lop_hoc_phan_id: lopId,
      giang_vien_id: lop?.giang_vien_id || ''
    })
  }

  // Gửi yêu cầu tư vấn
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate theo loại người nhận
    if (formData.loai_nguoi_nhan === 'GIANG_VIEN') {
      if (!formData.lop_hoc_phan_id || !formData.tieu_de || !formData.noi_dung) {
        setNotification({ show: true, message: 'Vui lòng điền đầy đủ thông tin', type: 'error' })
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
        return
      }
    } else {
      // Gửi tới Admin chỉ cần tiêu đề và nội dung
      if (!formData.tieu_de || !formData.noi_dung) {
        setNotification({ show: true, message: 'Vui lòng điền tiêu đề và nội dung', type: 'error' })
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
        return
      }
    }

    try {
      const payload = {
        sinh_vien_id: sinhVienId,
        loai_nguoi_nhan: formData.loai_nguoi_nhan,
        tieu_de: formData.tieu_de,
        noi_dung: formData.noi_dung
      }

      // Nếu gửi tới giảng viên, thêm thông tin lớp học phần
      if (formData.loai_nguoi_nhan === 'GIANG_VIEN') {
        payload.giang_vien_id = formData.giang_vien_id
        payload.lop_hoc_phan_id = formData.lop_hoc_phan_id
      }

      await apiFetch('/api/yeu-cau-tu-van', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      setNotification({ show: true, message: 'Gửi yêu cầu tư vấn thành công!', type: 'success' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)

      setShowModal(false)
      setFormData({
        loai_nguoi_nhan: 'GIANG_VIEN',
        lop_hoc_phan_id: '',
        giang_vien_id: '',
        tieu_de: '',
        noi_dung: ''
      })
      loadData(false)
    } catch (error) {
      console.error('Lỗi gửi yêu cầu:', error)
      setNotification({ show: true, message: 'Lỗi khi gửi yêu cầu tư vấn', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    }
  }

  // Xem chi tiết yêu cầu và conversation
  const handleViewDetail = async (yeuCauId) => {
    try {
      // Load thông tin yêu cầu
      const result = await apiFetch(`/api/yeu-cau-tu-van/${yeuCauId}`)
      setSelectedYeuCau(result.data)
      
      // Load conversation thread
      const messages = await apiFetch(`/api/tin-nhan-tu-van/${yeuCauId}`)
      setTinNhanList(messages.data || [])
      
      setShowDetailModal(true)
      setTinNhanMoi('')

      // Đánh dấu đã đọc tin nhắn của giảng viên → Badge giảm ngay
      if (result.data.so_tin_chua_doc_sv > 0) {
        await apiFetch(`/api/tin-nhan-tu-van/${yeuCauId}/danh-dau-da-doc`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nguoi_doc: 'SINH_VIEN' })
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
      setAlertModal({ show: true, message: 'Lỗi khi tải chi tiết yêu cầu', type: 'danger' })
    }
  }

  // Gửi tin nhắn mới
  const handleGuiTinNhan = async (e) => {
    e.preventDefault()
    
    if (!tinNhanMoi.trim()) {
      setAlertModal({ show: true, message: 'Vui lòng nhập nội dung tin nhắn', type: 'warning' })
      return
    }
    
    try {
      await apiFetch('/api/tin-nhan-tu-van', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yeu_cau_id: selectedYeuCau.id,
          nguoi_gui: 'SINH_VIEN',
          noi_dung: tinNhanMoi
        })
      })
      
      // Reload conversation
      const messages = await apiFetch(`/api/tin-nhan-tu-van/${selectedYeuCau.id}`)
      setTinNhanList(messages.data || [])
      setTinNhanMoi('')
      
      // Reload danh sách để cập nhật tin nhắn cuối
      loadData(false)
      
      // Cập nhật badge ngay lập tức (badge giảm khi trả lời)
      if (window.refreshTuVanCount) {
        setTimeout(() => window.refreshTuVanCount(), 500)
      }
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error)
      setNotification({ show: true, message: 'Lỗi khi gửi tin nhắn', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
    }
  }

  // Hủy yêu cầu
  const handleCancel = async () => {
    if (!confirmCancel) return
    const yeuCauId = confirmCancel
    setConfirmCancel(null)

    try {
      await apiFetch(`/api/yeu-cau-tu-van/${yeuCauId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sinh_vien_id: sinhVienId })
      })

      setNotification({ show: true, message: 'Hủy yêu cầu thành công!', type: 'success' })
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
      loadData(true)
    } catch (error) {
      console.error('Lỗi hủy yêu cầu:', error)
      setNotification({ show: true, message: 'Lỗi khi hủy yêu cầu', type: 'error' })
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

  return (
    <StudentLayout title="Yêu cầu tư vấn">
      <div className="container-fluid">
        {/* Header actions */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Danh sách yêu cầu tư vấn</h5>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Gửi yêu cầu mới
          </button>
        </div>

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
                      <th>Tiêu đề</th>
                      <th>Lớp học phần</th>
                      <th>Giảng viên</th>
                      <th>Thời gian gửi</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yeuCauList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          Chưa có yêu cầu tư vấn nào
                        </td>
                      </tr>
                    ) : (
                      yeuCauList.map((yc, index) => (
                        <tr key={yc.id}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{yc.tieu_de}</strong>
                            {yc.so_tin_chua_doc_sv > 0 && (
                              <span className="badge bg-danger ms-2">
                                {yc.so_tin_chua_doc_sv} tin mới
                              </span>
                            )}
                          </td>
                          <td>
                            {yc.loai_nguoi_nhan === 'ADMIN' ? (
                              <span className="badge bg-success">Phòng đào tạo</span>
                            ) : (
                              <div className="small">
                                <div className="fw-bold">{yc.ten_hoc_phan}</div>
                                <div className="text-muted">{yc.ma_lop_hoc_phan}</div>
                              </div>
                            )}
                          </td>
                          <td>{yc.ten_giang_vien || <span className="text-muted">Admin</span>}</td>
                          <td>{dayjs(yc.thoi_gian_gui).format('DD/MM/YYYY HH:mm')}</td>
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
                                  className="btn btn-outline-danger"
                                  onClick={() => setConfirmCancel(yc.id)}
                                  title="Hủy yêu cầu"
                                >
                                  <i className="bi bi-x-circle"></i>
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

      {/* Modal gửi yêu cầu */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Gửi yêu cầu tư vấn</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Chọn người nhận */}
                  <div className="mb-3">
                    <label className="form-label">Gửi yêu cầu tới <span className="text-danger">*</span></label>
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="loai_nguoi_nhan"
                        id="radio-giang-vien"
                        value="GIANG_VIEN"
                        checked={formData.loai_nguoi_nhan === 'GIANG_VIEN'}
                        onChange={(e) => setFormData({ ...formData, loai_nguoi_nhan: e.target.value, lop_hoc_phan_id: '', giang_vien_id: '' })}
                      />
                      <label className="btn btn-outline-primary" htmlFor="radio-giang-vien">
                        <i className="bi bi-person me-2"></i>
                        Giảng viên
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="loai_nguoi_nhan"
                        id="radio-admin"
                        value="ADMIN"
                        checked={formData.loai_nguoi_nhan === 'ADMIN'}
                        onChange={(e) => setFormData({ ...formData, loai_nguoi_nhan: e.target.value, lop_hoc_phan_id: '', giang_vien_id: '' })}
                      />
                      <label className="btn btn-outline-success" htmlFor="radio-admin">
                        <i className="bi bi-shield-check me-2"></i>
                        Phòng đào tạo (Admin)
                      </label>
                    </div>
                    <small className="text-muted d-block mt-2">
                      {formData.loai_nguoi_nhan === 'GIANG_VIEN' 
                        ? 'ℹ️ Chọn lớp học phần để gửi yêu cầu tới giảng viên dạy'
                        : 'ℹ️ Gửi yêu cầu tới phòng đào tạo về các vấn đề chung (học phí, hồ sơ, thủ tục,...)'
                      }
                    </small>
                  </div>

                  {/* Hiển thị chọn lớp học phần chỉ khi gửi tới giảng viên */}
                  {formData.loai_nguoi_nhan === 'GIANG_VIEN' && (
                    <div className="mb-3">
                      <label className="form-label">Lớp học phần <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={formData.lop_hoc_phan_id}
                        onChange={handleSelectLopHocPhan}
                        required={formData.loai_nguoi_nhan === 'GIANG_VIEN'}
                      >
                        <option value="">-- Chọn lớp học phần --</option>
                        {lopHocPhanList.map((lop) => (
                          <option key={lop.lop_hoc_phan_id} value={lop.lop_hoc_phan_id}>
                            {lop.ten_hoc_phan} - {lop.ma_lop_hoc_phan} ({lop.ten_giang_vien})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Tiêu đề <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập tiêu đề yêu cầu"
                      value={formData.tieu_de}
                      onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nội dung <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="6"
                      placeholder="Nhập nội dung yêu cầu tư vấn..."
                      value={formData.noi_dung}
                      onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-send me-2"></i>
                    Gửi yêu cầu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết yêu cầu */}
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
                {/* Thông tin yêu cầu */}
                <div className="bg-light p-3 rounded mb-3">
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <strong>Lớp học phần:</strong> {selectedYeuCau.ten_hoc_phan} - {selectedYeuCau.ma_lop_hoc_phan}
                    </div>
                    <div className="col-md-6">
                      <strong>Giảng viên:</strong> {selectedYeuCau.ten_giang_vien}
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
                          className={`mb-2 d-flex ${tn.nguoi_gui === 'SINH_VIEN' ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                          <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: tn.nguoi_gui === 'SINH_VIEN' ? 'flex-end' : 'flex-start' }}>
                            <div className={`d-flex align-items-center gap-1 mb-1 ${tn.nguoi_gui === 'SINH_VIEN' ? 'flex-row-reverse' : ''}`}>
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{ 
                                  width: '28px', 
                                  height: '28px', 
                                  fontSize: '0.75rem',
                                  backgroundColor: tn.nguoi_gui === 'SINH_VIEN' ? '#0d6efd' : '#198754'
                                }}
                              >
                                {tn.nguoi_gui === 'SINH_VIEN' ? 'B' : 'GV'}
                              </div>
                              <div className="small">
                                <div className={`fw-semibold ${tn.nguoi_gui === 'SINH_VIEN' ? 'text-end' : ''}`}>
                                  {tn.nguoi_gui === 'SINH_VIEN' ? 'Bạn' : selectedYeuCau.ten_giang_vien}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {dayjs(tn.thoi_gian_gui).format('HH:mm - DD/MM/YYYY')}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`shadow-sm ${
                                tn.nguoi_gui === 'SINH_VIEN'
                                  ? 'bg-primary text-white'
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
                          className="form-control border-0 shadow-sm"
                          placeholder="Nhập tin nhắn của bạn..."
                          value={tinNhanMoi}
                          onChange={(e) => setTinNhanMoi(e.target.value)}
                          style={{ 
                            borderRadius: '24px',
                            padding: '12px 20px',
                            fontSize: '0.95rem'
                          }}
                        />
                        <button 
                          type="submit" 
                          className="btn btn-primary ms-2 rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '48px', height: '48px' }}
                          disabled={!tinNhanMoi.trim()}
                        >
                          <i className="bi bi-send-fill"></i>
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

      {/* Confirm Cancel Modal */}
      {confirmCancel && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">⚠️ Xác nhận hủy yêu cầu</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmCancel(null)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-2"><strong>Bạn có chắc muốn hủy yêu cầu này?</strong></p>
                <p className="text-muted mb-0">
                  <small>⚠️ Hành động này không thể hoàn tác.</small>
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmCancel(null)}>
                  Không
                </button>
                <button className="btn btn-danger" onClick={handleCancel}>
                  <i className="bi bi-trash me-1"></i> Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        show={alertModal.show}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ show: false, message: '', type: 'info' })}
      />
    </StudentLayout>
  )
}
