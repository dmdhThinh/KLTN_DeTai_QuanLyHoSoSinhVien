import React, { useEffect, useState } from 'react'
import { useLocation,Link } from 'react-router-dom'
import { getGiangVienId, getGiangVienById } from '../api'
import 'bootstrap-icons/font/bootstrap-icons.css'


export default function TeacherLayout({ children, title = '', activeMenu = '' }) {
  const location = useLocation()
  const [gv, setGv] = useState(null)

  // Lấy thông tin giảng viên đang đăng nhập
  useEffect(() => {
  const id = getGiangVienId()
  if (!id) return

  getGiangVienById(id)
    .then((res) => {
      if (res) {
        // Hỗ trợ cả 2 dạng ho_ten và hoTen
        const name = res.hoTen || res.ho_ten || 'Giảng viên'
        setGv({ ...res, hoTen: name })
      }
    })
    .catch(() => setGv(null))
}, [])

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
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }
      .teacher-sidebar::-webkit-scrollbar-thumb:hover {
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
        className="bg-dark text-white d-flex flex-column p-3 shadow teacher-sidebar"
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
    location.pathname.includes('/teacher/lophocphan')
      ? 'active bg-success'
      : 'text-white-50'
  }`}
>
  <i className="bi bi-pencil-square me-2"></i> Nhập điểm
</Link>

          </li>
          <li>
            <a
              href="/teacher/yeu-cau"
              className={`nav-link ${
                location.pathname.includes('/yeu-cau')
                  ? 'active bg-success'
                  : 'text-white-50'
              }`}
            >
              <i className="bi bi-chat-left-text me-2"></i> Yêu cầu tư vấn
            </a>
          </li>
          <li>
            <a
              href="/teacher/thong-bao"
              className={`nav-link ${
                location.pathname.includes('/thong-bao')
                  ? 'active bg-success'
                  : 'text-white-50'
              }`}
            >
              <i className="bi bi-bell me-2"></i> Thông báo
            </a>
          </li>
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
  Xin chào, <b>{gv?.hoTen || 'Giảng viên'}</b>
</div>
            <div
              className="rounded-circle bg-light border"
              style={{ width: 32, height: 32 }}
            ></div>
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
