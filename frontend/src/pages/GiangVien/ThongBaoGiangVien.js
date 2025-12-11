// src/pages/GiangVien/ThongBaoGiangVien.js
import React, { useEffect, useState } from 'react'
import TeacherLayout from '../../components/TeacherLayout'
import { getGiangVienId, markThongBaoAsReadGiangVien } from '../../api'

const API_BASE = process.env.REACT_APP_API_BASE || ''

export default function ThongBaoGiangVien() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const gvId = getGiangVienId()
      const res = await fetch(`${API_BASE}/api/thongbao?giangVienId=${gvId}&_t=${Date.now()}`)
      const data = await res.json()
      setList(Array.isArray(data) ? data : [])
    } catch {
      setError('Không thể tải tin tức.')
      setList([])
    } finally {
      setLoading(false)
    }
  }

  const handleRead = (id) => {
    const gvId = getGiangVienId()
    if (gvId) {
      markThongBaoAsReadGiangVien(gvId, id).catch((err) => {
        console.error('Lỗi đánh dấu đã đọc:', err)
      })
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <TeacherLayout title="Tin tức / Thông báo">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-1">Danh sách tin tức</h5>
            <small className="text-muted">Cập nhật thông báo từ nhà trường</small>
          </div>
          <button 
            className="btn btn-outline-primary"
            onClick={loadData}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            {loading ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-primary mb-2" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
                <div>Đang tải dữ liệu...</div>
              </div>
            ) : error ? (
              <div className="text-center py-5 text-danger">
                <i className="bi bi-exclamation-triangle fs-1 mb-3"></i>
                <div>{error}</div>
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox fs-1 mb-3"></i>
                <div>Chưa có tin tức nào.</div>
              </div>
            ) : (
              <div className="list-group">
                {list.map((n, index) => (
                  <a
                    key={n.id}
                    href={`/teacher/thong-bao/${n.id}`}
                    onClick={() => handleRead(n.id)}
                    className="list-group-item list-group-item-action border-0 mb-2"
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      background: n.da_doc === 'Đã đọc' 
                        ? 'rgba(248,249,250,0.5)'
                        : 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(8px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1 me-3">
                        <div className="d-flex align-items-center mb-2">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{
                              width: '32px',
                              height: '32px',
                              background: `linear-gradient(135deg, ${
                                index % 3 === 0 ? '#667eea, #764ba2' :
                                index % 3 === 1 ? '#f093fb, #f5576c' :
                                '#4facfe, #00f2fe'
                              })`
                            }}
                          >
                            <i className="bi bi-megaphone text-white" style={{ fontSize: '14px' }}></i>
                          </div>
                          <h6 className="mb-0 fw-bold">{n.tieu_de}</h6>
                          {n.da_doc !== 'Đã đọc' && (
                            <span className="badge bg-danger ms-2">Mới</span>
                          )}
                        </div>
                        <div
                          className="text-muted small"
                          style={{
                            whiteSpace: 'pre-wrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {n.noi_dung?.length > 150
                            ? n.noi_dung.slice(0, 150) + '...'
                            : n.noi_dung}
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-light text-dark border mb-2">
                          <i className="bi bi-calendar3 me-1"></i>
                          {n.ngay_gui
                            ? new Date(n.ngay_gui).toLocaleDateString('vi-VN')
                            : ''}
                        </span>
                        <div className="small" style={{ 
                          color: index % 3 === 0 ? '#667eea' :
                                 index % 3 === 1 ? '#f5576c' : '#4facfe'
                        }}>
                          <i className="bi bi-arrow-right"></i>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  )
}
