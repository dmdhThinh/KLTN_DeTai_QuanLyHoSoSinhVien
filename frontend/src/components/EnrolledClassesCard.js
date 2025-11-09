import React, { useEffect, useState } from 'react'
import { apiFetch } from '../api'

export default function EnrolledClassesCard({ sinhVienId }) {
  const [hocKyList, setHocKyList] = useState([])
  const [selectedHocKy, setSelectedHocKy] = useState('')
  const [lopHocPhanList, setLopHocPhanList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sinhVienId) return

    const loadHocKy = async () => {
      try {
        const response = await apiFetch(`/api/hoc-tap/hoc-ky/${sinhVienId}`)
        const data = response.data || []
        setHocKyList(data)
        
        // Chọn học kỳ mới nhất mặc định
        if (data.length > 0) {
          const latest = data[0]
          setSelectedHocKy(`${latest.hocKy}-${latest.namHoc}`)
          loadLopHocPhan(latest.hocKy, latest.namHoc)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách học kỳ:', error)
        setLoading(false)
      }
    }

    loadHocKy()
  }, [sinhVienId])

  const loadLopHocPhan = async (hocKy, namHoc) => {
    try {
      setLoading(true)
      const response = await apiFetch(
        `/api/hoc-tap/lop-hoc-phan/${sinhVienId}?hocKy=${hocKy}&namHoc=${encodeURIComponent(namHoc)}`
      )
      setLopHocPhanList(response.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách lớp học phần:', error)
      setLopHocPhanList([])
    } finally {
      setLoading(false)
    }
  }

  const handleHocKyChange = (e) => {
    const value = e.target.value
    setSelectedHocKy(value)
    
    const [hocKy, namHoc] = value.split('-')
    loadLopHocPhan(hocKy, namHoc)
  }

  const tongTinChi = lopHocPhanList.reduce((sum, lhp) => sum + (lhp.soTinChi || 0), 0)

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="card-title mb-0">
            <i className="bi bi-journal-bookmark me-2 text-primary"></i>
            Lớp học phần
          </h6>
          
          {hocKyList.length > 0 && (
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto', minWidth: '180px' }}
              value={selectedHocKy}
              onChange={handleHocKyChange}
            >
              {hocKyList.map((hk) => (
                <option key={`${hk.hocKy}-${hk.namHoc}`} value={`${hk.hocKy}-${hk.namHoc}`}>
                  HK{hk.hocKy} ({hk.namHoc})
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : lopHocPhanList.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-inbox fs-3"></i>
            <p className="mt-2 mb-0 small">Chưa có lớp học phần nào</p>
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light sticky-top">
                  <tr>
                    <th className="small text-muted">Môn học/Lớp học phần</th>
                    <th className="text-end small text-muted" style={{ width: '80px' }}>Số tín chỉ</th>
                  </tr>
                </thead>
                <tbody>
                  {lopHocPhanList.map((lhp) => (
                    <tr key={lhp.id}>
                      <td>
                        <div className="small">
                          <a
                            href="#"
                            className="text-primary text-decoration-none fw-semibold"
                            onClick={(e) => {
                              e.preventDefault()
                              // Optional: Navigate to class detail
                            }}
                          >
                            {lhp.maLopHocPhan}
                          </a>
                        </div>
                        <div className="small text-muted">{lhp.tenHocPhan}</div>
                      </td>
                      <td className="text-end">
                        <span className="badge bg-light text-dark">{lhp.soTinChi}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border-top mt-3 pt-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Tổng cộng</span>
                <span className="badge bg-primary">{tongTinChi} tín chỉ</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
