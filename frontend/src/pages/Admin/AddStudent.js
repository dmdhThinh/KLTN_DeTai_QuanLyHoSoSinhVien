import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, createSinhVien } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/Admin/StudentForm.css'
import { AlertModal } from '../../components/Modal'

const API_BASE = process.env.REACT_APP_API_BASE || ''

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
 
export default function AddStudent() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    ma_sv: '', ho_ten: '', ngay_sinh: '', gioi_tinh: 'Nam',
    cccd: '', email: '', so_dien_thoai: '', dia_chi: '', khoa_hoc: '',
    khoa_id: '', nganh_id: '', lop_id: '', anh_the: null,
    nguoiThan: {
      cha: {
        ho_ten: '', cccd: '', ngay_sinh: '', nghe_nghiep: '', so_dien_thoai: '', email: '', dia_chi: ''
      },
      me: {
        ho_ten: '', cccd: '', ngay_sinh: '', nghe_nghiep: '', so_dien_thoai: '', email: '', dia_chi: ''
      },
      nguoiGiamHo: {
        ho_ten: '', cccd: '', ngay_sinh: '', nghe_nghiep: '', so_dien_thoai: '', email: '', dia_chi: ''
      }
    }
  })

  // Loại người thân: 'cha-me' hoặc 'nguoi-giam-ho'
  const [relativeType, setRelativeType] = useState('cha-me')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [message, setMessage] = useState('')
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' })

  // dữ liệu dropdown
  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])
  const [lops, setLops] = useState([])

  // load Khoa, Ngành, Lớp (dựa theo API sẵn có trong project)
  useEffect(() => {
    ;(async () => {
      try {
        const [khoaData, nganhData, lopData] = await Promise.all([
          apiFetch('/api/khoa'),
          apiFetch('/api/nganh'),
          apiFetch('/api/lop')
        ])
        setKhoas(khoaData || [])
        setNganhs(nganhData || [])
        setLops(lopData || [])
      } catch {
        setKhoas([]); setNganhs([]); setLops([])
      }
    })()
  }, [])

  // lọc ngành theo khoa đã chọn
  const nganhsByKhoa = useMemo(() => {
    if (!form.khoa_id) return []
    return (nganhs || []).filter(n => String(n.khoaId) === String(form.khoa_id))
  }, [nganhs, form.khoa_id])

  // lọc lớp theo ngành đã chọn
  const lopsByNganh = useMemo(() => {
    if (!form.nganh_id) return []
    return (lops || []).filter(l => String(l.nganhId) === String(form.nganh_id))
  }, [lops, form.nganh_id])

  const update = (k) => (e) => {
    const v = e.target.value
    setForm((s) => {
      // Khi đổi khoa → reset ngành & lớp
      if (k === 'khoa_id') return { ...s, khoa_id: v, nganh_id: '', lop_id: '' }
      // Khi đổi ngành → reset lớp
      if (k === 'nganh_id') return { ...s, nganh_id: v, lop_id: '' }
      return { ...s, [k]: v }
    })
  }

  // Cập nhật thông tin người thân (Cha, Mẹ)
  const handleRelativeChange = (relative, field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      nguoiThan: {
        ...prevForm.nguoiThan,
        [relative]: {
          ...prevForm.nguoiThan[relative],
          [field]: value
        }
      }
    }))
  }

  // Kiểm tra dữ liệu đầu vào với validation chặt chẽ
  const validate = () => {
    // 1. Kiểm tra các trường bắt buộc của sinh viên
    if (!form.ma_sv?.trim()) return 'Vui lòng nhập Mã sinh viên.'
    if (!form.ho_ten?.trim()) return 'Vui lòng nhập Họ tên sinh viên.'
    if (!form.ngay_sinh) return 'Vui lòng nhập Ngày sinh.'
    if (!form.cccd?.trim()) return 'Vui lòng nhập CCCD/CMND.'
    if (!form.so_dien_thoai?.trim()) return 'Vui lòng nhập Số điện thoại.'
    if (!form.email?.trim()) return 'Vui lòng nhập Email.'
    if (!form.dia_chi?.trim()) return 'Vui lòng nhập Địa chỉ.'
    if (!form.khoa_id) return 'Vui lòng chọn Khoa.'
    if (!form.nganh_id) return 'Vui lòng chọn Ngành.'
    if (!form.lop_id) return 'Vui lòng chọn Lớp.'

    // 2. Kiểm tra tuổi >= 18
    const birthYear = Number(String(form.ngay_sinh).slice(0, 4))
    const currentYear = new Date().getFullYear()
    if (!birthYear || currentYear - birthYear < 18) {
      return 'Sinh viên phải đủ 18 tuổi. (Năm hiện tại - Năm sinh >= 18)'
    }

    // 3. Kiểm tra CCCD đúng 12 số
    const cccdPattern = /^\d{12}$/
    if (!cccdPattern.test(form.cccd.trim())) {
      return 'CCCD/CMND phải là 12 chữ số.'
    }

    // 4. Kiểm tra Số điện thoại đúng 10 số
    const phonePattern = /^0\d{9}$/
    if (!phonePattern.test(form.so_dien_thoai.trim())) {
      return 'Số điện thoại phải là 10 chữ số và bắt đầu bằng số 0.'
    }

    // 5. Kiểm tra Email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(form.email.trim())) {
      return 'Email không hợp lệ.'
    }

    // 6. Kiểm tra ảnh thẻ (nếu có chọn file)
    if (photoFile) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(photoFile.type)) {
        return 'Ảnh thẻ phải là file ảnh (JPG, PNG, GIF, WEBP).'
      }
      // Giới hạn 5MB
      if (photoFile.size > 5 * 1024 * 1024) {
        return 'Kích thước ảnh không được vượt quá 5MB.'
      }
    }

    // 7. Kiểm tra thông tin người thân dựa trên loại đã chọn
    const required = ['ho_ten', 'cccd', 'nghe_nghiep', 'so_dien_thoai', 'email', 'dia_chi']

    if (relativeType === 'cha-me') {
      // Kiểm tra thông tin cha và mẹ
      const labelOf = (key) => (key === 'cha' ? 'Cha' : 'Mẹ')
      
      for (const key of ['cha', 'me']) {
        for (const f of required) {
          if (!String(form.nguoiThan[key][f] || '').trim()) {
            return `Vui lòng nhập "${f.replace(/_/g, ' ')}" cho ${labelOf(key)}.`
          }
        }
        
        // Validate CCCD của cha/mẹ
        if (!cccdPattern.test(form.nguoiThan[key].cccd.trim())) {
          return `CCCD ${labelOf(key)} phải là 12 chữ số.`
        }
        
        // Validate SĐT của cha/mẹ
        if (!phonePattern.test(form.nguoiThan[key].so_dien_thoai.trim())) {
          return `Số điện thoại ${labelOf(key)} phải là 10 chữ số và bắt đầu bằng 0.`
        }
        
        // Validate Email của cha/mẹ
        if (!emailPattern.test(form.nguoiThan[key].email.trim())) {
          return `Email ${labelOf(key)} không hợp lệ.`
        }
      }
    } else {
      // Kiểm tra thông tin người giám hộ
      for (const f of required) {
        if (!String(form.nguoiThan.nguoiGiamHo[f] || '').trim()) {
          return `Vui lòng nhập "${f.replace(/_/g, ' ')}" cho Người giám hộ.`
        }
      }
      
      // Validate CCCD người giám hộ
      if (!cccdPattern.test(form.nguoiThan.nguoiGiamHo.cccd.trim())) {
        return 'CCCD Người giám hộ phải là 12 chữ số.'
      }
      
      // Validate SĐT người giám hộ
      if (!phonePattern.test(form.nguoiThan.nguoiGiamHo.so_dien_thoai.trim())) {
        return 'Số điện thoại Người giám hộ phải là 10 chữ số và bắt đầu bằng 0.'
      }
      
      // Validate Email người giám hộ
      if (!emailPattern.test(form.nguoiThan.nguoiGiamHo.email.trim())) {
        return 'Email Người giám hộ không hợp lệ.'
      }
    }

    return ''  // Không có lỗi
  }

  // Gửi dữ liệu sinh viên và người thân
