import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import StudentDashboard from './pages/SinhVien/StudentDashboard'
import TeacherDashboard from './pages/GiangVien/TeacherDashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
import LichHocLichThi from './pages/SinhVien/LichHocLichThi'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/lich" element={<LichHocLichThi />} />
        {/* ✅ Bảo vệ route bằng ProtectedRoute */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      
      </Routes>
    </BrowserRouter>
  )
}

export default App


