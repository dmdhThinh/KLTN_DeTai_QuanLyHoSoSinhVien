import React from 'react'
import { Navigate } from 'react-router-dom'
import { getToken, getRole } from '../api'

export default function PrivateRoute({ children, allowRoles = [] }) {
  const token = getToken()
  const role = getRole()

  // Nếu chưa đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Nếu có danh sách quyền mà người dùng không khớp
  if (allowRoles.length > 0 && !allowRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  // Nếu hợp lệ thì render children
  return children
}
