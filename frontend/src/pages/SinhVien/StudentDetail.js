// src/pages/SinhVien/StudentDetail.js
import React, { useEffect, useState } from 'react'
import { getSinhVienById, getSinhVienId } from '../../api'
import StudentLayout from '../../components/StudentLayout'
import { useNavigate } from 'react-router-dom'
import '../../styles/SinhVien/StudentDetail.css'

function Field({ label, value }) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <input className="form-control" value={value || ''} disabled readOnly />
    </div>
  )
}

export default function StudentDetail() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sv, setSv] = useState(null)
  const [nguoiThan, setNguoiThan] = useState([])

  useEffect(() => {
    const studentId = getSinhVienId()
    if (!studentId) {
      navigate('/student')
      return
    }

    let stop = false

    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getSinhVienById(studentId)
        if (stop) return
        setSv(data || null)

        // Chuẩn hoá người thân
        let list = []
        const nt = data?.nguoiThan

        if (Array.isArray(nt)) {
          list = nt
        } else if (nt && typeof nt === 'object') {
          // Hỗ trợ cả Cha, Mẹ và Người giám hộ
          if (nt.cha && nt.cha.ho_ten) {
            list.push({ quan_he: 'Cha', ...nt.cha })
          }
          if (nt.me && nt.me.ho_ten) {
            list.push({ quan_he: 'Mẹ', ...nt.me })
          }
          if (nt.nguoiGiamHo && nt.nguoiGiamHo.ho_ten) {
            list.push({ quan_he: 'Người giám hộ', ...nt.nguoiGiamHo })
          }
        }
        setNguoiThan(list)
      } catch (e) {
        if (!stop) setError(e.message || 'Không thể tải dữ liệu sinh viên')
      } finally {
        if (!stop) setLoading(false)
      }
    })()

    return () => { stop = true }
  }, [navigate])

  return (
    <StudentLayout title="Chi tiết sinh viên">
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
          ) : sv ? (
            <>
              {(sv.tenKhoa || sv.tenNganh || sv.tenLop) && (
                <div className="alert alert-info mb-4">
                  {sv.tenKhoa && <span className="me-3"><strong>Khoa:</strong> {sv.tenKhoa}</span>}
                  {sv.tenNganh && <span className="me-3"><strong>Ngành:</strong> {sv.tenNganh}</span>}
                  {sv.tenLop && <span className="me-3"><strong>Lớp:</strong> {sv.tenLop}</span>}
                </div>
              )}

              {/* Thông tin sinh viên */}
              <div className="card shadow-sm mb-4">
                <div className="card-header custom-header fw-semibold">
                  Thông tin sinh viên
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* Ảnh thẻ sinh viên */}
                    {sv.anhThe && (
                      <div className="col-md-12 mb-4 text-center">
                        <label className="form-label fw-semibold d-block mb-2">Ảnh thẻ sinh viên</label>
                        <img 
                          src={sv.anhThe} 
                          alt="Ảnh thẻ sinh viên" 
                          className="img-thumbnail"
                          style={{ maxWidth: '200px', maxHeight: '250px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://via.placeholder.com/200x250?text=No+Image'
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="col-md-4"><Field label="Mã sinh viên" value={sv.maSv || sv.ma_sv} /></div>
                    <div className="col-md-4"><Field label="Họ tên" value={sv.hoTen || sv.ho_ten} /></div>
                    <div className="col-md-4"><Field label="Giới tính" value={sv.gioiTinh || sv.gioi_tinh} /></div>

                    <div className="col-md-4"><Field label="Ngày sinh" value={sv.ngaySinh || sv.ngay_sinh} /></div>
                    <div className="col-md-4"><Field label="Số CCCD" value={sv.cccd} /></div>
                    <div className="col-md-4"><Field label="Số điện thoại" value={sv.soDienThoai || sv.sdt} /></div>

                    <div className="col-md-6"><Field label="Email" value={sv.email} /></div>
                    <div className="col-md-6"><Field label="Địa chỉ" value={sv.diaChi || sv.dia_chi} /></div>
                  </div>
                </div>
              </div>

              {/* Người thân */}
              <div className="card shadow-sm">
                <div className="card-header custom-header fw-semibold">
                  Người thân
                </div>
                <div className="card-body">
                  {(!nguoiThan || nguoiThan.length === 0) ? (
                    <div className="text-muted text-center py-3">Chưa có thông tin người thân</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th style={{width: 48}}>#</th>
                            <th>Mối quan hệ</th>
                            <th>Họ tên</th>
                            <th>CCCD</th>
                            <th>Ngày sinh</th>
                            <th>Số điện thoại</th>
                            <th>Email</th>
                            <th>Nghề nghiệp</th>
                            <th>Địa chỉ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nguoiThan.map((p, idx) => (
                            <tr key={p.id || idx}>
                              <td>{idx + 1}</td>
                              <td><span className="badge bg-primary">{p.quan_he ?? p.moiQuanHe ?? p.moi_quan_he ?? ''}</span></td>
                              <td className="fw-semibold">{p.hoTen ?? p.ho_ten ?? ''}</td>
                              <td>{p.cccd ?? ''}</td>
                              <td>{p.ngay_sinh ?? p.ngaySinh ?? ''}</td>
                              <td>{p.so_dien_thoai ?? p.soDienThoai ?? p.sdt ?? ''}</td>
                              <td>{p.email ?? ''}</td>
                              <td>{p.nghe_nghiep ?? p.ngheNghiep ?? ''}</td>
                              <td>{p.dia_chi ?? p.diaChi ?? ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-warning text-center">Không có dữ liệu sinh viên</div>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
