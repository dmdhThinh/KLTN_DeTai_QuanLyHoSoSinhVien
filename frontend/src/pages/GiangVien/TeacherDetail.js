// src/pages/GiangVien/TeacherDetail.js
import React, { useEffect, useState } from 'react'
import { getGiangVienById, getGiangVienId } from '../../api'
import TeacherLayout from '../../components/TeacherLayout'
import { useNavigate } from 'react-router-dom'

function Field({ label, value }) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <input className="form-control" value={value || ''} disabled readOnly />
    </div>
  )
}

export default function TeacherDetail() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gv, setGv] = useState(null)

  useEffect(() => {
    const teacherId = getGiangVienId()
    if (!teacherId) {
      navigate('/teacher')
      return
    }

    let stop = false

    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getGiangVienById(teacherId)
        if (stop) return
        setGv(data || null)
      } catch (e) {
        if (!stop) setError(e.message || 'Không thể tải dữ liệu giảng viên')
      } finally {
        if (!stop) setLoading(false)
      }
    })()

    return () => { stop = true }
  }, [navigate])

  return (
    <TeacherLayout title="Chi tiết giảng viên">
      <div className="d-flex justify-content-center">
        <div className="w-100" style={{ maxWidth: 1300 }}>
          {error && <div className="alert alert-danger mb-3">{String(error)}</div>}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <div className="mt-2">Đang tải dữ liệu...</div>
            </div>
          ) : gv ? (
            <>
              {(gv.tenKhoa || gv.tenNganh) && (
                <div className="alert alert-info mb-4">
                  {gv.tenKhoa && <span className="me-3"><strong>Khoa:</strong> {gv.tenKhoa}</span>}
                  {gv.tenNganh && <span className="me-3"><strong>Ngành:</strong> {gv.tenNganh}</span>}
                </div>
              )}

              {/* Thông tin giảng viên */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white fw-semibold">
                  Thông tin giảng viên
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* Ảnh thẻ giảng viên */}
                    {gv.anhThe && (
                      <div className="col-md-12 mb-4 text-center">
                        <label className="form-label fw-semibold d-block mb-2">Ảnh thẻ giảng viên</label>
                        <img 
                          src={gv.anhThe} 
                          alt="Ảnh thẻ giảng viên" 
                          className="img-thumbnail"
                          style={{ maxWidth: '200px', maxHeight: '250px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://via.placeholder.com/200x250?text=No+Image'
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="col-md-4"><Field label="Mã giảng viên" value={gv.maGv || gv.ma_gv} /></div>
                    <div className="col-md-4"><Field label="Họ tên" value={gv.hoTen || gv.ho_ten} /></div>
                    <div className="col-md-4"><Field label="Giới tính" value={gv.gioiTinh || gv.gioi_tinh} /></div>

                    <div className="col-md-4"><Field label="Ngày sinh" value={gv.ngaySinh || gv.ngay_sinh} /></div>
                    <div className="col-md-4"><Field label="Số CCCD" value={gv.cccd} /></div>
                    <div className="col-md-4"><Field label="Số điện thoại" value={gv.soDienThoai || gv.so_dien_thoai || gv.sdt} /></div>

                    <div className="col-md-6"><Field label="Email" value={gv.email} /></div>
                    <div className="col-md-6"><Field label="Địa chỉ" value={gv.diaChi || gv.dia_chi} /></div>

                    {gv.hocVi && <div className="col-md-6"><Field label="Học vị" value={gv.hocVi || gv.hoc_vi} /></div>}
                    {gv.chucVu && <div className="col-md-6"><Field label="Chức vụ" value={gv.chucVu || gv.chuc_vu} /></div>}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-warning text-center">Không có dữ liệu giảng viên</div>
          )}
        </div>
      </div>
    </TeacherLayout>
  )
}

