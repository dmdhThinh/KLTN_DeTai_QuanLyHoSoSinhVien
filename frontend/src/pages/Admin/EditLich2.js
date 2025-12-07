import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

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

export default function EditLich2() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    lop_hoc_phan_id: '',
    thu: '',
    ca: '',
    tiet_bat_dau: '',
    tiet_ket_thuc: '',
    phong: '',
    co_so: '',
    loai: 'lythuyet',
    ghi_chu: ''
  })

  const [nganhId, setNganhId] = useState('')
  const [lopId, setLopId] = useState('')

  const [nganhs, setNganhs] = useState([])
  const [lops, setLops] = useState([])
  const [lopHocPhanInfo, setLopHocPhanInfo] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [nganhData, lopData, lichData] = await Promise.all([
        apiFetch('/api/nganh'),
        apiFetch('/api/lop'),
        apiFetch(`/api/lich-admin/${id}`)
      ])

      setNganhs(nganhData || [])
      setLops(lopData || [])

      // Load thông tin lịch học
      if (lichData) {
        setForm({
          lop_hoc_phan_id: lichData.lopHocPhanId || lichData.lop_hoc_phan_id || '',
          thu: lichData.thu || '',
          ca: lichData.ca || '',
          tiet_bat_dau: lichData.tietBatDau || lichData.tiet_bat_dau || '',
          tiet_ket_thuc: lichData.tietKetThuc || lichData.tiet_ket_thuc || '',
          phong: lichData.phong || '',
          co_so: lichData.coSo || lichData.co_so || '',
          loai: lichData.loai || 'lythuyet',
          ghi_chu: lichData.ghiChu || lichData.ghi_chu || ''
        })

        // Load thông tin lớp học phần để lấy khoa/ngành/lớp
        const lhpId = lichData.lopHocPhanId || lichData.lop_hoc_phan_id
        if (lhpId) {
          try {
            const lhpInfo = await apiFetch(`/api/lophocphan/${lhpId}`)
            if (lhpInfo) {
              setLopHocPhanInfo(lhpInfo)
              const lop = lopData.find(l => l.id === (lhpInfo.lopId || lhpInfo.lop_id))
              if (lop) {
                setLopId(lop.id)
                setNganhId(lop.nganhId || lop.nganh_id)
              }
            }
          } catch (err) {
            console.error('Error loading lop hoc phan info:', err)
          }
        }
      }
    } catch (err) {
      console.error(err)
      setError('Không thể tải dữ liệu.')
    } finally {
      setLoading(false)
    }
  }

  // Filter dropdowns
  const filteredLops = lops.filter(l => String(l.nganhId || l.nganh_id) === String(nganhId))

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const checkTrungPhong = async (thu, ca, tietBatDau, tietKetThuc, phong, excludeId) => {
    if (!thu || !ca || !tietBatDau || !tietKetThuc || !phong) {
      return false
    }

    try {
      // Lấy tất cả lịch học để kiểm tra trùng
      const allLich = await apiFetch('/api/lich-admin')
      
      // Kiểm tra trùng phòng trong cùng thứ, ca, và tiết học (loại trừ bản ghi hiện tại)
      const trung = allLich.some(lh => {
        // Bỏ qua bản ghi đang sửa
        if (lh.id === excludeId) return false
        
        // Chỉ kiểm tra nếu có phòng và cùng thứ, ca
        if (!lh.phong || !lh.thu || !lh.ca) return false
        
        const sameThu = Number(lh.thu) === Number(thu)
        const sameCa = (lh.ca || '').toLowerCase() === (ca || '').toLowerCase()
        const samePhong = (lh.phong || '').trim().toLowerCase() === (phong || '').trim().toLowerCase()
        
        if (!sameThu || !sameCa || !samePhong) return false
        
        // Kiểm tra trùng tiết học
        const lhTietBatDau = Number(lh.tietBatDau || lh.tiet_bat_dau)
        const lhTietKetThuc = Number(lh.tietKetThuc || lh.tiet_ket_thuc)
        const newTietBatDau = Number(tietBatDau)
        const newTietKetThuc = Number(tietKetThuc)
        
        // Trùng nếu có giao nhau
        return !(newTietKetThuc < lhTietBatDau || newTietBatDau > lhTietKetThuc)
      })
      
      return trung
    } catch (err) {
      console.error('Lỗi kiểm tra trùng phòng:', err)
      return false
    }
  }

  // Hàm chuyển đổi thứ
  const getThuLabel = (thu) => {
    const thuMap = {
      2: 'Thứ 2',
      3: 'Thứ 3',
      4: 'Thứ 4',
      5: 'Thứ 5',
      6: 'Thứ 6',
      7: 'Thứ 7',
      8: 'Chủ nhật'
    }
    return thuMap[thu] || thu
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Kiểm tra trùng phòng học
    if (form.phong && form.thu && form.ca && form.tiet_bat_dau && form.tiet_ket_thuc) {
      const isTrung = await checkTrungPhong(
        form.thu,
        form.ca,
        form.tiet_bat_dau,
        form.tiet_ket_thuc,
        form.phong,
        id
      )
      
      if (isTrung) {
        setError(`Phòng ${form.phong} đã được sử dụng trong ${getThuLabel(form.thu)}, ca ${form.ca}, tiết ${form.tiet_bat_dau}-${form.tiet_ket_thuc}. Vui lòng chọn phòng khác.`)
        return
      }
    }
    
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const payload = {
        thu: form.thu ? Number(form.thu) : null,
        ca: form.ca || '',
        tiet_bat_dau: form.tiet_bat_dau ? Number(form.tiet_bat_dau) : null,
        tiet_ket_thuc: form.tiet_ket_thuc ? Number(form.tiet_ket_thuc) : null,
        phong: form.phong?.trim() || null,
        co_so: form.co_so?.trim() || null,
        loai: form.loai || 'lythuyet',
        ghi_chu: form.ghi_chu || null
      }

      await apiFetch(`/api/lich-admin/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      setMessage('✅ Cập nhật lịch học thành công!')
      setTimeout(() => navigate('/admin/quan-ly-lich-hoc'), 1500)
    } catch (err) {
      console.error(err)
      setError('Không thể cập nhật lịch học: ' + (err.message || 'Lỗi không xác định'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>

  return (
    <AdminLayout activeMenu="quan-ly-lich-hoc" title="Cập nhật Lịch học">
      <CenterError message={error} onClose={() => setError('')} />
      {message && <div className="alert alert-success text-center py-2">{message}</div>}
      
      <div className="d-flex justify-content-center">
        <div className="card shadow-sm w-100" style={{ maxWidth: 1370 }}>
          <div className="card-body">
            
            <form onSubmit={handleSubmit} className="row g-3">

              {/* Cột 1 */}
              <div className="col-md-4">
                <label className="form-label">Mã lớp học phần *</label>
                <input
                  type="text"
                  className="form-control"
                  value={lopHocPhanInfo ? (lopHocPhanInfo.maLopHocPhan || lopHocPhanInfo.ma_lop_hoc_phan || '') : ''}
                  disabled
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Ngành *</label>
                <input
                  type="text"
                  className="form-control"
                  value={nganhs.find(n => n.id === nganhId)?.tenNganh || nganhs.find(n => n.id === nganhId)?.ten_nganh || ''}
                  disabled
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Lớp *</label>
                <input
                  type="text"
                  className="form-control"
                  value={filteredLops.find(l => l.id === lopId)?.tenLop || filteredLops.find(l => l.id === lopId)?.ten_lop || ''}
                  disabled
                />
              </div>

              {/* Cột 2 */}
              <div className="col-md-4">
                <label className="form-label">Thứ *</label>
                <select
                  className="form-select"
                  value={form.thu}
                  onChange={(e) => handleChange('thu', e.target.value)}
                  required
                >
                  <option value="">-- Chọn thứ --</option>
                  <option value="2">Thứ 2</option>
                  <option value="3">Thứ 3</option>
                  <option value="4">Thứ 4</option>
                  <option value="5">Thứ 5</option>
                  <option value="6">Thứ 6</option>
                  <option value="7">Thứ 7</option>
                  <option value="8">Chủ nhật</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Ca *</label>
                <select
                  className="form-select"
                  value={form.ca}
                  onChange={(e) => handleChange('ca', e.target.value)}
                  required
                >
                  <option value="">-- Chọn ca --</option>
                  <option value="sáng">Sáng</option>
                  <option value="chiều">Chiều</option>
                  <option value="tối">Tối</option>
                </select>
              </div>

              {/* Cột 3 */}
              <div className="col-md-4">
                <label className="form-label">Phòng</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.phong}
                  onChange={(e) => handleChange('phong', e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Tiết bắt đầu *</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.tiet_bat_dau}
                  onChange={(e) => handleChange('tiet_bat_dau', e.target.value)}
                  required
                  min="1"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Tiết kết thúc *</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.tiet_ket_thuc}
                  onChange={(e) => handleChange('tiet_ket_thuc', e.target.value)}
                  required
                  min="1"
                />
              </div>

              {/* Hàng 2 */}
              <div className="col-md-4">
                <label className="form-label">Cơ sở</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.co_so}
                  onChange={(e) => handleChange('co_so', e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Loại *</label>
                <select
                  className="form-select"
                  value={form.loai}
                  onChange={(e) => handleChange('loai', e.target.value)}
                  required
                >
                  <option value="lythuyet">Lý thuyết</option>
                  <option value="thuchanh">Thực hành</option>
                  <option value="tructuyen">Trực tuyến</option>
                  <option value="thi">Thi</option>
                </select>
              </div>

              <div className="col-12 d-flex justify-content-end mt-4">
                <button type="button" className="btn btn-secondary me-2" onClick={() => navigate('/admin/quan-ly-lich-hoc')}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
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

