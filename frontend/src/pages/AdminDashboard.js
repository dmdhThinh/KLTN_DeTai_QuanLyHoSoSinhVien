import React from 'react'

function Tile({ title, value, action }) {
  return (
    <div className="bg-white rounded-3 shadow-sm p-3 h-100">
      <div className="text-muted small mb-2">{title}</div>
      <div className="fs-2 fw-semibold">{value}</div>
      {action && <button className="btn btn-primary btn-sm mt-2">{action}</button>}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="d-flex" style={{minHeight:'100vh', background:'#f5f7fb'}}>
      {/* Sidebar */}
      <aside className="bg-dark text-white" style={{width:260}}>
        <div className="p-3 fw-semibold">QL Hồ sơ SV</div>
        <div className="px-3 text-uppercase text-white-50 small">Menu</div>
        <ul className="list-unstyled m-0 p-2">
          {[
            'Tổng quan',
            'Quản lý tài khoản',
            'Quản lý sinh viên',
            'Quản lý giảng viên',
            'Khoa - Ngành - Lớp',
            'Học phần',
            'Học phí',
            'Thông báo',
            'Báo cáo thống kê',
          ].map((t) => (
            <li key={t} className="mb-2">
              <button className="btn btn-dark w-100 text-start d-flex align-items-center gap-2">
                <span className="badge bg-secondary">•</span>
                <span>{t}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="px-3 text-uppercase text-white-50 small mt-3">Khác</div>
        <div className="p-2">
          <button className="btn btn-dark w-100 text-start d-flex align-items-center gap-2">
            <span className="badge bg-secondary">•</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-grow-1">
        {/* Top bar */}
        <div className="d-flex align-items-center gap-3 p-3 border-bottom bg-white">
          <div className="fw-semibold">Bảng điều khiển <span className="badge bg-primary ms-2">Admin</span></div>
          <div className="ms-auto d-flex align-items-center gap-3" style={{maxWidth:520, width:'100%'}}>
            <input className="form-control" placeholder="Nhập từ khóa tìm kiếm..." />
            <div className="text-muted small">Xin chào, admin01</div>
            <div className="rounded-circle bg-light border" style={{width:32,height:32}}></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 p-md-4">
          <div className="row g-3">
            <div className="col-lg-4"><Tile title="Tổng số sinh viên" value={0} /></div>
            <div className="col-lg-4"><Tile title="Tổng số giảng viên" value={0} /></div>
            <div className="col-lg-4"><Tile title="Tổng số học phần" value={0} /></div>

            <div className="col-lg-4"><Tile title="Quản lý tài khoản" value="" action="Mở" /></div>
            <div className="col-lg-4"><Tile title="Quản lý sinh viên" value="" action="Mở" /></div>
            <div className="col-lg-4"><Tile title="Khoa - Ngành - Lớp" value="" action="Mở" /></div>
            <div className="col-lg-4"><Tile title="Học phần" value="" action="Mở" /></div>
            <div className="col-lg-4"><Tile title="Học phí" value="" action="Mở" /></div>
            <div className="col-lg-4"><Tile title="Thông báo" value="" action="Mở" /></div>
            <div className="col-lg-4"><Tile title="Báo cáo thống kê" value="" action="Mở" /></div>
          </div>
        </div>
      </main>
    </div>
  )
}


