import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'
import { AlertModal, ConfirmModal } from '../../components/Modal'

const API_BASE = process.env.REACT_APP_API_BASE || ''

export default function ImportDiemRenLuyen() {
  const [importResult, setImportResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [diemRenLuyenList, setDiemRenLuyenList] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [filters, setFilters] = useState({ hoc_ky: '', nam_hoc: '', ma_sv: '' })
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' })
  const [addActivityModal, setAddActivityModal] = useState({ show: false, diemRenLuyenId: null })
  const [newActivity, setNewActivity] = useState({ ten_hoat_dong: '', diem: '', ghi_chu: '' })
  const [viewActivityModal, setViewActivityModal] = useState({ show: false, diemRenLuyenId: null, hoatDong: [] })
  const [searchActivity, setSearchActivity] = useState('') // Tìm kiếm trong modal
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null })

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Gọi trực tiếp API fetch mà không qua apiFetch để gửi formData
      // Vì apiFetch thường mặc định JSON
      const res = await fetch(`${API_BASE}/api/import/training-scores`, {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Import thất bại')

      setImportResult(data)
    } catch (err) {
      console.error(err)
      setImportResult({
        message: 'Import thất bại',
        lỗi: [{ dòng: '-', lỗi: err.message }]
      })
    } finally {
      setLoading(false)
      e.target.value = '' // Reset input
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/import/training-scores/template`)
      if (!response.ok) throw new Error('Không thể tải file mẫu')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'MauNhapDiemRenLuyen.xlsx'
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setAlertModal({ show: true, message: err.message, type: 'danger' })
    }
  }

  // Load danh sách điểm rèn luyện
  const loadDiemRenLuyenList = async () => {
    setLoadingList(true)
    try {
      const params = new URLSearchParams()
      if (filters.hoc_ky) params.append('hoc_ky', filters.hoc_ky)
      if (filters.nam_hoc) params.append('nam_hoc', filters.nam_hoc)
      
      const result = await apiFetch(`/api/import/training-scores?${params.toString()}`)
      setDiemRenLuyenList(result.data || [])
    } catch (err) {
      console.error('Lỗi load danh sách điểm rèn luyện:', err)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadDiemRenLuyenList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.hoc_ky, filters.nam_hoc])

  // Reload danh sách sau khi import thành công
  useEffect(() => {
    if (importResult && importResult.thành_công > 0) {
      loadDiemRenLuyenList()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importResult])

  const handleAddActivity = (diemRenLuyenId) => {
    setAddActivityModal({ show: true, diemRenLuyenId })
    setNewActivity({ ten_hoat_dong: '', diem: '', ghi_chu: '' })
  }

  const handleSaveActivity = async () => {
    if (!newActivity.ten_hoat_dong || !newActivity.diem) {
      setAlertModal({ show: true, message: 'Vui lòng nhập đầy đủ tên hoạt động và điểm', type: 'danger' })
      return
    }

    try {
      await apiFetch('/api/import/training-scores/hoat-dong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diem_ren_luyen_id: addActivityModal.diemRenLuyenId,
          ten_hoat_dong: newActivity.ten_hoat_dong,
          diem: Number(newActivity.diem),
          ghi_chu: newActivity.ghi_chu || null
        })
      })
      setAddActivityModal({ show: false, diemRenLuyenId: null })
      setNewActivity({ ten_hoat_dong: '', diem: '', ghi_chu: '' })
      
      // Load lại danh sách và cập nhật modal nếu đang mở
      const wasViewing = viewActivityModal.show && viewActivityModal.diemRenLuyenId === addActivityModal.diemRenLuyenId
      await loadDiemRenLuyenList()
      
      setAlertModal({ show: true, message: 'Thêm hoạt động thành công!', type: 'success' })
      
      // Nếu đang mở modal xem chi tiết, cập nhật lại
      if (wasViewing) {
        // Đợi một chút để state cập nhật
        setTimeout(() => {
          const updatedItem = diemRenLuyenList.find(item => item.id === addActivityModal.diemRenLuyenId)
          if (updatedItem) {
            setViewActivityModal({
              ...viewActivityModal,
              hoatDong: updatedItem.hoat_dong || []
            })
          }
        }, 100)
      }
    } catch (err) {
      setAlertModal({ show: true, message: err.message || 'Lỗi khi thêm hoạt động', type: 'danger' })
    }
  }

  const handleDeleteActivity = async (hoatDongId) => {
    try {
      const diemRenLuyenId = viewActivityModal.diemRenLuyenId
      await apiFetch(`/api/import/training-scores/hoat-dong/${hoatDongId}`, {
        method: 'DELETE'
      })
      
      // Load lại danh sách
      await loadDiemRenLuyenList()
      setAlertModal({ show: true, message: 'Xóa hoạt động thành công!', type: 'success' })
      
      // Nếu đang mở modal xem chi tiết, cập nhật lại
      if (viewActivityModal.show && diemRenLuyenId) {
        // Đợi một chút để state cập nhật
        setTimeout(async () => {
          const result = await apiFetch(`/api/import/training-scores?hoc_ky=${filters.hoc_ky || ''}&nam_hoc=${filters.nam_hoc || ''}`)
          const updatedItem = result.data?.find(item => item.id === diemRenLuyenId)
          if (updatedItem) {
            setViewActivityModal({
              ...viewActivityModal,
              hoatDong: updatedItem.hoat_dong || []
            })
          } else {
            // Nếu không còn hoạt động nào, đóng modal
            setViewActivityModal({ show: false, diemRenLuyenId: null, hoatDong: [] })
          }
        }, 200)
      }
    } catch (err) {
      setAlertModal({ show: true, message: err.message || 'Lỗi khi xóa hoạt động', type: 'danger' })
    }
  }

  return (
    <AdminLayout activeMenu="diem-ren-luyen" title="Nhập điểm rèn luyện">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex gap-3 align-items-center mb-3">
             <button className="btn btn-outline-primary" onClick={handleDownloadTemplate}>
              📄 Tải file Excel mẫu
            </button>
            <div>
              <input
                type="file"
                accept=".xlsx, .xls"
                className="form-control"
                onChange={handleImport}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="alert alert-light border">
             <strong>Lưu ý:</strong>
             <ul className="mb-0 mt-1 ps-3">
               <li>File Excel cần có các cột: <strong>Mã sinh viên, Học kỳ, Năm học, Tên hoạt động, Điểm</strong></li>
               <li>Mỗi dòng là một hoạt động. Có thể có nhiều dòng cho cùng một sinh viên (điểm sẽ được cộng dồn).</li>
               <li>Ví dụ: Sinh viên tham gia "Tư vấn hướng nghiệp" (+3 điểm) và "Giao lưu văn hóa" (+3 điểm) → Tổng điểm = 6.</li>
               <li>Xếp loại sẽ được tự động tính toán từ tổng điểm các hoạt động.</li>
             </ul>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-3">Đang xử lý import...</div>}

      {/* Danh sách điểm rèn luyện đã import */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <strong>DANH SÁCH ĐIỂM RÈN LUYỆN ĐÃ IMPORT</strong>
          <div className="d-flex gap-2 align-items-center">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: '150px' }}
              placeholder="🔍 Tìm mã SV..."
              value={filters.ma_sv}
              onChange={(e) => setFilters({ ...filters, ma_sv: e.target.value })}
            />
            <select
              className="form-select form-select-sm"
              style={{ width: '120px' }}
              value={filters.hoc_ky}
              onChange={(e) => setFilters({ ...filters, hoc_ky: e.target.value })}
            >
              <option value="">Tất cả HK</option>
              <option value="HK1">HK1</option>
              <option value="HK2">HK2</option>
              <option value="HK3">HK3</option>
              <option value="HK4">HK4</option>
              <option value="HK5">HK5</option>
              <option value="HK6">HK6</option>
              <option value="HK7">HK7</option>
              <option value="HK8">HK8</option>
            </select>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: '150px' }}
              placeholder="Năm học (VD: 2024-2025)"
              value={filters.nam_hoc}
              onChange={(e) => setFilters({ ...filters, nam_hoc: e.target.value })}
            />
            <button className="btn btn-sm btn-light" onClick={loadDiemRenLuyenList}>
              🔄 Tải lại
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          {loadingList ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : diemRenLuyenList.length === 0 ? (
            <div className="text-center py-4 text-muted">Chưa có dữ liệu điểm rèn luyện</div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '500px' }}>
              <table className="table table-bordered table-hover mb-0">
                <thead className="table-light sticky-top">
                  <tr>
                    <th style={{ width: '50px' }}>STT</th>
                    <th style={{ width: '120px' }}>Mã SV</th>
                    <th>Họ tên</th>
                    <th style={{ width: '100px' }}>Lớp</th>
                    <th style={{ width: '80px' }}>Học kỳ</th>
                    <th style={{ width: '120px' }}>Năm học</th>
                    <th style={{ width: '200px' }}>Hoạt động</th>
                    <th style={{ width: '100px' }} className="text-center">Tổng điểm</th>
                    <th style={{ width: '120px' }}>Xếp loại</th>
                    <th style={{ width: '100px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {diemRenLuyenList
                    .filter(item => {
                      if (filters.ma_sv) {
                        return item.ma_sv?.toLowerCase().includes(filters.ma_sv.toLowerCase())
                      }
                      return true
                    })
                    .map((item, index) => {
                      const hoatDong = item.hoat_dong || []
                      const tongHoatDong = hoatDong.length
                      
                      return (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td><strong>{item.ma_sv}</strong></td>
                          <td>{item.ho_ten}</td>
                          <td>{item.ten_lop || '-'}</td>
                          <td>{item.hoc_ky}</td>
                          <td><strong>{item.nam_hoc}</strong></td>
                          <td>
                            {tongHoatDong > 0 ? (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  setViewActivityModal({ 
                                    show: true, 
                                    diemRenLuyenId: item.id, 
                                    hoatDong: hoatDong,
                                    sinhVien: { ma_sv: item.ma_sv, ho_ten: item.ho_ten }
                                  })
                                  setSearchActivity('') // Reset search khi mở modal
                                }}
                              >
                                👁️ Xem {tongHoatDong} hoạt động
                              </button>
                            ) : (
                              <span className="text-muted">
                                {item.so_diem > 0 ? (
                                  <span className="text-warning">
                                    Có điểm nhưng chưa có hoạt động
                                  </span>
                                ) : (
                                  'Chưa có hoạt động'
                                )}
                              </span>
                            )}
                          </td>
                          <td className="text-center fw-bold">{item.so_diem || 0}</td>
                          <td>
                            <span className={`badge ${
                              item.xep_loai === 'Xuất sắc' ? 'bg-success' :
                              item.xep_loai === 'Tốt' ? 'bg-info' :
                              item.xep_loai === 'Khá' ? 'bg-primary' :
                              item.xep_loai === 'Trung bình' ? 'bg-warning' :
                              'bg-danger'
                            }`}>
                              {item.xep_loai || 'Yếu'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleAddActivity(item.id)}
                            >
                              ➕ Thêm
                            </button>
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

      {/* Kết quả Import */}
      {importResult && (
        <div className="card shadow-sm">
          <div
            className={`card-header fw-semibold ${
              importResult.lỗi && importResult.lỗi.length > 0 ? 'bg-danger text-white' : 'bg-success text-white'
            }`}
          >
            {importResult.lỗi && importResult.lỗi.length > 0
              ? `Có ${importResult.lỗi.length} dòng lỗi (Thành công: ${importResult.thành_công})`
              : `✅ Import thành công toàn bộ (${importResult.thành_công} dòng)`}
          </div>
          
          <div className="card-body p-0">
            {importResult.lỗi && importResult.lỗi.length > 0 ? (
              <div className="table-responsive" style={{ maxHeight: '400px' }}>
                <table className="table table-bordered mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th style={{ width: 80 }}>Dòng</th>
                      <th>Lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.lỗi.map((err, i) => (
                      <tr key={i}>
                        <td>{err.dòng}</td>
                        <td className="text-danger">{err.lỗi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-success">
                <h5 className="mb-0">🎉 Đã cập nhật điểm rèn luyện thành công!</h5>
              </div>
            )}
          </div>
        </div>
      )}

      <AlertModal
        show={alertModal.show}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ show: false, message: '', type: 'info' })}
      />

      {/* Modal xem chi tiết hoạt động */}
      {viewActivityModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  Chi tiết hoạt động rèn luyện - {viewActivityModal.sinhVien?.ma_sv} - {viewActivityModal.sinhVien?.ho_ten}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setViewActivityModal({ show: false, diemRenLuyenId: null, hoatDong: [] })
                    setSearchActivity('')
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {/* Tìm kiếm tên hoạt động */}
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 Tìm kiếm tên hoạt động..."
                    value={searchActivity}
                    onChange={(e) => setSearchActivity(e.target.value)}
                  />
                </div>
                
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '50px' }}>STT</th>
                        <th>Tên hoạt động</th>
                        <th style={{ width: '100px' }} className="text-center">Điểm</th>
                        <th>Ghi chú</th>
                        <th style={{ width: '100px' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewActivityModal.hoatDong
                        .filter(hd => {
                          if (searchActivity) {
                            return hd.ten_hoat_dong?.toLowerCase().includes(searchActivity.toLowerCase())
                          }
                          return true
                        })
                        .map((hd, idx) => {
                          // Tính lại STT sau khi filter
                          const filteredList = viewActivityModal.hoatDong.filter(h => {
                            if (searchActivity) {
                              return h.ten_hoat_dong?.toLowerCase().includes(searchActivity.toLowerCase())
                            }
                            return true
                          })
                          const displayIdx = filteredList.findIndex(h => h.id === hd.id)
                          const isBasicActivity = hd.ten_hoat_dong?.includes('Điểm rèn luyện cơ bản')
                          
                          return (
                            <tr key={hd.id} className={isBasicActivity ? 'table-warning' : ''}>
                              <td>{displayIdx + 1}</td>
                              <td>
                                {hd.ten_hoat_dong}
                                {isBasicActivity && (
                                  <span className="badge bg-primary ms-2" title="Điểm cơ bản mặc định">Mặc định</span>
                                )}
                              </td>
                              <td className="text-center fw-bold">+{hd.diem}</td>
                              <td>{hd.ghi_chu || '-'}</td>
                              <td>
                                {isBasicActivity ? (
                                  <span className="text-muted small">Không thể xóa</span>
                                ) : (
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => {
                                      setConfirmModal({
                                        show: true,
                                        message: 'Bạn có chắc muốn xóa hoạt động này?',
                                        onConfirm: () => {
                                          handleDeleteActivity(hd.id)
                                          setConfirmModal({ show: false, message: '', onConfirm: null })
                                        }
                                      })
                                    }}
                                  >
                                    ❌ Xóa
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      {viewActivityModal.hoatDong.filter(hd => {
                        if (searchActivity) {
                          return hd.ten_hoat_dong?.toLowerCase().includes(searchActivity.toLowerCase())
                        }
                        return true
                      }).length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            {searchActivity ? 'Không tìm thấy hoạt động nào' : 'Chưa có hoạt động'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="table-secondary">
                      <tr>
                        <td colSpan="2" className="text-end fw-bold">Tổng điểm:</td>
                        <td className="text-center fw-bold">
                          {viewActivityModal.hoatDong
                            .filter(hd => {
                              if (searchActivity) {
                                return hd.ten_hoat_dong?.toLowerCase().includes(searchActivity.toLowerCase())
                              }
                              return true
                            })
                            .reduce((sum, hd) => sum + (hd.diem || 0), 0)}
                        </td>
                        <td colSpan="2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setViewActivityModal({ show: false, diemRenLuyenId: null, hoatDong: [] })
                    handleAddActivity(viewActivityModal.diemRenLuyenId)
                  }}
                >
                  ➕ Thêm hoạt động
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setViewActivityModal({ show: false, diemRenLuyenId: null, hoatDong: [] })}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm hoạt động */}
      {addActivityModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Thêm hoạt động rèn luyện</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setAddActivityModal({ show: false, diemRenLuyenId: null })}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tên hoạt động <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={newActivity.ten_hoat_dong}
                    onChange={(e) => setNewActivity({ ...newActivity, ten_hoat_dong: e.target.value })}
                    placeholder="Ví dụ: Tư vấn hướng nghiệp"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Điểm <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    value={newActivity.diem}
                    onChange={(e) => setNewActivity({ ...newActivity, diem: e.target.value })}
                    placeholder="Ví dụ: 3"
                    min="0"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    value={newActivity.ghi_chu}
                    onChange={(e) => setNewActivity({ ...newActivity, ghi_chu: e.target.value })}
                    rows="3"
                    placeholder="Ghi chú (tùy chọn)"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setAddActivityModal({ show: false, diemRenLuyenId: null })}
                >
                  Hủy
                </button>
                <button className="btn btn-primary" onClick={handleSaveActivity}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={confirmModal.show}
        message={confirmModal.message}
        onConfirm={() => {
          if (confirmModal.onConfirm) {
            confirmModal.onConfirm()
          }
        }}
        onCancel={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
        title="Xác nhận xóa"
      />
    </AdminLayout>
  )
}
