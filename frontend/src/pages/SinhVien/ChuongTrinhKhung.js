// src/pages/ChuongTrinhKhung.js
import React, { useEffect, useState } from 'react'
import { getSinhVienId, apiFetch } from '../../api'
import StudentLayout from '../../components/StudentLayout'
import { Check } from 'lucide-react'
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
        console.log('📦 Data từ API:', result)
        console.log('📋 Danh sách môn:', result.danh_sach)
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

  // Group môn theo loại
  const monBatBuoc = data && data.danh_sach ? data.danh_sach.filter(item => item.loai_mon === 'BAT_BUOC') : []
  const monTuChon = data && data.danh_sach ? data.danh_sach.filter(item => item.loai_mon === 'TU_CHON') : []

  // Tính tổng TC bắt buộc từ dữ liệu
  const tongTcBatBuoc = monBatBuoc.reduce((sum, item) => sum + (item.so_tc_dvht || 0), 0)
  
  // Tính tổng TC tự chọn theo quy định từng học kỳ
  const getTongTcTuChon = (hk) => {
    switch(hk) {
      case 'HK2':
      case 'HK3':
      case 'HK5':
      case 'HK6':
        return 3
      case 'HK4':
      case 'HK7':
        return 7
      case 'HK8':
        return 6
      case 'HK9':
        // HK9: tính từ dữ liệu (hoặc có thể set giá trị cố định nếu có quy định)
        return monTuChon.reduce((sum, item) => sum + (item.so_tc_dvht || 0), 0)
      default:
        // HK1 hoặc các học kỳ khác: tính từ dữ liệu
        return monTuChon.reduce((sum, item) => sum + (item.so_tc_dvht || 0), 0)
    }
  }
  
  const tongTcTuChon = getTongTcTuChon(hocKy)
  
  // Tổng TC học kỳ = TC bắt buộc + TC tự chọn (theo quy định)
  const tongTcHocKy = tongTcBatBuoc + tongTcTuChon

  // Check có dữ liệu không
  const hasData = data && data.danh_sach && data.danh_sach.length > 0

  // Render một bảng
  const renderTable = (danhSach, tieuDe, tongTc, showTotal = true) => {
    if (!danhSach.length) return null

    return (
      <div className="mb-4">
        {/* Section header */}
        <div className="section-header">
          <div className="section-title">{tieuDe}</div>
          {showTotal && <div className="section-total">TỔNG SỐ TC: {tongTc}</div>}
        </div>

        {/* Bảng */}
        <div className="shadow-sm">
          <div className="table-responsive">
            <table className="ctk-table table table-hover align-middle mb-0">
              <tbody>
                {danhSach.map((item, index) => {
                  const daHoc = item.da_dkhp === 1 || 
                                item.diem_tong_ket !== null || 
                                (item.dat && item.dat !== 'Chưa đạt')

                  // Kiểm tra đạt: điểm >= 4.0 VÀ dat = 'Đạt'
                  const dat = (item.diem_tong_ket !== null && item.diem_tong_ket >= 4.0 && item.dat === 'Đạt') ||
                              (item.dat === 'Đạt' && item.diem_tong_ket !== null)
                  
                  // Kiểm tra rớt: có điểm VÀ (điểm < 4.0 HOẶC dat = 'Không đạt')
                  const rot = item.diem_tong_ket !== null && 
                              (item.diem_tong_ket < 4.0 || item.dat === 'Không đạt')

                  return (
                    <tr key={index}>
                      <td 
                        className="text-center fw-semibold"
                        style={{ backgroundColor: daHoc ? '#e0e0e0' : 'transparent', width: '50px' }}
                      >
                        {index + 1}
                      </td>
                      <td style={{ backgroundColor: daHoc ? '#e0e0e0' : 'transparent', width: '100px' }}>
                        {item.ma_mon_hoc}
                      </td>
                      <td 
                        className="fw-medium"
                        style={{ backgroundColor: daHoc ? '#e0e0e0' : 'transparent' }}
                      >
                        {item.ten_mon_hoc}
                      </td>
                      <td style={{ backgroundColor: daHoc ? '#e0e0e0' : 'transparent', width: '120px' }}>
                        {item.ma_hoc_phan}
                      </td>
                      <td style={{ backgroundColor: daHoc ? '#e0e0e0' : 'transparent', width: '250px' }}>
                        <small>{item.hoc_phan_loai}</small>
                      </td>
                      <td 
                        className="text-center"
                        style={{ backgroundColor: daHoc ? '#e0e0e0' : 'transparent', width: '80px' }}
                      >
                        {item.so_tc_dvht}
                      </td>
                      <td 
                        className="text-center"
                        style={{ backgroundColor: daHoc ? '#e0e0e0' : 'transparent', width: '80px' }}
                      >
                        {item.so_tiet_lt}
                      </td>
                      <td 
                        className="text-center"
                        style={{ backgroundColor: daHoc ? '#e0e0e0' : 'transparent', width: '80px' }}
                      >
                        {item.so_tiet_th}
                      </td>
                      <td 
                        className="text-center"
                        style={{ backgroundColor: daHoc ? '#e0e0e0' : 'transparent', width: '60px' }}
                      >
                        {dat ? (
                          <Check size={20} className="text-success" strokeWidth={3} />
                        ) : rot ? (
                          <span className="text-danger fw-bold">✗</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <StudentLayout title="Chương trình khung">
      <div className="container-fluid">
        {/* Dropdown chọn học kỳ */}
        <div className="mb-3">
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
            <option value="HK9">Học kỳ 9</option>
          </select>
        </div>

        {/* Header bảng cố định */}
        <div className="card border-0 shadow-sm mb-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="ctk-table table mb-0">
                <thead className="table-header">
                  <tr>
                    <th className="text-center" style={{ width: '50px' }}>STT</th>
                    <th style={{ width: '100px' }}>Mã môn học</th>
                    <th>Tên môn học</th>
                    <th style={{ width: '120px' }}>Mã học phần</th>
                    <th style={{ width: '250px' }}>Học phần: học trước (a), tiền quyết (b), song hành (c)</th>
                    <th className="text-center" style={{ width: '80px' }}>Số TC/DVHT</th>
                    <th className="text-center" style={{ width: '80px' }}>Số tiết LT</th>
                    <th className="text-center" style={{ width: '80px' }}>Số tiết TH</th>
                    <th className="text-center" style={{ width: '60px' }}>Đạt</th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>

        {/* HỌC KỲ X + TỔNG SỐ TC (nằm dưới header bảng) */}
        <div className="hoc-ky-row">
          <div className="hoc-ky-label">HỌC KỲ {hocKy.replace('HK', '')}</div>
          <div className="tong-tc-label">TỔNG SỐ TC: {tongTcHocKy}</div>
        </div>

        {/* Thông báo nếu không có dữ liệu */}
        {!hasData ? (
          <div className="alert alert-info text-center mt-3">
            Không có dữ liệu chương trình khung cho học kỳ <strong>{hocKy}</strong>
          </div>
        ) : (
          <>
            {/* Render 2 bảng: Bắt buộc và Tự chọn */}
            {renderTable(monBatBuoc, 'HỌC PHẦN BẮT BUỘC', tongTcBatBuoc, true)}
            {renderTable(monTuChon, 'HỌC PHẦN TỰ CHỌN', tongTcTuChon, true)}
          </>
        )}

        {/* Chú thích - dưới cùng */}
        <div className="card border-0 shadow-sm mt-4" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="card-body py-2 px-3">
            <div className="d-flex align-items-center gap-4 small">
              <div className="d-flex align-items-center gap-2">
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  backgroundColor: 'rgba(200, 200, 200, 0.3)',
                  border: '1px solid #cccccc5e',
                  borderRadius: '4px'
                }}></div>
                <span><i>Môn đã học/đang học</i></span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Check size={20} className="text-success" strokeWidth={3} />
                <span><i>Đã đạt</i></span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-danger fw-bold" style={{ fontSize: '18px' }}>✗</span>
                <span><i>Rớt </i></span>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </StudentLayout>
  )
}