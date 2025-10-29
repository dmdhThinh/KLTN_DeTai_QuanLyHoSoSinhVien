import React, { useEffect, useState } from 'react'
import { getSinhVienId, apiFetch } from '../../api' 



import { getSinhVienById } from '../../api'
import StudentLayout from '../../components/StudentLayout'
import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.vfs
export default function DiemSo() {
  const [diemSo, setDiemSo] = useState([])
   const [sv, setSv] = useState(null)
  useEffect(() => {
    const sinhVienId = getSinhVienId()   // ✅ dùng hàm giống lịch học

    if (sinhVienId) {
      getSinhVienById(sinhVienId).then(setSv).catch(()=>setSv(null))
      apiFetch(`/api/ketquahoctap/by-sinhvien?sinhVienId=${sinhVienId}`)
        .then(setDiemSo)
        .catch(() => setDiemSo([]))
    }
  }, [])
   // 🧾 In PDF
  const handlePrintPDF = () => {
  const grouped = {}
  diemSo.forEach(d => {
    const key = `${d.hocKy || 'HK1'} (${d.namHoc || ''})`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(d)
  })

  const content = [
    { text: 'TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM', alignment: 'center', style: 'header', margin: [0, 0, 0, 6] },
    { text: 'BẢNG ĐIỂM HỌC TẬP', alignment: 'center', style: 'title', margin: [0, 0, 0, 12] },
  ]

  if (sv) {
    content.push(
      { text: `Họ tên: ${sv.hoTen || ''}          MSSV: ${sv.maSv || ''}`, margin: [0, 0, 0, 4] },
      { text: `Ngành: ${sv.tenNganh || '---'}     Lớp: ${sv.tenLop || '---'}`, margin: [0, 0, 0, 10] }

    )
  }

  Object.entries(grouped).forEach(([hk, items], idx) => {
    if (idx > 0) content.push({ text: '', margin: [0, 6] })
    content.push({ text: hk, style: 'subheader', margin: [0, 6, 0, 6] })

    // ✅ Full 18 cột
    const body = [
      [
        'STT', 'Mã HP', 'Tên học phần', 'TC',
        'TX1', 'TX2', 'TX3', 'TX4',
        'TH1', 'TH2', 'TH3',
        'GK', 'CK',
        'TK', 'Thang 4', 'Chữ', 'Xếp loại', 'KQ'
      ]
    ]

    items.forEach((it, i) => {
      body.push([
        i + 1,
        it.maLopHocPhan,
        it.tenMonHoc,
        it.soTinChi,
        it.diemThuongXuyen1 ?? '',
        it.diemThuongXuyen2 ?? '',
        it.diemThuongXuyen3 ?? '',
        it.diemThuongXuyen4 ?? '',
        it.diemThucHanh1 ?? '',
        it.diemThucHanh2 ?? '',
        it.diemThucHanh3 ?? '',
        it.diemGiuaKy ?? '',
        it.diemCuoiKy ?? '',
        it.diemTongKet ?? '',
        it.diemThang4 ?? '',
        it.diemChu ?? '',
        it.xepLoai ?? '',
        it.dat ?? ''
      ])
    })

    content.push({
      table: {
        headerRows: 1,
        widths: [
          20, 40, '*', 20, // STT, Mã HP, Tên HP, TC
          25, 25, 25, 25,  // TX1–TX4
          25, 25, 25,      // TH1–TH3
          25, 25,          // GK, CK
          25, 30, 28, 40, 25 // TK, Thang 4, Chữ, Xếp loại, KQ
        ],
        body
      },
      layout: {
        fillColor: (rowIndex) => (rowIndex === 0 ? '#0d6efd' : null),
        hLineColor: '#d9d9d9',
        vLineColor: '#d9d9d9',
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 3,
        paddingBottom: () => 3
      },
      style: 'table'
    })
  })

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [25, 24, 25, 28],
    defaultStyle: { font: 'Roboto', fontSize: 8 }, // giảm font xuống 8
    pageOrientation: 'landscape', // ✅ in ngang
    styles: {
      header:   { fontSize: 14, bold: true },
      title:    { fontSize: 12, bold: true },
      subheader:{ fontSize: 11, bold: true, margin: [0, 4, 0, 2] },
      table:    { fontSize: 9, color: '#222' }
    }
  }

  docDefinition.content = content
  pdfMake.createPdf(docDefinition).download(`BangDiem_${sv?.ma_sv || 'sinhvien'}.pdf`)
}




  return (
    <StudentLayout title="Kết quả học tập">
     <div className="d-flex justify-content-center">
      <div className="card shadow-sm w-100" style={{ maxWidth: 1300 }}>
      

      <div className="container mt-4">
      {/* 🔘 Nút in PDF */}
            <div className="d-flex justify-content-end mb-3">
              <button
                onClick={handlePrintPDF}
                className="btn btn-danger d-flex align-items-center gap-2"
              >
                <i className="bi bi-file-earmark-pdf"></i> In PDF
              </button>
              </div>
       
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã học phần</th>
              <th>Tên học phần</th>
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
  {(() => {
    // Nhóm điểm theo học kỳ và năm học
    const grouped = {}
    diemSo.forEach((item) => {
      const key = `${item.hocKy} (${item.namHoc})`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(item)
    })

    // Hiển thị theo từng nhóm
    return Object.entries(grouped).map(([hocKyNam, items]) => (
      <React.Fragment key={hocKyNam}>
        {/* Dòng hiển thị tiêu đề học kỳ */}
        <tr style={{ background: '#f0f8ff', fontWeight: 'bold', color: '#0d6efd' }}>
          <td colSpan="18">{hocKyNam}</td>
        </tr>

        {items.map((item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>
            <td>{item.maLopHocPhan}</td>
            <td>{item.tenMonHoc}</td>
            <td>{item.soTinChi}</td>
            <td>{item.diemThuongXuyen1}</td>
            <td>{item.diemThuongXuyen2}</td>
            <td>{item.diemThuongXuyen3}</td>
            <td>{item.diemThuongXuyen4}</td>
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
              {item.dat?.trim().toLowerCase() === 'đạt' ? (
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
      </React.Fragment>
    ))
  })()}
</tbody>

        </table>
        
      </div>
      </div>
      </div>
  </StudentLayout>
  )
}
