import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TeacherLayout from '../../components/TeacherLayout'
import { getGiangVienId, markThongBaoAsReadGiangVien } from '../../api'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'

const API_BASE = process.env.REACT_APP_API_BASE || ''

export default function ThongBaoChiTietGiangVien() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tin, setTin] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async (forceRefresh = false) => {
    setLoading(true)
    try {
      const url = forceRefresh 
        ? `${API_BASE}/api/thongbao/${id}?_t=${Date.now()}`
        : `${API_BASE}/api/thongbao/${id}`
      
      const res = await fetch(url)
      const data = await res.json()
      setTin(data)
      
      // Đánh dấu đã đọc
      const gvId = getGiangVienId()
      if (gvId) {
        markThongBaoAsReadGiangVien(gvId, id)
      }
    } catch {
      setTin(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (loading)
    return (
      <TeacherLayout title="Chi tiết tin tức">
        <div className="container py-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <div className="mt-2 text-muted">Đang tải...</div>
          </div>
        </div>
      </TeacherLayout>
    )

  if (!tin)
    return (
      <TeacherLayout title="Chi tiết tin tức">
        <div className="container py-4 text-center">
          <div className="card shadow-sm border-0 p-5" style={{ borderRadius: '16px' }}>
            <i className="bi bi-exclamation-triangle text-danger fs-1 mb-3"></i>
            <h5 className="text-danger mb-3">Không tìm thấy tin tức</h5>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại
            </button>
          </div>
        </div>
      </TeacherLayout>
    )

  return (
    <TeacherLayout title="Chi tiết tin tức">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại danh sách
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => loadData(true)}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            {/* Header */}
            <div className="mb-4 pb-4 border-bottom">
              <div className="d-flex align-items-center mb-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <i className="bi bi-megaphone text-white fs-5"></i>
                </div>
                <div className="flex-grow-1">
                  <h4 className="mb-1 fw-bold">{tin.tieu_de}</h4>
                  <small className="text-muted">
                    <i className="bi bi-calendar3 me-1"></i>
                    Ngày đăng: {new Date(tin.ngay_gui).toLocaleDateString('vi-VN')}
                  </small>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4" style={{ 
              whiteSpace: 'pre-wrap', 
              fontSize: '15px',
              lineHeight: '1.8'
            }}>
              {tin.noi_dung}
            </div>

            {/* File đính kèm */}
            {tin.tep_dinh_kem && (
              <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-file-earmark-arrow-down fs-4 me-3 text-primary"></i>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-semibold">
                      {tin.mo_ta_file || tin.ten_file_goc || 'File đính kèm'}
                    </h6>
                    <small className="text-muted">Nhấn để tải xuống</small>
                  </div>
                  <a
                    href={`${API_BASE}/api/thongbao/${tin.id}/download`}
                    className="btn btn-primary"
                    download
                  >
                    <i className="bi bi-download me-2"></i>
                    Tải về
                  </a>
                </div>
              </div>
            )}

            {/* Gallery ảnh */}
            {tin.hinh_anh && Array.isArray(tin.hinh_anh) && tin.hinh_anh.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-images me-2"></i>
                  Hình ảnh liên quan
                </h6>
                <PhotoProvider
                  maskOpacity={0.8}
                  speed={() => 500}
                  easing={(type) =>
                    type === 2
                      ? 'cubic-bezier(0.36, 0, 0.66, -0.56)'
                      : 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }
                >
                  <div className="row g-3">
                    {tin.hinh_anh.map((url, i) => {
                      const imgUrl = url.startsWith('http') 
                        ? url 
                        : `${API_BASE}/${url.replace(/\\/g, '/')}`
                      return (
                        <div key={i} className="col-md-4">
                          <PhotoView src={imgUrl}>
                            <img
                              src={imgUrl}
                              alt={`Ảnh ${i + 1}`}
                              className="rounded shadow-sm w-100"
                              style={{
                                height: '200px',
                                objectFit: 'cover',
                                cursor: 'pointer',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)'
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(102,126,234,0.3)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                                e.currentTarget.style.boxShadow = 'none'
                              }}
                            />
                          </PhotoView>
                        </div>
                      )
                    })}
                  </div>
                </PhotoProvider>
              </div>
            )}

            {/* Video */}
            {tin.video && (
              <div className="mb-4">
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-play-circle me-2"></i>
                  Video
                </h6>
                <video
                  controls
                  className="w-100 rounded shadow-sm"
                  style={{ 
                    maxHeight: 480, 
                    borderRadius: '12px',
                    animation: 'fadeIn 0.6s ease' 
                  }}
                  src={tin.video.startsWith('http') 
                    ? tin.video 
                    : `${API_BASE}/${tin.video.replace(/\\/g, '/')}`}
                >
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation CSS */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}
      </style>
    </TeacherLayout>
  )
}
