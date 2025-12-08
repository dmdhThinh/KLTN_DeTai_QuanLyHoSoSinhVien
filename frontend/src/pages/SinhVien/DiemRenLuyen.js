import React, { useEffect, useState } from 'react'
import { getSinhVienId, apiFetch } from '../../api'
import StudentLayout from '../../components/StudentLayout'

export default function DiemRenLuyen() {
  const [diemRenLuyen, setDiemRenLuyen] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    const sinhVienId = getSinhVienId()
    if (sinhVienId) {
      apiFetch(`/api/import/training-scores/sinh-vien/${sinhVienId}`)
        .then(data => {
          setDiemRenLuyen(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(err => {
          console.error('Lỗi khi lấy điểm rèn luyện:', err)
          setDiemRenLuyen([])
          setLoading(false)
        })
    }
  }, [])

  const handleViewDetails = (item) => {
    setSelectedItem(item)
  }

  return (
    <StudentLayout title="Điểm rèn luyện">
      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <strong>📊 ĐIỂM RÈN LUYỆN</strong>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : diemRenLuyen.length === 0 ? (
            <div className="text-center text-muted py-4">Chưa có điểm rèn luyện</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>STT</th>
                    <th>Học kỳ</th>
                    <th>Năm học</th>
                    <th className="text-center">Điểm</th>
                    <th>Xếp loại</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {diemRenLuyen.map((drl, index) => (
                    <tr key={drl.id}>
                      <td>{index + 1}</td>
                      <td>{drl.hoc_ky}</td>
                      <td>{drl.nam_hoc}</td>
                      <td className="text-center fw-bold">{drl.so_diem || 0}</td>
                      <td>
                        <span className={`badge ${
                          drl.xep_loai === 'Xuất sắc' ? 'bg-success' :
                          drl.xep_loai === 'Tốt' ? 'bg-info' :
                          drl.xep_loai === 'Khá' ? 'bg-primary' :
                          drl.xep_loai === 'Trung bình' ? 'bg-warning' :
                          'bg-danger'
                        }`}>
                          {drl.xep_loai || 'Yếu'}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(drl)}
                        >
                          👁️ Xem chi tiết
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

      {/* Modal chi tiết hoạt động */}
      {selectedItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedItem(null)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  Chi tiết hoạt động rèn luyện - {selectedItem.hoc_ky} {selectedItem.nam_hoc}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedItem(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Điểm tổng:</strong> <span className="fs-4 fw-bold text-primary">{selectedItem.so_diem || 0}</span>
                  {' '}
                  <span className={`badge ${
                    selectedItem.xep_loai === 'Xuất sắc' ? 'bg-success' :
                    selectedItem.xep_loai === 'Tốt' ? 'bg-info' :
                    selectedItem.xep_loai === 'Khá' ? 'bg-primary' :
                    selectedItem.xep_loai === 'Trung bình' ? 'bg-warning' :
                    'bg-danger'
                  }`}>
                    {selectedItem.xep_loai || 'Yếu'}
                  </span>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '50px' }}>STT</th>
                        <th>Tên hoạt động</th>
                        <th style={{ width: '100px' }} className="text-center">Điểm</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.hoat_dong && selectedItem.hoat_dong.length > 0 ? (
                        selectedItem.hoat_dong.map((hd, idx) => (
                          <tr key={hd.id}>
                            <td>{idx + 1}</td>
                            <td>{hd.ten_hoat_dong}</td>
                            <td className="text-center fw-bold">+{hd.diem}</td>
                            <td>{hd.ghi_chu || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">Chưa có hoạt động</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="table-secondary">
                      <tr>
                        <td colSpan="2" className="text-end fw-bold">Tổng điểm:</td>
                        <td className="text-center fw-bold">
                          {selectedItem.hoat_dong ? selectedItem.hoat_dong.reduce((sum, hd) => sum + (hd.diem || 0), 0) : 0}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedItem(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  )
}

