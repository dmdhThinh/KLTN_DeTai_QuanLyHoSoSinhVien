import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'

export default function EditThongBao() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tieuDe, setTieuDe] = useState('')
  const [noiDung, setNoiDung] = useState('')
  const [moTaFile, setMoTaFile] = useState('')
  const [hinhAnh, setHinhAnh] = useState(null)
  const [video, setVideo] = useState(null)
  const [tep, setTep] = useState(null)
  const [message, setMessage] = useState('')
  
  // State để lưu data cũ (từ S3)
  const [existingImages, setExistingImages] = useState([])
  const [existingVideo, setExistingVideo] = useState(null)
  const [existingFile, setExistingFile] = useState(null)
  
  // State để track items bị xóa
  const [deleteVideo, setDeleteVideo] = useState(false)
  const [deleteFile, setDeleteFile] = useState(false)

  useEffect(() => {
    fetch(`/api/thongbao/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTieuDe(data.tieu_de)
        setNoiDung(data.noi_dung)
        setMoTaFile(data.mo_ta_file || '')
        
        // Lưu media đã có
        setExistingImages(data.hinh_anh || [])
        setExistingVideo(data.video || null)
        setExistingFile(data.tep_dinh_kem || null)
      })
      .catch(() => setMessage('❌ Không tải được dữ liệu'))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    const formData = new FormData()
    formData.append('tieu_de', tieuDe)
    formData.append('noi_dung', noiDung)
    formData.append('mo_ta_file', moTaFile)

    // Gửi danh sách ảnh còn lại (sau khi xóa)
    if (existingImages.length > 0) {
      formData.append('keep_images', JSON.stringify(existingImages))
    }
    
    // Đánh dấu xóa video/file
    if (deleteVideo) formData.append('delete_video', 'true')
    if (deleteFile) formData.append('delete_file', 'true')

    // Upload file mới
    if (hinhAnh?.length)
      hinhAnh.forEach((file) => formData.append('hinh_anh', file))
    if (video) formData.append('video', video)
    if (tep) formData.append('tep_dinh_kem', tep)

    try {
      const res = await fetch(`/api/thongbao/${id}`, {
        method: 'PUT',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMessage('✅ ' + data.message)
      setTimeout(() => navigate('/admin/thongbao'), 1500)
    } catch (err) {
      setMessage('❌ ' + err.message)
    }
  }

  return (
    <AdminLayout title="Cập nhật tin tức" activeMenu="thongbao">
      <div className="card shadow-sm p-4">
        <h5 className="fw-semibold mb-3">Chỉnh sửa thông báo</h5>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label className="form-label fw-semibold">Tiêu đề</label>
            <input
              type="text"
              className="form-control"
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Nội dung</label>
            <textarea
              className="form-control"
              rows="6"
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              required
            ></textarea>
          </div>
          {/* Preview ảnh đã có */}
          {existingImages.length > 0 && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Ảnh hiện tại ({existingImages.length})</label>
              <div className="d-flex flex-wrap gap-2">
                {existingImages.map((url, i) => {
                  const imgUrl = url.startsWith('http') 
                    ? url 
                    : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/${url.replace(/\\/g, '/')}`
                  return (
                    <div key={i} className="position-relative">
                      <img
                        src={imgUrl}
                        alt={`Ảnh ${i + 1}`}
                        className="rounded border"
                        style={{ width: 120, height: 120, objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                        style={{ padding: '2px 6px', fontSize: '12px' }}
                        onClick={() => {
                          if (window.confirm('Ảnh này sẽ bị xóa khi bạn lưu thay đổi. Tiếp tục?')) {
                            setExistingImages(existingImages.filter((_, idx) => idx !== i))
                          }
                        }}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  )
                })}
              </div>
              <small className="text-muted">Click nút X để xóa ảnh, hoặc upload ảnh mới bên dưới</small>
            </div>
          )}

          {/* Preview video đã có */}
          {existingVideo && !deleteVideo && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Video hiện tại</label>
              <div className="d-flex align-items-start gap-2">
                <video
                  controls
                  className="rounded border"
                  style={{ maxWidth: 400, maxHeight: 300 }}
                  src={existingVideo.startsWith('http') 
                    ? existingVideo 
                    : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/${existingVideo.replace(/\\/g, '/')}`}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (window.confirm('Video này sẽ bị xóa khi bạn lưu thay đổi. Tiếp tục?')) {
                      setDeleteVideo(true)
                    }
                  }}
                >
                  <i className="bi bi-trash"></i> Xóa video
                </button>
              </div>
              <small className="text-muted">Click nút xóa để gỡ video, hoặc upload video mới bên dưới</small>
            </div>
          )}
          {deleteVideo && (
            <div className="mb-3 alert alert-warning">
              <i className="bi bi-exclamation-triangle"></i> Video sẽ bị xóa khi lưu thay đổi. 
              <button type="button" className="btn btn-link btn-sm" onClick={() => setDeleteVideo(false)}>Hoàn tác</button>
            </div>
          )}

          {/* Preview file đính kèm đã có */}
          {existingFile && !deleteFile && (() => {
            const fileUrl = existingFile.startsWith('http') 
              ? existingFile 
              : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/${existingFile.replace(/\\/g, '/')}`
            
            // Lấy extension từ URL
            const urlParts = fileUrl.split('/')
            const fileName = urlParts[urlParts.length - 1]
            const extension = fileName.includes('.') ? fileName.split('.').pop() : 'file'
            
            // Tạo tên file từ mô tả
            const downloadName = moTaFile 
              ? `${moTaFile.replace(/[^a-zA-Z0-9\s-_]/g, '')}.${extension}`
              : fileName
            
            return (
            <div className="mb-3">
              <label className="form-label fw-semibold">File đính kèm hiện tại</label>
              <div className="d-flex align-items-center gap-2">
                <a
                  href={fileUrl}
                  download={downloadName}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  <i className="bi bi-download"></i> {moTaFile || 'Tải file hiện tại'}
                </a>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (window.confirm('File này sẽ bị xóa khi bạn lưu thay đổi. Tiếp tục?')) {
                      setDeleteFile(true)
                    }
                  }}
                >
                  <i className="bi bi-trash"></i> Xóa file
                </button>
              </div>
              <small className="text-muted">Click nút xóa để gỡ file, hoặc upload file mới bên dưới</small>
            </div>
            )
          })()}
          {deleteFile && (
            <div className="mb-3 alert alert-warning">
              <i className="bi bi-exclamation-triangle"></i> File sẽ bị xóa khi lưu thay đổi. 
              <button type="button" className="btn btn-link btn-sm" onClick={() => setDeleteFile(false)}>Hoàn tác</button>
            </div>
          )}

          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Thay ảnh (nếu muốn)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                multiple
                onChange={(e) => setHinhAnh([...e.target.files])}
              />
              {hinhAnh && <small className="text-success">✅ {hinhAnh.length} ảnh mới đã chọn</small>}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Video mới (nếu có)</label>
              <input
                type="file"
                className="form-control"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files[0])}
              />
              {video && <small className="text-success">✅ Video mới đã chọn</small>}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">File đính kèm mới</label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                onChange={(e) => setTep(e.target.files[0])}
              />
              {tep && <small className="text-success">✅ File mới đã chọn</small>}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Mô tả file</label>
            <input
              type="text"
              className="form-control"
              value={moTaFile}
              onChange={(e) => setMoTaFile(e.target.value)}
            />
          </div>
          {message && <div className="alert alert-info">{message}</div>}
          <button className="btn btn-success">Cập nhật</button>
        </form>
      </div>
    </AdminLayout>
  )
}