import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { clearAuth, getGiangVienId, getUnreadCountGiangVien, getUnreadMessageCountGiangVien } from '../api'

export default function TeacherLayout({ children, title = '', activeMenu = '', gvName = '' }) {
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const id = getGiangVienId()
        if (id) {
          const [unreadData, unreadMsgData] = await Promise.all([
            getUnreadCountGiangVien(id).catch(() => 0),
            getUnreadMessageCountGiangVien(id).catch(() => 0)
          ])

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
        console.error('Error fetching teacher data:', error)
      }
    }
    fetchTeacherData()

    // Expose refresh function
    window.refreshTuVanCount = fetchTeacherData
  }, [])


  // Menu items để tìm kiếm
  const menuItems = [
    { name: 'Tổng quan', path: '/teacher', icon: 'bi-house-door' },
    { name: 'Lớp học phần', path: '/teacher/lophocphan', icon: 'bi-collection' },
    { name: 'Sinh viên trong lớp', path: '/teacher/sv-lop', icon: 'bi-people' },
    { name: 'Lịch giảng dạy', path: '/teacher/lich', icon: 'bi-calendar-week' },
    { name: 'Nhập điểm', path: '/teacher/nhapdiem', icon: 'bi-clipboard-check' },

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
      .teacher-scrollable-content::-webkit-scrollbar {
        width: 8px;
      }
      .teacher-scrollable-content::-webkit-scrollbar-track {
        background: #f1f1f1;
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
        background: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
      }
      .teacher-sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.5);
      }
      .teacher-sidebar {
        border-radius: 0 16px 16px 0;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      }
      .teacher-sidebar .nav-link {
        color: #6c757d;
        border-radius: 12px;
        padding: 10px 12px;
        transition: all 0.2s ease;
      }
      .teacher-sidebar .nav-link i {
        color: #adb5bd;
        transition: color 0.2s ease;
      }
      .teacher-sidebar .nav-link:hover {
        background-color: #f8f9fa;
        color: #495057;
      }
      .teacher-sidebar .nav-link:hover i {
        color: #6c757d;
      }
      .teacher-sidebar .nav-link.active {
        background: linear-gradient(135deg, #e7f3ff 0%, #d1ecf1 100%) !important;
        color: #0d6efd !important;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(13, 110, 253, 0.15);
      }
      .teacher-sidebar .nav-link.active i {
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
        className="bg-white text-dark d-flex flex-column p-3 shadow teacher-sidebar"
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
            <a href="/teacher" className={`nav-link ${location.pathname === '/teacher' || activeMenu === 'overview' ? 'active' : ''}`}>
              <i className="bi bi-house-door me-2"></i> Tổng quan
            </a>
          </li>
          <li>
            <a href="/teacher/lophocphan" className={`nav-link ${location.pathname.includes('/teacher/lophocphan') || activeMenu === 'lophocphan' ? 'active' : ''}`}>
              <i className="bi bi-collection me-2"></i> Lớp học phần
            </a>
          </li>
          <li>
            <a href="/teacher/sv-lop" className={`nav-link ${location.pathname.includes('/teacher/sv-lop') || activeMenu === 'sv-lop' ? 'active' : ''}`}>
              <i className="bi bi-people me-2"></i> Sinh viên trong lớp
            </a>
          </li>
          <li>
            <a href="/teacher/lich" className={`nav-link ${location.pathname.includes('/teacher/lich') || activeMenu === 'lich' ? 'active' : ''}`}>
              <i className="bi bi-calendar-week me-2"></i> Lịch giảng dạy
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
              href="/teacher/yeu-cau-tu-van"
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
              href="/teacher/thong-bao"
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
                  Xin chào, <b style={{ color: '#495057' }}>{gvName || 'Giảng viên'}</b>
                </div>
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
                  {gvName ? gvName.charAt(0).toUpperCase() : 'G'}
                </div>
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
                    href="/teacher/detail" 
                    className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark rounded-2"
                    style={{ transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="bi bi-person" style={{ width: '20px' }}></i>
                    <span style={{ fontSize: '14px' }}>Thông tin cá nhân</span>
                  </a>
                  <a 
                    href="/teacher/change-password" 
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
        <div className="flex-grow-1 p-4 pt-3 teacher-scrollable-content" style={{ overflowY: 'auto', overflowX: 'hidden', background: '#f8f9fa' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
