import React, { useEffect, useState } from 'react'
import { getSinhVienById, getSinhVienId } from '../../api'

function StatCard({ title, value, variant, link }) {
  return (
    <div className={`border rounded-3 p-3 ${variant || ''}`}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="text-muted small">{title}</div>
        {link && <button className="btn btn-link p-0 small">{link}</button>}
      </div>
      <div className="fs-2 fw-semibold mt-1">{value}</div>
    </div>
  )
}

export default function StudentDashboard() {
  const [sv, setSv] = useState(null)

  useEffect(() => {
    const id = getSinhVienId()
    if (!id) return
    getSinhVienById(id).then(setSv).catch(() => {})
  }, [])

  return (
    <div className="p-4 p-md-5">
      {/* Top bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input className="form-control w-auto" style={{minWidth: 260}} placeholder="Tìm kiếm..." />
        <div className="small">Trang chủ • Tin tức • User</div>
      </div>

      {/* Main content card */}
      <div className="bg-white rounded-4 shadow p-4">
        <div className="row g-4">
          {/* Left: Profile summary */}
          <div className="col-lg-8">
            <div className="border rounded-3 p-4 h-100">
              <div className="row g-4">
                {/* Avatar + name */}
                <div className="col-md-4 d-flex gap-3 align-items-center">
                  <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center" style={{width:64,height:64}}>
                    <img alt="Avatar" src={sv?.anhThe || ''} onError={(e)=>{ e.currentTarget.style.display='none' }} />
                  </div>
                  <div>
                    <div className="fs-5 fw-semibold">{sv?.hoTen || '—'}</div>
                    <button className="btn btn-link p-0 small">Xem chi tiết</button>
                  </div>
                </div>

                {/* Info grid */}
                <div className="col-md-8">
                  <div className="row row-cols-2 g-3 small">
                    <div>
                      <div className="text-muted">MSSV</div>
                      <div className="fw-semibold">{sv?.maSv || '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted">Lớp học</div>
                      <div className="fw-semibold">{sv?.lop }</div>
                    </div>
                    <div>
                      <div className="text-muted">Giới tính</div>
                      <div className="fw-semibold">{sv?.gioiTinh || '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted">Khóa học</div>
                      <div className="fw-semibold">{sv?.khoaHoc || '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted">Ngày sinh</div>
                      <div className="fw-semibold">{sv?.ngaySinh || '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted">Ngành</div>
                      <div className="fw-semibold">{sv?.nganh  }</div>
                    </div>
                    <div className="col-12">
                      <div className="text-muted">Nơi sinh</div>
                      <div className="fw-semibold">{sv?.diaChi || '-'}</div>
                    </div>
                    <div className="col-12">
                      <div className="text-muted">Khoa/Viện</div>
                      <div className="fw-semibold">{sv?.khoa || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Reminders + small stats */}
          <div className="col-lg-4 d-flex flex-column gap-3">
            <StatCard title="Nhắc nhở mới" value={0} link="Xem chi tiết" />
            <div className="row g-3">
              <div className="col-6">
  <StatCard
    title="Lịch học"
    value={0}
    variant="bg-light"
    link={<a href="/lich?mode=hoc">Xem chi tiết</a>}
  />
</div>
<div className="col-6">
  <StatCard
    title="Lịch thi"
    value={0}
    variant="bg-light"
    link={<a href="/lich?mode=thi">Xem chi tiết</a>}
  />
</div>

            </div>
          </div>
        </div>

        {/* Horizontal actions */}
        <div className="d-flex gap-2 gap-md-3 mt-4 overflow-auto pb-2">
          {[
            'Lịch theo tuần',
            'Kết quả học tập',
            'Đăng ký học phần',
            'Hồ sơ điện tử',
            'Tra cứu công nợ',
            'Thanh toán trực tuyến',
            'Phiếu thu tổng hợp',
            'Lịch theo tiến độ',
            'Nhắc nhở ',
            'Khảo sát',
          ].map((t) => (
            <button key={t} className="btn btn-outline-secondary rounded-3">
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


