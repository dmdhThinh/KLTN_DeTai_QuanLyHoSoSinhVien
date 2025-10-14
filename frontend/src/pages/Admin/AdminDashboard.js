// src/pages/Admin/AdminDashboard.js
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth } from '../../api'
import {
  FaHome, FaUserCog, FaUserGraduate, FaChalkboardTeacher, FaUniversity,
  FaBook, FaMoneyBillWave, FaBell, FaChartBar, FaSignOutAlt
} from 'react-icons/fa'

function Tile({ title, value, action, onAction }) {
  return (
    <div className="bg-white rounded-3 shadow-sm p-3 h-100">
      <div className="text-muted small mb-2">{title}</div>
      <div className="fs-2 fw-semibold">{value}</div>
      {action && (
        <button className="btn btn-primary btn-sm mt-2" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const handleLogout = () => {
    clearAuth('Quản trị')
    setTimeout(() => navigate('/login', { replace: true }), 100)
  }

  const menuItems = [
    { title: 'Tổng quan', icon: <FaHome />, path: '/admin' },
    { title: 'Quản lý tài khoản', icon: <FaUserCog /> },
    { title: 'Quản lý sinh viên', icon: <FaUserGraduate />, path: '/admin/students' },
    { title: 'Quản lý giảng viên', icon: <FaChalkboardTeacher /> },
    { title: 'Quản lý khoa', icon: <FaUniversity />, path: '/admin/khoa' },
    { title: 'Quản lý ngành', icon: <FaUniversity />, path: '/admin/nganh' },
    { title: 'Học phần', icon: <FaBook /> },
    { title: 'Học phí', icon: <FaMoneyBillWave /> },
    { title: 'Thông báo', icon: <FaBell /> },
    { title: 'Báo cáo thống kê', icon: <FaChartBar /> },
  ]

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      {/* Sidebar */}
      <aside className="bg-dark text-white" style={{ width: 260 }}>
        <div className="p-3 fw-semibold fs-5 border-bottom border-secondary">
          <FaUniversity className="me-2" /> QL Hồ sơ SV
        </div>

        <div className="px-3 text-uppercase text-white-50 small mt-3">Menu</div>
        <ul className="list-unstyled m-0 p-2">
          {menuItems.map(({ title, icon, path }) => (
            <li key={title} className="mb-2">
              <button
                className="btn btn-dark w-100 text-start d-flex align-items-center gap-2"
                onClick={() => path && navigate(path)}
              >
                <span className="fs-5">{icon}</span>
                <span>{title}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="px-3 text-uppercase text-white-50 small mt-3">Khác</div>
        <div className="p-2">
          <button onClick={handleLogout} className="btn btn-outline-danger w-100 text-start d-flex align-items-center gap-2">
            <FaSignOutAlt className="fs-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1">
        <div className="d-flex align-items-center gap-3 p-3 border-bottom bg-white">
          <div className="fw-semibold">
            Bảng điều khiển <span className="badge bg-primary ms-2">Admin</span>
          </div>
          <div className="ms-auto d-flex align-items-center gap-3" style={{ maxWidth: 520, width: '100%' }}>
            <input className="form-control" placeholder="Nhập từ khóa tìm kiếm..." />
            <div className="text-muted small">Xin chào, admin01</div>
            <div className="rounded-circle bg-light border" style={{ width: 32, height: 32 }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 p-md-4">
          <div className="row g-3">
            <div className="col-lg-4"><Tile title="Tổng số sinh viên" value={0} /></div>
            <div className="col-lg-4"><Tile title="Tổng số giảng viên" value={0} /></div>
            <div className="col-lg-4"><Tile title="Tổng số học phần" value={0} /></div>

          
          </div>
        </div>
      </main>
    </div>
  )
}
