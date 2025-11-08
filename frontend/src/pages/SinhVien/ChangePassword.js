// src/pages/SinhVien/ChangePassword.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, clearAuth } from '../../api'
import StudentLayout from '../../components/StudentLayout'
import '../../styles/SinhVien/ChangePassword.css'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return setError('Vui lòng điền đầy đủ thông tin')
    }

    if (newPassword.length < 6) {
      return setError('Mật khẩu mới phải có ít nhất 6 ký tự')
    }

    if (newPassword !== confirmPassword) {
      return setError('Mật khẩu mới và xác nhận mật khẩu không khớp')
    }

    if (oldPassword === newPassword) {
      return setError('Mật khẩu mới không được trùng với mật khẩu cũ')
    }

    setLoading(true)
    try {
      const token = sessionStorage.getItem('token')
      await apiFetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          oldPassword, 
          newPassword 
        })
      })
      
      setSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      // Đăng xuất sau 2 giây
      setTimeout(() => {
        clearAuth()
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StudentLayout title="Đổi mật khẩu">
      <div className="d-flex justify-content-center">
        <div className="change-password-container">
          <div className="card shadow-sm">
            <div className="card-header custom-header-password">
              <i className="bi bi-shield-lock me-2"></i>
              Đổi mật khẩu
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setError('')}
                  ></button>
                </div>
              )}

              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Mật khẩu cũ */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-key me-2"></i>
                    Mật khẩu hiện tại
                  </label>
                  <div className="input-group">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Nhập mật khẩu hiện tại"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      <i className={`bi ${showOldPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-key-fill me-2"></i>
                    Mật khẩu mới
                  </label>
                  <div className="input-group">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <i className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Xác nhận mật khẩu */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-shield-check me-2"></i>
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Ghi chú */}
                <div className="alert alert-info">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  <strong>Lưu ý:</strong>
                  <ul className="mb-0 mt-2 ps-3">
                    <li>Mật khẩu phải có ít nhất 6 ký tự</li>
                    <li>Mật khẩu mới không được trùng với mật khẩu cũ</li>
                    <li>Bạn sẽ cần đăng nhập lại sau khi đổi mật khẩu</li>
                  </ul>
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/student')}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary-gradient"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Đổi mật khẩu
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
