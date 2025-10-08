import React, { useEffect, useState } from 'react'
import { getGiangVienId, getGiangVienById } from '../api'

function StatTile({ title, value, action }) {
  return (
    <div className="bg-white rounded-3 shadow-sm p-3 h-100">
      <div className="text-muted small mb-2">{title}</div>
      <div className="fs-2 fw-semibold">{value}</div>
      {action && (
        <button className="btn btn-primary btn-sm mt-2">{action}</button>
      )}
    </div>
  )
}

export default function TeacherDashboard() {
  const [gvName, setGvName] = useState('')

  useEffect(() => {
    const id = getGiangVienId()
    if (id) {
      getGiangVienById(id).then((d)=> setGvName(d?.hoTen || '')).catch(()=>{})
    }
  }, [])

  return (
    <div className="d-flex" style={{minHeight:'100vh', background:'#f5f7fb'}}>
      {/* Sidebar */}
      <aside className="bg-dark text-white" style={{width:260}}>
        <div className="p-3 fw-semibold">Giảng viên</div>
        <div className="px-3 text-uppercase text-white-50 small">Menu</div>
        <ul className="list-unstyled m-0 p-2">
          {[{t:'Tổng quan',k:'overview'},{t:'Lớp cố vấn',k:'lop'},{t:'Sinh viên trong lớp',k:'svlop'},{t:'Nhập điểm - nhận xét',k:'diem'},{t:'Yêu cầu tư vấn',k:'tuvan'},{t:'Thông báo',k:'tb'}].map(({t,k})=> (
            <li key={k} className="mb-2">
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
          <div className="fw-semibold">Bảng điều khiển <span className="badge bg-success ms-2">Giảng viên</span></div>
          <div className="ms-auto d-flex align-items-center gap-3" style={{maxWidth:520, width:'100%'}}>
            <input className="form-control" placeholder="Tìm sinh viên/lớp..." />
            <div className="text-muted small">Xin chào, {gvName || 'Giảng viên'}</div>
            <div className="rounded-circle bg-light border" style={{width:32,height:32}}></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 p-md-4">
          <div className="row g-3">
            <div className="col-lg-6">
              <div className="bg-white rounded-3 shadow-sm p-3">
                <div className="text-muted small">Tổng số lớp cố vấn</div>
                <div className="fs-1 fw-semibold">0</div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="bg-white rounded-3 shadow-sm p-3 h-100">
                <div className="text-muted small">Sinh viên thuộc lớp</div>
                <div className="fs-1 fw-semibold">0</div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="bg-white rounded-3 shadow-sm p-3 h-100">
                <div className="text-muted small">Yêu cầu cần phản hồi</div>
                <div className="fs-1 fw-semibold">0</div>
              </div>
            </div>

            <div className="col-lg-4">
              <StatTile title="Tra cứu sinh viên theo lớp" value="" action="Mở" />
            </div>
            <div className="col-lg-4">
              <StatTile title="Nhập điểm - nhận xét" value="" action="Mở" />
            </div>
            <div className="col-lg-4">
              <StatTile title="Phản hồi yêu cầu sinh viên" value="" action="Mở" />
            </div>
            <div className="col-lg-4">
              <StatTile title="Gửi thông báo cho lớp" value="" action="Mở" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


