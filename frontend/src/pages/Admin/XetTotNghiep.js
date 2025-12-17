import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'
import { exportToExcel } from '../../components/excelExport'

export default function XetTotNghiep() {
  // Hàm tính học kỳ và năm học hiện tại
  const getCurrentSemester = () => {
    const now = new Date()
    const month = now.getMonth() + 1 // 1-12
    const year = now.getFullYear()
    
    let hocKy = 'HK1'
    let namHoc = ''
    
    if (month >= 9 && month <= 12) {
      hocKy = 'HK1'
      namHoc = `${year}-${year + 1}`
    } else if (month >= 1 && month <= 5) {
      hocKy = 'HK2'
      namHoc = `${year - 1}-${year}`
    } else {
      hocKy = 'HK1'
      namHoc = `${year}-${year + 1}`
    }
    
    return { hocKy, namHoc }
  }

  const currentSem = getCurrentSemester()
  const [dotXetList, setDotXetList] = useState([])
  const [selectedDotXet, setSelectedDotXet] = useState(null)
  const [hoSoList, setHoSoList] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchMaSV, setSearchMaSV] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [stats, setStats] = useState({ total: 0, duDieuKien: 0, daTotNghiep: 0, khongDuDieuKien: 0 })
  const [showCreateDot, setShowCreateDot] = useState(false)
  const [showTaoHoSo, setShowTaoHoSo] = useState(false)
  const [selectedKhoaHoc, setSelectedKhoaHoc] = useState('K20')
  const [khoaHocList, setKhoaHocList] = useState([])
  const [thongKeKhoaHoc, setThongKeKhoaHoc] = useState([])
  const [newDot, setNewDot] = useState({
    ten_dot: '',
    nam_hoc: currentSem.namHoc,
    hoc_ky: currentSem.hocKy,
    ngay_bat_dau: '',
    ngay_ket_thuc: ''
  })
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null })
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' })
  const [promptModal, setPromptModal] = useState({ show: false, message: '', placeholder: '', onConfirm: null })

  // Helper functions
  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ show: true, message, onConfirm })
  }

  const showAlert = (message, type = 'info') => {
    setAlertModal({ show: true, message, type })
  }

  const showPrompt = (message, placeholder, onConfirm) => {
    setPromptModal({ show: true, message, placeholder, onConfirm })
  }

  useEffect(() => {
    fetchDotXetList()
    fetchKhoaHocList()
    fetchThongKeKhoaHoc()
  }, [])

  const fetchKhoaHocList = async () => {
    try {
      const response = await apiFetch('/api/tot-nghiep/khoa-hoc')
      if (response.success && response.data) {
        setKhoaHocList(response.data)
        if (response.data.length > 0 && !selectedKhoaHoc) {
          setSelectedKhoaHoc(response.data[0]) // Chọn khóa học đầu tiên làm mặc định
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách khóa học:', err)
      // Fallback nếu API không hoạt động
      setKhoaHocList(['K20', 'K21', 'K22', 'K23', 'K24', 'K25'])
    }
  }

  const fetchThongKeKhoaHoc = async () => {
    try {
      const response = await apiFetch('/api/tot-nghiep/thong-ke-khoa-hoc')
      if (response.success && response.data) {
        setThongKeKhoaHoc(response.data)
      }
    } catch (err) {
      console.error('Lỗi khi tải thống kê khóa học:', err)
    }
  }

  useEffect(() => {
    if (selectedDotXet) {
      fetchHoSoList(selectedDotXet, 1) // Reset về trang 1 khi đổi đợt xét hoặc tìm kiếm
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDotXet, searchMaSV])

  useEffect(() => {
    if (selectedDotXet) {
      fetchHoSoList(selectedDotXet, pagination.page)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page])

  const fetchDotXetList = async () => {
    try {
      const response = await apiFetch('/api/tot-nghiep/dot-xet')
      if (response.success) {
        setDotXetList(response.data || [])
        if (response.data && response.data.length > 0) {
          setSelectedDotXet(response.data[0].id)
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách đợt xét:', err)
    }
  }

  const fetchHoSoList = async (dotXetId, page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      if (searchMaSV.trim()) {
        params.append('search', searchMaSV.trim())
      }
      
      const response = await apiFetch(`/api/tot-nghiep/ho-so/${dotXetId}?${params.toString()}`)
      if (response.success) {
        setHoSoList(response.data || [])
        if (response.pagination) {
          setPagination(response.pagination)
        }
        if (response.stats) {
          setStats(response.stats)
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải hồ sơ tốt nghiệp:', err)
      showAlert('Lỗi: ' + err.message, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDot = async () => {
    if (!newDot.ten_dot || !newDot.ngay_bat_dau || !newDot.ngay_ket_thuc) {
      showAlert('Vui lòng điền đầy đủ thông tin', 'warning')
      return
    }

    try {
      const response = await apiFetch('/api/tot-nghiep/dot-xet', {
        method: 'POST',
        body: JSON.stringify(newDot)
      })
      if (response.success) {
        showAlert('Tạo đợt xét thành công!', 'success')
        setShowCreateDot(false)
        setNewDot({
          ten_dot: '',
          nam_hoc: currentSem.namHoc,
          hoc_ky: currentSem.hocKy,
          ngay_bat_dau: '',
          ngay_ket_thuc: ''
        })
        fetchDotXetList()
      }
    } catch (err) {
      showAlert('Lỗi: ' + err.message, 'danger')
    }
  }

  const handleXetTotNghiep = async (hoSoId) => {
    showConfirm('Xác nhận xét tốt nghiệp cho sinh viên này?', async () => {
    try {
      const response = await apiFetch(`/api/tot-nghiep/xet/${hoSoId}`, {
        method: 'POST'
      })
      if (response.success) {
          showAlert('Xét tốt nghiệp thành công!', 'success')
        fetchHoSoList(selectedDotXet)
      }
    } catch (err) {
        showAlert('Lỗi: ' + err.message, 'danger')
    }
    })
  }

  const handleTaoHoSoHangLoat = async () => {
    if (!selectedDotXet) {
      showAlert('Vui lòng chọn đợt xét trước!', 'warning')
      return
    }

    if (!selectedKhoaHoc) {
      showAlert('Vui lòng chọn khóa học!', 'warning')
      return
    }

    showConfirm(`Tạo hồ sơ tốt nghiệp cho tất cả sinh viên ${selectedKhoaHoc}? Hệ thống sẽ tự động kiểm tra điều kiện tốt nghiệp cho từng sinh viên.`, async () => {
    setLoading(true)
    try {
      const response = await apiFetch('/api/tot-nghiep/tao-ho-so-hang-loat', {
        method: 'POST',
        body: JSON.stringify({ 
          dot_xet_id: selectedDotXet,
          khoa_hoc: selectedKhoaHoc
        })
      })
      if (response.success) {
        const { total, duDieuKien, khongDuDieuKien, daCoHoSo, error } = response.data
          showAlert(
            `Đã tạo hồ sơ thành công!\n\n` +
              `- Tổng số sinh viên: ${total}\n` +
              `- Đủ điều kiện: ${duDieuKien}\n` +
              `- Chưa đủ điều kiện: ${khongDuDieuKien}\n` +
              `- Đã có hồ sơ: ${daCoHoSo}\n` +
            `- Lỗi: ${error}`,
            'success'
          )
        setShowTaoHoSo(false)
        fetchHoSoList(selectedDotXet)
      }
    } catch (err) {
        showAlert('Lỗi: ' + err.message, 'danger')
    } finally {
      setLoading(false)
    }
    })
  }

  const handleXetHangLoat = async () => {
    showConfirm('Xác nhận xét tốt nghiệp hàng loạt cho tất cả sinh viên đủ điều kiện?', async () => {
    setLoading(true)
    try {
      const response = await apiFetch('/api/tot-nghiep/xet-hang-loat', {
        method: 'POST',
        body: JSON.stringify({ dot_xet_id: selectedDotXet })
      })
      if (response.success) {
          showAlert(`Đã xét tốt nghiệp ${response.data.successCount} sinh viên!`, 'success')
        fetchHoSoList(selectedDotXet)
      }
    } catch (err) {
        showAlert('Lỗi: ' + err.message, 'danger')
      } finally {
        setLoading(false)
      }
    })
  }

  const handleCapNhatLaiTrangThai = async () => {
    if (!selectedDotXet) {
      showAlert('Vui lòng chọn đợt xét tốt nghiệp!', 'warning')
      return
    }

    showConfirm('Bạn có chắc chắn muốn cập nhật lại trạng thái tất cả hồ sơ trong đợt xét này?\n\nHệ thống sẽ kiểm tra lại điều kiện tốt nghiệp cho từng sinh viên (bao gồm chứng chỉ tiếng Anh).', async () => {
      setLoading(true)
      try {
        const response = await apiFetch('/api/tot-nghiep/cap-nhat-lai-trang-thai', {
          method: 'POST',
          body: JSON.stringify({ dot_xet_id: selectedDotXet })
        })
        if (response.success) {
          showAlert(`✅ ${response.message}`, 'success')
          fetchHoSoList(selectedDotXet, pagination.page)
          fetchThongKeKhoaHoc() // Reload thống kê
        }
      } catch (err) {
        showAlert('Lỗi: ' + err.message, 'danger')
    } finally {
      setLoading(false)
    }
    })
  }

  const handleXoaHoSoKhoaHoc = async (khoaHoc) => {
    showConfirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa TẤT CẢ hồ sơ tốt nghiệp của khóa ${khoaHoc}?\n\nHành động này không thể hoàn tác!`, () => {
      showPrompt(`Nhập lại khóa học để xác nhận (${khoaHoc}):`, khoaHoc, (inputValue) => {
        if (inputValue !== khoaHoc) {
          showAlert('Khóa học không khớp. Đã hủy thao tác.', 'warning')
          return
        }

        setLoading(true)
        apiFetch('/api/tot-nghiep/xoa-theo-khoa-hoc', {
          method: 'DELETE',
          body: JSON.stringify({ 
            khoa_hoc: khoaHoc,
            dot_xet_id: selectedDotXet || null
          })
        })
        .then(response => {
          if (response.success) {
            showAlert(`✅ ${response.message}`, 'success')
            fetchHoSoList(selectedDotXet)
            fetchThongKeKhoaHoc() // Reload thống kê
          }
        })
        .catch(err => {
          showAlert('Lỗi: ' + err.message, 'danger')
        })
        .finally(() => {
          setLoading(false)
        })
      })
    })
  }

  const handleExport = () => {
    if (!hoSoList.length) return

    const dataToExport = hoSoList.map((item, index) => {
      let ketQua = {}
      if (item.ket_qua_xet_duyet) {
        if (typeof item.ket_qua_xet_duyet === 'string') {
          try {
            ketQua = JSON.parse(item.ket_qua_xet_duyet)
          } catch (e) {
            ketQua = {}
          }
        } else {
          ketQua = item.ket_qua_xet_duyet
        }
      }
      return {
        'STT': index + 1,
        'Mã SV': item.ma_sv,
        'Họ tên': item.ho_ten,
        'Điểm TB tích lũy': ketQua.diemTBTichLuy || '',
        'Tỷ lệ hoàn thành (%)': ketQua.tyLeHoanThanh || '',
        'Tín chỉ đã hoàn thành': ketQua.tinChiHoanThanh ? `${ketQua.tinChiHoanThanh} (${ketQua.tongTinChiBatBuoc || 0} bắt buộc)` : '',
        'Tổng tín chỉ bắt buộc': ketQua.tongTinChiBatBuoc || '',
        'Tín chỉ nợ': ketQua.tongTinChiNo || '',
        'Trạng thái': getTrangThaiLabel(item.trang_thai),
        'Ngày đăng ký': new Date(item.ngay_dang_ky).toLocaleDateString('vi-VN')
      }
    })

    exportToExcel(dataToExport, `XetTotNghiep_${selectedDotXet}`)
  }

  const getTrangThaiLabel = (trangThai) => {
    const labels = {
      'CHO_DUYET': 'Chờ duyệt',
      'DU_DIEU_KIEN': 'Đủ điều kiện',
      'KHONG_DU_DIEU_KIEN': 'Không đủ điều kiện',
      'DA_TOT_NGHIEP': 'Đã tốt nghiệp'
    }
    return labels[trangThai] || trangThai
  }

  const getTrangThaiBadge = (trangThai) => {
    const badges = {
      'CHO_DUYET': 'warning',
      'DU_DIEU_KIEN': 'success',
      'KHONG_DU_DIEU_KIEN': 'danger',
      'DA_TOT_NGHIEP': 'primary'
    }
    return badges[trangThai] || 'secondary'
  }

  // Stats đã được lấy từ backend, không cần tính lại từ hoSoList

  return (
    <AdminLayout title="Xét tốt nghiệp" activeMenu="xet-tot-nghiep">
      <div className="container-fluid">
        {/* Thống kê khóa học */}
        {thongKeKhoaHoc.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Thống kê khóa học</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Khóa học</th>
                      <th className="text-center">Tổng SV</th>
                      <th className="text-center">Đã tốt nghiệp</th>
                      <th className="text-center">Đủ điều kiện</th>
                      <th className="text-center">Chưa đủ điều kiện</th>
                      <th className="text-center">Chưa tạo hồ sơ</th>
                      <th className="text-center">Tỷ lệ tốt nghiệp</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {thongKeKhoaHoc.map((stat, index) => (
                      <tr key={index}>
                        <td><strong>{stat.khoa_hoc}</strong></td>
                        <td className="text-center">{stat.tong_sv}</td>
                        <td className="text-center">
                          <span className="badge bg-success">{stat.da_tot_nghiep}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info">{stat.du_dieu_kiên}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-warning">{stat.khong_du_dieu_kiên}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-secondary">{stat.chua_tao_ho_so}</span>
                        </td>
                        <td className="text-center">
                          <strong>{stat.ty_le_tot_nghiep}%</strong>
                        </td>
                        <td>
                          <span className={`badge ${
                            stat.trang_thai === 'Đã học xong' ? 'bg-success' :
                            stat.trang_thai === 'Đang học' ? 'bg-primary' :
                            'bg-warning'
                          }`}>
                            {stat.trang_thai}
                          </span>
                        </td>
                        <td>
                          {(stat.da_tot_nghiep > 0 || stat.du_dieu_kiên > 0 || stat.khong_du_dieu_kiên > 0) && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleXoaHoSoKhoaHoc(stat.khoa_hoc)}
                              disabled={loading}
                              title={`Xóa tất cả hồ sơ tốt nghiệp của khóa ${stat.khoa_hoc}`}
                            >
                              <i className="bi bi-trash me-1"></i>Xóa hồ sơ
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Header với thống kê */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="text-muted small">Tổng số hồ sơ</div>
                <div className="fs-3 fw-bold">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm border-success">
              <div className="card-body">
                <div className="text-muted small">Đủ điều kiện</div>
                <div className="fs-3 fw-bold text-success">{stats.duDieuKien}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm border-primary">
              <div className="card-body">
                <div className="text-muted small">Đã tốt nghiệp</div>
                <div className="fs-3 fw-bold text-primary">{stats.daTotNghiep}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm border-danger">
              <div className="card-body">
                <div className="text-muted small">Không đủ điều kiện</div>
                <div className="fs-3 fw-bold text-danger">{stats.khongDuDieuKien}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chọn đợt xét */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row align-items-end">
              <div className="col-md-3">
                <label className="form-label">Đợt xét tốt nghiệp</label>
                <select
                  className="form-select"
                  value={selectedDotXet || ''}
                  onChange={(e) => {
                    setSelectedDotXet(Number(e.target.value))
                    setPagination({ ...pagination, page: 1 })
                  }}
                >
                  <option value="">-- Chọn đợt xét --</option>
                  {dotXetList.map(dot => (
                    <option key={dot.id} value={dot.id}>
                      {dot.ten_dot} ({dot.nam_hoc} - {dot.hoc_ky}) - {dot.trang_thai === 'MO' ? 'Mở' : 'Đóng'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Tìm kiếm mã SV</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã sinh viên..."
                  value={searchMaSV}
                  onChange={(e) => {
                    setSearchMaSV(e.target.value)
                    setPagination({ ...pagination, page: 1 })
                  }}
                />
              </div>
              <div className="col-md-6 text-end">
                <button
                  className="btn btn-primary me-2"
                  onClick={() => setShowCreateDot(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>Tạo đợt xét mới
                </button>
                {selectedDotXet && (
                  <>
                  <button
                    className="btn btn-info me-2"
                    onClick={() => setShowTaoHoSo(true)}
                    disabled={loading}
                    title="Tạo hồ sơ tốt nghiệp cho sinh viên"
                  >
                    <i className="bi bi-person-plus me-2"></i>Tạo hồ sơ tốt nghiệp
                  </button>
                    <button
                      className="btn btn-warning me-2"
                      onClick={handleCapNhatLaiTrangThai}
                      disabled={loading}
                      title="Cập nhật lại trạng thái hồ sơ (sau khi thêm chứng chỉ tiếng Anh)"
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>Cập nhật trạng thái
                    </button>
                  </>
                )}
                {stats.duDieuKien > 0 && (
                  <button
                    className="btn btn-success me-2"
                    onClick={handleXetHangLoat}
                    disabled={loading}
                  >
                    <i className="bi bi-check-all me-2"></i>Xét tốt nghiệp hàng loạt ({stats.duDieuKien})
                  </button>
                )}
                <button
                  className="btn btn-outline-primary"
                  onClick={handleExport}
                  disabled={!hoSoList.length}
                >
                  <i className="bi bi-file-earmark-excel me-2"></i>Xuất Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal tạo hồ sơ tốt nghiệp */}
        {showTaoHoSo && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tạo hồ sơ tốt nghiệp</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowTaoHoSo(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Chọn khóa học</label>
                    <select
                      className="form-select"
                      value={selectedKhoaHoc}
                      onChange={(e) => setSelectedKhoaHoc(e.target.value)}
                    >
                      {khoaHocList.length > 0 ? (
                        khoaHocList.map(khoa => (
                          <option key={khoa} value={khoa}>{khoa}</option>
                        ))
                      ) : (
                        <option value="K20">K20</option>
                      )}
                    </select>
                    <small className="form-text text-muted d-block mt-2">
                      Hệ thống sẽ tạo hồ sơ tốt nghiệp cho tất cả sinh viên khóa <strong>{selectedKhoaHoc}</strong> ngành Kỹ Thuật Phần Mềm
                    </small>
                  </div>
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Hệ thống sẽ tự động kiểm tra điều kiện tốt nghiệp cho từng sinh viên và phân loại trạng thái.
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowTaoHoSo(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleTaoHoSoHangLoat}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>Tạo hồ sơ
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal tạo đợt xét */}
        {showCreateDot && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tạo đợt xét tốt nghiệp mới</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateDot(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tên đợt xét</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newDot.ten_dot}
                      onChange={(e) => setNewDot({ ...newDot, ten_dot: e.target.value })}
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Năm học</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newDot.nam_hoc}
                        onChange={(e) => setNewDot({ ...newDot, nam_hoc: e.target.value })}
                        placeholder="2024-2025"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Học kỳ</label>
                      <select
                        className="form-select"
                        value={newDot.hoc_ky}
                        onChange={(e) => setNewDot({ ...newDot, hoc_ky: e.target.value })}
                      >
                        <option value="HK1">HK1</option>
                        <option value="HK2">HK2</option>
                        <option value="HK3">HK3</option>
                        <option value="HK4">HK4</option>
                        <option value="HK5">HK5</option>
                        <option value="HK6">HK6</option>
                        <option value="HK7">HK7</option>
                        <option value="HK8">HK8</option>
                        <option value="HK9">HK9</option>
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Ngày bắt đầu</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newDot.ngay_bat_dau}
                        onChange={(e) => setNewDot({ ...newDot, ngay_bat_dau: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Ngày kết thúc</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newDot.ngay_ket_thuc}
                        onChange={(e) => setNewDot({ ...newDot, ngay_ket_thuc: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateDot(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCreateDot}
                  >
                    Tạo đợt xét
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bảng danh sách hồ sơ */}
        <div className="card shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : hoSoList.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox fs-1"></i>
                <p className="mt-3">Chưa có hồ sơ tốt nghiệp nào</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>STT</th>
                      <th>Mã SV</th>
                      <th>Họ tên</th>
                      <th>Điểm TB tích lũy</th>
                      <th>Tỷ lệ hoàn thành</th>
                      <th>Tín chỉ đã hoàn thành<br/><small className="text-muted fw-normal">(tổng / bắt buộc)</small></th>
                      <th>Tín chỉ nợ</th>
                      <th>Chứng chỉ TA</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hoSoList.map((hoSo, index) => {
                      let ketQua = {}
                      if (hoSo.ket_qua_xet_duyet) {
                        if (typeof hoSo.ket_qua_xet_duyet === 'string') {
                          try {
                            ketQua = JSON.parse(hoSo.ket_qua_xet_duyet)
                          } catch (e) {
                            ketQua = {}
                          }
                        } else {
                          ketQua = hoSo.ket_qua_xet_duyet
                        }
                      }
                      return (
                        <tr key={hoSo.id}>
                          <td>{index + 1}</td>
                          <td><strong>{hoSo.ma_sv}</strong></td>
                          <td>{hoSo.ho_ten}</td>
                          <td>{ketQua.diemTBTichLuy?.toFixed(2) || '-'}</td>
                          <td>{ketQua.tyLeHoanThanh?.toFixed(2) || '-'}%</td>
                          <td>
                            {ketQua.tinChiHoanThanh ? (
                              <>
                                <strong>{ketQua.tinChiHoanThanh}</strong> 
                                <span className="text-muted small"> ({ketQua.tongTinChiBatBuoc || 0} bắt buộc)</span>
                              </>
                            ) : '-'}
                          </td>
                          <td>
                            <span className={ketQua.tongTinChiNo > 0 ? 'text-danger' : 'text-success'}>
                              {ketQua.tongTinChiNo || 0}
                            </span>
                          </td>
                          <td>
                            {hoSo.loai_chung_chi ? (
                              <div>
                                <span className="badge bg-success">{hoSo.loai_chung_chi}</span>
                                {hoSo.diem_chung_chi && (
                                  <small className="d-block text-muted mt-1">Điểm: {hoSo.diem_chung_chi}</small>
                                )}
                                {hoSo.ngay_cap_chung_chi && (
                                  <small className="d-block text-muted">Ngày: {new Date(hoSo.ngay_cap_chung_chi).toLocaleDateString('vi-VN')}</small>
                                )}
                              </div>
                            ) : (
                              <span className="badge bg-danger">Chưa có</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge bg-${getTrangThaiBadge(hoSo.trang_thai)}`}>
                              {getTrangThaiLabel(hoSo.trang_thai)}
                            </span>
                          </td>
                          <td>
                            {hoSo.trang_thai === 'DU_DIEU_KIEN' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleXetTotNghiep(hoSo.id)}
                              >
                                <i className="bi bi-check-circle me-1"></i>Xét tốt nghiệp
                              </button>
                            )}
                            {hoSo.trang_thai === 'KHONG_DU_DIEU_KIEN' && (
                              <small className="text-muted" title={hoSo.ly_do_tu_choi}>
                                {hoSo.ly_do_tu_choi?.substring(0, 50)}...
                              </small>
                            )}
                            {hoSo.trang_thai === 'DA_TOT_NGHIEP' && (
                              <span className="text-success">
                                <i className="bi bi-check-circle-fill"></i> Đã tốt nghiệp
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Phân trang */}
            {hoSoList.length > 0 && pagination.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} bản ghi
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page === 1}
                      >
                        Trước
                      </button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, idx) => {
                      const pageNum = idx + 1
                      // Chỉ hiển thị một số trang xung quanh trang hiện tại
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                      ) {
                        return (
                          <li key={pageNum} className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => setPagination({ ...pagination, page: pageNum })}
                            >
                              {pageNum}
                            </button>
                          </li>
                        )
                      } else if (
                        pageNum === pagination.page - 2 ||
                        pageNum === pagination.page + 2
                      ) {
                        return (
                          <li key={pageNum} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )
                      }
                      return null
                    })}
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
      </div>

      {/* Modal xác nhận */}
      {confirmModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p style={{ whiteSpace: 'pre-line' }}>{confirmModal.message}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (confirmModal.onConfirm) {
                      confirmModal.onConfirm()
                    }
                    setConfirmModal({ show: false, message: '', onConfirm: null })
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông báo */}
      {alertModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className={`modal-header bg-${alertModal.type === 'success' ? 'success' : alertModal.type === 'danger' ? 'danger' : alertModal.type === 'warning' ? 'warning' : 'info'} text-white`}>
                <h5 className="modal-title">
                  {alertModal.type === 'success' ? '✅ Thành công' : 
                   alertModal.type === 'danger' ? '❌ Lỗi' : 
                   alertModal.type === 'warning' ? 'Cảnh báo' : 
                   'ℹ️ Thông báo'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setAlertModal({ show: false, message: '', type: 'info' })}
                ></button>
              </div>
              <div className="modal-body">
                <p style={{ whiteSpace: 'pre-line' }}>{alertModal.message}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setAlertModal({ show: false, message: '', type: 'info' })}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal prompt */}
      {promptModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPromptModal({ show: false, message: '', placeholder: '', onConfirm: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p>{promptModal.message}</p>
                <input
                  type="text"
                  className="form-control"
                  placeholder={promptModal.placeholder}
                  id="promptInput"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && promptModal.onConfirm) {
                      promptModal.onConfirm(e.target.value)
                      setPromptModal({ show: false, message: '', placeholder: '', onConfirm: null })
                    }
                  }}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPromptModal({ show: false, message: '', placeholder: '', onConfirm: null })}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const input = document.getElementById('promptInput')
                    if (input && promptModal.onConfirm) {
                      promptModal.onConfirm(input.value)
                    }
                    setPromptModal({ show: false, message: '', placeholder: '', onConfirm: null })
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