const onSubmit = async (e) => {
  e.preventDefault();
  if (submitting) return;

  // 1. Validation frontend
  const msg = validate();
  if (msg) return setError(msg);

  // 2. Check duplicate với backend
  setSubmitting(true);
  setError('');
  
  try {
    // Kiểm tra trùng lặp mã SV, SĐT, Email
    const checkUrl = `${API_BASE}/api/sinhviens/check-duplicate?ma_sv=${encodeURIComponent(form.ma_sv)}&so_dien_thoai=${encodeURIComponent(form.so_dien_thoai)}&email=${encodeURIComponent(form.email)}`
    
    const checkRes = await fetch(checkUrl);
    const checkData = await checkRes.json();
    
    if (checkData.isDuplicate) {
      const errorMessages = checkData.errors.map(e => e.message).join(' ');
      setError(errorMessages);
      setSubmitting(false);
      return;
    }
  } catch (err) {
    console.error('Lỗi kiểm tra trùng lặp:', err);
    setError('Lỗi kết nối server khi kiểm tra thông tin.');
    setSubmitting(false);
    return;
  }

  // 3. Tiếp tục submit nếu không trùng
  setSubmitting(true);
  try {
    const toNull = (v) => (typeof v === 'string' ? v.trim() || null : v ?? null);

    // Tạo danh sách người thân dựa trên loại đã chọn
    let nguoi_than = [];
    
    if (relativeType === 'cha-me') {
      nguoi_than = [
        { quan_he: 'Cha',
          ho_ten: toNull(form.nguoiThan.cha.ho_ten),
          cccd: toNull(form.nguoiThan.cha.cccd),
          so_dien_thoai: toNull(form.nguoiThan.cha.so_dien_thoai),
          ngay_sinh: toNull(form.nguoiThan.cha.ngay_sinh),
          nghe_nghiep: toNull(form.nguoiThan.cha.nghe_nghiep),
          email: toNull(form.nguoiThan.cha.email),
          dia_chi: toNull(form.nguoiThan.cha.dia_chi),
        },
        { quan_he: 'Mẹ',
          ho_ten: toNull(form.nguoiThan.me.ho_ten),
          cccd: toNull(form.nguoiThan.me.cccd),
          so_dien_thoai: toNull(form.nguoiThan.me.so_dien_thoai),
          ngay_sinh: toNull(form.nguoiThan.me.ngay_sinh),
          nghe_nghiep: toNull(form.nguoiThan.me.nghe_nghiep),
          email: toNull(form.nguoiThan.me.email),
          dia_chi: toNull(form.nguoiThan.me.dia_chi),
        },
      ];
    } else {
      // Người giám hộ
      nguoi_than = [
        { quan_he: 'Người giám hộ',
          ho_ten: toNull(form.nguoiThan.nguoiGiamHo.ho_ten),
          cccd: toNull(form.nguoiThan.nguoiGiamHo.cccd),
          so_dien_thoai: toNull(form.nguoiThan.nguoiGiamHo.so_dien_thoai),
          ngay_sinh: toNull(form.nguoiThan.nguoiGiamHo.ngay_sinh),
          nghe_nghiep: toNull(form.nguoiThan.nguoiGiamHo.nghe_nghiep),
          email: toNull(form.nguoiThan.nguoiGiamHo.email),
          dia_chi: toNull(form.nguoiThan.nguoiGiamHo.dia_chi),
        },
      ];
    }

    // ✅ KHÔNG gửi File qua JSON
    const payload = {
      ...form,
      khoa_id: Number(form.khoa_id) || null,
      nganh_id: Number(form.nganh_id) || null,
      lop_id: Number(form.lop_id) || null,
      anh_the: null,
      nguoi_than,
    };
    delete payload.anh_the;

    const result = await createSinhVien(payload);
    const newStudentId = result.id;

    // Upload ảnh thẻ nếu có
    if (photoFile && newStudentId) {
      try {
        console.log('🚀 Bắt đầu upload ảnh:', {
          studentId: newStudentId,
          fileName: photoFile.name,
          fileSize: photoFile.size,
          fileType: photoFile.type
        });

        const formData = new FormData();
        formData.append('photo', photoFile);
        formData.append('ma_sv', form.ma_sv);
        
        const res = await fetch(`${API_BASE}/api/sinhviens/${newStudentId}/upload-photo`, {
          method: 'POST',
          body: formData
        });
        
        console.log('📡 Response status:', res.status);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
          console.error('❌ Upload ảnh thất bại:', errorData);
          setAlertModal({ show: true, message: `⚠️ Sinh viên đã được tạo nhưng upload ảnh thất bại: ${errorData.message || 'Lỗi không xác định'}`, type: 'warning' });
        } else {
          const data = await res.json();
          console.log('✅ Upload ảnh thành công:', data);
        }
      } catch (err) {
        console.error('❌ Lỗi upload ảnh:', err);
        setAlertModal({ show: true, message: `⚠️ Sinh viên đã được tạo nhưng upload ảnh thất bại: ${err.message}`, type: 'warning' });
      }
    } else {
      console.log('ℹ️ Không có ảnh để upload hoặc không có ID sinh viên');
    }

    navigate('/admin/students', { replace: true });
  } catch (err) {
    setError(err.message || 'Không thể tạo sinh viên');
  } finally {
    setSubmitting(false);
  }
};



  return (
    <AdminLayout activeMenu="students" title="Thêm sinh viên">
      <CenterError message={error} onClose={() => setError('')} />
      <div className="d-flex justify-content-center">
        <div className="card shadow-sm w-100" style={{ maxWidth: 1370 }}>
          <div className="card shadow-sm">
            <div className="card-body form-scroll ">
              <h5 className="mb-3 section-title">Thông tin sinh viên</h5>
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

                {/* Thông tin liên hệ sinh viên */}
                <h5 className="mt-3">Thông tin liên hệ</h5>
                <div className="col-md-6">
                  <label className="form-label">CCCD/CMND</label>
                  <input className="form-control" value={form.cccd} onChange={update('cccd')} placeholder="Số CCCD/CMND" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Số điện thoại</label>
                  <input className="form-control" value={form.so_dien_thoai} onChange={update('so_dien_thoai')} placeholder="Số điện thoại sinh viên" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={update('email')} placeholder="Email sinh viên" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Địa chỉ</label>
                  <input className="form-control" value={form.dia_chi} onChange={update('dia_chi')} placeholder="Địa chỉ sinh viên" />
                </div>

                <div className="col-md-12">
                  <label className="form-label">Ảnh thẻ</label>
                  <div className="d-flex align-items-start gap-3">
                    <div className="flex-grow-1">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setPhotoFile(file);
                            // Tạo preview
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPhotoPreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {photoFile && (
                        <small className="text-muted mt-1 d-block">
                          Đã chọn: <strong>{photoFile.name}</strong>
                        </small>
                      )}
                    </div>
                    {photoPreview && (
                      <div className="text-center">
                        <img 
                          src={photoPreview} 
                          alt="Preview ảnh thẻ" 
                          className="img-thumbnail"
                          style={{ maxWidth: '150px', maxHeight: '180px', objectFit: 'cover' }}
                        />
                        <div className="small text-muted mt-1">Preview</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cascading: Khoa → Ngành → Lớp */}
                <h5 className="mt-3">Thông tin học vấn</h5>
                <div className="col-md-4">
                  <label className="form-label">Khoa *</label>
                  <select className="form-select" value={form.khoa_id} onChange={update('khoa_id')}>
                    <option value="">-- Chọn Khoa --</option>
                    {khoas.map(k => (<option key={k.id} value={k.id}>{k.tenKhoa}</option>))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Ngành *</label>
                  <select className="form-select" value={form.nganh_id} onChange={update('nganh_id')} disabled={!nganhsByKhoa.length}>
                    <option value="">{nganhsByKhoa.length ? '-- Chọn Ngành --' : '— Chưa có ngành —'}</option>
                    {nganhsByKhoa.map(n => (<option key={n.id} value={n.id}>{n.tenNganh}</option>))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Lớp *</label>
                  <select className="form-select" value={form.lop_id} onChange={update('lop_id')} disabled={!lopsByNganh.length}>
                    <option value="">{lopsByNganh.length ? '-- Chọn Lớp --' : '— Chưa có lớp —'}</option>
                    {lopsByNganh.map(l => (<option key={l.id} value={l.id}>{l.tenLop}</option>))}
                  </select>
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
                  <input
                    className="form-control"
                    value={form.nguoiThan.cha.ho_ten}
                    onChange={(e) => handleRelativeChange('cha', 'ho_ten', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">CCCD Cha *</label>
                  <input
                    className="form-control"
                    value={form.nguoiThan.cha.cccd}
                    onChange={(e) => handleRelativeChange('cha', 'cccd', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Nghề nghiệp Cha *</label>
                  <input
                    className="form-control"
                    value={form.nguoiThan.cha.nghe_nghiep}
                    onChange={(e) => handleRelativeChange('cha', 'nghe_nghiep', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ngày sinh Cha *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.nguoiThan.cha.ngay_sinh}
                    onChange={(e) => handleRelativeChange('cha', 'ngay_sinh', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Số điện thoại Cha *</label>
                  <input
                    className="form-control"
                    value={form.nguoiThan.cha.so_dien_thoai}
                    onChange={(e) => handleRelativeChange('cha', 'so_dien_thoai', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email Cha *</label>
                  <input
                    className="form-control"
                    value={form.nguoiThan.cha.email}
                    onChange={(e) => handleRelativeChange('cha', 'email', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Địa chỉ Cha *</label>
                  <input
                    className="form-control"
                    value={form.nguoiThan.cha.dia_chi}
                    onChange={(e) => handleRelativeChange('cha', 'dia_chi', e.target.value)}
                  />
                </div>

                {/* Thông tin mẹ */}
                <h5 className="mt-4">Thông tin Mẹ</h5>
                <div className="col-md-6">
                  <label className="form-label">Họ tên Mẹ *</label>
                  <input
                    className="form-control"
                    value={form.nguoiThan.me.ho_ten}
                    onChange={(e) => handleRelativeChange('me', 'ho_ten', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">CCCD Mẹ *</label>
                  <input
                    className="form-control"
                    value={form.nguoiThan.me.cccd}
                    onChange={(e) => handleRelativeChange('me', 'cccd', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Nghề nghiệp Mẹ *</label>
                  <input
                    className="form-control"
                    value={form.nguoiThan.me.nghe_nghiep}
                    onChange={(e) => handleRelativeChange('me', 'nghe_nghiep', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ngày sinh Mẹ *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.nguoiThan.me.ngay_sinh}
                    onChange={(e) => handleRelativeChange('me', 'ngay_sinh', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Số điện thoại Mẹ *</label>
                  <input
                    className="form-control"
                    value={form.nguoiThan.me.so_dien_thoai}
                    onChange={(e) => handleRelativeChange('me', 'so_dien_thoai', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email Mẹ *</label>
                  <input
                    className="form-control"
                    value={form.nguoiThan.me.email}
                    onChange={(e) => handleRelativeChange('me', 'email', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Địa chỉ Mẹ *</label>
                  <input
                    className="form-control"
                    value={form.nguoiThan.me.dia_chi}
                    onChange={(e) => handleRelativeChange('me', 'dia_chi', e.target.value)}
                  />
                </div>
                  </>
                )}

                {/* Thông tin người giám hộ - chỉ hiện khi chọn nguoi-giam-ho */}
                {relativeType === 'nguoi-giam-ho' && (
                  <>
                    <h5 className="mt-4">Thông tin Người giám hộ</h5>
                    <div className="col-md-6">
                      <label className="form-label">Họ tên Người giám hộ *</label>
                      <input
                        className="form-control"
                        value={form.nguoiThan.nguoiGiamHo.ho_ten}
                        onChange={(e) => handleRelativeChange('nguoiGiamHo', 'ho_ten', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">CCCD Người giám hộ *</label>
                      <input
                        className="form-control"
                        value={form.nguoiThan.nguoiGiamHo.cccd}
                        onChange={(e) => handleRelativeChange('nguoiGiamHo', 'cccd', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nghề nghiệp *</label>
                      <input
                        className="form-control"
                        value={form.nguoiThan.nguoiGiamHo.nghe_nghiep}
                        onChange={(e) => handleRelativeChange('nguoiGiamHo', 'nghe_nghiep', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Ngày sinh *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.nguoiThan.nguoiGiamHo.ngay_sinh}
                        onChange={(e) => handleRelativeChange('nguoiGiamHo', 'ngay_sinh', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Số điện thoại *</label>
                      <input
                        className="form-control"
                        value={form.nguoiThan.nguoiGiamHo.so_dien_thoai}
                        onChange={(e) => handleRelativeChange('nguoiGiamHo', 'so_dien_thoai', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email *</label>
                      <input
                        className="form-control"
                        value={form.nguoiThan.nguoiGiamHo.email}
                        onChange={(e) => handleRelativeChange('nguoiGiamHo', 'email', e.target.value)}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Địa chỉ *</label>
                      <input
                        className="form-control"
                        value={form.nguoiThan.nguoiGiamHo.dia_chi}
                        onChange={(e) => handleRelativeChange('nguoiGiamHo', 'dia_chi', e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="col-12 d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Đang lưu...' : 'Lưu sinh viên'}
                  </button>
                </div>
              </form>
            </div>
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
