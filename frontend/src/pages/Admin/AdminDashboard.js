// src/pages/Admin/AdminDashboard.js
import React from 'react'
import AdminLayout from '../../components/AdminLayout'

function Tile({ title, value, action, onAction }) {
  return (
    <div className="bg-white rounded-3 shadow-sm p-3 h-100 text-center">
      <div className="text-muted small mb-2">{title}</div>
      <div className="fs-2 fw-semibold text-primary">{value}</div>
      {action && (
        <button className="btn btn-outline-primary btn-sm mt-2" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminLayout title="Bảng điều khiển" activeMenu="dashboard">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h5 className="fw-semibold mb-0">
            Bảng điều khiển <span className="badge bg-primary ms-2">Admin</span>
          </h5>
        </div>

        {/* Các ô thống kê */}
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <Tile title="Tổng số sinh viên" value={0} />
          </div>
          <div className="col-lg-4 col-md-6">
            <Tile title="Tổng số giảng viên" value={0} />
          </div>
          <div className="col-lg-4 col-md-6">
            <Tile title="Tổng số học phần" value={0} />
          </div>
        </div>

        {/* Biểu đồ hoặc thống kê mở rộng */}
        <div className="mt-5">
          <div className="card shadow-sm">
            <div className="card-body text-center text-muted">
              <i className="bi bi-bar-chart fs-1 text-secondary"></i>
              <p className="mt-2 mb-0">Khu vực biểu đồ thống kê sẽ hiển thị tại đây</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
