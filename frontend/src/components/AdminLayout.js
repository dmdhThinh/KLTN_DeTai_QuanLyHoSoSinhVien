import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { apiFetch, clearAuth } from '../api'

export default function AdminLayout({ children, title = '', activeMenu = '' }) {
  const location = useLocation()
  const [badgeCount, setBadgeCount] = useState(0)
  const [openAccordions, setOpenAccordions] = useState({
    nguoiDung: location.pathname.includes('/accounts') || location.pathname.includes('/students') || location.pathname.includes('/teachers'),
    heThong: location.pathname.includes('/khoa') || location.pathname.includes('/nganh') || location.pathname.includes('/lop') || location.pathname.includes('/thongbao'),
    hocPhan: location.pathname.includes('/hocphan') || location.pathname.includes('/lophocphan') || location.pathname.includes('/quan-ly-lich-hoc') || location.pathname.includes('/lich') || location.pathname.includes('/dot-dang-ky'),
    daoTao: location.pathname.includes('/diem-ren-luyen') || location.pathname.includes('/xet-hoc-bong') || location.pathname.includes('/xet-tot-nghiep'),
    taiChinh: location.pathname.includes('/hoc-phi'),
    chungChi: location.pathname.includes('/chung-chi-tieng-anh')
  })

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Menu items để tìm kiếm
  const menuItems = [
    { name: 'Tổng quan', path: '/admin', icon: 'bi-house-door' },
    { name: 'Quản lý tài khoản', path: '/admin/accounts', icon: 'bi-person-gear' },
    { name: 'Sinh viên', path: '/admin/students', icon: 'bi-people' },
    { name: 'Giảng viên', path: '/admin/teachers', icon: 'bi-person-badge' },
    { name: 'Khoa', path: '/admin/khoa', icon: 'bi-building' },
    { name: 'Ngành', path: '/admin/nganh', icon: 'bi-diagram-3' },
    { name: 'Lớp', path: '/admin/lop', icon: 'bi-easel' },
    { name: 'Tin tức', path: '/admin/thongbao', icon: 'bi-megaphone' },
    { name: 'Học phần', path: '/admin/hocphan', icon: 'bi-journal-text' },
    { name: 'Lớp học phần', path: '/admin/lophocphan', icon: 'bi-collection' },
    { name: 'Quản lý lịch học', path: '/admin/quan-ly-lich-hoc', icon: 'bi-calendar-week' },
    { name: 'Quản lý buổi học', path: '/admin/lich', icon: 'bi-calendar-event' },
    { name: 'Đợt đăng ký học phần', path: '/admin/dot-dang-ky', icon: 'bi-calendar-check' },
    { name: 'Quản lý học phí', path: '/admin/hoc-phi', icon: 'bi-cash-coin' },
    { name: 'Điểm rèn luyện', path: '/admin/diem-ren-luyen', icon: 'bi-award' },
    { name: 'Import chứng chỉ TA', path: '/admin/chung-chi-tieng-anh', icon: 'bi-file-earmark-arrow-up' },
    { name: 'Quản lý chứng chỉ TA', path: '/admin/quan-ly-chung-chi-tieng-anh', icon: 'bi-translate' },
    { name: 'Xét học bổng', path: '/admin/xet-hoc-bong', icon: 'bi-trophy' },
    { name: 'Xét tốt nghiệp', path: '/admin/xet-tot-nghiep', icon: 'bi-mortarboard' }
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

  // Load badge count
  useEffect(() => {
    const loadBadgeCount = async () => {
      try {
        const response = await apiFetch('/api/yeu-cau-tu-van/admin/count')
        setBadgeCount(response.count || 0)
      } catch (error) {
        console.error('Lỗi khi tải badge count:', error)
      }
    }

    loadBadgeCount()

    // Auto-refresh mỗi 10 giây
    const interval = setInterval(loadBadgeCount, 10000)
    
    // Expose refresh function
    window.refreshTuVanCount = loadBadgeCount
    
    return () => clearInterval(interval)
  }, [])

  // Custom scrollbar styling
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .admin-scrollable-content::-webkit-scrollbar {
        width: 8px;
      }
      .admin-scrollable-content::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .admin-scrollable-content::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      .admin-scrollable-content::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      .admin-scrollable-content {
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f1f1;
        scroll-behavior: smooth;
      }
      .admin-sidebar::-webkit-scrollbar {
        width: 6px;
      }
      .admin-sidebar::-webkit-scrollbar-track {
        background: transparent;
      }
      .admin-sidebar::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
      }
      .admin-sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.5);
      }
      .admin-sidebar {
        border-radius: 0 16px 16px 0;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      }
      .admin-sidebar .nav-link {
        color: #6c757d;
        border-radius: 12px;
        padding: 10px 12px;
        transition: all 0.2s ease;
      }
      .admin-sidebar .nav-link i {
        color: #adb5bd;
        transition: color 0.2s ease;
      }
      .admin-sidebar .nav-link:hover {
        background-color: #f8f9fa;
        color: #495057;
      }
      .admin-sidebar .nav-link:hover i {
        color: #6c757d;
      }
      .admin-sidebar .nav-link.active {
        background: linear-gradient(135deg, #e7f3ff 0%, #d1ecf1 100%) !important;
        color: #0d6efd !important;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(13, 110, 253, 0.15);
      }
      .admin-sidebar .nav-link.active i {
        color: #0d6efd !important;
      }
      .admin-sidebar .accordion-button {
        background: transparent;
        border: none;
        padding: 10px 12px;
        color: #6c757d;
        font-size: 14px;
        box-shadow: none;
        border-radius: 12px;
        transition: all 0.3s ease;
        position: relative;
      }
      .admin-sidebar .accordion-button:hover {
        background-color: #f8f9fa;
        color: #495057;
        transform: translateX(4px);
      }
      .admin-sidebar .accordion-button:not(.collapsed) {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        color: #0d6efd;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(13, 110, 253, 0.1);
      }
      .admin-sidebar .accordion-button:not(.collapsed)::after {
        transform: rotate(180deg);
        transition: transform 0.3s ease;
      }
      .admin-sidebar .accordion-button::after {
        transition: transform 0.3s ease;
        margin-left: auto;
      }
      .admin-sidebar .accordion-button:focus {
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
        border-color: transparent;
      }
      .admin-sidebar .accordion-item {
        border: none;
        background: transparent;
        margin-bottom: 4px;
      }
      .admin-sidebar .accordion-collapse {
        transition: all 0.3s ease;
      }
      .admin-sidebar .accordion-body {
        padding: 8px 0 8px 24px;
        animation: slideDown 0.3s ease-out;
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .admin-sidebar .accordion-body .nav-link {
        transition: all 0.2s ease;
        position: relative;
        padding-left: 8px;
      }
      .admin-sidebar .accordion-body .nav-link::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 0;
        background: linear-gradient(135deg, #0d6efd 0%, #667eea 100%);
        border-radius: 2px;
        transition: height 0.2s ease;
      }
      .admin-sidebar .accordion-body .nav-link:hover::before {
        height: 60%;
      }
      .admin-sidebar .accordion-body .nav-link.active::before {
        height: 80%;
      }
      .admin-sidebar .accordion-body .nav-link:hover {
        transform: translateX(4px);
        padding-left: 12px;
      }
      .admin-sidebar .accordion-body .nav-link i {
        transition: transform 0.2s ease;
      }
      .admin-sidebar .accordion-body .nav-link:hover i {
        transform: scale(1.1);
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        className="bg-white text-dark d-flex flex-column p-3 shadow admin-sidebar"
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
            <a href="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
              <i className="bi bi-house-door me-2"></i> Tổng quan
            </a>
          </li>


          {/* Accordion Menu */}
          <div className="accordion accordion-flush" id="adminMenuAccordion" style={{ marginTop: '8px' }}>
            {/* Quản lý người dùng */}
            <div className="accordion-item">
              <button
                className={`accordion-button ${!openAccordions.nguoiDung ? 'collapsed' : ''}`}
                type="button"
                onClick={() => toggleAccordion('nguoiDung')}
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <i className="bi bi-people me-2"></i> Quản lý người dùng
              </button>
              <div className={`accordion-collapse collapse ${openAccordions.nguoiDung ? 'show' : ''}`}>
                <div className="accordion-body">
                  <ul className="nav nav-pills flex-column gap-1">
                    <li><a href="/admin/accounts" className={`nav-link ${location.pathname.includes('/accounts') ? 'active' : ''}`}><i className="bi bi-person-gear me-2"></i> Quản lý tài khoản</a></li>
                    <li><a href="/admin/students" className={`nav-link ${location.pathname.includes('/students') ? 'active' : ''}`}><i className="bi bi-people me-2"></i> Sinh viên</a></li>
                    <li><a href="/admin/teachers" className={`nav-link ${location.pathname.includes('/teachers') ? 'active' : ''}`}><i className="bi bi-person-badge me-2"></i> Giảng viên</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Hệ thống */}
            <div className="accordion-item">
              <button
                className={`accordion-button ${!openAccordions.heThong ? 'collapsed' : ''}`}
                type="button"
                onClick={() => toggleAccordion('heThong')}
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <i className="bi bi-gear me-2"></i> Hệ thống
              </button>
              <div className={`accordion-collapse collapse ${openAccordions.heThong ? 'show' : ''}`}>
                <div className="accordion-body">
                  <ul className="nav nav-pills flex-column gap-1">
                    <li><a href="/admin/khoa" className={`nav-link ${location.pathname.includes('/khoa') ? 'active' : ''}`}><i className="bi bi-building me-2"></i> Khoa</a></li>
                    <li><a href="/admin/nganh" className={`nav-link ${location.pathname.includes('/nganh') ? 'active' : ''}`}><i className="bi bi-diagram-3 me-2"></i> Ngành</a></li>
                    <li><a href="/admin/lop" className={`nav-link ${location.pathname === '/admin/lop' || location.pathname.startsWith('/admin/lop/')? 'active': ''}`}><i className="bi bi-easel me-2"></i> Lớp</a></li>
                    <li><a href="/admin/thongbao"className={`nav-link ${location.pathname.includes('/thongbao') ? 'active' : ''}`}><i className="bi bi-megaphone me-2"></i> Tin tức</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Học phần */}
            <div className="accordion-item">
              <button
                className={`accordion-button ${!openAccordions.hocPhan ? 'collapsed' : ''}`}
                type="button"
                onClick={() => toggleAccordion('hocPhan')}
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <i className="bi bi-journal-text me-2"></i> Học phần
              </button>
              <div className={`accordion-collapse collapse ${openAccordions.hocPhan ? 'show' : ''}`}>
                <div className="accordion-body">
                  <ul className="nav nav-pills flex-column gap-1">
                    <li><a href="/admin/hocphan" className={`nav-link ${location.pathname.includes('/hocphan') ? 'active' : ''}`}><i className="bi bi-journal-text me-2"></i> Học phần</a></li>
                    <li><a href="/admin/lophocphan" className={`nav-link ${location.pathname.includes('/lophocphan') ? 'active' : ''}`}><i className="bi bi-collection me-2"></i> Lớp học phần</a></li>
                    <li><a href="/admin/quan-ly-lich-hoc" className={`nav-link ${location.pathname.includes('/quan-ly-lich-hoc') ? 'active' : ''}`}><i className="bi bi-calendar-week me-2"></i> Quản lý lịch học</a></li>
                    <li><a href="/admin/lich" className={`nav-link ${location.pathname.includes('/lich') && !location.pathname.includes('/quan-ly-lich-hoc') ? 'active' : ''}`}><i className="bi bi-calendar-event me-2"></i> Quản lý buổi học</a></li>
                    <li><a href="/admin/dot-dang-ky" className={`nav-link ${location.pathname.includes('/dot-dang-ky') ? 'active' : ''}`}><i className="bi bi-calendar-check me-2"></i> Đợt đăng ký học phần</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Đào tạo */}
            <div className="accordion-item">
              <button
                className={`accordion-button ${!openAccordions.daoTao ? 'collapsed' : ''}`}
                type="button"
                onClick={() => toggleAccordion('daoTao')}
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <i className="bi bi-mortarboard me-2"></i> Đào tạo
              </button>
              <div className={`accordion-collapse collapse ${openAccordions.daoTao ? 'show' : ''}`}>
                <div className="accordion-body">
                  <ul className="nav nav-pills flex-column gap-1">
                    <li><a href="/admin/diem-ren-luyen" className={`nav-link ${location.pathname.includes('/diem-ren-luyen') ? 'active' : ''}`}><i className="bi bi-award me-2"></i> Điểm rèn luyện</a></li>
                    <li><a href="/admin/xet-hoc-bong" className={`nav-link ${location.pathname.includes('/xet-hoc-bong') ? 'active' : ''}`}><i className="bi bi-trophy me-2"></i> Xét học bổng</a></li>
                    <li><a href="/admin/xet-tot-nghiep" className={`nav-link ${location.pathname.includes('/xet-tot-nghiep') ? 'active' : ''}`}><i className="bi bi-mortarboard me-2"></i> Xét tốt nghiệp</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tài chính */}
            <div className="accordion-item">
              <button
                className={`accordion-button ${!openAccordions.taiChinh ? 'collapsed' : ''}`}
                type="button"
                onClick={() => toggleAccordion('taiChinh')}
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <i className="bi bi-cash-coin me-2"></i> Tài chính
              </button>
              <div className={`accordion-collapse collapse ${openAccordions.taiChinh ? 'show' : ''}`}>
                <div className="accordion-body">
                  <ul className="nav nav-pills flex-column gap-1">
                    <li><a href="/admin/hoc-phi" className={`nav-link ${location.pathname.includes('/hoc-phi') ? 'active' : ''}`}><i className="bi bi-cash-coin me-2"></i> Quản lý học phí</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Chứng chỉ */}
            <div className="accordion-item">
              <button
                className={`accordion-button ${!openAccordions.chungChi ? 'collapsed' : ''}`}
                type="button"
                onClick={() => toggleAccordion('chungChi')}
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <i className="bi bi-translate me-2"></i> Chứng chỉ
              </button>
              <div className={`accordion-collapse collapse ${openAccordions.chungChi ? 'show' : ''}`}>
                <div className="accordion-body">
                  <ul className="nav nav-pills flex-column gap-1">
                    <li><a href="/admin/chung-chi-tieng-anh" className={`nav-link ${location.pathname.includes('/chung-chi-tieng-anh') && !location.pathname.includes('/quan-ly-chung-chi-tieng-anh') ? 'active' : ''}`}><i className="bi bi-file-earmark-arrow-up me-2"></i> Import chứng chỉ TA</a></li>
                    <li><a href="/admin/quan-ly-chung-chi-tieng-anh" className={`nav-link ${location.pathname.includes('/quan-ly-chung-chi-tieng-anh') ? 'active' : ''}`}><i className="bi bi-translate me-2"></i> Quản lý chứng chỉ TA</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
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
              href="/admin/tu-van"
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
                {badgeCount > 0 && (
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
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </div>
              <span className="fw-semibold" style={{ fontSize: '14px' }}>Tin nhắn</span>
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
                  Xin chào, <b style={{ color: '#495057' }}>admin01</b>
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
                  A
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
                    href="/admin/change-password" 
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
        <div className="flex-grow-1 p-4 pt-3 admin-scrollable-content" style={{ overflowY: 'auto', overflowX: 'hidden', background: '#f8f9fa' }}>
          {children}
        </div>
      </main>
    </div>
  )
}