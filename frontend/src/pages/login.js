import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, saveAuth, getRole, getToken } from '../api'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styles/Login.css' // ✅ thêm CSS riêng

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const navigate = useNavigate()

  // Kiểm tra nếu đã đăng nhập thì redirect (chỉ khi reload page)
  useEffect(() => {
    const role = getRole()
    const token = getToken()
    
    if (role && token) {
      if (role === 'Quản trị') {
        navigate('/admin', { replace: true })
      } else if (role === 'Giảng viên') {
        navigate('/teacher', { replace: true })
      } else if (role === 'Sinh viên') {
        navigate('/student', { replace: true })
      }
    }
  }, [navigate])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/thongbao')
        const data = await res.json()
        if (mounted) setNews(Array.isArray(data) ? data.slice(0, 10) : [])
      } catch {
        if (mounted) setNews([])
      } finally {
        if (mounted) setNewsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const data = await apiLogin(username, password)
      if (data?.requireChangePassword && data?.token) {
        sessionStorage.setItem('temp_token', data.token)
        navigate('/change-password')
        return
      }

      if (data?.token && data?.role) {
        saveAuth({
          token: data.token,
          role: data.role,
          sinhVienId: data.sinhVienId,
          giangVienId: data.giangVienId
        })
        if (data.role === 'Quản trị') navigate('/admin')
        else if (data.role === 'Giảng viên') navigate('/teacher')
        else navigate('/student')
      } else setMessage('Đăng nhập thất bại')
    } catch (err) {
      setMessage(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Header với logo và text */}
      <div className="login-header">
        <div className="logo-container">
          <img 
            src="/Logo.png" 
            alt="Logo Đại học Phương Nam" 
            className="login-logo"
          />
          <div className="school-info">
            <h1 className="school-name">Trường Đại học Phương Nam</h1>
          </div>
        </div>
      </div>

      <div className="login-container">
        {/* Bên trái - danh sách tin tức */}
        <div className="news-panel fade-in-left">
          <h2 className="news-title">📰 DANH SÁCH CÁC TIN TỨC</h2>
          <div className="news-list">
            {newsLoading ? (
              <div className="text-muted">Đang tải...</div>
            ) : news.length === 0 ? (
              <div className="text-muted">Chưa có tin tức nào.</div>
            ) : (
              news.map((n, i) => (
                <div className="news-item" key={i}>
                  <div className="news-header">
                    <h5>{n.tieu_de}</h5>
                    <span>
                      {n.ngay_gui
                        ? new Date(n.ngay_gui).toLocaleDateString('vi-VN')
                        : ''}
                    </span>
                  </div>
                  <p>
                    {n.noi_dung.length > 150
                      ? n.noi_dung.slice(0, 150) + '...'
                      : n.noi_dung}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bên phải - form đăng nhập */}
        <div className="login-form fade-in-right">
          <h2>🔐 ĐĂNG NHẬP</h2>
          {message && <div className="alert">{message}</div>}

          <form onSubmit={handleSubmit}>
            <label>Tên đăng nhập</label>
            <div className="input-wrapper">
              <i className="bi bi-person input-icon"></i>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
                disabled={loading}
              />
            </div>

            <label>Mật khẩu</label>
            <div className="input-wrapper password-wrapper">
              <i className="bi bi-lock input-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
              </button>
            </div>

            <button type="submit" disabled={loading} className="login-button">
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}