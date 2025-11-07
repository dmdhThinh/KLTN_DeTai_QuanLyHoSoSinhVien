// src/pages/SinhVien/StudentDashboard.js
import React, { useEffect, useState } from 'react'
import { getSinhVienById, getSinhVienId, apiFetch } from '../../api'
import StudentLayout from '../../components/StudentLayout'
import dayjs from 'dayjs'
import '../../styles/SinhVien/StudentDashboard.css' // giữ nguyên đường dẫn cũ của bạn
import StudentDetailModal from './StudentDetailModal' // ⬅️ thêm import modal

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

  // ⬇️ state cho modal xem chi tiết
  const [openDetail, setOpenDetail] = useState(false)
  const [studentId, setStudentId] = useState(null)

  useEffect(() => {
    const id = getSinhVienId()
    if (!id) return
    setStudentId(id) // ⬅️ lưu lại để truyền vào modal

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
    <StudentLayout title="Trang tổng quan sinh viên">
      <div className="d-flex justify-content-center">
        <div className="w-100" style={{ maxWidth: 1300 }}>
          <div>
            <div className="row g-4">
              {/* Left: Profile summary */}
              <div className="col-lg-8">
                <div className="border rounded-3 p-4 h-100">
                  <div className="row g-4">
                    <div className="col-md-4 d-flex gap-3 align-items-center">
                      <div
                        className="rounded-circle bg-light border d-flex align-items-center justify-content-center overflow-hidden"
                        style={{ width: 80, height: 80, minWidth: 80 }}
                      >
                        {sv?.anhThe ? (
                          <img
                            alt="Ảnh thẻ sinh viên"
                            src={sv.anhThe}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image'
                            }}
                          />
                        ) : (
                          <div className="text-muted" style={{ fontSize: '32px' }}>
                            👤
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="fs-5 fw-semibold">{sv?.hoTen || '—'}</div>
                        {/* ⬇️ mở modal xem chi tiết (SV + người thân) */}
                        <button
                          className="btn btn-link p-0 small"
                          onClick={() => setOpenDetail(true)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>

                    <div className="col-md-8">
                      <div
                        className="row row-cols-2 g-2 small"
                        style={{ fontSize: '15px', lineHeight: '1.9', marginTop: '4px' }}
                      >
                        <div>
                          <div>
                            <span className="text-muted">MSSV:</span>{' '}
                            <span className="fw-semibold">{sv?.maSv || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <div>
                            <span className="text-muted">Lớp học:</span>{' '}
                            <span className="fw-semibold">{sv?.tenLop || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <div>
                            <span className="text-muted">Giới tính:</span>{' '}
                            <span className="fw-semibold">{sv?.gioiTinh || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <div>
                            <span className="text-muted">Khóa học:</span>{' '}
                            <span className="fw-semibold">{sv?.khoaHoc || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <div>
                            <span className="text-muted">Ngày sinh:</span>{' '}
                            <span className="fw-semibold">{sv?.ngaySinh || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <div>
                            <span className="text-muted">Ngành:</span>{' '}
                            <span className="fw-semibold">{sv?.tenNganh || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <div>
                            <span className="text-muted">Nơi sinh:</span>{' '}
                            <span className="fw-semibold">{sv?.diaChi || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <div>
                            <span className="text-muted">Khoa/Viện:</span>{' '}
                            <span className="fw-semibold">{sv?.tenKhoa || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Stats */}
              <div className="col-lg-4 d-flex flex-column gap-3">
                <StatCard title="Nhắc nhở mới" value={0} link="Xem chi tiết" />
                <div className="row g-2">
                  <div className="col-6">
                    <StatCard
                      title="Lịch học"
                      value={lichHocCount}
                      variant="stat-lichhoc"
                      link={<a href="/lich?mode=hoc">Xem chi tiết</a>}
                    />
                  </div>
                  <div className="col-6">
                    <StatCard
                      title="Lịch thi"
                      value={lichThiCount}
                      variant="stat-lichthi"
                      link={<a href="/lich?mode=thi">Xem chi tiết</a>}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ⬇️ Modal chi tiết SV + người thân */}
      <StudentDetailModal
        open={openDetail}
        studentId={studentId}
        onClose={() => setOpenDetail(false)}
      />
    </StudentLayout>
  )
}
