import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function EditLich() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
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
  const [lopHocPhanInfo, setLopHocPhanInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [phongError, setPhongError] = useState('')

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // 🔹 Lấy chi tiết lịch
  const loadData = async () => {
    setLoading(true)
    try {
      const lichData = await apiFetch(`/api/lich-admin/${id}`)
      
      if (lichData) {
        setForm({
          ngay_hoc: lichData.ngay_hoc || '',
          thu: lichData.thu || '',
          ca: lichData.ca || '',
          tiet_bat_dau: lichData.tiet_bat_dau || lichData.tietBatDau || '',
          tiet_ket_thuc: lichData.tiet_ket_thuc || lichData.tietKetThuc || '',
          phong: lichData.phong || '',
          co_so: lichData.co_so || lichData.coSo || '',
          loai: lichData.loai || 'lythuyet',
          ghi_chu: lichData.ghi_chu || lichData.ghiChu || ''
        })

        // Load thông tin lớp học phần
        const lhpId = lichData.lopHocPhanId || lichData.lop_hoc_phan_id
        if (lhpId) {
          try {
            const lhpInfo = await apiFetch(`/api/lophocphan/${lhpId}`)
            if (lhpInfo) {
              setLopHocPhanInfo(lhpInfo)
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

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Tính thứ từ ngày học
  const getThuFromDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const dayOfWeek = date.getDay() // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    // Chuyển đổi: 0 (CN) -> 8, 1 (T2) -> 2, ..., 6 (T7) -> 7
    return dayOfWeek === 0 ? '8' : String(dayOfWeek + 1)
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

  // Kiểm tra trùng phòng khi thay đổi các field liên quan
  const checkPhongConflict = async (newForm) => {
    if (newForm.phong && newForm.thu && newForm.ca && newForm.tiet_bat_dau && newForm.tiet_ket_thuc) {
      const isTrung = await checkTrungPhong(
        newForm.thu,
        newForm.ca,
        newForm.tiet_bat_dau,
        newForm.tiet_ket_thuc,
        newForm.phong,
        id
      )
      
      if (isTrung) {
        setPhongError(`Phòng ${newForm.phong} đã được sử dụng trong ${getThuLabel(newForm.thu)}, ca ${newForm.ca}, tiết ${newForm.tiet_bat_dau}-${newForm.tiet_ket_thuc}. Vui lòng chọn phòng khác.`)
      } else {
        setPhongError('')
      }
    } else {
      setPhongError('')
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

  const handleNgayHocChange = async (dateString) => {
    handleChange('ngay_hoc', dateString)
    // Tự động tính và set thứ
    const thu = getThuFromDate(dateString)
    handleChange('thu', thu)
    
    // Kiểm tra lại trùng phòng nếu đã có phòng
    if (form.phong) {
      const newForm = { ...form, ngay_hoc: dateString, thu }
      await checkPhongConflict(newForm)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Kiểm tra trùng phòng học (nếu chưa có lỗi từ real-time check)
    if (form.phong && form.thu && form.ca && form.tiet_bat_dau && form.tiet_ket_thuc && !phongError) {
      const isTrung = await checkTrungPhong(
        form.thu,
        form.ca,
        form.tiet_bat_dau,
        form.tiet_ket_thuc,
        form.phong,
        id
      )
      
      if (isTrung) {
        setPhongError(`Phòng ${form.phong} đã được sử dụng trong ${getThuLabel(form.thu)}, ca ${form.ca}, tiết ${form.tiet_bat_dau}-${form.tiet_ket_thuc}. Vui lòng chọn phòng khác.`)
        return
      }
    }
    
    // Nếu đã có lỗi phòng từ real-time check, không submit
    if (phongError) {
      return
    }

    setSaving(true)
    setMessage('')
    setError('')

    try {
      // Nếu có ngày học cụ thể → gọi API tạo bản ghi ngoại lệ
      if (form.ngay_hoc && form.ngay_hoc.trim() !== '') {
        await apiFetch('/api/lich-admin/override', {
          method: 'POST',
          body: JSON.stringify({
            lich_hoc_id: id,
            ngay_hoc: form.ngay_hoc,
            phong: form.phong,
            co_so: form.co_so,
            ghi_chu: form.ghi_chu,
          }),
        })
      } else {
        // Ngược lại → sửa mẫu lịch gốc (áp dụng mọi tuần)
        const payload = {
          thu: form.thu ? Number(form.thu) : null,
          ca: form.ca || '',
          tiet_bat_dau: form.tiet_bat_dau ? Number(form.tiet_bat_dau) : null,
          tiet_ket_thuc: form.tiet_ket_thuc ? Number(form.tiet_ket_thuc) : null,
          phong: form.phong?.trim() || null,
          co_so: form.co_so?.trim() || null,
          loai: form.loai || 'lythuyet',
          ghi_chu: form.ghi_chu || null,
        }
        await apiFetch(`/api/lich-admin/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      }

      setMessage('✅ Cập nhật lịch học thành công!')
      setTimeout(() => navigate('/admin/lich'), 1500)
    } catch (err) {
      console.error(err)
      setError('Không thể cập nhật lịch học: ' + (err.message || 'Lỗi không xác định'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>

  return (
    <AdminLayout activeMenu="lich" title="Cập nhật Lịch học">
      {message && <div className="alert alert-success text-center py-2">{message}</div>}
      {error && !error.includes('Phòng') && <div className="alert alert-danger text-center py-2">{error}</div>}
      
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
                <label className="form-label">Ngày học *</label>
              <input
                type="date"
                className="form-control"
                  value={form.ngay_hoc}
                  onChange={(e) => handleNgayHocChange(e.target.value)}
                  required
                />
                {form.ngay_hoc && form.thu && (
              <small className="text-muted">
                    Thứ: {form.thu === '2' ? 'Thứ 2' : form.thu === '3' ? 'Thứ 3' : form.thu === '4' ? 'Thứ 4' : form.thu === '5' ? 'Thứ 5' : form.thu === '6' ? 'Thứ 6' : form.thu === '7' ? 'Thứ 7' : 'Chủ nhật'}
              </small>
                )}
            </div>

              <div className="col-md-4">
                <label className="form-label">Ca *</label>
                <select
                  className="form-select"
                  value={form.ca}
                  onChange={async (e) => {
                    const value = e.target.value
                    handleChange('ca', value)
                    if (form.phong) {
                      const newForm = { ...form, ca: value }
                      await checkPhongConflict(newForm)
                    }
                  }}
                  required
                >
                  <option value="">-- Chọn ca --</option>
                  <option value="sáng">Sáng</option>
                  <option value="chiều">Chiều</option>
                  <option value="tối">Tối</option>
                </select>
            </div>

              {/* Cột 2 */}
              <div className="col-md-4">
                <label className="form-label">Phòng</label>
              <input
                type="text"
                  className={`form-control ${phongError ? 'is-invalid' : ''}`}
                  value={form.phong}
                  onChange={async (e) => {
                    const phongValue = e.target.value
                    handleChange('phong', phongValue)
                    
                    // Kiểm tra trùng phòng real-time nếu đã có đủ thông tin
                    if (phongValue && form.thu && form.ca && form.tiet_bat_dau && form.tiet_ket_thuc) {
                      const newForm = { ...form, phong: phongValue }
                      await checkPhongConflict(newForm)
                    } else {
                      setPhongError('')
                    }
                  }}
                />
                {phongError && (
                  <div className="invalid-feedback d-block">
                    {phongError}
                  </div>
                )}
            </div>

              <div className="col-md-4">
                <label className="form-label">Tiết bắt đầu *</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.tiet_bat_dau}
                  onChange={async (e) => {
                    const value = e.target.value
                    handleChange('tiet_bat_dau', value)
                    if (form.phong) {
                      const newForm = { ...form, tiet_bat_dau: value }
                      await checkPhongConflict(newForm)
                    }
                  }}
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
                  onChange={async (e) => {
                    const value = e.target.value
                    handleChange('tiet_ket_thuc', value)
                    if (form.phong) {
                      const newForm = { ...form, tiet_ket_thuc: value }
                      await checkPhongConflict(newForm)
                    }
                  }}
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
                <button type="button" className="btn btn-secondary me-2" onClick={() => navigate('/admin/lich')}>
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
