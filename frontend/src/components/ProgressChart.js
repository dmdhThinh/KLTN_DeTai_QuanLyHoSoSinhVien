import React, { useEffect, useState } from 'react'
import { apiFetch } from '../api'

export default function ProgressChart({ sinhVienId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sinhVienId) return

    const loadData = async () => {
      try {
        setLoading(true)
        const response = await apiFetch(`/api/hoc-tap/tien-do/${sinhVienId}`)
        setData(response)
      } catch (error) {
        console.error('Lỗi khi tải tiến độ học tập:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [sinhVienId])

  if (loading) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body text-center text-muted py-5">
          <i className="bi bi-exclamation-circle fs-1"></i>
          <p className="mt-2">Không có dữ liệu</p>
        </div>
      </div>
    )
  }

  const { tongTinChi, tinChiHoanThanh } = data
  const percent = tongTinChi > 0 ? Math.round((tinChiHoanThanh / tongTinChi) * 100) : 0
  const isOverLimit = tinChiHoanThanh > tongTinChi
  const tinChiConLai = tongTinChi - tinChiHoanThanh
  const tinChiVuotQua = isOverLimit ? tinChiHoanThanh - tongTinChi : 0

  // SVG circle parameters
  const size = 200
  const strokeWidth = 20
  const center = size / 2
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  // Giới hạn progress circle ở 100% (khi vượt quá vẫn hiển thị đầy)
  const displayPercent = Math.min(percent, 100)
  const offset = circumference - (displayPercent / 100) * circumference
  // Giữ màu xanh lá
  const progressColor = '#28a745'

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h6 className="card-title mb-4">
          <i className="bi bi-graph-up-arrow me-2 text-success"></i>
          Tiến độ học tập
        </h6>

        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '250px' }}>
          <div className="position-relative">
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#e9ecef"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={progressColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.3s ease-in-out'
                }}
              />
            </svg>

            {/* Center text */}
            <div
              className="position-absolute top-50 start-50 translate-middle text-center"
              style={{ width: '140px' }}
            >
              <div className="small text-muted mb-1">Đã hoàn thành</div>
              <div className="fs-1 fw-bold text-success">
                {percent}%
              </div>
              <div className="small text-muted mt-2">
                <strong>{tinChiHoanThanh}</strong>/<strong>{tongTinChi}</strong> tín chỉ
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center">
          <div className="d-flex justify-content-around">
            <div>
              <div className="small text-muted">Tổng tín chỉ</div>
              <div className="fw-semibold fs-5">{tongTinChi}</div>
            </div>
            <div className="vr"></div>
            <div>
              <div className="small text-muted">Đã hoàn thành</div>
              <div className="fw-semibold fs-5 text-success">{tinChiHoanThanh}</div>
            </div>
            <div className="vr"></div>
            <div>
              <div className="small text-muted">{isOverLimit ? 'Vượt quá' : 'Còn lại'}</div>
              <div className={`fw-semibold fs-5 ${isOverLimit ? 'text-success' : 'text-warning'}`}>
                {isOverLimit ? `+${tinChiVuotQua}` : tinChiConLai}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
