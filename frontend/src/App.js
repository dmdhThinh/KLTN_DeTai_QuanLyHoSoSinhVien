// src/App.js
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import StudentDashboard from './pages/SinhVien/StudentDashboard'
import TeacherDashboard from './pages/GiangVien/TeacherDashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'

import LichHocLichThi from './pages/SinhVien/LichHocLichThi'
import AddStudent from './pages/Admin/AddStudent'
import StudentList from './pages/Admin/StudentList'
import EditStudent from './pages/Admin/EditStudent'
import PrivateRoute from './components/PrivateRoute'

import KhoaList from './pages/Admin/KhoaList'
import AddKhoa from './pages/Admin/AddKhoa'
import EditKhoa from './pages/Admin/EditKhoa'

import NganhList from './pages/Admin/NganhList'
import AddNganh from  './pages/Admin/AddNganh'
import EditNganh from  './pages/Admin/EditNganh'

import LopList from './pages/Admin/LopList'
import AddLop from  './pages/Admin/AddLop'
import EditLop from  './pages/Admin/EditLop'

import LichList from './pages/Admin/LichList'
import AddLich from  './pages/Admin/AddLich'
import EditLich from  './pages/Admin/EditLich'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang mặc định */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Sinh viên */}
        <Route
          path="/student"
          element={
            <PrivateRoute allowRoles={['Sinh viên']}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        {/* Giảng viên */}
        <Route
          path="/teacher"
          element={
            <PrivateRoute allowRoles={['Giảng viên']}>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />

        {/* Quản trị */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowRoles={['Quản trị']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <PrivateRoute allowRoles={['Quản trị']}>
              <StudentList />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/students/new"
          element={
            <PrivateRoute allowRoles={['Quản trị']}>
              <AddStudent />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/students/edit/:id"
          element={
            <PrivateRoute allowRoles={['Quản trị']}>
              <EditStudent />
            </PrivateRoute>
          }
        />
        

        {/* Lịch học, lịch thi */}
        <Route path="/lich" element={<LichHocLichThi />} />

        <Route path="/admin/khoa" element={<PrivateRoute allowRoles={['Quản trị']}><KhoaList /></PrivateRoute>} />
        <Route path="/admin/khoa/new" element={<PrivateRoute allowRoles={['Quản trị']}><AddKhoa /></PrivateRoute>} />
        <Route path="/admin/khoa/edit/:id" element={<PrivateRoute allowRoles={['Quản trị']}><EditKhoa /></PrivateRoute>} />

        <Route path="/admin/nganh" element={<PrivateRoute allowRoles={['Quản trị']}><NganhList /></PrivateRoute>} />
        <Route path="/admin/nganh/new" element={<PrivateRoute allowRoles={['Quản trị']}><AddNganh /></PrivateRoute>} />
        <Route path="/admin/nganh/edit/:id" element={<PrivateRoute allowRoles={['Quản trị']}><EditNganh /></PrivateRoute>} />

        <Route path="/admin/lop" element={<PrivateRoute allowRoles={['Quản trị']}><LopList /></PrivateRoute>} />
        <Route path="/admin/lop/new" element={<PrivateRoute allowRoles={['Quản trị']}><AddLop /></PrivateRoute>} />
        <Route path="/admin/lop/edit/:id" element={<PrivateRoute allowRoles={['Quản trị']}><EditLop /></PrivateRoute>} />

        <Route path="/admin/lich" element={<PrivateRoute allowRoles={['Quản trị']}><LichList /></PrivateRoute>} />
        <Route path="/admin/lich/new" element={<PrivateRoute allowRoles={['Quản trị']}><AddLich /></PrivateRoute>} />
        <Route path="/admin/lich/edit/:id" element={<PrivateRoute allowRoles={['Quản trị']}><EditLich /></PrivateRoute>} />

        {/* Trang không tồn tại → về login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
