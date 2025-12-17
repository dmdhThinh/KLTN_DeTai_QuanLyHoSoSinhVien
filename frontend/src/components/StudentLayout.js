import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { clearAuth, getSinhVienById, getSinhVienId, getUnreadCount, getUnreadMessageCount } from '../api'
import ChatBot from './ChatBot'

export default function StudentLayout({ children, title = '' }) {
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [studentName, setStudentName] = useState('Sinh viên')
  const [studentData, setStudentData] = useState(null)
  const [avatarError, setAvatarError] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const id = getSinhVienId()
        if (id) {
          const [studentData, unreadData, unreadMsgData] = await Promise.all([
            getSinhVienById(id).catch(() => null),
            getUnreadCount(id).catch(() => 0),
            getUnreadMessageCount(id).catch(() => 0)
          ])

          if (studentData) {
            if (studentData.hoTen) {
              setStudentName(studentData.hoTen)
            }
            setStudentData(studentData) // Lưu toàn bộ thông tin sinh viên để dùng cho avatar
            setAvatarError(false) // Reset avatar error khi load lại data
          }

          // Handle unread news count
          if (unreadData) {
            if (typeof unreadData === 'number') {
              setUnreadCount(unreadData)
            } else if (unreadData.count !== undefined) {
              setUnreadCount(unreadData.count)
            } else if (Array.isArray(unreadData)) {
               setUnreadCount(unreadData.length)
            }
          }

          // Handle unread message count
          if (typeof unreadMsgData === 'number') {
            setUnreadMessageCount(unreadMsgData)
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error)
      }
    }
    fetchStudentData()

    // Expose refresh function to global window so other components can call it
    window.refreshTuVanCount = fetchStudentData
  }, [])

  // Menu items để tìm kiếm
  const menuItems = [
    { name: 'Tổng quan', path: '/student', icon: 'bi-house-door' },
    { name: 'Lịch học lịch thi', path: '/lich', icon: 'bi-calendar-week' },
    { name: 'Kết quả học tập', path: '/diemso', icon: 'bi-journal-text' },
    { name: 'Chương trình khung', path: '/chuongtrinhkhung', icon: 'bi-diagram-3' },
    { name: 'Đăng ký học phần', path: '/dkhp', icon: 'bi-calendar-check' },
    { name: 'Công nợ', path: '/congno', icon: 'bi-cash-coin' },
    { name: 'Điểm rèn luyện', path: '/diem-ren-luyen', icon: 'bi-award' },
    { name: 'Học bổng', path: '/hoc-bong', icon: 'bi-trophy' },
    { name: 'Yêu cầu tư vấn', path: '/yeu-cau-tu-van', icon: 'bi-question-circle' }
  ]

  const filteredMenuItems = searchQuery
    ? menuItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : []

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSearchResults(value.length > 0)
  }

  const handleSearchItemClick = (path) => {
    setSearchQuery('')
    setShowSearchResults(false)
    window.location.href = path
  }

  // Custom scrollbar styling
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .student-scrollable-content::-webkit-scrollbar {
        width: 8px;
      }
      .student-scrollable-content::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .student-scrollable-content::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      .student-scrollable-content::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      .student-scrollable-content {
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f1f1;
        scroll-behavior: smooth;
      }
      .student-sidebar::-webkit-scrollbar {
        width: 6px;
      }
      .student-sidebar::-webkit-scrollbar-track {
        background: transparent;
      }
      .student-sidebar::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
      }
      .student-sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.5);
      }
      .student-sidebar {
        border-radius: 0 16px 16px 0;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      }
      .student-sidebar .nav-link {
        color: #6c757d;
        border-radius: 12px;
        padding: 10px 12px;
        transition: all 0.2s ease;
      }
      .student-sidebar .nav-link i {
        color: #adb5bd;
        transition: color 0.2s ease;
      }
      .student-sidebar .nav-link:hover {
        background-color: #f8f9fa;
        color: #495057;
      }
      .student-sidebar .nav-link:hover i {
        color: #6c757d;
      }
      .student-sidebar .nav-link.active {
        background: linear-gradient(135deg, #e7f3ff 0%, #d1ecf1 100%) !important;
        color: #0d6efd !important;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(13, 110, 253, 0.15);
      }
      .student-sidebar .nav-link.active i {
        color: #0d6efd !important;
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        className="bg-white text-dark d-flex flex-column p-3 shadow student-sidebar"
        style={{
          width: 250,
          height: '100vh',
          overflowY: 'auto',
          position: 'sticky',
          top: 0,
          left: 0,
          flexShrink: 0
        }}
      >
        <div className="d-flex flex-column align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid #e9ecef' }}>
          <img 
            src="/Logo.png" 
            alt="Logo Đại học Phương Nam" 
            style={{ width: '70px', height: '70px', objectFit: 'contain', marginBottom: '12px' }}
          />
          <span className="fw-semibold text-center" style={{ fontSize: '12px', lineHeight: '1.4', color: '#495057' }}>
            Trường Đại học Phương Nam
          </span>
        </div>

        <ul className="nav nav-pills flex-column gap-1 mb-auto" style={{ paddingTop: '8px' }}>
          <li>
            <a href="/student" className={`nav-link ${location.pathname === '/student' ? 'active' : ''}`}>
              <i className="bi bi-house-door me-2"></i> Tổng quan
            </a>
          </li>
          <li>
            <a href="/chuongtrinhkhung" className={`nav-link ${location.pathname === '/chuongtrinhkhung' ? 'active' : ''}`}>
              <i className="bi bi-diagram-3 me-2"></i> Chương trình khung
            </a>
          </li>
          <li>
            <a href="/lich" className={`nav-link ${location.pathname === '/lich' ? 'active' : ''}`}>
              <i className="bi bi-calendar-week me-2"></i> Lịch theo tuần
            </a>
          </li>
          <li>
            <a href="/diemso" className={`nav-link ${location.pathname === '/diemso' ? 'active' : ''}`}>
              <i className="bi bi-journal-text me-2"></i> Kết quả học tập
            </a>
          </li>

          <li>
            <a href="/dkhp" className={`nav-link ${location.pathname === '/dkhp' ? 'active' : ''}`}>
              <i className="bi bi-calendar-check me-2"></i> Đăng ký học phần
            </a>
          </li>
          <li>
            <a href="/congno" className={`nav-link ${location.pathname === '/congno' ? 'active' : ''}`}>
              <i className="bi bi-cash-coin me-2"></i> Công nợ
            </a>
          </li>
          <li>
            <a href="/yeu-cau-tu-van" className={`nav-link ${location.pathname === '/yeu-cau-tu-van' ? 'active' : ''}`}>
              <i className="bi bi-question-circle me-2"></i> Yêu cầu tư vấn
            </a>
          </li>
          <li>
            <a href="/diem-ren-luyen" className={`nav-link ${location.pathname === '/diem-ren-luyen' ? 'active' : ''}`}>
              <i className="bi bi-award me-2"></i> Điểm rèn luyện
            </a>
          </li>
          <li>
            <a href="/hoc-bong" className={`nav-link ${location.pathname === '/hoc-bong' ? 'active' : ''}`}>
              <i className="bi bi-trophy me-2"></i> Học bổng
            </a>
          </li>
          
        </ul>

      </aside>

      {/* Main content */}
      <main className="flex-grow-1 d-flex flex-column" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Fixed Header */}
        <div className="bg-white" style={{ 
          flexShrink: 0, 
          zIndex: 100,
          height: '64px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
        <div className="d-flex justify-content-between align-items-center w-100">
          <h4 className="fw-bold mb-0" style={{ fontSize: '20px', color: '#343a40' }}>{title}</h4>
          <div className="d-flex align-items-center gap-3">
            {/* Search Box */}
            <div className="position-relative" style={{ width: '280px' }}>
              <i 
                className="bi bi-search position-absolute" 
                style={{ 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#6c757d',
                  fontSize: '14px',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}
              ></i>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm menu..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                style={{ 
                  borderRadius: '24px',
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  border: '1px solid #e9ecef',
                  fontSize: '14px',
                  height: '38px'
                }}
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && filteredMenuItems.length > 0 && (
                <div 
                  className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border"
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    padding: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {filteredMenuItems.map((item, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark rounded-2"
                      style={{ 
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSearchItemClick(item.path)
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <i className={`bi ${item.icon}`} style={{ width: '20px', color: '#6c757d' }}></i>
                      <span style={{ fontSize: '14px' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <a 
              href="/yeu-cau-tu-van"
              className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none rounded-pill position-relative"
              style={{ 
                backgroundColor: '#f8f9fa',
                color: '#495057',
                border: '1px solid #e9ecef',
                transition: 'background-color 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eef2ff'
                e.currentTarget.style.borderColor = '#dfe3eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa'
                e.currentTarget.style.borderColor = '#e9ecef'
              }}
            >
              <div className="position-relative">
                <i className="bi bi-chat-dots" style={{ fontSize: '18px', color: '#6c757d' }}></i>
                {unreadMessageCount > 0 && (
                <span
                    className="position-absolute translate-middle badge rounded-pill bg-danger"
                    style={{
                      top: '-5px',
                      right: '-10px',
                      fontSize: '10px',
                      padding: '4px 6px',
                      border: '2px solid white'
                    }}
                  >
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                </span>
              )}
            </div>
              <span className="fw-semibold" style={{ fontSize: '14px' }}>Tin nhắn</span>
            </a>
            <a 
              href="/student/thongbao"
              className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none rounded-pill position-relative"
              style={{ 
                backgroundColor: '#f8f9fa',
                color: '#495057',
                border: '1px solid #e9ecef',
                transition: 'background-color 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff4e6'
                e.currentTarget.style.borderColor = '#ffe8cc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa'
                e.currentTarget.style.borderColor = '#e9ecef'
              }}
            >
              <div className="position-relative">
                <i className="bi bi-megaphone" style={{ fontSize: '18px', color: '#fd7e14' }}></i>
                {unreadCount > 0 && (
                <span
                    className="position-absolute translate-middle badge rounded-pill bg-danger"
                    style={{
                      top: '-5px',
                      right: '-10px',
                      fontSize: '10px',
                      padding: '4px 6px',
                      border: '2px solid white'
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
              <span className="fw-semibold" style={{ fontSize: '14px' }}>Tin tức</span>
            </a>

            {/* User Info */}
            <div className="position-relative">
              <div 
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                style={{ 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: showUserMenu ? '#f8f9fa' : 'transparent'
                }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                onMouseEnter={(e) => !showUserMenu && (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                onMouseLeave={(e) => !showUserMenu && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div className="text-muted small me-2">
                  Xin chào, <b style={{ color: '#495057' }}>{studentName}</b>
                </div>
                {studentData?.anhThe && !avatarError ? (
                  <img
                    src={studentData.anhThe}
                    alt="Ảnh đại diện"
                    className="rounded-circle"
                    style={{ 
                      width: '40px', 
                      height: '40px',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onError={() => {
                      // Nếu ảnh lỗi, set state để hiển thị chữ cái
                      setAvatarError(true)
                    }}
                  />
                ) : (
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                      width: '40px', 
                      height: '40px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}
                  >
                    {studentData?.hoTen ? studentData.hoTen.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}
                <i className={`bi bi-chevron-down ms-1`} style={{ fontSize: '12px', color: '#6c757d', transition: 'transform 0.2s', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}></i>
              </div>
              
              {/* Dropdown Menu */}
              {showUserMenu && (
                <div 
                  className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border"
                  style={{
                    minWidth: '200px',
                    zIndex: 1000,
                    padding: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <a 
                    href="/student/detail" 
                    className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark rounded-2"
                    style={{ transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="bi bi-person" style={{ width: '20px' }}></i>
                    <span style={{ fontSize: '14px' }}>Thông tin cá nhân</span>
                  </a>
                  <a 
                    href="/student/change-password" 
                    className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark rounded-2"
                    style={{ transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="bi bi-key" style={{ width: '20px' }}></i>
                    <span style={{ fontSize: '14px' }}>Đổi mật khẩu</span>
                  </a>
                  <hr className="my-1" style={{ margin: '4px 0' }} />
                  <button 
                    onClick={() => {
                      clearAuth()
                      window.location.href = '/login'
                    }}
                    className="w-100 d-flex align-items-center gap-2 px-3 py-2 border-0 bg-transparent text-danger rounded-2"
                    style={{ transition: 'background-color 0.2s', fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="bi bi-box-arrow-right" style={{ width: '20px' }}></i>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow-1 p-4 pt-3 student-scrollable-content" style={{ overflowY: 'auto', overflowX: 'hidden', background: '#f8f9fa' }}>
          {children}
        </div>
      </main>
      
      {/* ChatBot Component */}
      <ChatBot />
    </div>
  )
}
