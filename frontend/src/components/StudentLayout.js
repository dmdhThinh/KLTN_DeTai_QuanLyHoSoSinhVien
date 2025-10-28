import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { getSinhVienId, getSinhVienById } from '../api'
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function StudentLayout({ children, title = '' }) {
  const location = useLocation()
  const [sv, setSv] = useState(null)

  useEffect(() => {
    const id = getSinhVienId()
    if (!id) return

    getSinhVienById(id)
      .then((res) => {
        if (res) {
          const name = res.hoTen || res.ho_ten || 'Sinh viên'
          setSv({ ...res, hoTen: name })
        }
      })
      .catch(() => setSv(null))
  }, [])

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#f4f6fa' }}>
      {/* Sidebar */}
      <aside
        className="text-white d-flex flex-column p-3 shadow"
        style={{
          width: 250,
          background: 'linear-gradient(180deg, #0d3b66 0%, #133b5c 100%)',
        }}
      >
        <div className="d-flex align-items-center mb-4 ps-1">
          <i className="bi bi-mortarboard-fill fs-4 me-2 text-warning"></i>
          <span className="fs-5 fw-semibold text-white">Sinh Viên</span>
        </div>

        <ul className="nav nav-pills flex-column gap-1 mb-auto">
          <li>
            <Link
              to="/student"
              className={`nav-link ${
                location.pathname === '/student'
                  ? 'active'
                  : 'text-white-50'
              }`}
              style={{
                backgroundColor:
                  location.pathname === '/student' ? '#1e6091' : 'transparent',
                color: location.pathname === '/student' ? '#fff' : '#bcd0e8',
                borderRadius: '8px',
                transition: 'all 0.2s',
              }}
            >
              <i className="bi bi-house-door me-2"></i> Trang chủ
            </Link>
          </li>

          <div
            className="text-uppercase small mt-3 mb-1 ps-2"
            style={{ color: '#a6b9d5', letterSpacing: '0.5px' }}
          >
            MENU CHÍNH
          </div>

          <li>
            <Link
              to="/student/chuong-trinh-khung"
              className={`nav-link ${
                location.pathname.includes('/chuong-trinh-khung')
                  ? 'active'
                  : 'text-white-50'
              }`}
              style={{
                backgroundColor: location.pathname.includes('/chuong-trinh-khung')
                  ? '#1e6091'
                  : 'transparent',
                color: location.pathname.includes('/chuong-trinh-khung')
                  ? '#fff'
                  : '#bcd0e8',
                borderRadius: '8px',
                transition: 'all 0.2s',
              }}
            >
              <i className="bi bi-journal-text me-2"></i> Chương trình khung
            </Link>
          </li>

          <li>
            <Link
              to="/diemso"
              className={`nav-link ${
                location.pathname.includes('/diemso') ? 'active' : 'text-white-50'
              }`}
              style={{
                backgroundColor: location.pathname.includes('/diemso')
                  ? '#1e6091'
                  : 'transparent',
                color: location.pathname.includes('/diemso')
                  ? '#fff'
                  : '#bcd0e8',
                borderRadius: '8px',
                transition: 'all 0.2s',
              }}
            >
              <i className="bi bi-bar-chart-line me-2"></i> Kết quả học tập
            </Link>
          </li>

          <li>
            <Link
              to="/lich"
              className={`nav-link ${
                location.pathname.includes('/lich')
                  ? 'active'
                  : 'text-white-50'
              }`}
              style={{
                backgroundColor: location.pathname.includes('/lich')
                  ? '#1e6091'
                  : 'transparent',
                color: location.pathname.includes('/lich')
                  ? '#fff'
                  : '#bcd0e8',
                borderRadius: '8px',
                transition: 'all 0.2s',
              }}
            >
              <i className="bi bi-calendar-week me-2"></i> Lịch theo tuần
            </Link>
          </li>

          <li>
            <Link
              to="/student/cong-no"
              className={`nav-link ${
                location.pathname.includes('/cong-no')
                  ? 'active'
                  : 'text-white-50'
              }`}
              style={{
                backgroundColor: location.pathname.includes('/cong-no')
                  ? '#1e6091'
                  : 'transparent',
                color: location.pathname.includes('/cong-no')
                  ? '#fff'
                  : '#bcd0e8',
                borderRadius: '8px',
                transition: 'all 0.2s',
              }}
            >
              <i className="bi bi-cash-coin me-2"></i> Tra cứu công nợ
            </Link>
          </li>
        </ul>

        <div className="border-top pt-3 mt-3">
          <a
            href="/login"
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center fw-semibold"
            style={{
              borderRadius: '8px',
              border: '1px solid #f28b82',
              color: '#f28b82',
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-semibold mb-0">{title}</h5>
          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Tìm kiếm..."
              style={{ maxWidth: 250 }}
            />
            <div className="text-muted small">
              Xin chào, <b>{sv?.hoTen || 'Sinh viên'}</b>
            </div>
            <div
              className="rounded-circle bg-light border"
              style={{ width: 32, height: 32 }}
            ></div>
          </div>
        </div>
        <div>{children}</div>
      </main>
    </div>
  )
}
