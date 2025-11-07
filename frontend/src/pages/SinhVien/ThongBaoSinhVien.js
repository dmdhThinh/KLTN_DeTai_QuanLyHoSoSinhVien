// src/pages/SinhVien/ThongBaoSinhVien.js
import React, { useEffect, useState } from 'react'
import StudentLayout from '../../components/StudentLayout'
import { getSinhVienId, markThongBaoAsRead } from '../../api'

export default function ThongBaoSinhVien() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const svId = getSinhVienId()
      // Gửi sinhVienId để backend lấy trạng thái đọc
      const res = await fetch(`/api/thongbao?sinhVienId=${svId}&_t=${Date.now()}`)
      const data = await res.json()
      setList(Array.isArray(data) ? data : [])
    } catch {
      setError('Không thể tải tin tức.')
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRead = (id) => {
    const svId = getSinhVienId()
    if (svId) {
      markThongBaoAsRead(svId, id).catch((err) => {
        console.error('Lỗi đánh dấu đã đọc:', err)
      })
    }
  }

  return (
    <StudentLayout title="Tin tức / Thông báo">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold mb-0">Danh sách tin tức</h5>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={loadData}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i> {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-muted">⏳ Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-danger">{error}</div>
            ) : list.length === 0 ? (
              <div className="text-muted">Chưa có tin tức nào.</div>
            ) : (
              <div className="list-group">
                {list.map((n) => (
                  <a
                    key={n.id}
                    href={`/student/thongbao/${n.id}`}
                    onClick={() => handleRead(n.id)}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      backgroundColor: n.da_doc === 'Đã đọc' ? '#fafafa' : '#eef7ff'
                    }}
                  >
                    <div className="me-3 flex-grow-1">
                      <div className="fw-semibold d-flex align-items-center">
                        {n.tieu_de}
                        {n.da_doc !== 'Đã đọc' && (
                          <span className="ms-2 text-primary" style={{ fontSize: 12 }}>
                            🔵 Mới
                          </span>
                        )}
                      </div>
                      <div
                        className="text-muted small mt-1"
                        style={{
                          whiteSpace: 'pre-wrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {n.noi_dung?.length > 150
                          ? n.noi_dung.slice(0, 150) + '...'
                          : n.noi_dung}
                      </div>
                    </div>
                    <span className="badge bg-light text-dark border align-self-start">
                      {n.ngay_gui
                        ? new Date(n.ngay_gui).toLocaleDateString('vi-VN')
                        : ''}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}