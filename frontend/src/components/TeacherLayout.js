import React, { useEffect, useState, useRef } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { getGiangVienId, getGiangVienById, apiFetch, getUnreadCountGiangVien, clearAuth } from '../api'
import { Bell, MessageCircle } from 'lucide-react'
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function TeacherLayout({ children, title = '', activeMenu = '' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [gv, setGv] = useState(null)
  const [tuVanCount, setTuVanCount] = useState(0)
  const [thongBaoCount, setThongBaoCount] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // Lấy thông tin giảng viên đang đăng nhập
  useEffect(() => {
    const id = getGiangVienId()
    if (!id) return

    getGiangVienById(id)
      .then((res) => {
        if (res) {
          const name = res.hoTen || res.ho_ten || 'Giảng viên'
          setGv({ ...res, hoTen: name })
        }
      })
      .catch(() => setGv(null))

    // Lấy số yêu cầu tư vấn mới
    const fetchTuVanCount = () => {
      apiFetch(`/api/yeu-cau-tu-van/giang-vien/${id}/count`)
        .then((res) => setTuVanCount(res.count || 0))
        .catch(() => setTuVanCount(0))
    }
    
    // Lấy số thông báo chưa đọc
    const fetchThongBaoCount = () => {
      getUnreadCountGiangVien(id)
        .then((res) => setThongBaoCount(res.count || 0))
        .catch(() => setThongBaoCount(0))
    }
    
    fetchTuVanCount()
    fetchThongBaoCount()
    
    // Cập nhật mỗi 5 giây
    const interval = setInterval(() => {
      fetchTuVanCount()
      fetchThongBaoCount()
    }, 5000)
    
    // Expose refresh function globally for child components
    window.refreshTuVanCount = fetchTuVanCount
    window.refreshThongBaoCount = fetchThongBaoCount
    
    return () => {
      clearInterval(interval)
      delete window.refreshTuVanCount
      delete window.refreshThongBaoCount
    }
  }, [])

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  // Custom scrollbar styling
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .teacher-scrollable-content::-webkit-scrollbar {
        width: 8px;
      }
      .teacher-scrollable-content::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      .teacher-scrollable-content::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      .teacher-scrollable-content::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      .teacher-scrollable-content {
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f1f1;
        scroll-behavior: smooth;
      }
      .teacher-sidebar::-webkit-scrollbar {
        width: 6px;
      }
      .teacher-sidebar::-webkit-scrollbar-track {
        background: transparent;
      }
      .teacher-sidebar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }
      .teacher-sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        className="bg-dark text-white d-flex flex-column p-3 shadow teacher-sidebar"
        style={{
          width: 250,
          height: '100vh',
          overflowY: 'auto',
          position: 'sticky',
          top: 0,
          left: 0,
          flexShrink: 0,
        }}
      >
        <div className="d-flex align-items-center mb-4">
          <i className="bi bi-mortarboard-fill fs-4 me-2 text-success"></i>
          <span className="fs-5 fw-semibold">Giảng Viên</span>
        </div>

        <ul className="nav nav-pills flex-column gap-1 mb-auto">
          <li>
            <a
              href="/teacher"
              className={`nav-link ${
                location.pathname === '/teacher' ? 'active bg-success' : 'text-white-50'
              }`}
            >
              <i className="bi bi-house-door me-2"></i> Tổng quan
            </a>
          </li>

          <div className="text-uppercase small text-white-50 mt-3 mb-1 ps-3">
            Chức năng
          </div>

          <li>
            <a
              href="/teacher/lop-covan"
              className={`nav-link ${
                location.pathname.includes('/lop-covan')
                  ? 'active bg-success'
                  : 'text-white-50'
              }`}
            >
              <i className="bi bi-people me-2"></i> Lớp cố vấn
            </a>
          </li>

          <li>
            <a
              href="/teacher/sv-lop"
              className={`nav-link ${
                location.pathname.includes('/sv-lop')
                  ? 'active bg-success'
                  : 'text-white-50'
              }`}
            >
              <i className="bi bi-person-lines-fill me-2"></i> SV trong lớp
            </a>
          </li>

          <li>
            <Link
              to="/teacher/lophocphan"
              className={`nav-link ${
                (location.pathname.includes('/teacher/lophocphan') ||
                  location.pathname.includes('/teacher/nhapdiem'))
                  ? 'active bg-success'
                  : 'text-white-50'
              }`}
            >
              <i className="bi bi-pencil-square me-2"></i> Nhập điểm
            </Link>
          </li>

          {/* ĐÃ THÊM LẠI: Lịch giảng dạy */}
          <li>
            <Link
              to="/teacher/lich"
              className={`nav-link ${
                location.pathname.includes('/teacher/lich')
                  ? 'active bg-success'
                  : 'text-white-50'
              }`}
            >
              <i className="bi bi-calendar3 me-2"></i> Lịch giảng dạy
            </Link>
          </li>

          <li>
            <Link
              to="/teacher/yeu-cau-tu-van"
              className={`nav-link ${
                location.pathname.includes('/yeu-cau-tu-van')
                  ? 'active bg-success'
                  : 'text-white-50'
              }`}
            >
              <i className="bi bi-chat-dots me-2"></i> Yêu cầu tư vấn
            </Link>
          </li>

          <li>
            <Link
              to="/teacher/thong-bao"
              className={`nav-link ${
                location.pathname.includes('/thong-bao')
                  ? 'active bg-success'
                  : 'text-white-50'
              }`}
            >
              <i className="bi bi-bell me-2"></i> Thông báo
            </Link>
          </li>
        </ul>

        <div className="border-top pt-3 mt-3">
          <button
            onClick={handleLogout}
            className="btn btn-danger w-100 d-flex align-items-center justify-content-center fw-semibold"
            style={{ borderRadius: '8px' }}
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

            {/* Tin tức + Tin nhắn + Thông tin GV */}
            <div className="d-flex align-items-center gap-4" ref={menuRef}>
              {/* Tin tức */}
              <Link
                to="/teacher/thong-bao"
                className="position-relative text-secondary small d-flex align-items-center gap-1 iuh-hover-item text-decoration-none"
              >
                <Bell size={16} />
                <span>Tin tức</span>
                {thongBaoCount > 0 && (
                  <span
                    className="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill"
                    style={{ fontSize: 10 }}
                  >
                    {thongBaoCount}
                  </span>
                )}
              </Link>

              {/* Tin nhắn */}
              <Link
                to="/teacher/yeu-cau-tu-van"
                className="position-relative text-secondary small d-flex align-items-center gap-1 iuh-hover-item text-decoration-none"
              >
                <MessageCircle size={16} />
                <span>Tin nhắn</span>
                {tuVanCount > 0 && (
                  <span
                    className="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill"
                    style={{ fontSize: 10 }}
                  >
                    {tuVanCount}
                  </span>
                )}
              </Link>

              {/* Dropdown thông tin giảng viên */}
              <div className="text-muted small dropdown">
                Xin chào,{' '}
                <b
                  className="text-primary"
                  onClick={() => setShowMenu((prev) => !prev)}
                  style={{ cursor: 'pointer' }}
                >
                  {gv?.hoTen || 'Giảng viên'}
                </b>
                {showMenu && (
                  <div
                    className="student-dropdown-menu shadow-lg border-0 rounded-3 bg-white position-absolute end-0 mt-2"
                    style={{
                      zIndex: 9999,
                      minWidth: '220px',
                      animation: 'fadeInDown 0.2s ease-out',
                    }}
                  >
                    <button
                      className="student-dropdown-item"
                      onClick={() => {
                        setShowMenu(false)
                        navigate('/teacher')
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
                        navigate('/change-password')
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
                className="rounded-circle bg-light border d-flex align-items-center justify-content-center overflow-hidden"
                style={{ width: 40, height: 40, cursor: 'pointer' }}
                onClick={() => setShowMenu((prev) => !prev)}
              >
                {gv?.anh_the || gv?.anhThe ? (
                  <img
                    src={gv.anh_the || gv.anhThe}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <i className="bi bi-person-circle text-secondary" style={{ fontSize: '28px' }}></i>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div
          className="flex-grow-1 p-4 pt-3 teacher-scrollable-content"
          style={{ overflowY: 'auto', overflowX: 'hidden', background: '#f8f9fa' }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}