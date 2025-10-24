import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function EditGiangVien() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])
  const [lops, setLops] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const [k, n, l, gv] = await Promise.all([
          apiFetch('/api/khoa'),
          apiFetch('/api/nganh'),
          apiFetch('/api/lop'),
          apiFetch(`/api/giangviens/${id}`)
        ])
        setKhoas(k || [])
        setNganhs(n || [])
        setLops(l || [])
        setForm({
          ma_gv: gv.maGv,
          ho_ten: gv.hoTen,
          email: gv.email || '',
          so_dien_thoai: gv.soDienThoai || '',
          gioi_tinh: gv.gioiTinh || 'Nam',
          ngay_sinh: gv.ngaySinh ? gv.ngaySinh.substring(0,10) : '',
          dia_chi: gv.diaChi || '',
          khoa_id: gv.khoaId || '',
          nganh_id: gv.nganhId || '',
          lop_id: gv.lopId || '',
          chuc_vu: gv.chucVu || '',
          anh_the: gv.anhThe || ''
        })
      } catch (e) {
        setError('Không thể tải dữ liệu giảng viên')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const update = (k) => (e) => {
    const v = e.target.value
    setForm(s => {
      if (k === 'khoa_id') return { ...s, khoa_id: v, nganh_id: '', lop_id: '' }
      if (k === 'nganh_id') return { ...s, nganh_id: v, lop_id: '' }
      return { ...s, [k]: v }
    })
  }

  const nganhsByKhoa = useMemo(() => {
    if (!form?.khoa_id) return nganhs
    return nganhs.filter(n => String(n.khoaId) === String(form.khoa_id))
  }, [form?.khoa_id, nganhs])

  const lopsByNganh = useMemo(() => {
    if (!form?.nganh_id) return []
    return lops.filter(l => String(l.nganhId) === String(form.nganh_id))
  }, [form?.nganh_id, lops])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    if (!form.ma_gv || !form.ho_ten || !form.khoa_id) {
      setError('Vui lòng nhập Mã GV, Họ tên và chọn Khoa.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await apiFetch(`/api/giangviens/${id}`, {
        method: 'PUT',
        body: JSON.stringify(form)
      })
      setMessage('✅ Cập nhật thành công!')
      setTimeout(() => navigate('/admin/teachers', { replace: true }), 1200)
    } catch (err) {
      setError(err.message || 'Không thể cập nhật giảng viên')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <AdminLayout activeMenu="teachers" title="Đang tải...">
      <div className="text-center mt-5">Đang tải dữ liệu...</div>
    </AdminLayout>
  }

  return (
    <AdminLayout activeMenu="teachers" title="Chỉnh sửa Giảng viên">
      {error && <div className="alert alert-danger text-center">{error}</div>}
      {message && <div className="alert alert-success text-center">{message}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <form className="row g-3" onSubmit={onSubmit}>
            <div className="col-md-3">
              <label className="form-label">Mã GV *</label>
              <input className="form-control" value={form.ma_gv} onChange={update('ma_gv')} />
            </div>
            <div className="col-md-5">
              <label className="form-label">Họ tên *</label>
              <input className="form-control" value={form.ho_ten} onChange={update('ho_ten')} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Chức vụ</label>
              <input className="form-control" value={form.chuc_vu} onChange={update('chuc_vu')} placeholder="VD: Giảng viên chính" />
            </div>

            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input className="form-control" value={form.email} onChange={update('email')} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Số điện thoại</label>
              <input className="form-control" value={form.so_dien_thoai} onChange={update('so_dien_thoai')} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Giới tính</label>
              <select className="form-select" value={form.gioi_tinh} onChange={update('gioi_tinh')}>
                <option>Nam</option>
                <option>Nữ</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Ngày sinh</label>
              <input type="date" className="form-control" value={form.ngay_sinh} onChange={update('ngay_sinh')} />
            </div>
            <div className="col-md-8">
              <label className="form-label">Địa chỉ</label>
              <input className="form-control" value={form.dia_chi} onChange={update('dia_chi')} />
            </div>

            {/* Cascading */}
            <div className="col-md-4">
              <label className="form-label">Khoa *</label>
              <select className="form-select" value={form.khoa_id} onChange={update('khoa_id')}>
                <option value="">-- Chọn Khoa --</option>
                {khoas.map(k => <option key={k.id} value={k.id}>{k.tenKhoa || k.ten_khoa}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Ngành</label>
              <select className="form-select" value={form.nganh_id} onChange={update('nganh_id')} disabled={!nganhsByKhoa.length}>
                <option value="">{nganhsByKhoa.length ? '-- Chọn Ngành --' : '— Chưa có ngành —'}</option>
                {nganhsByKhoa.map(n => <option key={n.id} value={n.id}>{n.tenNganh || n.ten_nganh}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Lớp</label>
              <select className="form-select" value={form.lop_id} onChange={update('lop_id')} disabled={!lopsByNganh.length}>
                <option value="">{lopsByNganh.length ? '-- Chọn Lớp --' : '— Chưa có lớp —'}</option>
                {lopsByNganh.map(l => <option key={l.id} value={l.id}>{l.tenLop}</option>)}
              </select>
            </div>

            {/* Ảnh thẻ */}
            <div className="col-md-6">
              <label className="form-label">Ảnh thẻ (URL hoặc chọn file)</label>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Dán URL ảnh (nếu có)"
                value={form.anh_the}
                onChange={update('anh_the')}
              />
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setForm(s => ({ ...s, anh_the: file.name }))
                }}
              />
              {form.anh_the && <small className="text-muted">Ảnh hiện tại: <b>{form.anh_the}</b></small>}
            </div>

            <div className="col-12 d-flex justify-content-end">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}