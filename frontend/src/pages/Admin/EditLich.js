import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function EditLich() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lich, setLich] = useState({
    ngay_hoc: '',
    thu: '',
    ca: '',
    tiet_bat_dau: '',
    tiet_ket_thuc: '',
    phong: '',
    co_so: '',
    loai: 'lythuyet',
    ghi_chu: '',
  })
  const [giangViens, setGiangViens] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadLich()
    loadGiangVien()
  }, [id])

  // 🔹 Lấy chi tiết lịch
  const loadLich = async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/api/lich-admin/${id}`)
      // nếu backend trả về null → tránh lỗi .ngay_hoc
      setLich({
        ngay_hoc: data.ngay_hoc || '',
        thu: data.thu || '',
        ca: data.ca || '',
        tiet_bat_dau: data.tiet_bat_dau || data.tietBatDau || '',
        tiet_ket_thuc: data.tiet_ket_thuc || data.tietKetThuc || '',
        phong: data.phong || '',
        co_so: data.co_so || '',
        loai: data.loai || 'lythuyet',
        ghi_chu: data.ghi_chu || data.ghiChu || '',
        lop_hoc_phan_id: data.lop_hoc_phan_id,
        giang_vien_id: data.giang_vien_id,
      })
    } catch (err) {
      console.error(err)
      setError('Không thể tải dữ liệu lịch học')
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Lấy danh sách giảng viên
  const loadGiangVien = async () => {
    try {
      const data = await apiFetch('/api/giangvien')
      setGiangViens(data || [])
    } catch (err) {
      console.error('Lỗi tải giảng viên:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setLich((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!lich) return

    setSaving(true)
    try {
      // Nếu có ngày học cụ thể → gọi API tạo bản ghi ngoại lệ
      if (lich.ngay_hoc && lich.ngay_hoc.trim() !== '') {
        await apiFetch('/api/lich-admin/override', {
          method: 'POST',
          body: JSON.stringify({
            lich_hoc_id: id,
            ngay_hoc: lich.ngay_hoc,
            phong: lich.phong,
            co_so: lich.co_so,
            ghi_chu: lich.ghi_chu,
          }),
        })
      } else {
        // Ngược lại → sửa mẫu lịch gốc (áp dụng mọi tuần)
        const payload = {
          thu: lich.thu || null,
          ca: lich.ca || '',
          tiet_bat_dau: lich.tiet_bat_dau || null,
          tiet_ket_thuc: lich.tiet_ket_thuc || null,
          phong: lich.phong?.trim() || null,
          co_so: lich.co_so?.trim() || null,
          loai: lich.loai || 'lythuyet',
          ghi_chu: lich.ghi_chu || null,
        }
        await apiFetch(`/api/lich-admin/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      }

      // 🔹 Nếu giảng viên thay đổi
      if (lich.lop_hoc_phan_id && lich.giang_vien_id) {
        await apiFetch(`/api/lich-admin/update-giangvien`, {
          method: 'PUT',
          body: JSON.stringify({
            lopHocPhanId: lich.lop_hoc_phan_id,
            giangVienId: lich.giang_vien_id,
          }),
        })
      }

      setMessage('✅ Cập nhật lịch thành công!')
      setTimeout(() => navigate('/admin/lich'), 1500)
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật lịch:', err)
      setMessage('❌ Cập nhật thất bại: ' + (err.message || 'Lỗi không xác định'))
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <AdminLayout title="Chỉnh sửa Lịch">
        <div className="text-center p-5 text-muted">⏳ Đang tải dữ liệu...</div>
      </AdminLayout>
    )

  if (!lich)
    return (
      <AdminLayout title="Chỉnh sửa Lịch">
        <div className="text-center text-danger p-4">Không tìm thấy lịch</div>
      </AdminLayout>
    )

  return (
    <AdminLayout title="Chỉnh sửa lịch học" activeMenu="lich">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <h5 className="mb-3">📝 Cập nhật lịch học</h5>

          {message && <div className="alert alert-info text-center">{message}</div>}

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {/* 🔹 Ngày áp dụng (chỉ dùng khi muốn đổi 1 buổi riêng) */}
            <div>
              <label className="form-label">Ngày áp dụng (nếu chỉ đổi 1 buổi)</label>
              <input
                type="date"
                className="form-control"
                name="ngay_hoc"
                value={lich.ngay_hoc || ''}
                onChange={handleChange}
              />
              <small className="text-muted">
                Nếu bỏ trống, thay đổi này áp dụng cho toàn bộ các tuần.
              </small>
            </div>

            <div>
              <label className="form-label">Thứ</label>
              <input
                type="number"
                className="form-control"
                name="thu"
                value={lich.thu || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">Ca</label>
              <input
                type="text"
                className="form-control"
                name="ca"
                value={lich.ca || ''}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <div className="col">
                <label className="form-label">Tiết bắt đầu</label>
                <input
                  type="number"
                  className="form-control"
                  name="tiet_bat_dau"
                  value={lich.tiet_bat_dau || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="col">
                <label className="form-label">Tiết kết thúc</label>
                <input
                  type="number"
                  className="form-control"
                  name="tiet_ket_thuc"
                  value={lich.tiet_ket_thuc || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Phòng</label>
              <input
                type="text"
                className="form-control"
                name="phong"
                value={lich.phong || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">Cơ sở</label>
              <input
                type="text"
                className="form-control"
                name="co_so"
                value={lich.co_so || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">Loại lịch</label>
              <select
                name="loai"
                className="form-select"
                value={lich.loai || ''}
                onChange={handleChange}
              >
                <option value="lythuyet">Lý thuyết</option>
                <option value="thuchanh">Thực hành</option>
                <option value="tructuyen">Trực tuyến</option>
                <option value="thi">Thi</option>
              </select>
            </div>

            <div className="d-flex justify-content-between mt-3">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '💾 Đang lưu...' : '💾 Lưu thay đổi'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/lich')}
              >
                ⬅ Quay lại
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
