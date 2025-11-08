import React from 'react'
import { useLocation } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function AdminLayout({ children, title = '', activeMenu = '' }) {
  const location = useLocation()

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <aside
        className="bg-dark text-white d-flex flex-column p-3 shadow"
        style={{ width: 250 }}
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
          <li><a href="/admin/dot-nhap-diem" className={`nav-link ${location.pathname.includes('/dot-nhap-diem') ? 'active bg-info' : 'text-white-50'}`}><i className="bi bi-clipboard-check me-2"></i> Đợt nhập điểm</a></li>
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
              Xin chào, <b>admin01</b>
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