//  src/pages/changePassword.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPass !== confirmPass) return setError('Mật khẩu nhập lại không khớp')
    if (newPass.length < 6) return setError('Mật khẩu phải từ 6 ký tự')

    setLoading(true)
    try {
      await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('tempToken')}` },
        body: JSON.stringify({ newPassword: newPass }),
      })
      alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
      localStorage.removeItem('tempToken')
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 to-indigo-300">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Đổi mật khẩu lần đầu</h2>
        {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Mật khẩu mới"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold"
          >
            {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  )
}
