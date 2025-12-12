// src/pages/Admin/EditStudent.js
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch, getSinhVienById } from '../../api'
import '../../styles/Admin/StudentForm.css'
import { AlertModal } from '../../components/Modal'

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

export default function EditStudent() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState(null)
  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])
  const [lops, setLops] = useState([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [relativeType, setRelativeType] = useState('cha-me') // Loại người thân
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' })

  // dropdown
  useEffect(() => {
    (async () => {
      try {
        const [khoaData, nganhData, lopData] = await Promise.all([
          apiFetch('/api/khoa'),
          apiFetch('/api/nganh'),
          apiFetch('/api/lop')
        ])
        setKhoas(khoaData || [])
        setNganhs(nganhData || [])
        setLops(lopData || [])
      } catch (err) {
        console.error('Lỗi tải dropdown:', err)
      }
    })()
  }, [])

  // load SV + nguoiThan
  useEffect(() => {
    (async () => {
      try {
        const data = await getSinhVienById(id)
        
        // Detect loại người thân từ data
        let detectedType = 'cha-me'
        if (data.nguoiThan) {
          // Nếu có thông tin người giám hộ và không có cha/mẹ → người giám hộ
          if (data.nguoiThan.nguoiGiamHo?.ho_ten && 
              !data.nguoiThan.cha?.ho_ten && 
              !data.nguoiThan.me?.ho_ten) {
            detectedType = 'nguoi-giam-ho'
          }
        }
        setRelativeType(detectedType)
        
        setForm({
          ma_sv: data.maSv,
          ho_ten: data.hoTen,
          ngay_sinh: data.ngaySinh,
          gioi_tinh: data.gioiTinh || 'Nam',
          cccd: data.cccd || '',
          email: data.email || '',
          so_dien_thoai: data.soDienThoai || '',
          dia_chi: data.diaChi || '',
          khoa_hoc: data.khoaHoc || '',
          lop_id: data.lopId || '',
          khoa_id: data.khoaId || '',
          nganh_id: data.nganhId || '',
          anh_the: data.anhThe || '',
          nguoiThan: data.nguoiThan || {
            cha: { ho_ten:'', cccd:'', ngay_sinh:'', nghe_nghiep:'', so_dien_thoai:'', email:'', dia_chi:'' },
            me:  { ho_ten:'', cccd:'', ngay_sinh:'', nghe_nghiep:'', so_dien_thoai:'', email:'', dia_chi:'' },
            nguoiGiamHo: { ho_ten:'', cccd:'', ngay_sinh:'', nghe_nghiep:'', so_dien_thoai:'', email:'', dia_chi:'' }
          }
        })
      } catch (err) {
        console.error(err)
        setError('Không thể tải dữ liệu sinh viên.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const update = (k) => (e) => {
    const v = e.target.value
    setForm((s) => {
      if (k === 'khoa_id') return { ...s, khoa_id: v, nganh_id: '', lop_id: '' }
      if (k === 'nganh_id') return { ...s, nganh_id: v, lop_id: '' }
      return { ...s, [k]: v }
    })
  }

  const handleRelativeChange = (who, field, value) => {
    setForm((s) => ({
      ...s,
      nguoiThan: {
        ...s.nguoiThan,
        [who]: {
          ...s.nguoiThan[who],
          [field]: value
        }
      }
    }))
  }

  const nganhsByKhoa = useMemo(() => {
    if (!form?.khoa_id) return nganhs
    return nganhs.filter(n => String(n.khoaId) === String(form.khoa_id))
  }, [form?.khoa_id, nganhs])

  const lopsByNganh = useMemo(() => {
    if (!form?.nganh_id) return []
    return lops.filter(l => String(l.nganhId) === String(form.nganh_id))
  }, [form?.nganh_id, lops])

  const toNull = (v) => (typeof v === 'string' ? v.trim() || null : v ?? null)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      // Upload ảnh mới nếu có chọn
      if (photoFile) {
        console.log('🚀 Bắt đầu upload ảnh:', {
          studentId: id,
          fileName: photoFile.name,
          fileSize: photoFile.size,
          fileType: photoFile.type
        })

        const formData = new FormData()
        formData.append('photo', photoFile)
        formData.append('ma_sv', form.ma_sv)
        
        const API_BASE = process.env.REACT_APP_API_BASE || ''
        const res = await fetch(`${API_BASE}/api/sinhviens/${id}/upload-photo`, {
          method: 'POST',
          body: formData
        })
        
        console.log('📡 Response status:', res.status)
        
        if (res.ok) {
          const data = await res.json()
          console.log('✅ Upload ảnh thành công:', data)
          // Cập nhật URL ảnh mới vào form để lưu vào DB
          form.anh_the = data.url
        } else {
          const errorData = await res.json().catch(() => ({ message: 'Unknown error' }))
          console.error('❌ Upload ảnh thất bại:', errorData)
          setAlertModal({ show: true, message: `Upload ảnh thất bại: ${errorData.message}. Thông tin sinh viên vẫn sẽ được lưu.`, type: 'warning' })
        }
      }

      // Tạo danh sách người thân dựa trên loại đã chọn
      let nguoi_than = []
      
      if (relativeType === 'cha-me') {
        nguoi_than = [
          {
            quan_he: 'Cha',
            ho_ten: toNull(form.nguoiThan.cha.ho_ten),
            cccd: toNull(form.nguoiThan.cha.cccd),
            so_dien_thoai: toNull(form.nguoiThan.cha.so_dien_thoai),
            ngay_sinh: toNull(form.nguoiThan.cha.ngay_sinh),
            nghe_nghiep: toNull(form.nguoiThan.cha.nghe_nghiep),
            email: toNull(form.nguoiThan.cha.email),
            dia_chi: toNull(form.nguoiThan.cha.dia_chi),
          },
          {
            quan_he: 'Mẹ',
            ho_ten: toNull(form.nguoiThan.me.ho_ten),
            cccd: toNull(form.nguoiThan.me.cccd),
            so_dien_thoai: toNull(form.nguoiThan.me.so_dien_thoai),
            ngay_sinh: toNull(form.nguoiThan.me.ngay_sinh),
            nghe_nghiep: toNull(form.nguoiThan.me.nghe_nghiep),
            email: toNull(form.nguoiThan.me.email),
            dia_chi: toNull(form.nguoiThan.me.dia_chi),
          },
        ]
      } else {
        // Người giám hộ
        nguoi_than = [
          {
            quan_he: 'Người giám hộ',
            ho_ten: toNull(form.nguoiThan.nguoiGiamHo.ho_ten),
            cccd: toNull(form.nguoiThan.nguoiGiamHo.cccd),
            so_dien_thoai: toNull(form.nguoiThan.nguoiGiamHo.so_dien_thoai),
            ngay_sinh: toNull(form.nguoiThan.nguoiGiamHo.ngay_sinh),
            nghe_nghiep: toNull(form.nguoiThan.nguoiGiamHo.nghe_nghiep),
            email: toNull(form.nguoiThan.nguoiGiamHo.email),
            dia_chi: toNull(form.nguoiThan.nguoiGiamHo.dia_chi),
          },
        ]
      }

      await apiFetch(`/api/sinhviens/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          lop_id: Number(form.lop_id),
          nguoi_than
        })
      })

      setMessage('✅ Cập nhật sinh viên + người thân' + (photoFile ? ' + ảnh thẻ' : '') + ' thành công!')
      setTimeout(() => navigate('/admin/students', { replace: true }), 1200)
    } catch (err) {
      setError(err.message || 'Không thể cập nhật sinh viên')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !form) {
    return (
      <AdminLayout title="Đang tải..." activeMenu="students">
        <div className="text-center mt-5">Đang tải dữ liệu...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeMenu="students" title="Chỉnh sửa sinh viên">
      <CenterError message={error} onClose={() => setError('')} />
      {message && <div className="alert alert-success text-center py-2">{message}</div>}

      <div className="d-flex justify-content-center">
        <div className="card shadow-sm w-100" style={{ maxWidth: 1370 }}>
          <div className="card-body form-scroll">
            <h5 className="mb-3">Thông tin sinh viên</h5>
            <form className="row g-3" onSubmit={onSubmit}>
              <div className="col-md-4">
                <label className="form-label">Mã sinh viên *</label>
                <input className="form-control" value={form.ma_sv} onChange={update('ma_sv')} />
              </div>
              <div className="col-md-8">
                <label className="form-label">Họ tên *</label>
                <input className="form-control" value={form.ho_ten} onChange={update('ho_ten')} />
              </div>

              <div className="col-md-4">
                <label className="form-label">Ngày sinh *</label>
                <input type="date" className="form-control" value={form.ngay_sinh} onChange={update('ngay_sinh')} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Giới tính</label>
                <select className="form-select" value={form.gioi_tinh} onChange={update('gioi_tinh')}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Khóa học</label>
                <input className="form-control" value={form.khoa_hoc} onChange={update('khoa_hoc')} placeholder="VD: K47" />
              </div>

              {/* Cascading */}
              <div className="col-md-4">
                <label className="form-label">Khoa *</label>
                <select className="form-select" value={form.khoa_id} onChange={update('khoa_id')}>
                  <option value="">-- Chọn Khoa --</option>
                  {khoas.map(k => (<option key={k.id} value={k.id}>{k.tenKhoa}</option>))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Ngành *</label>
                <select className="form-select" value={form.nganh_id} onChange={update('nganh_id')}
                        disabled={!nganhsByKhoa.length}>
                  <option value="">{nganhsByKhoa.length ? '-- Chọn Ngành --' : '— Chưa có ngành —'}</option>
                  {nganhsByKhoa.map(n => (<option key={n.id} value={n.id}>{n.tenNganh}</option>))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Lớp *</label>
                <select className="form-select" value={form.lop_id} onChange={update('lop_id')}
                        disabled={!lopsByNganh.length}>
                  <option value="">{lopsByNganh.length ? '-- Chọn Lớp --' : '— Chưa có lớp —'}</option>
                  {lopsByNganh.map(l => (<option key={l.id} value={l.id}>{l.tenLop}</option>))}
                </select>
              </div>

              {/* Ảnh thẻ */}
              <div className="col-md-12">
                <label className="form-label">Ảnh thẻ</label>
                <div className="d-flex align-items-start gap-3">
                  <div className="flex-grow-1">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) setPhotoFile(file)
                      }}
                    />
                    {photoFile && (
                      <small className="text-success mt-1 d-block">
                        ✅ Đã chọn ảnh mới: <strong>{photoFile.name}</strong>
                        <br />
                        <span className="text-muted">Ảnh sẽ được upload khi bấm "Lưu thay đổi"</span>
                      </small>
                    )}
                  </div>
                  
                  {/* Hiển thị ảnh hiện tại hoặc preview ảnh mới */}
                  {(form.anh_the || photoFile) && (
                    <div className="text-center">
                      {photoFile ? (
                        // Preview ảnh mới
                        <>
                          <img 
                            src={URL.createObjectURL(photoFile)}
                            alt="Preview ảnh mới" 
                            className="img-thumbnail"
                            style={{ maxWidth: '150px', maxHeight: '180px', objectFit: 'cover' }}
                          />
                          <div className="small text-success fw-semibold mt-1">Preview ảnh mới</div>
                        </>
                      ) : (
                        // Ảnh hiện tại
                        <>
                          <img 
                            src={form.anh_the} 
                            alt="Ảnh thẻ hiện tại" 
                            className="img-thumbnail"
                            style={{ maxWidth: '150px', maxHeight: '180px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://via.placeholder.com/150x180?text=No+Image'
                            }}
                          />
                          <div className="small text-muted mt-1">Ảnh hiện tại</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <h5 className="mt-3">Thông tin liên hệ</h5>
              <div className="col-md-6">
                <label className="form-label">CCCD/CMND</label>
                <input className="form-control" value={form.cccd} onChange={update('cccd')} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Số điện thoại</label>
                <input className="form-control" value={form.so_dien_thoai} onChange={update('so_dien_thoai')} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input className="form-control" value={form.email} onChange={update('email')} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Địa chỉ</label>
                <input className="form-control" value={form.dia_chi} onChange={update('dia_chi')} />
              </div>

              {/* Chọn loại người thân */}
              <h5 className="mt-4">Thông tin Người thân</h5>
              <div className="col-md-12">
                <label className="form-label fw-semibold">Loại người thân *</label>
                <div className="d-flex gap-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="relativeType"
                      id="relativeTypeChaMe"
                      value="cha-me"
                      checked={relativeType === 'cha-me'}
                      onChange={(e) => setRelativeType(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="relativeTypeChaMe">
                      Cha và Mẹ
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="relativeType"
                      id="relativeTypeNguoiGiamHo"
                      value="nguoi-giam-ho"
                      checked={relativeType === 'nguoi-giam-ho'}
                      onChange={(e) => setRelativeType(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="relativeTypeNguoiGiamHo">
                      Người giám hộ
                    </label>
                  </div>
                </div>
              </div>

              {/* Thông tin cha - chỉ hiện khi chọn cha-me */}
              {relativeType === 'cha-me' && (
                <>
                  <h5 className="mt-4">Thông tin Cha</h5>
              <div className="col-md-6">
                <label className="form-label">Họ tên Cha *</label>
                <input className="form-control"
                       value={form.nguoiThan.cha.ho_ten}
                       onChange={(e)=>handleRelativeChange('cha','ho_ten',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">CCCD Cha *</label>
                <input className="form-control"
                       value={form.nguoiThan.cha.cccd}
                       onChange={(e)=>handleRelativeChange('cha','cccd',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Nghề nghiệp Cha *</label>
                <input className="form-control"
                       value={form.nguoiThan.cha.nghe_nghiep}
                       onChange={(e)=>handleRelativeChange('cha','nghe_nghiep',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ngày sinh Cha *</label>
                <input type="date" className="form-control"
                       value={form.nguoiThan.cha.ngay_sinh}
                       onChange={(e)=>handleRelativeChange('cha','ngay_sinh',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Số điện thoại Cha *</label>
                <input className="form-control"
                       value={form.nguoiThan.cha.so_dien_thoai}
                       onChange={(e)=>handleRelativeChange('cha','so_dien_thoai',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email Cha *</label>
                <input className="form-control"
                       value={form.nguoiThan.cha.email}
                       onChange={(e)=>handleRelativeChange('cha','email',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Địa chỉ Cha *</label>
                <input className="form-control"
                       value={form.nguoiThan.cha.dia_chi}
                       onChange={(e)=>handleRelativeChange('cha','dia_chi',e.target.value)} />
              </div>

              {/* ====== Thông tin Mẹ ====== */}
              <h5 className="mt-4">Thông tin Mẹ</h5>
              <div className="col-md-6">
                <label className="form-label">Họ tên Mẹ *</label>
                <input className="form-control"
                       value={form.nguoiThan.me.ho_ten}
                       onChange={(e)=>handleRelativeChange('me','ho_ten',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">CCCD Mẹ *</label>
                <input className="form-control"
                       value={form.nguoiThan.me.cccd}
                       onChange={(e)=>handleRelativeChange('me','cccd',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Nghề nghiệp Mẹ *</label>
                <input className="form-control"
                       value={form.nguoiThan.me.nghe_nghiep}
                       onChange={(e)=>handleRelativeChange('me','nghe_nghiep',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ngày sinh Mẹ *</label>
                <input type="date" className="form-control"
                       value={form.nguoiThan.me.ngay_sinh}
                       onChange={(e)=>handleRelativeChange('me','ngay_sinh',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Số điện thoại Mẹ *</label>
                <input className="form-control"
                       value={form.nguoiThan.me.so_dien_thoai}
                       onChange={(e)=>handleRelativeChange('me','so_dien_thoai',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email Mẹ *</label>
                <input className="form-control"
                       value={form.nguoiThan.me.email}
                       onChange={(e)=>handleRelativeChange('me','email',e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Địa chỉ Mẹ *</label>
                <input className="form-control"
                       value={form.nguoiThan.me.dia_chi}
                       onChange={(e)=>handleRelativeChange('me','dia_chi',e.target.value)} />
              </div>
                </>
              )}

              {/* Thông tin người giám hộ - chỉ hiện khi chọn nguoi-giam-ho */}
              {relativeType === 'nguoi-giam-ho' && (
                <>
                  <h5 className="mt-4">Thông tin Người giám hộ</h5>
                  <div className="col-md-6">
                    <label className="form-label">Họ tên Người giám hộ *</label>
                    <input className="form-control"
                           value={form.nguoiThan.nguoiGiamHo.ho_ten}
                           onChange={(e)=>handleRelativeChange('nguoiGiamHo','ho_ten',e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">CCCD Người giám hộ *</label>
                    <input className="form-control"
                           value={form.nguoiThan.nguoiGiamHo.cccd}
                           onChange={(e)=>handleRelativeChange('nguoiGiamHo','cccd',e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Nghề nghiệp *</label>
                    <input className="form-control"
                           value={form.nguoiThan.nguoiGiamHo.nghe_nghiep}
                           onChange={(e)=>handleRelativeChange('nguoiGiamHo','nghe_nghiep',e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Ngày sinh *</label>
                    <input type="date" className="form-control"
                           value={form.nguoiThan.nguoiGiamHo.ngay_sinh}
                           onChange={(e)=>handleRelativeChange('nguoiGiamHo','ngay_sinh',e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Số điện thoại *</label>
                    <input className="form-control"
                           value={form.nguoiThan.nguoiGiamHo.so_dien_thoai}
                           onChange={(e)=>handleRelativeChange('nguoiGiamHo','so_dien_thoai',e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input className="form-control"
                           value={form.nguoiThan.nguoiGiamHo.email}
                           onChange={(e)=>handleRelativeChange('nguoiGiamHo','email',e.target.value)} />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Địa chỉ *</label>
                    <input className="form-control"
                           value={form.nguoiThan.nguoiGiamHo.dia_chi}
                           onChange={(e)=>handleRelativeChange('nguoiGiamHo','dia_chi',e.target.value)} />
                  </div>
                </>
              )}

              <div className="col-12 d-flex justify-content-end">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AlertModal
        show={alertModal.show}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ show: false, message: '', type: 'info' })}
      />
    </AdminLayout>
  )
}
