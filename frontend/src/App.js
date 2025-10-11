// src/App.js
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import StudentDashboard from './pages/SinhVien/StudentDashboard'
import TeacherDashboard from './pages/GiangVien/TeacherDashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
import LichHocLichThi from './pages/SinhVien/LichHocLichThi'
import ProtectedRoute from './components/ProtectedRoute'
import AddStudent from './pages/Admin/AddStudent'
import StudentList from './pages/Admin/StudentList'
import EditStudent from './pages/Admin/EditStudent'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Bảo vệ các trang sau đăng nhập */}
        <Route
          path="/student"
          element={<ProtectedRoute>
           <PrivateRoute allowRoles={['Sinh viên']}>
           <StudentDashboard />
           </PrivateRoute>
          </ProtectedRoute>}
        />
       <Route
          path="/teacher"
          element={
            <ProtectedRoute>
              <PrivateRoute allowRoles={['Giảng viên']}>
                <TeacherDashboard />
              </PrivateRoute>
            </ProtectedRoute>
          }
        />



        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
              <PrivateRoute allowRoles={['Admin']}></PrivateRoute>
              <PrivateRoute></PrivateRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={<ProtectedRoute><StudentList /></ProtectedRoute>}
        />
        <Route
          path="/admin/students/new"
          element={<ProtectedRoute><AddStudent /></ProtectedRoute>}
        />
        <Route
          path="/admin/students/edit/:id"
          element={<ProtectedRoute><EditStudent /></ProtectedRoute>}
        />
        {/* Lịch có thể để public hoặc bảo vệ tùy ý; giữ nguyên */}
        <Route path="/lich" element={<LichHocLichThi />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
