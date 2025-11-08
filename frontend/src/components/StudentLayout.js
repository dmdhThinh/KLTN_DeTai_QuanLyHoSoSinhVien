import React, { useEffect, useState, useRef } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  getRole,
  getSinhVienId,
  getSinhVienById,
  getGiangVienId,
  getGiangVienById,
  clearAuth,
  getUnreadCount
} from '../api'
import { Bell } from 'lucide-react'
import 'bootstrap-icons/font/bootstrap-icons.css'


export default function StudentLayout({ children, title = '' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sv, setSv] = useState(null)
  const [unread, setUnread] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // Custom scrollbar styling
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .flex-grow-1[style*="overflowY"]::-webkit-scrollbar {
        width: 8px;
      }
      .flex-grow-1[style*="overflowY"]::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .flex-grow-1[style*="overflowY"]::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      .flex-grow-1[style*="overflowY"]::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      .flex-grow-1[style*="overflowY"] {
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f1f1;
        scroll-behavior: smooth;
      }
      aside::-webkit-scrollbar {
        width: 6px;
      }
      aside::-webkit-scrollbar-track {
        background: transparent;
      }
      aside::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }
      aside::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  // ✅ Lấy thông tin sinh viên + số tin chưa đọc
  useEffect(() => {
    const role = getRole()
    if (role === 'Sinh viên') {
      const id = getSinhVienId()
      if (id) {
        getSinhVienById(id)
          .then((res) => setSv(res))
          .catch(() => setSv(null))

        getUnreadCount(id)
          .then((res) => setUnread(res.count || 0))
          .catch(() => setUnread(0))
      }
    } else if (role === 'Giảng viên') {
      const id = getGiangVienId()
      if (id)
        getGiangVienById(id)
          .then((res) => setSv(res))
          .catch(() => setSv(null))
    }
  }, [])

  // ✅ Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ✅ Đăng xuất
  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        className="text-white d-flex flex-column p-3 shadow"
        style={{
          width: 250,
          height: '100vh',
          background: 'linear-gradient(180deg, #0d3b66 0%, #133b5c 100%)',
          overflowY: 'auto',
          position: 'sticky',
          top: 0,
          left: 0,
          flexShrink: 0
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
                location.pathname === '/student' ? 'active' : 'text-white-50'
              }`}
              style={{
                backgroundColor:
                  location.pathname === '/student' ? '#1e6091' : 'transparent',
                color:
                  location.pathname === '/student' ? '#fff' : '#bcd0e8',
                borderRadius: '8px',
                transition: 'all 0.2s'
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
              to="/chuongtrinhkhung"
              className={`nav-link ${
                location.pathname.includes('/chuongtrinhkhung')
                  ? 'active'
                  : 'text-white-50'
              }`}
              style={{
                backgroundColor: location.pathname.includes('/chuongtrinhkhung')
                  ? '#1e6091'
                  : 'transparent',
                color: location.pathname.includes('/chuongtrinhkhung')
                  ? '#fff'
                  : '#bcd0e8',
                borderRadius: '8px',
                transition: 'all 0.2s'
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
                transition: 'all 0.2s'
              }}
            >
              <i className="bi bi-bar-chart-line me-2"></i> Kết quả học tập
            </Link>
          </li>

          <li>
            <Link
              to="/lich"
              className={`nav-link ${
                location.pathname.includes('/lich') ? 'active' : 'text-white-50'
              }`}
              style={{
                backgroundColor: location.pathname.includes('/lich')
                  ? '#1e6091'
                  : 'transparent',
                color: location.pathname.includes('/lich')
                  ? '#fff'
                  : '#bcd0e8',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
            >
              <i className="bi bi-calendar-week me-2"></i> Lịch theo tuần
            </Link>
          </li>
          <li>
            <Link
              to="/dkhp"
              className={`nav-link ${
                location.pathname.includes('/dkhp') ? 'active' : 'text-white-50'
              }`}
              style={{
                backgroundColor: location.pathname.includes('/dkhp')
                  ? '#1e6091'
                  : 'transparent',
                color: location.pathname.includes('/dkhp')
                  ? '#fff'
                  : '#bcd0e8',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
            >
              <i className="bi bi-calendar-week me-2"></i> Đăng ký học phần
            </Link>
          </li>

          <li>
            <Link
              to="/congno"
              className={`nav-link ${
                location.pathname.includes('/congno')
                  ? 'active'
                  : 'text-white-50'
              }`}
              style={{
                backgroundColor: location.pathname.includes('/congno')
                  ? '#1e6091'
                  : 'transparent',
                color: location.pathname.includes('/congno')
                  ? '#fff'
                  : '#bcd0e8',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
            >
              <i className="bi bi-cash-coin me-2"></i> Tra cứu công nợ
            </Link>
          </li>
        </ul>

        <div className="border-top pt-3 mt-3">
          <button
            onClick={handleLogout}
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center fw-semibold"
            style={{
              borderRadius: '8px',
              border: '1px solid #f28b82',
              color: '#f28b82'
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1 d-flex flex-column" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Fixed Header */}
        <div className="p-4 pb-3 bg-white shadow-sm" style={{ flexShrink: 0, zIndex: 100 }}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="fw-semibold mb-0">{title}</h5>

          {/* 🔔 Tin tức + User dropdown */}
          <div className="d-flex align-items-center gap-4" ref={menuRef}>
            {/* Tin tức */}
            <div
              className="position-relative text-secondary small d-flex align-items-center gap-1 iuh-hover-item"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/student/thongbao')}
            >
              <Bell size={16} />
              <span>Tin tức</span>
              {unread > 0 && (
                <span
                  className="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill"
                  style={{ fontSize: 10 }}
                >
                  {unread}
                </span>
              )}
            </div>

            {/* Thông tin SV */}
            <div className="text-muted small dropdown">
              Xin chào,{' '}
              <b
                className="text-primary"
                onClick={() => setShowMenu((prev) => !prev)}
                style={{ cursor: 'pointer' }}
              >
                {sv?.hoTen || 'Sinh viên'}
              </b>
              {showMenu && (
                <div 
                  className="student-dropdown-menu shadow-lg border-0 rounded-3 bg-white position-absolute end-0 mt-2"
                  style={{ 
                    zIndex: 9999,
                    minWidth: '220px',
                    animation: 'fadeInDown 0.2s ease-out'
                  }}
                >
                  <button 
                    className="student-dropdown-item"
                    onClick={() => {
                      setShowMenu(false)
                      navigate('/student/detail')
                    }}
                  >
                    <i className="bi bi-person-circle me-2" style={{ fontSize: '16px' }}></i>
                    <span>Thông tin cá nhân</span>
                  </button>
                  <div className="dropdown-divider mx-2"></div>
                  <button 
                    className="student-dropdown-item"
                    onClick={() => {
                      setShowMenu(false)
                      navigate('/student/change-password')
                    }}
                  >
                    <i className="bi bi-shield-lock me-2" style={{ fontSize: '16px' }}></i>
                    <span>Đổi mật khẩu</span>
                  </button>
                  <div className="dropdown-divider mx-2"></div>
                  <button
                    className="student-dropdown-item student-dropdown-item-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2" style={{ fontSize: '16px' }}></i>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
            <div
              className="rounded-circle bg-light border overflow-hidden d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40, cursor: 'pointer' }}
              onClick={() => setShowMenu((prev) => !prev)}
            >
              {sv?.anhThe ? (
                <img
                  src={sv.anhThe}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <i className="bi bi-person-circle text-secondary" style={{ fontSize: '24px' }}></i>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow-1 p-4 pt-3" style={{ overflowY: 'auto', overflowX: 'hidden', background: '#f4f6fa' }}>
          {children}
        </div>
      </main>
    </div>
  )
}