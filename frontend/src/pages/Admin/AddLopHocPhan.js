import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api'
import AdminLayout from '../../components/AdminLayout'

function CenterError({ message, onClose }) {
  if (!message) return null
  return (
    <div className="position-fixed top-50 start-50 translate-middle" style={{ zIndex: 1055 }}>
      <div className="card shadow-lg border-danger" style={{ maxWidth: 520 }}>
        <div className="card-body text-center">
          <div className="fw-semibold text-danger mb-2">Có lỗi xảy ra</div>
          <div className="mb-3">{message}</div>
          <button className="btn btn-danger" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}

export default function AddLopHocPhan() {
  const navigate = useNavigate()

  // 🧩 State form
  const [maLopHocPhan, setMaLopHocPhan] = useState('')
  const [hocPhanId, setHocPhanId] = useState('')
  const [giangVienId, setGiangVienId] = useState('')
  const [lopId, setLopId] = useState('')
  const [hocKy, setHocKy] = useState('HK1')
  const [namHoc, setNamHoc] = useState('2025-2026')
  const [trangThai, setTrangThai] = useState('Chấp nhận mở lớp')
  const [ngayBatDau, setNgayBatDau] = useState('')
  const [ngayKetThuc, setNgayKetThuc] = useState('')
  const [soTuanHoc, setSoTuanHoc] = useState('')

  // 🧠 Combobox phụ thuộc
  const [nganhId, setNganhId] = useState('')

  // 🗂️ Data lists
  const [nganhs, setNganhs] = useState([])
  const [lops, setLops] = useState([])
  const [hocPhans, setHocPhans] = useState([])
  const [giangViens, setGiangViens] = useState([])

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadNganhs()
    loadLops()
    loadHocPhans()
    loadGiangViens()
  }, [])

  // 🧮 Tự động tính số tuần học
  useEffect(() => {
    if (ngayBatDau && ngayKetThuc) {
      const start = new Date(ngayBatDau)
      const end = new Date(ngayKetThuc)
      
      if (end >= start) {
        const diffTime = Math.abs(end - start)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const weeks = Math.ceil(diffDays / 7)
        setSoTuanHoc(weeks.toString())
      } else {
        setSoTuanHoc('')
      }
    }
  }, [ngayBatDau, ngayKetThuc])

  // 🧩 Load data
  const loadNganhs = async () => {
    try {
      const data = await apiFetch('/api/nganh')
      setNganhs(data || [])
    } catch {
      setNganhs([])
    }
  }

  const loadLops = async () => {
    try {
      const data = await apiFetch('/api/lop')
      setLops(data || [])
    } catch {
      setLops([])
    }
  }

  const loadHocPhans = async () => {
    try {
      const data = await apiFetch('/api/hocphan')
      setHocPhans(data || [])
    } catch {
      setHocPhans([])
    }
  }

  const loadGiangViens = async () => {
    try {
     const response = await apiFetch('/api/giangviens');
    setGiangViens(response.data || []); // Extract the 'data' array from the response
    } catch {
      setGiangViens([])
    }
  }

  // 🎯 Lọc lớp theo ngành
  const filteredLops = lops.filter(l => l.nganhId == nganhId || l.nganh_id == nganhId)

  // 🎯 Lọc học phần theo ngành
  const filteredHocPhans = hocPhans.filter(h => h.nganhId == nganhId || h.nganh_id == nganhId)

  // 🧾 Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!maLopHocPhan.trim()) return setError('Vui lòng nhập mã lớp học phần.')
    if (!hocPhanId || !giangVienId || !lopId)
      return setError('Vui lòng chọn đầy đủ học phần, giảng viên và lớp.')
    if (!ngayBatDau || !ngayKetThuc || !soTuanHoc)
      return setError('Vui lòng nhập ngày bắt đầu, ngày kết thúc và số tuần học.')

    setSubmitting(true)
    try {
      await apiFetch('/api/lophocphan', {
        method: 'POST',
        body: JSON.stringify({
          maLopHocPhan,
          hocPhanId,
          giangVienId,
          lopId,
          hocKy,
          namHoc,
          trangThai,
          ngayBatDau,
          ngayKetThuc,
          soTuanHoc
        })
      })
      navigate('/admin/lophocphan', { replace: true })
    } catch (err) {
      setError(err.message || 'Không thể thêm lớp học phần.')
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <AdminLayout activeMenu="lophocphan" title="Thêm Lớp Học Phần">
      <CenterError message={error} onClose={() => setError('')} />
      <div className="d-flex justify-content-center">
        <div className="card shadow-sm w-100" style={{ maxWidth: 1370 }}>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="row g-3">

              {/* Mã lớp học phần */}
              <div className="col-md-4">
                <label className="form-label">Mã lớp học phần *</label>
                <input
                  className="form-control"
                  value={maLopHocPhan}
                  onChange={(e) => setMaLopHocPhan(e.target.value)}
                  placeholder="VD: CNTT01-WWW1"
                />
              </div>

              {/* Ngành */}
              <div className="col-md-4">
                <label className="form-label">Ngành *</label>
                <select
                  className="form-select"
                  value={nganhId}
                  onChange={(e) => {
                    setNganhId(e.target.value)
                    setLopId('')
                    setHocPhanId('')
                  }}
                >
                  <option value="">-- Chọn ngành --</option>
                  {nganhs.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.tenNganh || n.ten_nganh}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lớp */}
              <div className="col-md-4">
                <label className="form-label">Lớp *</label>
                <select
                  className="form-select"
                  value={lopId}
                  onChange={(e) => setLopId(e.target.value)}
                  disabled={!nganhId}
                >
                  <option value="">-- Chọn lớp --</option>
                  {filteredLops.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.tenLop || l.ten_lop}
                    </option>
                  ))}
                </select>
              </div>

              {/* Học phần */}
              <div className="col-md-4">
                <label className="form-label">Học phần *</label>
                <select
                  className="form-select"
                  value={hocPhanId}
                  onChange={(e) => setHocPhanId(e.target.value)}
                  disabled={!nganhId}
                >
                  <option value="">-- Chọn học phần --</option>
                  {filteredHocPhans.map((hp) => (
                    <option key={hp.id} value={hp.id}>
                      {hp.tenHocPhan || hp.ten_hoc_phan}
                    </option>
                  ))}
                </select>
              </div>

              {/* Giảng viên */}
              <div className="col-md-4">
                <label className="form-label">Giảng viên *</label>
                <select
                  className="form-select"
                  value={giangVienId}
                  onChange={(e) => setGiangVienId(e.target.value)}
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {giangViens.map((gv) => (
                    <option key={gv.id} value={gv.id}>                    
                      {gv.hoTen || gv.ho_ten}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày bắt đầu */}
              <div className="col-md-4">
                <label className="form-label">Ngày bắt đầu *</label>
                <input
                  type="date"
                  className="form-control"
                  value={ngayBatDau}
                  onChange={(e) => setNgayBatDau(e.target.value)}
                />
              </div>

              {/* Ngày kết thúc */}
              <div className="col-md-4">
                <label className="form-label">Ngày kết thúc *</label>
                <input
                  type="date"
                  className="form-control"
                  value={ngayKetThuc}
                  onChange={(e) => setNgayKetThuc(e.target.value)}
                />
              </div>

              {/* Số tuần học */}
              <div className="col-md-4">
                <label className="form-label">Số tuần học *</label>
                <input
                  type="number"
                  className="form-control"
                  value={soTuanHoc}
                  onChange={(e) => setSoTuanHoc(e.target.value)}
                  placeholder="VD: 15"
                />
              </div>

              {/* Học kỳ / Năm học / Trạng thái */}
              <div className="col-md-3">
                <label className="form-label">Học kỳ</label>
                <select
                  className="form-select"
                  value={hocKy}
                  onChange={(e) => setHocKy(e.target.value)}
                >
                  <option value="HK1">HK1</option>
                  <option value="HK2">HK2</option>
                  <option value="HK Hè">HK Hè</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Năm học</label>
                <input
                  className="form-control"
                  value={namHoc}
                  onChange={(e) => setNamHoc(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={trangThai}
                  onChange={(e) => setTrangThai(e.target.value)}
                >
                  <option value="Chờ sinh viên đăng ký">Chờ sinh viên đăng ký</option>
                  <option value="Chấp nhận mở lớp">Chấp nhận mở lớp</option>
                  <option value="Hủy mở lớp">Hủy mở lớp</option>
                </select>
              </div>

              {/* Submit */}
              <div className="col-12 d-flex justify-content-end gap-2">
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  onClick={() => navigate('/admin/lophocphan')}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary" 
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu lớp học phần'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
