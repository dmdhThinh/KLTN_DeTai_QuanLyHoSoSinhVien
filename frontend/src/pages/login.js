import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, saveAuth } from '../api'
import '../styles/Login.css' // ✅ thêm CSS riêng

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const navigate = useNavigate()

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
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}