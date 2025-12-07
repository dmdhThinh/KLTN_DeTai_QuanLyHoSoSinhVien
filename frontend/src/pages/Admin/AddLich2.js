import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'


export default function AddLich2() {
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

  const [lopHocPhans, setLopHocPhans] = useState([])
  const [searchText, setSearchText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const lhpData = await apiFetch('/api/lophocphan')
      setLopHocPhans(lhpData || [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải dữ liệu.')
    } finally {
      setLoading(false)
    }
  }

  // Filter lớp học phần theo text search
  const filteredSuggestions = searchText
    ? lopHocPhans.filter(lhp => {
        const maLopHocPhan = (lhp.maLopHocPhan || lhp.ma_lop_hoc_phan || '').toLowerCase()
        const tenHocPhan = (lhp.tenHocPhan || lhp.ten_hoc_phan || '').toLowerCase()
        const search = searchText.toLowerCase()
        return maLopHocPhan.includes(search) || tenHocPhan.includes(search)
      }).slice(0, 10) // Giới hạn 10 kết quả
    : []

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSearchChange = (value) => {
    setSearchText(value)
    setShowSuggestions(true)
    if (!value) {
      handleChange('lop_hoc_phan_id', '')
      setError('')
    } else {
      // Kiểm tra xem có khớp với lớp học phần nào không
      const matched = lopHocPhans.find(lhp => {
        const maLopHocPhan = (lhp.maLopHocPhan || lhp.ma_lop_hoc_phan || '').toLowerCase()
        const tenHocPhan = (lhp.tenHocPhan || lhp.ten_hoc_phan || '').toLowerCase()
        const search = value.toLowerCase()
        return maLopHocPhan === search || `${maLopHocPhan} - ${tenHocPhan}` === search
      })
      
      if (!matched) {
        // Nếu không khớp chính xác, xóa selection
        handleChange('lop_hoc_phan_id', '')
      }
    }
  }

  const handleSelectSuggestion = (lhp) => {
    setSearchText(`${lhp.maLopHocPhan || lhp.ma_lop_hoc_phan} - ${lhp.tenHocPhan || lhp.ten_hoc_phan}`)
    handleChange('lop_hoc_phan_id', lhp.id)
    setShowSuggestions(false)
    setError('')
  }

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false)
      // Chỉ kiểm tra validation khi blur nếu có text và chưa chọn
      if (searchText && !form.lop_hoc_phan_id) {
        const matched = lopHocPhans.find(lhp => {
          const maLopHocPhan = (lhp.maLopHocPhan || lhp.ma_lop_hoc_phan || '').toLowerCase()
          const tenHocPhan = (lhp.tenHocPhan || lhp.ten_hoc_phan || '').toLowerCase()
          const search = searchText.toLowerCase()
          return maLopHocPhan === search || `${maLopHocPhan} - ${tenHocPhan}` === search
        })
        
        if (!matched) {
          setError('Mã lớp học phần không tồn tại. Vui lòng chọn từ danh sách gợi ý.')
        } else {
          setError('')
        }
      } else if (!searchText) {
        setError('')
      }
    }, 200)
  }

  const checkTrungPhong = async (thu, ca, tietBatDau, tietKetThuc, phong) => {
    if (!thu || !ca || !tietBatDau || !tietKetThuc || !phong) {
      return false
    }

    try {
      // Lấy tất cả lịch học để kiểm tra trùng
      const allLich = await apiFetch('/api/lich-admin')
      
      // Kiểm tra trùng phòng trong cùng thứ, ca, và tiết học
      const trung = allLich.some(lh => {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Kiểm tra validation
    if (!searchText || !form.lop_hoc_phan_id) {
      // Nếu chưa chọn lớp học phần, kiểm tra xem có khớp không
      if (searchText && !form.lop_hoc_phan_id) {
        const matched = lopHocPhans.find(lhp => {
          const maLopHocPhan = (lhp.maLopHocPhan || lhp.ma_lop_hoc_phan || '').toLowerCase()
          const tenHocPhan = (lhp.tenHocPhan || lhp.ten_hoc_phan || '').toLowerCase()
          const search = searchText.toLowerCase()
          return maLopHocPhan === search || `${maLopHocPhan} - ${tenHocPhan}` === search
        })
        
        if (matched) {
          // Nếu khớp nhưng chưa có ID, set lại
          handleSelectSuggestion(matched)
          // Đợi một chút để state cập nhật
          await new Promise(resolve => setTimeout(resolve, 100))
        } else {
          // Không khớp, để validation dưới input xử lý
          return
        }
      } else {
        return
      }
    }
    
    // Kiểm tra trùng phòng học
    if (form.phong && form.thu && form.ca && form.tiet_bat_dau && form.tiet_ket_thuc) {
      const isTrung = await checkTrungPhong(
        form.thu,
        form.ca,
        form.tiet_bat_dau,
        form.tiet_ket_thuc,
        form.phong
      )
      
      if (isTrung) {
        setMessage('')
        setError(`Phòng ${form.phong} đã được sử dụng trong ${getThuLabel(form.thu)}, ca ${form.ca}, tiết ${form.tiet_bat_dau}-${form.tiet_ket_thuc}. Vui lòng chọn phòng khác.`)
        return
      }
    }
    
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const payload = {
        ...form,
        lop_hoc_phan_id: Number(form.lop_hoc_phan_id),
        thu: form.thu ? Number(form.thu) : null,
        tiet_bat_dau: form.tiet_bat_dau ? Number(form.tiet_bat_dau) : null,
        tiet_ket_thuc: form.tiet_ket_thuc ? Number(form.tiet_ket_thuc) : null
      }

      await apiFetch('/api/lich-admin', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      setMessage('✅ Thêm lịch học thành công!')
      setTimeout(() => navigate('/admin/quan-ly-lich-hoc'), 1500)
    } catch (err) {
      console.error(err)
      setError('Không thể thêm lịch học: ' + (err.message || 'Lỗi không xác định'))
    } finally {
      setSaving(false)
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

  if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>

  return (
    <AdminLayout activeMenu="quan-ly-lich-hoc" title="Thêm Lịch học">
      {message && <div className="alert alert-success text-center py-2">{message}</div>}
      
      <div className="d-flex justify-content-center">
        <div className="card shadow-sm w-100" style={{ maxWidth: 1370 }}>
          <div className="card-body">
            
            <form onSubmit={handleSubmit} className="row g-3">

              {/* Row 1 */}
              <div className="col-md-4" style={{ position: 'relative' }}>
                <label className="form-label">Mã lớp học phần *</label>
                <input
                  type="text"
                  className={`form-control ${error && searchText && !form.lop_hoc_phan_id ? 'is-invalid' : ''}`}
                  value={searchText}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    setShowSuggestions(true)
                    setError('')
                  }}
                  onBlur={handleSearchBlur}
                  placeholder="Gõ mã hoặc tên lớp học phần..."
                  required
                />
                {searchText && !form.lop_hoc_phan_id && (
                  <div className="invalid-feedback d-block">
                    Mã lớp học phần không tồn tại. Vui lòng chọn từ danh sách gợi ý.
                  </div>
                )}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div
                    className="list-group"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      maxHeight: '300px',
                      overflowY: 'auto',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      backgroundColor: 'white',
                      boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    {filteredSuggestions.map(lhp => (
                      <button
                        key={lhp.id}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => handleSelectSuggestion(lhp)}
                        style={{ textAlign: 'left', cursor: 'pointer' }}
                      >
                        <div className="fw-semibold">{lhp.maLopHocPhan || lhp.ma_lop_hoc_phan}</div>
                        <div className="small text-muted">{lhp.tenHocPhan || lhp.ten_hoc_phan}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 2 */}
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

              {/* Row 3 */}
              <div className="col-md-4">
                <label className="form-label">Phòng</label>
                <input
                  type="text"
                  className={`form-control ${error && error.includes('Phòng') ? 'is-invalid' : ''}`}
                  value={form.phong}
                  onChange={(e) => {
                    handleChange('phong', e.target.value)
                    if (error && error.includes('Phòng')) {
                      setError('')
                    }
                  }}
                />
                {error && error.includes('Phòng') && (
                  <div className="invalid-feedback d-block">
                    {error}
                  </div>
                )}
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

              {/* Row 4 */}
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

