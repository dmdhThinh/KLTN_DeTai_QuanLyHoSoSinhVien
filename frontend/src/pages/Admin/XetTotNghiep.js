import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'
import { exportToExcel } from '../../components/excelExport'

export default function XetTotNghiep() {
  const [dotXetList, setDotXetList] = useState([])
  const [selectedDotXet, setSelectedDotXet] = useState(null)
  const [hoSoList, setHoSoList] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateDot, setShowCreateDot] = useState(false)
  const [showTaoHoSo, setShowTaoHoSo] = useState(false)
  const [selectedKhoaHoc, setSelectedKhoaHoc] = useState('K20')
  const [khoaHocList, setKhoaHocList] = useState([])
  const [newDot, setNewDot] = useState({
    ten_dot: '',
    nam_hoc: '2024-2025',
    hoc_ky: 'HK9',
    ngay_bat_dau: '',
    ngay_ket_thuc: ''
  })

  useEffect(() => {
    fetchDotXetList()
    fetchKhoaHocList()
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

  useEffect(() => {
    if (selectedDotXet) {
      fetchHoSoList(selectedDotXet)
    }
  }, [selectedDotXet])

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

  const fetchHoSoList = async (dotXetId) => {
    setLoading(true)
    try {
      const response = await apiFetch(`/api/tot-nghiep/ho-so/${dotXetId}`)
      if (response.success) {
        setHoSoList(response.data || [])
      }
    } catch (err) {
      console.error('Lỗi khi tải hồ sơ tốt nghiệp:', err)
      alert('Lỗi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDot = async () => {
    if (!newDot.ten_dot || !newDot.ngay_bat_dau || !newDot.ngay_ket_thuc) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      const response = await apiFetch('/api/tot-nghiep/dot-xet', {
        method: 'POST',
        body: JSON.stringify(newDot)
      })
      if (response.success) {
        alert('Tạo đợt xét thành công!')
        setShowCreateDot(false)
        setNewDot({
          ten_dot: '',
          nam_hoc: '2024-2025',
          hoc_ky: 'HK9',
          ngay_bat_dau: '',
          ngay_ket_thuc: ''
        })
        fetchDotXetList()
      }
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  const handleXetTotNghiep = async (hoSoId) => {
    if (!window.confirm('Xác nhận xét tốt nghiệp cho sinh viên này?')) return

    try {
      const response = await apiFetch(`/api/tot-nghiep/xet/${hoSoId}`, {
        method: 'POST'
      })
      if (response.success) {
        alert('Xét tốt nghiệp thành công!')
        fetchHoSoList(selectedDotXet)
      }
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  const handleTaoHoSoHangLoat = async () => {
    if (!selectedDotXet) {
      alert('Vui lòng chọn đợt xét trước!')
      return
    }

    if (!selectedKhoaHoc) {
      alert('Vui lòng chọn khóa học!')
      return
    }

    if (!window.confirm(`Tạo hồ sơ tốt nghiệp cho tất cả sinh viên ${selectedKhoaHoc}? Hệ thống sẽ tự động kiểm tra điều kiện tốt nghiệp cho từng sinh viên.`)) return

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
        alert(`Đã tạo hồ sơ thành công!\n\n` +
              `- Tổng số sinh viên: ${total}\n` +
              `- Đủ điều kiện: ${duDieuKien}\n` +
              `- Chưa đủ điều kiện: ${khongDuDieuKien}\n` +
              `- Đã có hồ sơ: ${daCoHoSo}\n` +
              `- Lỗi: ${error}`)
        setShowTaoHoSo(false)
        fetchHoSoList(selectedDotXet)
      }
    } catch (err) {
      alert('Lỗi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleXetHangLoat = async () => {
    if (!window.confirm('Xác nhận xét tốt nghiệp hàng loạt cho tất cả sinh viên đủ điều kiện?')) return

    setLoading(true)
    try {
      const response = await apiFetch('/api/tot-nghiep/xet-hang-loat', {
        method: 'POST',
        body: JSON.stringify({ dot_xet_id: selectedDotXet })
      })
      if (response.success) {
        alert(`Đã xét tốt nghiệp ${response.data.successCount} sinh viên!`)
        fetchHoSoList(selectedDotXet)
      }
    } catch (err) {
      alert('Lỗi: ' + err.message)
    } finally {
      setLoading(false)
    }
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

  const stats = {
    total: hoSoList.length,
    duDieuKien: hoSoList.filter(h => h.trang_thai === 'DU_DIEU_KIEN').length,
    daTotNghiep: hoSoList.filter(h => h.trang_thai === 'DA_TOT_NGHIEP').length,
    khongDuDieuKien: hoSoList.filter(h => h.trang_thai === 'KHONG_DU_DIEU_KIEN').length
  }

  return (
    <AdminLayout title="Xét tốt nghiệp" activeMenu="xet-tot-nghiep">
      <div className="container-fluid">
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
              <div className="col-md-4">
                <label className="form-label">Đợt xét tốt nghiệp</label>
                <select
                  className="form-select"
                  value={selectedDotXet || ''}
                  onChange={(e) => setSelectedDotXet(Number(e.target.value))}
                >
                  <option value="">-- Chọn đợt xét --</option>
                  {dotXetList.map(dot => (
                    <option key={dot.id} value={dot.id}>
                      {dot.ten_dot} ({dot.nam_hoc} - {dot.hoc_ky}) - {dot.trang_thai === 'MO' ? 'Mở' : 'Đóng'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-8 text-end">
                <button
                  className="btn btn-primary me-2"
                  onClick={() => setShowCreateDot(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>Tạo đợt xét mới
                </button>
                {selectedDotXet && (
                  <button
                    className="btn btn-info me-2"
                    onClick={() => setShowTaoHoSo(true)}
                    disabled={loading}
                    title="Tạo hồ sơ tốt nghiệp cho sinh viên"
                  >
                    <i className="bi bi-person-plus me-2"></i>Tạo hồ sơ tốt nghiệp
                  </button>
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
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

