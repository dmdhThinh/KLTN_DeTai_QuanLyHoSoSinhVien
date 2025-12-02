import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { apiFetch } from '../api'

export default function AdminLayout({ children, title = '', activeMenu = '' }) {
  const location = useLocation()
  const [badgeCount, setBadgeCount] = useState(0)

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
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }
      .admin-sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        className="bg-dark text-white d-flex flex-column p-3 shadow admin-sidebar"
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
        <div className="d-flex align-items-center mb-4">
          <i className="bi bi-mortarboard-fill fs-4 me-2 text-info"></i>
          <span className="fs-5 fw-semibold">QL Hồ sơ SV</span>
        </div>

        <ul className="nav nav-pills flex-column gap-1 mb-auto">
          <li>
            <a href="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active bg-info' : 'text-white-50'}`}>
              <i className="bi bi-house-door me-2"></i> Tổng quan
            </a>
          </li>

          <li>
            <a href="/admin/tu-van" className={`nav-link ${location.pathname.includes('/tu-van') ? 'active bg-info' : 'text-white-50'} d-flex justify-content-between align-items-center`}>
              <span><i className="bi bi-chat-left-text me-2"></i> Yêu cầu tư vấn</span>
              {badgeCount > 0 && (
                <span className="badge bg-danger rounded-pill">{badgeCount}</span>
              )}
            </a>
          </li>

          <div className="text-uppercase small text-white-50 mt-3 mb-1 ps-3">Quản lý</div>
          <li><a href="/admin/accounts" className={`nav-link text-white ${location.pathname.includes('/accounts') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-person-gear me-2"></i> Quản lý tài khoản</a></li>
          <li><a href="/admin/students" className={`nav-link ${location.pathname.includes('/students') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-people me-2"></i> Sinh viên</a></li>
          <li><a href="/admin/teachers" className={`nav-link ${location.pathname.includes('/teachers') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-person-badge me-2"></i> Giảng viên</a></li>
          <li><a href="/admin/khoa" className={`nav-link ${location.pathname.includes('/khoa') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-building me-2"></i> Khoa</a></li>
          <li><a href="/admin/nganh" className={`nav-link ${location.pathname.includes('/nganh') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-diagram-3 me-2"></i> Ngành</a></li>
          <li><a href="/admin/lop" className={`nav-link ${location.pathname === '/admin/lop' || location.pathname.startsWith('/admin/lop/')? 'active bg-info': 'text-white-50'}`}><i className="bi bi-easel me-2"></i> Lớp</a></li>
          <li><a href="/admin/thongbao"className={`nav-link ${location.pathname.includes('/thongbao') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-megaphone me-2"></i> Tin tức</a></li>

          <div className="text-uppercase small text-white-50 mt-3 mb-1 ps-3">Học phần</div>
          <li><a href="/admin/hocphan" className={`nav-link ${location.pathname.includes('/hocphan') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-journal-text me-2"></i> Học phần</a></li>
          <li><a href="/admin/lophocphan" className={`nav-link ${location.pathname.includes('/lophocphan') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-collection me-2"></i> Lớp học phần</a></li>
          <li><a href="/admin/lich" className={`nav-link ${location.pathname.includes('/lich') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-calendar-event me-2"></i> Lịch học</a></li>
          <li><a href="/admin/dot-dang-ky" className={`nav-link ${location.pathname.includes('/dot-dang-ky') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-calendar-check me-2"></i> Đợt đăng ký HP</a></li>
          <li><a href="/admin/dot-nhap-diem" className={`nav-link ${location.pathname.includes('/dot-nhap-diem') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-clipboard-check me-2"></i> Đợt nhập điểm</a></li>
          <li><a href="/admin/hoc-phi" className={`nav-link ${location.pathname.includes('/hoc-phi') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-cash-coin me-2"></i> Quản lý học phí</a></li>
          <li><a href="/admin/diem-ren-luyen" className={`nav-link ${location.pathname.includes('/diem-ren-luyen') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-award me-2"></i> Điểm rèn luyện</a></li>
          <li><a href="/admin/xet-hoc-bong" className={`nav-link ${location.pathname.includes('/xet-hoc-bong') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-trophy me-2"></i> Xét học bổng</a></li>
        </ul>

        <div className="border-top pt-3 mt-3">
          <a
            href="/login"
            className="btn btn-danger w-100 d-flex align-items-center justify-content-center fw-semibold"
            style={{ borderRadius: '8px' }}
          >
            <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
          </a>
        </div>

      </aside>

      {/* Main content */}
      <main className="flex-grow-1 d-flex flex-column" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Fixed Header */}
        <div className="p-4 pb-3 bg-white shadow-sm" style={{ flexShrink: 0, zIndex: 100 }}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="fw-semibold mb-0">{title}</h5>
          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Tìm kiếm..."
              style={{ maxWidth: 250 }}
            />
            <div className="text-muted small">
              Xin chào, <b>admin01</b>
            </div>
            <div
              className="rounded-circle bg-light border"
              style={{ width: 32, height: 32 }}
            ></div>
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