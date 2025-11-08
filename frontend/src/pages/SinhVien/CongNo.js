import React, { useEffect, useState } from 'react'
import { getSinhVienId, apiFetch, getSinhVienById } from '../../api'
import StudentLayout from '../../components/StudentLayout'

export default function CongNo() {
  const [congNo, setCongNo] = useState([])
  const [thongKe, setThongKe] = useState(null)
  const [sv, setSv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterHocKy, setFilterHocKy] = useState('ALL')
  const [filterTinhTrang, setFilterTinhTrang] = useState('ALL')


  useEffect(() => {
    const sinhVienId = getSinhVienId()

    if (sinhVienId) {
      // Lấy thông tin sinh viên
      getSinhVienById(sinhVienId)
        .then(setSv)
        .catch(() => setSv(null))

      // Lấy công nợ
      apiFetch(`/api/hoc-phi/sinh-vien/${sinhVienId}`)
        .then(data => {
          if (data.success) {
            setCongNo(data.data.danhSachCongNo || [])
            setThongKe(data.data.thongKe || null)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Lỗi khi lấy công nợ:', err)
          setLoading(false)
        })
    }
  }, [])

  // Format tiền VND
  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount)
  }

  // Lọc danh sách công nợ
  const filteredCongNo = congNo.filter(item => {
    const matchHocKy = filterHocKy === 'ALL' || item.hocKy === filterHocKy
    const matchTinhTrang = filterTinhTrang === 'ALL' || item.trangThaiThucTe === filterTinhTrang
    return matchHocKy && matchTinhTrang
  })

  // Lấy danh sách học kỳ unique
  const uniqueHocKy = [...new Set(congNo.map(item => item.hocKy))]

  // Group by học kỳ và năm học
  const groupedByHocKy = filteredCongNo.reduce((acc, item) => {
    const key = `${item.hocKy} - ${item.namHoc}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {})

  if (loading) {
    return (
      <StudentLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="fw-bold mb-1">Tra cứu công nợ</h3>
                {sv && (
                  <p className="text-muted mb-0">
                    {sv.hoTen} - {sv.maSv} - {sv.tenLop}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        {thongKe && (
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Tổng tiền</p>
                      <h4 className="fw-bold mb-0">{formatCurrency(thongKe.tongTien)}</h4>
                    </div>
                    <div className="ms-2">
                      <i className="bi bi-cash-stack text-primary" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Đã thanh toán</p>
                      <h4 className="fw-bold mb-0 text-success">{formatCurrency(thongKe.daThanhToan)}</h4>
                    </div>
                    <div className="ms-2">
                      <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Còn nợ</p>
                      <h4 className="fw-bold mb-0 text-danger">{formatCurrency(thongKe.conNo)}</h4>
                    </div>
                    <div className="ms-2">
                      <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Tổng học phần</p>
                      <h4 className="fw-bold mb-0">{thongKe.tongSoHocPhan}</h4>
                      <small className="text-muted">
                        Chưa nộp: {thongKe.soHocPhanChuaNop} | Quá hạn: {thongKe.soHocPhanQuaHan}
                      </small>
                    </div>
                    <div className="ms-2">
                      <i className="bi bi-book text-info" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bộ lọc */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Học kỳ</label>
                <select 
                  className="form-select" 
                  value={filterHocKy} 
                  onChange={(e) => setFilterHocKy(e.target.value)}
                >
                  <option value="ALL">Tất cả học kỳ</option>
                  {uniqueHocKy.map(hk => (
                    <option key={hk} value={hk}>{hk}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Tình trạng</label>
                <select 
                  className="form-select" 
                  value={filterTinhTrang} 
                  onChange={(e) => setFilterTinhTrang(e.target.value)}
                >
                  <option value="ALL">Tất cả</option>
                  <option value="Đã nộp">Đã nộp</option>
                  <option value="Chưa nộp">Chưa nộp</option>
                  <option value="Quá hạn">Quá hạn</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách công nợ theo học kỳ */}
        {Object.keys(groupedByHocKy).length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
              <p className="text-muted mt-3">Không có dữ liệu công nợ</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedByHocKy).map(([hocKyNamHoc, items]) => (
            <div key={hocKyNamHoc} className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">{hocKyNamHoc}</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th width="5%">STT</th>
                        <th width="10%">Mã HP</th>
                        <th width="25%">Tên học phần</th>
                        <th width="8%" className="text-center">Tín chỉ</th>
                        <th width="12%" className="text-end">Số tiền</th>
                        <th width="10%" className="text-center">Hạn nộp</th>
                        <th width="10%" className="text-center">Lần thứ</th>
                        <th width="12%" className="text-center">Tình trạng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.maHocPhan}</td>
                          <td>{item.tenHocPhan}</td>
                          <td className="text-center">{item.soTinChi}</td>
                          <td className="text-end fw-bold">{formatCurrency(item.soTien)}</td>
                          <td className="text-center">
                            {item.hanNop ? new Date(item.hanNop).toLocaleDateString('vi-VN') : '---'}
                          </td>
                          <td className="text-center">{item.lanThu || 1}</td>
                          <td className="text-center">
                            {item.trangThaiThucTe === 'Đã nộp' && (
                              <span className="badge bg-success">Đã nộp</span>
                            )}
                            {item.trangThaiThucTe === 'Chưa nộp' && (
                              <span className="badge bg-warning text-dark">Chưa nộp</span>
                            )}
                            {item.trangThaiThucTe === 'Quá hạn' && (
                              <span className="badge bg-danger">Quá hạn</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-light fw-bold">
                        <td colSpan="4" className="text-end">Tổng cộng:</td>
                        <td className="text-end">
                          {formatCurrency(items.reduce((sum, item) => sum + parseFloat(item.soTien || 0), 0))}
                        </td>
                        <td colSpan="3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Lưu ý */}
        <div className="alert alert-info border-0 shadow-sm">
          <h6 className="alert-heading">
            <i className="bi bi-info-circle me-2"></i>Lưu ý
          </h6>
          <ul className="mb-0 small">
            <li>Vui lòng thanh toán học phí đúng hạn để tránh bị xếp vào danh sách "Quá hạn"</li>
            <li>Sinh viên có học phí quá hạn có thể bị hạn chế thi hoặc đăng ký học phần kỳ tiếp theo</li>
            <li>Nếu có thắc mắc về công nợ, vui lòng liên hệ phòng Tài chính - Kế toán</li>
          </ul>
        </div>
      </div>
    </StudentLayout>
  )
}
