// src/components/PrivateRoute.js
import React from 'react'
import { Navigate } from 'react-router-dom'
import { getRole } from '../api'

export default function PrivateRoute({ allowRoles, children }) {
  const role = getRole()
  console.log('🔐 Kiểm tra quyền:', role)  // <== thêm log tạm
  if (!role) return <Navigate to="/login" replace />
  console.log('🔍 allowRoles:', allowRoles)
  console.log('🔍 currentRole:', role)
  if (!allowRoles.includes(role)) return <Navigate to="/login" replace />
  return children
}
