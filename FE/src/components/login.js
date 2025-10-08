

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
      // Expecting { token, sinhVienId, giangVienId, role }
      saveAuth(result)
      const normalize = (s) => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
      const role = normalize(result.role || '')
      if (role.includes('admin') || role.includes('quan tri')) {
        navigate('/admin', { replace: true })
      } else if (role.includes('giang vien') || result.giangVienId) {
        navigate('/teacher', { replace: true })
      } else if (role.includes('sinh vien') || result.sinhVienId) {
        navigate('/student', { replace: true })
      } else if (!role && !result.giangVienId && !result.sinhVienId) {
        // If backend didn't return role/ids (e.g., pure admin account), prefer admin dashboard
        navigate('/admin', { replace: true })
      } else {
        navigate('/student', { replace: true })
      }
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none px-4 py-3 pr-10 transition"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-purple-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0V21H4.5v-.75z" />
              </svg>
            </span>
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none px-4 py-3 pr-10 transition"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.01 9.964 7.178.07.214.07.43 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold rounded-xl py-3 shadow-md transition">
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login


