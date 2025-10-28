import React, { useEffect, useState } from 'react'
import { getSinhVienId, apiFetch } from '../../api' 

import StudentLayout from '../../components/StudentLayout'
export default function DiemSo() {
  const [diemSo, setDiemSo] = useState([])
  useEffect(() => {
    const sinhVienId = getSinhVienId()   // ✅ dùng hàm giống lịch học

    if (sinhVienId) {
      apiFetch(`/api/ketquahoctap/by-sinhvien?sinhVienId=${sinhVienId}`)
        .then(setDiemSo)
        .catch(() => setDiemSo([]))
    }
  }, [])

  return (
    <StudentLayout title="Kết quả học tập">
     <div className="d-flex justify-content-center">
      <div className="card shadow-sm w-100" style={{ maxWidth: 1300 }}>
      

      <div className="container mt-4">
       
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã học phần</th>
              <th>Tên môn học/học phần</th>
              <th>Số tín chỉ</th>
              <th colSpan={4}>Thường xuyên</th>
              <th colSpan={3}>Thực hành</th>
              <th>Giữa kỳ</th>
              <th>Cuối kỳ</th>
              <th>Điểm tổng kết</th>
              <th>Thang điểm 4</th>
              <th>Điểm chữ</th>
              <th>Xếp loại</th>
              <th>Đạt</th>
            </tr>
            <tr>
              {/* Headers for Thường xuyên and Thực hành columns */}
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {diemSo.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.maLopHocPhan}</td>
                <td>{item.tenMonHoc}</td>
                <td>{item.soTinChi}</td>
                {/* Render points for Thường xuyên columns */}
                <td>{item.diemThuongXuyen1}</td>
                <td>{item.diemThuongXuyen2}</td>
                <td>{item.diemThuongXuyen3}</td>
                <td>{item.diemThuongXuyen4}</td>
                {/* Render points for Thực hành columns */}
                <td>{item.diemThucHanh1}</td>
                <td>{item.diemThucHanh2}</td>
                <td>{item.diemThucHanh3}</td>
                <td>{item.diemGiuaKy}</td>
                <td>{item.diemCuoiKy}</td>
                <td>{item.diemTongKet}</td>
                <td>{item.diemThang4}</td>
                <td>{item.diemChu}</td>
                <td>{item.xepLoai}</td>
                <td style={{ textAlign: 'center' }}>
  {item.dat && item.dat.toString().trim().toLowerCase() === 'đạt' ? (
    <img 
      src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
      alt="Đạt"
      width="24"
      height="24"
      style={{ transition: 'transform 0.2s' }}
      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'}
      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
    />
  ) : (
    <img 
      src="https://cdn-icons-png.flaticon.com/512/1828/1828843.png"
      alt="Không đạt"
      width="24"
      height="24"
      style={{ transition: 'transform 0.2s' }}
      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'}
      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
    />
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
      </div>
      </div>
  </StudentLayout>
  )
}
