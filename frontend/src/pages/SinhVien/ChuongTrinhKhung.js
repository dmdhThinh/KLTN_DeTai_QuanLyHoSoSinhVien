// src/pages/ChuongTrinhKhung.js
import React, { useEffect, useState } from 'react'
import { getSinhVienId, apiFetch } from '../../api'
import StudentLayout from '../../components/StudentLayout'
import '../../styles/SinhVien/ChuongTrinhKhung.css'

export default function ChuongTrinhKhung() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hocKy, setHocKy] = useState('HK1')
  const [sinhVien, setSinhVien] = useState(null)

  // Lấy sinh viên + chương trình khung
  useEffect(() => {
    const id = getSinhVienId()
    if (!id) return

    // Lấy thông tin sinh viên (để lấy nganh_id)
    apiFetch(`/api/sinhviens/${id}`)
      .then((sv) => {
        setSinhVien(sv)
        return apiFetch(`/api/chuongtrinhkhung/${hocKy}/${sv.nganhId}?sinh_vien_id=${id}`)
      })
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [hocKy])

  if (loading) {
    return (
      <StudentLayout title="Chương trình khung">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (!data || !data.danh_sach.length) {
    return (
      <StudentLayout title="Chương trình khung">
        <div className="alert alert-info text-center">
          Không có dữ liệu chương trình khung cho học kỳ <strong>{hocKy}</strong>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout title="Chương trình khung">
      <div className="container-fluid">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            
            <p className="text-muted small mb-0">
              Ngành: <strong>{sinhVien?.tenNganh}</strong> | 
              Lớp: <strong>{sinhVien?.tenLop}</strong>
            </p>
          </div>

          {/* Chọn học kỳ */}
          <select
            className="form-select w-auto"
            value={hocKy}
            onChange={(e) => setHocKy(e.target.value)}
          >
            <option value="HK1">Học kỳ 1</option>
            <option value="HK2">Học kỳ 2</option>
            <option value="HK3">Học kỳ 3</option>
            <option value="HK4">Học kỳ 4</option>
            <option value="HK5">Học kỳ 5</option>
            <option value="HK6">Học kỳ 6</option>
            <option value="HK7">Học kỳ 7</option>
            <option value="HK8">Học kỳ 8</option>
          </select>
        </div>

        {/* Bảng chương trình khung - THÊM class "ctk-table" */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="ctk-table table table-hover align-middle mb-0">
                <thead className="table-primary text-white">
                  <tr>
                    <th className="text-center" style={{ width: '50px' }}>#</th>
                    <th>Mã môn học</th>
                    <th>Tên môn học</th>
                    
                    <th>Học phần: học trước (a), tiền quyết (b), song hành (c)</th>
                    <th className="text-center">Số TC/DVHT</th>
                    <th className="text-center">Số tiết LT</th>
                    <th className="text-center">Số tiết TH</th>
                    <th className="text-center">Đạt</th>
                  </tr>
                </thead>
                <tbody>
                  {data.danh_sach.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center fw-semibold">{index + 1}</td>
                      <td>{item.ma_mon_hoc}</td>
                      <td className="fw-medium">{item.ten_mon_hoc}</td>
                      
                      <td><small>{item.hoc_phan_loai}</small></td>
                      <td className="text-center">{item.so_tc_dvht}</td>
                      <td className="text-center">{item.so_tiet_lt}</td>
                      <td className="text-center">{item.so_tiet_th}</td>
                      <td className="text-center">
                        {item.dat === 'Đạt' ? (
                          <span className="text-success fw-bold">Checkmark</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-info fw-bold">
                    <td colSpan="5" className="text-end">TỔNG SỐ TC:</td>
                    <td className="text-center">{data.tong_tc}</td>
                    <td colSpan="3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        
      </div>
    </StudentLayout>
  )
}