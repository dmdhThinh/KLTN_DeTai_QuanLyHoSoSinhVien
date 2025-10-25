//  src/pages/login.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi, saveAuth, clearAuth } from '../api'

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      clearAuth()
      const result = await loginApi(username, password)
      console.log('🔍 login result:', result)

      // ⚠️ Nếu cần đổi mật khẩu lần đầu
      if (result.requireChangePassword) {
        localStorage.setItem('tempToken', result.token)
        navigate('/change-password', { replace: true })
        return
      }

      // ✅ Nếu đăng nhập bình thường
      saveAuth(result)

      const role = result.role || ''

      if (role.includes('admin') || role.includes('Quản trị') || role.includes('quan tri')) {
        saveAuth(result) // Giữ nguyên role gốc: "Quản trị"
        navigate('/admin', { replace: true })
        return
      } else if (role.includes('Giảng viên') || role.includes('giang vien') || result.giangVienId) {
        saveAuth(result)
        navigate('/teacher', { replace: true })
        return
      } else if (role.includes('Sinh viên') || role.includes('sinh vien') || result.sinhVienId) {
        saveAuth(result)
        navigate('/student', { replace: true })
        return
      }

    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-300 via-sky-300 to-indigo-300 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Đăng nhập hệ thống</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl"
          >
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login