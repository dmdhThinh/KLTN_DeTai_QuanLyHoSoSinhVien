import React, { useEffect, useState } from 'react'
import { getSinhVienById, getSinhVienId, apiFetch } from '../../api'
import Header from '../../components/Header'
import dayjs from 'dayjs'
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
// 🧭 Hàm lấy thứ 2 đầu tuần
function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export default function StudentDashboard() {
  const [sv, setSv] = useState(null)
  const [lichHocCount, setLichHocCount] = useState(0)
  const [lichThiCount, setLichThiCount] = useState(0)

  useEffect(() => {
    const id = getSinhVienId()
    if (!id) return

    // Lấy thông tin sinh viên
    getSinhVienById(id)
      .then(setSv)
      .catch(() => {})

      // 🗓️ Xác định tuần hiện tại
    const weekStart = getMonday(new Date())
    const from = dayjs(weekStart).format('YYYY-MM-DD')

    // 🧩 Lấy số lượng lịch học trong tuần
    apiFetch(`/api/lich/hoc?sinhVienId=${id}&from=${from}`)
      .then((data) => {
        setLichHocCount(Array.isArray(data) ? data.length : 0)
      })
      .catch(() => setLichHocCount(0))

    // 🧩 Lấy số lượng lịch thi trong tuần
    apiFetch(`/api/lich/thi?sinhVienId=${id}&from=${from}`)
      .then((data) => {
        setLichThiCount(Array.isArray(data) ? data.length : 0)
      })
      .catch(() => setLichThiCount(0))
  }, [])

  return (
    <div>
      <Header />

      <div className="bg-white rounded-4 shadow p-4">
        <div className="row g-4">
          {/* Left: Profile summary */}
          <div className="col-lg-8">
            <div className="border rounded-3 p-4 h-100">
              <div className="row g-4">
                <div className="col-md-4 d-flex gap-3 align-items-center">
                  <div
                    className="rounded-circle bg-light border d-flex align-items-center justify-content-center"
                    style={{ width: 64, height: 64 }}
                  >
                    <img
                      alt="Avatar"
                      src={sv?.anhThe || ''}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <div>
                    <div className="fs-5 fw-semibold">{sv?.hoTen || '—'}</div>
                    <button className="btn btn-link p-0 small">
                      Xem chi tiết
                    </button>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="row row-cols-2 g-3 small">
                    <div>
                      <div className="text-muted">MSSV</div>
                      <div className="fw-semibold">{sv?.maSv || '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted">Lớp học</div>
                      <div className="fw-semibold">{sv?.tenLop || '-'}</div>
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
                      <div className="fw-semibold">{sv?.tenNganh || '-'}</div>
                    </div>
                    <div className="col-12">
                      <div className="text-muted">Nơi sinh</div>
                      <div className="fw-semibold">{sv?.diaChi || '-'}</div>
                    </div>
                    <div className="col-12">
                      <div className="text-muted">Khoa/Viện</div>
                      <div className="fw-semibold">{sv?.tenKhoa || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="col-lg-4 d-flex flex-column gap-3">
            <StatCard title="Nhắc nhở mới" value={0} link="Xem chi tiết" />
            <div className="row g-3">
              <div className="col-6">
                <StatCard
                  title="Lịch học"
                  value={lichHocCount}
                  variant="bg-light"
                  link={<a href="/lich?mode=hoc">Xem chi tiết</a>}
                />
              </div>
              <div className="col-6">
                <StatCard
                  title="Lịch thi"
                  value={lichThiCount}
                  variant="bg-light"
                  link={<a href="/lich?mode=thi">Xem chi tiết</a>}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
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
      {t === 'Kết quả học tập' ? (
        <a href="/diemso" style={{ textDecoration: 'none', color: 'inherit' }}>
          {t}
        </a>
      ) : (
        t
      )}
    </button>
          ))}
          
        </div>
      </div>
    </div>
  )
}
