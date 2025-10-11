import React, { useEffect, useState, useRef } from 'react'
import { getRole, getSinhVienById, getSinhVienId, getGiangVienById, getGiangVienId, clearAuth } from '../api'
import { Bell, Home, Search } from 'lucide-react'
import '../styles/SinhVien/Header.css'

export default function Header() {
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const role = getRole()
    if (role === 'Sinh viên') {
      const id = getSinhVienId()
      if (id) getSinhVienById(id).then(setUser).catch(() => {})
    } else if (role === 'Giảng viên') {
      const id = getGiangVienId()
      if (id) getGiangVienById(id).then(setUser).catch(() => {})
    } else {
      setUser({ hoTen: 'Quản trị viên' })
    }
  }, [])

  // Đóng menu khi click ra ngoài
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

  return (
    <header className="iuh-header shadow-sm">
      <div className="container-fluid d-flex align-items-center justify-content-between py-2 px-4">
        {/* Left: logo + search */}
        <div className="d-flex align-items-center gap-3">
          <img
            src="/logo_iuh.png"
            alt="IUH"
            className="iuh-logo"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <div className="iuh-search d-flex align-items-center px-2 rounded-pill border bg-white">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="form-control border-0 shadow-none"
            />
            <Search size={18} color="#888" />
          </div>
        </div>

        {/* Right: icons + user */}
        <div className="d-flex align-items-center gap-4">
          <div className="text-secondary small d-flex align-items-center gap-1 iuh-hover-item">
            <Home size={16} /> Trang chủ
          </div>

          <div className="position-relative text-secondary small d-flex align-items-center gap-1 iuh-hover-item">
            <Bell size={16} />
            <span>Tin tức</span>
            <span
              className="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill"
              style={{ fontSize: 10 }}
            >
              9
            </span>
          </div>

          {/* User dropdown */}
          <div className="position-relative" ref={menuRef}>
            <div
              className="d-flex align-items-center gap-2 iuh-user"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <div
                className="rounded-circle border bg-light"
                style={{ width: 32, height: 32 }}
              ></div>
              <div className="fw-semibold small text-primary d-flex align-items-center">
                {user?.hoTen || 'Người dùng'}
                <i className="bi bi-caret-down-fill ms-1 small" style={{ fontSize: 10 }}></i>
              </div>
            </div>

            {showMenu && (
              <div className="iuh-dropdown shadow-sm border rounded-2 bg-white position-absolute end-0 mt-2">
                <button className="dropdown-item">Thông tin cá nhân</button>
                <hr className="my-1" />
                <button className="dropdown-item">Đổi mật khẩu</button>
                <hr className="my-1" />
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
