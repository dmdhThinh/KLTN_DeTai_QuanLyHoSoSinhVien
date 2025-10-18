// src/pages/Admin/AddStudent.js
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, createSinhVien } from '../../api'
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

export default function AddStudent() {
  const navigate = useNavigate()
  // const [form, setForm] = useState({
  //   ma_sv: '', ho_ten: '', ngay_sinh: '', gioi_tinh: 'Nam',
  //   email: '', so_dien_thoai: '', dia_chi: '', khoa_hoc: '',
  //   khoa_id: '', nganh_id: '', lop_id: ''
  // })
  const [form, setForm] = useState({
  ma_sv: '', ho_ten: '', ngay_sinh: '', gioi_tinh: 'Nam',
  email: '', so_dien_thoai: '', dia_chi: '', khoa_hoc: '',
  khoa_id: '', nganh_id: '', lop_id: '', anh_the: null
})

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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
    if (!form.khoa_id) return nganhs
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
      // khi đổi khoa → reset ngành & lớp
      if (k === 'khoa_id') return { ...s, khoa_id: v, nganh_id: '', lop_id: '' }
      // khi đổi ngành → reset lớp
      if (k === 'nganh_id') return { ...s, nganh_id: v, lop_id: '' }
      return { ...s, [k]: v }
    })
  }

  const validate = () => {
    if (!form.ma_sv || !form.ho_ten || !form.ngay_sinh)
      return 'Vui lòng nhập đầy đủ: Mã sinh viên, Họ tên, Ngày sinh.'
    const birthYear = Number(String(form.ngay_sinh).slice(0, 4))
    const currentYear = new Date().getFullYear()
    if (!birthYear || currentYear - birthYear <= 18)
      return 'Tuổi phải lớn hơn 18 (tính theo năm).'
    if (!form.khoa_id) return 'Vui lòng chọn Khoa.'
    if (!form.nganh_id) return 'Vui lòng chọn Ngành.'
    if (!form.lop_id) return 'Vui lòng chọn Lớp.'
    return ''
  }

  // const onSubmit = async (e) => {
  //   e.preventDefault()
  //   if (submitting) return
  //   const msg = validate()
  //   if (msg) return setError(msg)
  //   setSubmitting(true)
  //   try {
  //     // chỉ cần lop_id để liên kết; khoa/nganh dùng để lọc ở client
  //     await createSinhVien({
  //       ma_sv: form.ma_sv,
  //       ho_ten: form.ho_ten,
  //       ngay_sinh: form.ngay_sinh,
  //       gioi_tinh: form.gioi_tinh,
  //       email: form.email,
  //       so_dien_thoai: form.so_dien_thoai,
  //       dia_chi: form.dia_chi,
  //       khoa_hoc: form.khoa_hoc,
  //       lop_id: Number(form.lop_id)
  //     })
  //     navigate('/admin/students', { replace: true })
  //   } catch (err) {
  //     setError(err.message || 'Không thể tạo sinh viên')
  //   } finally {
  //     setSubmitting(false)
  //   }
  // }

// const onSubmit = async (e) => {
//   e.preventDefault()
//   if (submitting) return
//   const msg = validate()
//   if (msg) return setError(msg)
//   setSubmitting(true)
//   try {
//     const fd = new FormData()
//     Object.entries(form).forEach(([k, v]) => {
//       if (v !== null && v !== '') fd.append(k, v)
//     })
//     await fetch('/api/sinhviens', { method: 'POST', body: fd })
//     navigate('/admin/students', { replace: true })
//   } catch (err) {
//     setError('Không thể tạo sinh viên')
//   } finally {
//     setSubmitting(false)
//   }
// }
const onSubmit = async (e) => {
  e.preventDefault()
  if (submitting) return
  const msg = validate()
  if (msg) return setError(msg)
  setSubmitting(true)
  try {
    // Gửi JSON bình thường, không cần FormData
    await createSinhVien({
      ...form,
      lop_id: Number(form.lop_id)
    })
    navigate('/admin/students', { replace: true })
  } catch (err) {
    setError(err.message || 'Không thể tạo sinh viên')
  } finally {
    setSubmitting(false)
  }
}


  return (
    <AdminLayout activeMenu="students" title="Thêm sinh viên">
      <CenterError message={error} onClose={() => setError('')} />

      <div className="card shadow-sm">
        <div className="card-body">
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

            <div className="col-md-6">
              <label className="form-label">Ảnh thẻ</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) setForm(s => ({ ...s, anh_the: file.name }))  // chỉ lưu tên file
                }}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Khóa học</label>
              <input className="form-control" value={form.khoa_hoc} onChange={update('khoa_hoc')} placeholder="VD: K47" />
            </div>

            {/* Cascading: Khoa → Ngành → Lớp */}
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

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" value={form.email} onChange={update('email')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Số điện thoại</label>
              <input className="form-control" value={form.so_dien_thoai} onChange={update('so_dien_thoai')} />
            </div>
            <div className="col-12">
              <label className="form-label">Địa chỉ</label>
              <input className="form-control" value={form.dia_chi} onChange={update('dia_chi')} />
            </div>

            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Lưu sinh viên'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}