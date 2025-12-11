import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudentLayout from '../../components/StudentLayout'
import { getThongBaoById, getSinhVienId, markThongBaoAsRead } from '../../api'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'

const API_BASE = process.env.REACT_APP_API_BASE || ''

export default function ThongBaoChiTiet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tin, setTin] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async (forceRefresh = false) => {
    setLoading(true)
    try {
      // Thêm timestamp để bypass cache nếu cần
      const url = forceRefresh 
        ? `${API_BASE}/api/thongbao/${id}?_t=${Date.now()}`
        : `${API_BASE}/api/thongbao/${id}`
      
      const res = await fetch(url)
      const data = await res.json()
      setTin(data)
      
      // ✅ Đánh dấu là đã đọc
      const svId = getSinhVienId()
      if (svId) markThongBaoAsRead(svId, id)
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
      <StudentLayout title="Chi tiết tin tức">
        <div className="container py-4 text-muted">Đang tải...</div>
      </StudentLayout>
    )

  if (!tin)
    return (
      <StudentLayout title="Chi tiết tin tức">
        <div className="container py-4 text-center text-danger">
          Không tìm thấy tin tức
          <div>
            <button className="btn btn-link" onClick={() => navigate(-1)}>
              ← Quay lại
            </button>
          </div>
        </div>
      </StudentLayout>
    )

  return (
    <StudentLayout title="Chi tiết tin tức">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            ← Quay lại danh sách
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => loadData(true)}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i> {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        <div className="card shadow-sm p-4">
          <h5 className="fw-bold mb-2">{tin.tieu_de}</h5>
          <div className="text-muted small mb-3">
            Ngày đăng: {new Date(tin.ngay_gui).toLocaleDateString('vi-VN')}
          </div>

          <div style={{ whiteSpace: 'pre-wrap' }}>{tin.noi_dung}</div>

          {/* 📎 File đính kèm (hiển thị mô tả + link tải) */}
          {tin.tep_dinh_kem && (
            <div className="mt-4">
              <span className="fw-semibold">
                {tin.mo_ta_file || tin.ten_file_goc || 'File đính kèm'}
              </span>{' '}
              (
              <a
                href={`${API_BASE}/api/thongbao/${tin.id}/download`}
                className="text-primary text-decoration-underline"
              >
                tải tại đây
              </a>
              )
            </div>
          )}

          {/* 🖼️ Gallery slideshow ảnh */}
          {tin.hinh_anh && Array.isArray(tin.hinh_anh) && tin.hinh_anh.length > 0 && (
            <div className="mt-4">
              <h6 className="fw-semibold mb-2">Hình ảnh liên quan</h6>
              <PhotoProvider
                maskOpacity={0.8}
                speed={() => 500}
                easing={(type) =>
                  type === 2
                    ? 'cubic-bezier(0.36, 0, 0.66, -0.56)'
                    : 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                }
              >
                <div className="d-flex flex-wrap gap-3 justify-content-center">
                  {tin.hinh_anh.map((url, i) => {
                    const imgUrl = url.startsWith('http') 
                      ? url 
                      : `${API_BASE}/${url.replace(/\\/g, '/')}`
                    return (
                    <PhotoView
                      key={i}
                      src={imgUrl}
                    >
                      <img
                        src={imgUrl}
                        alt={`Ảnh ${i + 1}`}
                        className="rounded shadow-sm"
                        style={{
                          width: '30%',
                          minWidth: 200,
                          maxHeight: 200,
                          objectFit: 'cover',
                          cursor: 'pointer',
                          transition:
                            'transform 0.3s ease, box-shadow 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)'
                          e.currentTarget.style.boxShadow =
                            '0 0 10px rgba(0,0,0,0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                    </PhotoView>
                  )})}
                </div>
              </PhotoProvider>
            </div>
          )}

          {/* 🎥 Hiển thị video */}
          {tin.video && (
            <div className="mt-4 text-center">
              <h6 className="fw-semibold mb-2">Video</h6>
              <video
                controls
                className="w-100 rounded shadow-sm"
                style={{ maxHeight: 480, animation: 'fadeIn 0.6s ease' }}
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

      {/* Hiệu ứng mượt khi hiển thị ảnh/video */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}
      </style>
    </StudentLayout>
  )
}