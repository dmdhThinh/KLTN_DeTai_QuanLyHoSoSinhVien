// src/components/PrivateRoute.js
import React from 'react'
import { Navigate } from 'react-router-dom'
import { getRole, getToken } from '../api'

export default function PrivateRoute({ allowRoles, children }) {
  // Gọi getRole() và getToken() ngay lập tức (synchronous)
  // getRole() đã có logic fallback về localStorage nên sẽ luôn trả về giá trị đúng
  const role = getRole()
  const token = getToken()
  
  // Debug log
  console.log(' PrivateRoute - Role:', role, 'Token:', token ? 'Có' : 'Không', 'URL:', window.location.pathname)
  
  // Kiểm tra cả token và role
  if (!role || !token) {
    console.log('❌ Không có role hoặc token, redirect về login')
    console.log('   - Role:', role)
    console.log('   - Token:', token)
    console.log('   - localStorage role_sv:', localStorage.getItem('role_sv'))
    console.log('   - localStorage token_sv:', localStorage.getItem('token_sv') ? 'Có' : 'Không')
    return <Navigate to="/login" replace />
  }
  
  if (!allowRoles.includes(role)) {
    console.log('❌ Role không phù hợp, redirect về login')
    console.log('   - Current role:', role)
    console.log('   - Allowed roles:', allowRoles)
    return <Navigate to="/login" replace />
  }
  
  console.log('✅ PrivateRoute passed, rendering children')
  return children
}