import React, { useEffect, useState } from 'react'
import { getSinhVienId, apiFetch } from '../../api'
import { useNavigate, useLocation } from 'react-router-dom'

export default function LichHocLichThi() {
  const [lich, setLich] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { search } = useLocation()
  const mode = new URLSearchParams(search).get('mode') || 'hoc'

  useEffect(() => {
    const id = getSinhVienId()
    if (!id) return
    apiFetch(`/api/lich/${mode}?sinhVienId=${id}`)
      .then((data) => setLich(data || []))
      .catch(() => setLich([]))
      .finally(() => setLoading(false))
  }, [mode])

  const days = [
    { label: 'Thứ 2', date: '06/10/2025' },
    { label: 'Thứ 3', date: '07/10/2025' },
    { label: 'Thứ 4', date: '08/10/2025' },
    { label: 'Thứ 5', date: '09/10/2025' },
    { label: 'Thứ 6', date: '10/10/2025' },
    { label: 'Thứ 7', date: '11/10/2025' },
    { label: 'Chủ nhật', date: '12/10/2025' },
  ]
  const caHoc = ['Sáng', 'Chiều', 'Tối']

  if (loading) return <div className="text-center mt-5">Đang tải...</div>

  return (
    <div className="p-4" style={{ background: '#f7f9fb', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h4 className="fw-semibold m-0">
          Lịch {mode === 'hoc' ? 'học' : 'thi'} theo tuần
        </h4>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              checked={mode === 'hoc'}
              readOnly
            />
            <label className="form-check-label">Lịch học</label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              checked={mode === 'thi'}
              readOnly
            />
            <label className="form-check-label">Lịch thi</label>
          </div>
          <input type="date" className="form-control form-control-sm" defaultValue="2025-10-10" />
          <button className="btn btn-sm btn-outline-primary">Hiện tại</button>
          <button className="btn btn-sm btn-outline-secondary">In lịch</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)}>
            Trở về
          </button>
          <button className="btn btn-sm btn-outline-secondary">Tiếp →</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive shadow-sm border rounded-3 bg-white">
        <table className="table table-bordered align-middle text-center m-0" style={{ fontSize: 14 }}>
          <thead className="table-light">
            <tr>
              <th style={{ width: 100 }}>Ca học</th>
              {days.map((d) => (
                <th key={d.label}>
                  <div className="fw-semibold">{d.label}</div>
                  <div className="text-muted small">{d.date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {caHoc.map((ca) => (
              <tr key={ca}>
                <td className="fw-semibold bg-light">{ca}</td>
                {days.map((_, i) => {
                  const cell = lich.find(
                    (x) => x.thu === i + 2 && x.ca?.toLowerCase() === ca.toLowerCase()
                  )
                  return (
                    <td key={i} style={{ minWidth: 180, height: 120, verticalAlign: 'top' }}>
                      {cell ? (
                        <div
                          className={`p-2 rounded-3 text-start shadow-sm border border-1 ${
                            cell.loai === 'thuchanh'
                              ? 'bg-success-subtle border-success'
                              : cell.loai === 'tructuyen'
                              ? 'bg-info-subtle border-info'
                              : cell.loai === 'thi'
                              ? 'bg-warning-subtle border-warning'
                              : 'bg-light border-secondary'
                          }`}
                        >
                          <div className="fw-semibold">{cell.monHoc}</div>
                          <div className="small text-muted">{cell.lopHocPhan}</div>
                          <div className="small">Tiết: {cell.tiet}</div>
                          <div className="small">Phòng: {cell.phong}</div>
                          <div className="small">GV: {cell.giangVien}</div>
                        </div>
                      ) : (
                        <div style={{ height: 100 }}></div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nếu không có dữ liệu */}
      {(!lich || lich.length === 0) && (
        <div className="text-center text-muted mt-3">
          Không có dữ liệu {mode === 'hoc' ? 'lịch học' : 'lịch thi'} cho tuần này.
        </div>
      )}

      {/* Chú thích */}
      <div className="d-flex flex-wrap gap-4 mt-4 small text-muted">
        <div><span className="badge bg-secondary me-1">&nbsp;</span> Lịch học lý thuyết</div>
        <div><span className="badge bg-success me-1">&nbsp;</span> Lịch học thực hành</div>
        <div><span className="badge bg-info me-1">&nbsp;</span> Lịch học trực tuyến</div>
        <div><span className="badge bg-warning me-1">&nbsp;</span> Lịch thi</div>
        <div><span className="badge bg-danger me-1">&nbsp;</span> Lịch tạm ngưng</div>
      </div>
    </div>
  )
}
