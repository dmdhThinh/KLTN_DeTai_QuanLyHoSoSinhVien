// src/pages/Admin/AddThongBao.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'

const API_BASE = process.env.REACT_APP_API_BASE || ''

export default function AddThongBao() {
  const [tieuDe, setTieuDe] = useState('')
  const [noiDung, setNoiDung] = useState('')
  const [hinhAnh, setHinhAnh] = useState(null)
  const [video, setVideo] = useState(null)
  const [tep, setTep] = useState(null)
  const [moTaFile, setMoTaFile] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    const formData = new FormData()
    formData.append('tieu_de', tieuDe)
    formData.append('noi_dung', noiDung)
    formData.append('mo_ta_file', moTaFile)

    if (hinhAnh?.length)
      hinhAnh.forEach((file) => formData.append('hinh_anh', file))

    if (video) formData.append('video', video)
    if (tep) formData.append('tep_dinh_kem', tep)

    try {
      const res = await fetch(`${API_BASE}/api/thongbao`, {
        method: 'POST',
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
    <AdminLayout title="Đăng tin tức mới" activeMenu="thongbao">
      <div className="card shadow-sm p-4">
        <h5 className="fw-semibold mb-3">
          Thêm tin tức có hình ảnh / video / file
        </h5>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Tiêu đề */}
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

          {/* Nội dung */}
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

          <div className="row mb-3">
            {/* Upload nhiều ảnh */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Ảnh minh họa (chọn thư mục hoặc nhiều ảnh)
              </label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                multiple
                webkitdirectory="true"
                directory="true"
                onChange={(e) => setHinhAnh([...e.target.files])}
              />
              {hinhAnh?.length > 0 && (
                <div className="mt-2 small text-muted">
                  {hinhAnh.length} ảnh được chọn
                </div>
              )}
            </div>

            {/* Upload video */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">Video</label>
              <input
                type="file"
                className="form-control"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files[0])}
              />
              {video && (
                <div className="mt-2 small text-muted">
                  🎥 {video.name}
                </div>
              )}
            </div>

            {/* Upload file đính kèm */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">File đính kèm</label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                onChange={(e) => setTep(e.target.files[0])}
              />
              {tep && (
                <div className="mt-2 small text-muted">
                  📎 {tep.name}
                </div>
              )}
            </div>
          </div>

          {/* Mô tả file */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Mô tả file (ví dụ: Danh sách sinh viên được học bổng)
            </label>
            <input
              type="text"
              className="form-control"
              value={moTaFile}
              onChange={(e) => setMoTaFile(e.target.value)}
              placeholder="Nhập mô tả file đính kèm..."
            />
          </div>
          {/* Thông báo / kết quả */}
          {message && <div className="alert alert-info">{message}</div>}

          {/* Nút gửi */}
          <button className="btn btn-primary">Đăng tin</button>
        </form>
      </div>
    </AdminLayout>
  )
}