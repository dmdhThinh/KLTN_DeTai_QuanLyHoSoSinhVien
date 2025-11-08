import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

export default function EditLopHocPhan() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    maLopHocPhan: '',
    hocPhanId: '',
    giangVienId: '',
    lopId: '',
    hocKy: 'HK1',
    namHoc: '2025-2026',
    trangThai: 'Chấp nhận mở lớp',
    ngayBatDau: '',
    ngayKetThuc: '',
    soTuanHoc: ''
  })

  const [khoaId, setKhoaId] = useState('')
  const [nganhId, setNganhId] = useState('')

  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])
  const [lops, setLops] = useState([])
  const [hocPhans, setHocPhans] = useState([])
  const [giangViens, setGiangViens] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [khoaData, nganhData, lopData, hocPhanData, gvData, lhpData] = await Promise.all([
        apiFetch('/api/khoa'),
        apiFetch('/api/nganh'),
        apiFetch('/api/lop'),
        apiFetch('/api/hocphan'),
        apiFetch('/api/giangviens'),
        apiFetch(`/api/lophocphan/${id}`)
      ])

      setKhoas(khoaData)
      setNganhs(nganhData)
      setLops(lopData)
      setHocPhans(hocPhanData)
      setGiangViens(gvData.data || []);

      setForm({
        maLopHocPhan: lhpData.ma_lop_hoc_phan || lhpData.maLopHocPhan || '',
        hocPhanId: lhpData.hoc_phan_id || lhpData.hocPhanId || '',
        giangVienId: lhpData.giang_vien_id || lhpData.giangVienId || '',
        lopId: lhpData.lop_id || lhpData.lopId || '',
        hocKy: lhpData.hoc_ky || lhpData.hocKy || 'HK1',
        namHoc: lhpData.nam_hoc || lhpData.namHoc || '',
        trangThai: lhpData.trang_thai || lhpData.trangThai || 'Chấp nhận mở lớp',
        ngayBatDau: lhpData.ngay_bat_dau ? lhpData.ngay_bat_dau.substring(0, 10) : '',
        ngayKetThuc: lhpData.ngay_ket_thuc ? lhpData.ngay_ket_thuc.substring(0, 10) : '',
        soTuanHoc: lhpData.so_tuan_hoc || ''
      })

      // Gán khoa/ngành tương ứng (nếu có)
      const lop = lopData.find(l => l.id === lhpData.lop_id)
      if (lop) {
        setNganhId(lop.nganh_id)
        const nganh = nganhData.find(n => n.id === lop.nganh_id)
        if (nganh) setKhoaId(nganh.khoa_id)
      }

    } catch (err) {
      console.error(err)
      setError('Không thể tải dữ liệu lớp học phần.')
    } finally {
      setLoading(false)
    }
  }

  const filteredNganhs = nganhs.filter(n => n.khoaId == khoaId || n.khoa_id == khoaId)
  const filteredLops = lops.filter(l => l.nganhId == nganhId || l.nganh_id == nganhId)
  const filteredHocPhans = hocPhans.filter(h => h.nganhId == nganhId || h.nganh_id == nganhId)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiFetch(`/api/lophocphan/${id}`, {
        method: 'PUT',
        body: JSON.stringify(form)
      })
      navigate('/admin/lophocphan', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Không thể cập nhật lớp học phần.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>

  return (
    <AdminLayout activeMenu="lophocphan" title="Chỉnh sửa Lớp Học Phần">
      <CenterError message={error} onClose={() => setError('')} />
      <div className="d-flex justify-content-center">
        <div className="card shadow-sm w-100" style={{ maxWidth: 1370 }}>
          <div className="card-body">
            <h5 className="mb-3">Cập nhật thông tin Lớp Học Phần</h5>
            <form onSubmit={handleSubmit} className="row g-3">

              {/* Mã lớp học phần */}
              <div className="col-md-4">
                <label className="form-label">Mã lớp học phần *</label>
                <input
                  className="form-control"
                  value={form.maLopHocPhan}
                  onChange={(e) => handleChange('maLopHocPhan', e.target.value)}
                />
              </div>

              {/* Khoa */}
              <div className="col-md-4">
                <label className="form-label">Khoa *</label>
                <select
                  className="form-select"
                  value={khoaId}
                  onChange={(e) => {
                    setKhoaId(e.target.value)
                    setNganhId('')
                    handleChange('lopId', '')
                    handleChange('hocPhanId', '')
                  }}
                >
                  <option value="">-- Chọn khoa --</option>
                  {khoas.map(k => <option key={k.id} value={k.id}>{k.tenKhoa || k.ten_khoa}</option>)}
                </select>
              </div>

              {/* Ngành */}
              <div className="col-md-4">
                <label className="form-label">Ngành *</label>
                <select
                  className="form-select"
                  value={nganhId}
                  onChange={(e) => {
                    setNganhId(e.target.value)
                    handleChange('lopId', '')
                    handleChange('hocPhanId', '')
                  }}
                  disabled={!khoaId}
                >
                  <option value="">-- Chọn ngành --</option>
                  {filteredNganhs.map(n => (
                    <option key={n.id} value={n.id}>{n.tenNganh || n.ten_nganh}</option>
                  ))}
                </select>
              </div>

              {/* Lớp */}
              <div className="col-md-4">
                <label className="form-label">Lớp *</label>
                <select
                  className="form-select"
                  value={form.lopId}
                  onChange={(e) => handleChange('lopId', e.target.value)}
                  disabled={!nganhId}
                >
                  <option value="">-- Chọn lớp --</option>
                  {filteredLops.map(l => (
                    <option key={l.id} value={l.id}>{l.tenLop || l.ten_lop}</option>
                  ))}
                </select>
              </div>

              {/* Học phần */}
              <div className="col-md-4">
                <label className="form-label">Học phần *</label>
                <select
                  className="form-select"
                  value={form.hocPhanId}
                  onChange={(e) => handleChange('hocPhanId', e.target.value)}
                  disabled={!nganhId}
                >
                  <option value="">-- Chọn học phần --</option>
                  {filteredHocPhans.map(hp => (
                    <option key={hp.id} value={hp.id}>{hp.tenHocPhan || hp.ten_hoc_phan}</option>
                  ))}
                </select>
              </div>

              {/* Giảng viên */}
              <div className="col-md-4">
  <label className="form-label">Giảng viên *</label>
  <select
    className="form-select"
    value={form.giangVienId}
    onChange={(e) => handleChange('giangVienId', e.target.value)}
  >
    <option value="">-- Chọn giảng viên --</option>
    {Array.isArray(giangViens) && giangViens.length > 0 ? (
      giangViens.map(gv => (
        <option key={gv.id} value={gv.id}>{gv.hoTen || gv.ho_ten}</option>
      ))
    ) : (
      <option value="" disabled>Không có giảng viên</option>
    )}
  </select>
</div>

              {/* Ngày bắt đầu / kết thúc / số tuần */}
              <div className="col-md-4">
                <label className="form-label">Ngày bắt đầu</label>
                <input type="date" className="form-control"
                  value={form.ngayBatDau}
                  onChange={(e) => handleChange('ngayBatDau', e.target.value)} />
              </div>

              <div className="col-md-4">
                <label className="form-label">Ngày kết thúc</label>
                <input type="date" className="form-control"
                  value={form.ngayKetThuc}
                  onChange={(e) => handleChange('ngayKetThuc', e.target.value)} />
              </div>

              <div className="col-md-4">
                <label className="form-label">Số tuần học</label>
                <input type="number" className="form-control"
                  value={form.soTuanHoc}
                  onChange={(e) => handleChange('soTuanHoc', e.target.value)} />
              </div>

              {/* Học kỳ / Năm học / Trạng thái */}
              <div className="col-md-3">
                <label className="form-label">Học kỳ</label>
                <select className="form-select" value={form.hocKy}
                  onChange={(e) => handleChange('hocKy', e.target.value)}>
                  <option value="HK1">HK1</option>
                  <option value="HK2">HK2</option>
                  <option value="HK Hè">HK Hè</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Năm học</label>
                <input className="form-control" value={form.namHoc}
                  onChange={(e) => handleChange('namHoc', e.target.value)} />
              </div>

              <div className="col-md-3">
                <label className="form-label">Trạng thái</label>
                <select className="form-select" value={form.trangThai}
                  onChange={(e) => handleChange('trangThai', e.target.value)}>
                  <option value="Chờ sinh viên đăng ký">Chờ sinh viên đăng ký</option>
                  <option value="Chấp nhận mở lớp">Chấp nhận mở lớp</option>
                  <option value="Hủy mở lớp">Hủy mở lớp</option>
                </select>
              </div>

              <div className="col-12 d-flex justify-content-end">
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
