import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuth } from '../api';
import {
  FaHome, FaUserCog, FaUserGraduate, FaChalkboardTeacher,
  FaUniversity, FaBook, FaMoneyBillWave, FaBell,
  FaChartBar, FaSignOutAlt,
  FaCalendar
} from 'react-icons/fa';

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin URL hiện tại

  // Xác định activeMenu dựa trên pathname
  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === '/admin') return 'overview';
    if (path.startsWith('/admin/students')) return 'students';
    if (path.startsWith('/admin/khoa')) return 'departments';
    if (path.startsWith('/admin/nganh')) return 'majors';
    if (path.startsWith('/admin/lop')) return 'classes';
    if (path.startsWith('/admin/lich')) return 'calendar';

    
    // Thêm các trường hợp khác nếu cần
    return '';
  };

  const activeMenu = getActiveMenu();

  const handleLogout = () => {
    clearAuth('Quản trị');
    navigate('/login', { replace: true });
  };

  const handleNavigate = (key) => {
    switch (key) {
      case 'overview': navigate('/admin'); break;
      case 'students': navigate('/admin/students'); break;
      case 'departments': navigate('/admin/khoa'); break;
      case 'majors': navigate('/admin/nganh'); break;
      case 'classes': navigate('/admin/lop'); break;
      case 'calendar': navigate('/admin/lich'); break;
      // Thêm các case khác nếu cần
      default: break;
    }
  };

  const menuItems = [
    { key: 'overview', title: 'Tổng quan', icon: <FaHome /> },
    { key: 'accounts', title: 'Quản lý tài khoản', icon: <FaUserCog /> },
    { key: 'students', title: 'Quản lý sinh viên', icon: <FaUserGraduate /> },
    { key: 'teachers', title: 'Quản lý giảng viên', icon: <FaChalkboardTeacher /> },
    { key: 'departments', title: 'Quản lý khoa', icon: <FaUniversity /> },
    { key: 'majors', title: 'Quản lý ngành', icon: <FaUniversity />,  },
    { key: 'classes', title: 'Quản lý lớp', icon: <FaUniversity />,  },
    { key: 'calendar', title: 'Quản lý lịch học', icon: <FaCalendar />,  },
    { key: 'courses', title: 'Học phần', icon: <FaBook /> },
    { key: 'fees', title: 'Học phí', icon: <FaMoneyBillWave /> },
    { key: 'noti', title: 'Thông báo', icon: <FaBell /> },
    { key: 'stats', title: 'Báo cáo thống kê', icon: <FaChartBar /> },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      {/* Sidebar */}
      <aside className="bg-dark text-white" style={{ width: 260 }}>
        <div className="p-3 fw-semibold fs-5 border-bottom border-secondary">
          <FaUniversity className="me-2" /> QL Hồ sơ SV
        </div>

        <div className="px-3 text-uppercase text-white-50 small mt-3">Menu</div>
        <ul className="list-unstyled m-0 p-2">
          {menuItems.map(({ key, title, icon }) => (
            <li key={key} className="mb-1">
              <button
                className={`btn w-100 text-start d-flex align-items-center gap-2 ${
                  activeMenu === key ? 'btn-primary' : 'btn-dark'
                }`}
                onClick={() => handleNavigate(key)}
              >
                <span className="fs-5">{icon}</span>
                <span>{title}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="px-3 text-uppercase text-white-50 small mt-3">Khác</div>
        <div className="p-2">
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger w-100 text-start d-flex align-items-center gap-2"
          >
            <FaSignOutAlt className="fs-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 p-3 border-bottom bg-white">
          <div className="fw-semibold">
            {title || 'Bảng điều khiển'} <span className="badge bg-primary ms-2">Admin</span>
          </div>
          <div
            className="ms-auto d-flex align-items-center gap-3"
            style={{ maxWidth: 520, width: '100%' }}
          >
            <input className="form-control" placeholder="Tìm kiếm..." />
            <div className="text-muted small">Xin chào, admin01</div>
            <div className="rounded-circle bg-light border" style={{ width: 32, height: 32 }}></div>
          </div>
        </div>

        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}