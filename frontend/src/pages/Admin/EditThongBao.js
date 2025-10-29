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

  useEffect(() => {
    fetch(`/api/thongbao/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTieuDe(data.tieu_de)
        setNoiDung(data.noi_dung)
        setMoTaFile(data.mo_ta_file || '')
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
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Video mới (nếu có)</label>
              <input
                type="file"
                className="form-control"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files[0])}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">File đính kèm mới</label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                onChange={(e) => setTep(e.target.files[0])}
              />
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