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

import LopHocPhanList from './pages/Admin/LopHocPhanList'
import AddLopHocPhan from  './pages/Admin/AddLopHocPhan'
import EditLopHocPhan from  './pages/Admin/EditLopHocPhan'

import HocPhanList from './pages/Admin/HocPhanList'
import AddHocPhan from  './pages/Admin/AddHocPhan'
import EditHocPhan from  './pages/Admin/EditHocPhan.js'

import GiangVienList from './pages/Admin/GiangVienList'
import AddGiangVien from './pages/Admin/AddGiangVien'
import EditGiangVien from './pages/Admin/EditGiangVien'

import TeacherNhapDiem from './pages/GiangVien/NhapDiem.js'
import LopHocPhanList2 from './pages/GiangVien/LopHocPhanList2.js'

import AccountList from './pages/Admin/AccountList'

import DiemSo from './pages/SinhVien/DiemSo.js'

import ChangePassword from './pages/changePassword'

import ThongBaoList from './pages/Admin/ThongBaoList'
import AddThongBao from './pages/Admin/AddThongBao'
import EditThongBao from './pages/Admin/EditThongBao'
import ThongBaoSinhVien from './pages/SinhVien/ThongBaoSinhVien'
import ThongBaoChiTiet from './pages/SinhVien/ThongBaoChiTiet'



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang mặc định */}
        <Route path="/change-password" element={<ChangePassword />} />
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
        <Route
  path="/teacher/nhapdiem"
  element={
    <PrivateRoute allowRoles={['Giảng viên']}>
      <TeacherNhapDiem />
    </PrivateRoute>
  }
/>
<Route
  path="/teacher/lophocphan"
  element={<PrivateRoute allowRoles={['Giảng viên']}><LopHocPhanList2 /></PrivateRoute>}
/>
<Route
  path="/teacher/nhapdiem/:lopHocPhanId"
  element={<PrivateRoute allowRoles={['Giảng viên']}><TeacherNhapDiem /></PrivateRoute>}
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
        <Route path="/lich" element={<PrivateRoute allowRoles={['Sinh viên']}><LichHocLichThi /></PrivateRoute>} />
        <Route path="/diemso" element={<PrivateRoute allowRoles={['Sinh viên']}><DiemSo /></PrivateRoute>} />

        <Route path="/admin/accounts" element={<PrivateRoute allowRoles={['Quản trị']}> <AccountList /></PrivateRoute>} />

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

        <Route path="/admin/lophocphan" element={<PrivateRoute allowRoles={['Quản trị']}><LopHocPhanList /></PrivateRoute>} />
        <Route path="/admin/lophocphan/new" element={<PrivateRoute allowRoles={['Quản trị']}><AddLopHocPhan /></PrivateRoute>} />
        <Route path="/admin/lophocphan/edit/:id" element={<PrivateRoute allowRoles={['Quản trị']}><EditLopHocPhan /></PrivateRoute>} />

         <Route path="/admin/hocphan" element={<PrivateRoute allowRoles={['Quản trị']}><HocPhanList /></PrivateRoute>} />
        <Route path="/admin/hocphan/new" element={<PrivateRoute allowRoles={['Quản trị']}><AddHocPhan /></PrivateRoute>} />
        <Route path="/admin/hocphan/edit/:id" element={<PrivateRoute allowRoles={['Quản trị']}><EditHocPhan /></PrivateRoute>} />

        <Route path="/admin/teachers" element={<PrivateRoute allowRoles={['Quản trị']}><GiangVienList /></PrivateRoute>} />
        <Route path="/admin/teachers/new" element={<PrivateRoute allowRoles={['Quản trị']}><AddGiangVien /></PrivateRoute>} />
        <Route path="/admin/teachers/edit/:id" element={<PrivateRoute allowRoles={['Quản trị']}><EditGiangVien /></PrivateRoute>} />

        <Route path="/admin/thongbao" element={<PrivateRoute allowRoles={['Quản trị']}><ThongBaoList /></PrivateRoute>} />
        <Route path="/admin/thongbao/new" element={<PrivateRoute allowRoles={['Quản trị']}><AddThongBao /></PrivateRoute>} />
        <Route path="/admin/thongbao/edit/:id" element={<PrivateRoute allowRoles={['Quản trị']}><EditThongBao /></PrivateRoute>}/>
        <Route path="/student/thongbao" element={<PrivateRoute allowRoles={['Sinh viên']}><ThongBaoSinhVien /></PrivateRoute>}/>
        <Route path="/student/thongbao/:id" element={<PrivateRoute allowRoles={['Sinh viên']}><ThongBaoChiTiet /></PrivateRoute>}/>
        {/* Trang không tồn tại → về login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
