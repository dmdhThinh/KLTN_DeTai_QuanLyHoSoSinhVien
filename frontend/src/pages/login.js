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
   <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-teal-300 via-sky-300 to-indigo-300 p-4">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-indigo-500">
              <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-4.418 0-8 3.134-8 7v1h16v-1c0-3.866-3.582-7-8-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Đăng nhập hệ thống</h1>
        </div>

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