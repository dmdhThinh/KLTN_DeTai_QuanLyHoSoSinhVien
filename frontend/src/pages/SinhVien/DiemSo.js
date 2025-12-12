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
  const [diemTrungBinh, setDiemTrungBinh] = useState([])
  const [dangKyHocPhan, setDangKyHocPhan] = useState([])
  
  useEffect(() => {
    const loadData = async () => {
      const sinhVienId = getSinhVienId()
      if (!sinhVienId) return

      try {
        // Load thông tin sinh viên
        const svData = await getSinhVienById(sinhVienId)
        setSv(svData)
      } catch {
        setSv(null)
      }

      try {
        // Load điểm số
        const diemData = await apiFetch(`/api/ket-qua-hoc-tap/by-sinhvien?sinhVienId=${sinhVienId}`)
        setDiemSo(diemData || [])

        // Load danh sách đăng ký học phần để kiểm tra
        const dangKyData = await apiFetch(`/api/dkhp/my?sinh_vien_id=${sinhVienId}`)
        setDangKyHocPhan(dangKyData || [])

        // Nếu có điểm số, kiểm tra xem đã nhập đủ điểm chưa
        if (diemData && diemData.length > 0 && dangKyData && dangKyData.length > 0) {
          // Nhóm điểm theo học kỳ
          const diemGrouped = {}
          diemData.forEach(item => {
            const key = `${item.hocKy}_${item.namHoc}`
            if (!diemGrouped[key]) {
              diemGrouped[key] = []
            }
            diemGrouped[key].push(item)
          })

          // Nhóm đăng ký theo học kỳ (chỉ lấy môn đã được chấp nhận - THANH_CONG)
          const dangKyGrouped = {}
          dangKyData.forEach(item => {
            // Chỉ tính các môn đã được chấp nhận (THANH_CONG)
            // trang_thai_dk có thể là: 'CHO_DUYET', 'THANH_CONG', 'HUY', 'TU_CHOI'
            if (item.trang_thai_dk === 'THANH_CONG') {
              const key = `${item.hoc_ky}_${item.nam_hoc}`
              if (!dangKyGrouped[key]) {
                dangKyGrouped[key] = []
              }
              dangKyGrouped[key].push(item)
            }
          })

          // Kiểm tra từng học kỳ: số môn có điểm = số môn đã đăng ký
          let shouldUpdate = false
          for (const [key, diemList] of Object.entries(diemGrouped)) {
            const dangKyList = dangKyGrouped[key] || []
            
            // Đếm số môn có điểm tổng kết
            const soMonCoDiem = diemList.filter(item => 
              item.diemTongKet !== null && 
              item.diemTongKet !== undefined && 
              item.diemTongKet !== ''
            ).length

            console.log(`📊 Học kỳ ${key}:`, {
              soMonDangKy: dangKyList.length,
              soMonCoDiem: soMonCoDiem,
              duDieuKien: soMonCoDiem > 0 && soMonCoDiem === dangKyList.length
            })

            // Nếu số môn có điểm = số môn đã đăng ký -> đủ điều kiện
            if (soMonCoDiem > 0 && soMonCoDiem === dangKyList.length) {
              shouldUpdate = true
              console.log(`✅ Học kỳ ${key} đã nhập đủ điểm, sẽ cập nhật điểm tích lũy`)
              break
            }
          }

          // Nếu có ít nhất 1 học kỳ đã nhập đủ điểm, cập nhật điểm tích lũy
          if (shouldUpdate) {
            try {
              await apiFetch('/api/diem-trung-binh/cap-nhat-tat-ca', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sinhVienId })
              })
            } catch (err) {
              console.error('Không thể cập nhật điểm tích lũy tự động:', err)
            }
          }
        }

        // Load điểm trung bình (sau khi cập nhật)
        const dtbData = await apiFetch(`/api/diem-trung-binh/theo-sinh-vien?sinhVienId=${sinhVienId}`)
        setDiemTrungBinh(dtbData || [])
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err)
        setDiemSo([])
        setDiemTrungBinh([])
      }
    }

    loadData()
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
    { text: 'TRƯỜNG ĐẠI HỌC PHƯƠNG NAM', alignment: 'center', style: 'header', margin: [0, 0, 0, 6] },
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
        (it.diemTongKet !== null && it.diemTongKet !== undefined && it.diemTongKet !== '') ? (it.dat ?? '') : '—'
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

    // 📊 Thêm bảng điểm trung bình
    const hocKy = items[0]?.hocKy
    const namHoc = items[0]?.namHoc
    const dtb = diemTrungBinh.find(d => d.hoc_ky === hocKy && d.nam_hoc === namHoc)
    
    // Hiển thị điểm tích lũy khi có dữ liệu
    const shouldShowDTB = dtb
    
    if (shouldShowDTB) {
      content.push({
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'Điểm Trung Bình học kỳ hệ 10: ' + (dtb.diem_tb_hoc_ky || '0.00'), fontSize: 9, bold: true },
              { text: 'Điểm Trung Bình học kỳ hệ 4: ' + (dtb.diem_tb_hoc_ky_thang4 || '0.00'), fontSize: 9, bold: true }
            ],
            [
              { text: 'Điểm Trung Bình tích lũy: ' + (dtb.diem_tb_tich_luy || '0.00'), fontSize: 9, color: '#006400' },
              { text: 'Điểm Trung Bình tích lũy (hệ 4): ' + (dtb.diem_tb_tich_luy_thang4 || '0.00'), fontSize: 9, color: '#006400' }
            ],
            [
              { text: 'Tổng số tín chỉ đã đăng ký: ' + (dtb.tong_tin_chi_dang_ky || 0), fontSize: 9 },
              { text: 'Tổng số tín chỉ tích lũy: ' + (dtb.tong_tin_chi_tich_luy || 0), fontSize: 9 }
            ],
            [
              { text: 'Tổng số tín chỉ đạt: ' + (dtb.tong_tin_chi_dat || 0), fontSize: 9 },
              { text: 'Tổng số tín chỉ nợ: ' + (dtb.tong_tin_chi_no || 0), fontSize: 9, color: dtb.tong_tin_chi_no > 0 ? '#d9534f' : '#000' }
            ],
            [
              { text: 'Xếp loại học lực tích lũy: ' + (dtb.xep_loai_tich_luy || 'Chưa xếp loại'), fontSize: 9 },
              { text: 'Xếp loại học lực học kỳ: ' + (dtb.xep_loai_hoc_ky || 'Chưa xếp loại'), fontSize: 9 }
            ]
          ]
        },
        layout: {
          fillColor: '#f8f9fa',
          hLineColor: '#d9d9d9',
          vLineColor: '#d9d9d9',
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4
        },
        margin: [0, 4, 0, 0]
      })
    }
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




  // Helper function để lấy màu theo điểm
  const getScoreColor = (score) => {
    if (!score) return '#6c757d'
    if (score >= 8.5) return '#28a745'
    if (score >= 7.0) return '#17a2b8'
    if (score >= 5.5) return '#ffc107'
    return '#dc3545'
  }

  return (
    <StudentLayout title="Kết quả học tập">
     <div className="d-flex justify-content-center">
      <div className="card shadow-lg w-100" style={{ 
        maxWidth: 1300, 
        borderRadius: '15px', 
        overflow: 'hidden',
        border: 'none'
      }}>
      
      {/* Header gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px 30px',
        color: 'white'
      }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1" style={{ fontWeight: '600' }}>
              <i className="bi bi-trophy-fill me-2"></i>
              Bảng điểm học tập
            </h4>
            <small style={{ opacity: 0.9 }}>Xem và tải xuống kết quả học tập của bạn</small>
          </div>
          <button
            onClick={handlePrintPDF}
            className="btn btn-light d-flex align-items-center gap-2"
            style={{ 
              borderRadius: '10px',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <i className="bi bi-file-earmark-pdf-fill text-danger"></i> Tải PDF
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '30px' }}>
        <table className="table table-hover" style={{ 
          borderRadius: '10px', 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <thead style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <tr>
              <th style={{ verticalAlign: 'middle', fontWeight: '600' }}>STT</th>
              <th style={{ verticalAlign: 'middle', fontWeight: '600' }}>Mã HP</th>
              <th style={{ verticalAlign: 'middle', fontWeight: '600' }}>Tên học phần</th>
              <th style={{ verticalAlign: 'middle', fontWeight: '600' }}>TC</th>
              <th colSpan={4} style={{ textAlign: 'center', fontWeight: '600' }}>Thường xuyên</th>
              <th colSpan={3} style={{ textAlign: 'center', fontWeight: '600' }}>Thực hành</th>
              <th style={{ verticalAlign: 'middle', fontWeight: '600' }}>GK</th>
              <th style={{ verticalAlign: 'middle', fontWeight: '600' }}>CK</th>
              <th style={{ verticalAlign: 'middle', fontWeight: '600' }}>TK</th>
              <th style={{ verticalAlign: 'middle', fontWeight: '600' }}>Hệ 4</th>
              <th style={{ verticalAlign: 'middle', fontWeight: '600' }}>Chữ</th>
              <th style={{ verticalAlign: 'middle', fontWeight: '600' }}>Xếp loại</th>
              <th style={{ verticalAlign: 'middle', fontWeight: '600' }}>KQ</th>
            </tr>
            <tr style={{ fontSize: '0.9rem' }}>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th style={{ textAlign: 'center' }}>1</th>
              <th style={{ textAlign: 'center' }}>2</th>
              <th style={{ textAlign: 'center' }}>3</th>
              <th style={{ textAlign: 'center' }}>4</th>
              <th style={{ textAlign: 'center' }}>1</th>
              <th style={{ textAlign: 'center' }}>2</th>
              <th style={{ textAlign: 'center' }}>3</th>
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
    return Object.entries(grouped).map(([hocKyNam, items]) => {
      // Tìm điểm trung bình cho học kỳ này
      const hocKy = items[0]?.hocKy
      const namHoc = items[0]?.namHoc
      const dtb = diemTrungBinh.find(d => d.hoc_ky === hocKy && d.nam_hoc === namHoc)
      
      // Hiển thị điểm tích lũy khi có dữ liệu
      const showDiemTichLuy = dtb
      
      return (
        <React.Fragment key={hocKyNam}>
          {/* Dòng hiển thị tiêu đề học kỳ */}
          <tr style={{ 
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            borderLeft: '4px solid #667eea'
          }}>
            <td colSpan="18" style={{ 
              padding: '12px 16px',
              fontWeight: '600',
              fontSize: '1.1rem',
              color: '#667eea'
            }}>
              <i className="bi bi-calendar-check me-2"></i>
              {hocKyNam}
            </td>
          </tr>

          {items.map((item, index) => (
            <tr key={item.id} style={{ 
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa'
              e.currentTarget.style.transform = 'scale(1.005)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = ''
              e.currentTarget.style.transform = 'scale(1)'
            }}>
              <td style={{ fontWeight: '500' }}>{index + 1}</td>
              <td><span style={{ 
                padding: '4px 8px',
                background: '#667eea20',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                color: '#667eea'
              }}>{item.maLopHocPhan}</span></td>
              <td style={{ fontWeight: '500' }}>{item.tenMonHoc}</td>
              <td><span style={{
                background: '#764ba220',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: '600'
              }}>{item.soTinChi}</span></td>
              <td style={{ textAlign: 'center' }}>{item.diemThuongXuyen1}</td>
              <td style={{ textAlign: 'center' }}>{item.diemThuongXuyen2}</td>
              <td style={{ textAlign: 'center' }}>{item.diemThuongXuyen3}</td>
              <td style={{ textAlign: 'center' }}>{item.diemThuongXuyen4}</td>
              <td style={{ textAlign: 'center' }}>{item.diemThucHanh1}</td>
              <td style={{ textAlign: 'center' }}>{item.diemThucHanh2}</td>
              <td style={{ textAlign: 'center' }}>{item.diemThucHanh3}</td>
              <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.diemGiuaKy}</td>
              <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.diemCuoiKy}</td>
              <td style={{ 
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                color: getScoreColor(item.diemTongKet)
              }}>{item.diemTongKet}</td>
              <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.diemThang4}</td>
              <td style={{ textAlign: 'center' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  background: getScoreColor(item.diemTongKet) + '20',
                  color: getScoreColor(item.diemTongKet)
                }}>{item.diemChu}</span>
              </td>
              <td style={{ textAlign: 'center', fontSize: '0.9rem' }}>{item.xepLoai}</td>
              <td style={{ textAlign: 'center' }}>
                {item.diemTongKet !== null && item.diemTongKet !== undefined && item.diemTongKet !== '' ? (
                  item.dat?.trim().toLowerCase() === 'đạt' ? (
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
                  )
                ) : (
                  <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>—</span>
                )}
              </td>
            </tr>
          ))}

          {/* Thêm dòng thông tin điểm trung bình */}
          {showDiemTichLuy && (
            <tr style={{ 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderTop: '3px solid #667eea'
            }}>
              <td colSpan="18">
                <div className="row py-2 px-3" style={{ fontSize: '0.9rem' }}>
                  <div className="col-md-6">
                    <div style={{ marginBottom: '0.4rem' }}>
                      <i className="bi bi-graph-up text-primary me-2"></i>
                      <strong>Điểm Trung Bình học kỳ hệ 10:</strong> 
                      <span className="fw-bold ms-2" style={{ 
                        color: getScoreColor(dtb.diem_tb_hoc_ky),
                        fontSize: '1.1rem'
                      }}>{dtb.diem_tb_hoc_ky || '0.00'}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <i className="bi bi-trophy text-success me-2"></i>
                      <strong>Điểm Trung Bình tích lũy:</strong> 
                      <span className="fw-bold ms-2" style={{ 
                        color: getScoreColor(dtb.diem_tb_tich_luy),
                        fontSize: '1.1rem'
                      }}>{dtb.diem_tb_tich_luy || '0.00'}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <i className="bi bi-clipboard-check text-info me-2"></i>
                      <strong>Tổng số tín chỉ đã đăng ký:</strong> 
                      <span className="ms-2">{dtb.tong_tin_chi_dang_ky || 0}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <strong>Tổng số tín chỉ đạt:</strong> 
                      <span className="ms-2">{dtb.tong_tin_chi_dat || 0}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <i className="bi bi-award text-warning me-2"></i>
                      <strong>Xếp loại học lực tích lũy:</strong> 
                      <span className="badge bg-info ms-2" style={{ fontSize: '0.85rem' }}>
                        {dtb.xep_loai_tich_luy || 'Chưa xếp loại'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div style={{ marginBottom: '0.4rem' }}>
                      <i className="bi bi-graph-up text-primary me-2"></i>
                      <strong>Điểm Trung Bình học kỳ hệ 4:</strong> 
                      <span className="fw-bold ms-2" style={{ 
                        color: getScoreColor(dtb.diem_tb_hoc_ky_thang4 * 2.5),
                        fontSize: '1.1rem'
                      }}>{dtb.diem_tb_hoc_ky_thang4 || '0.00'}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <i className="bi bi-trophy text-success me-2"></i>
                      <strong>Điểm Trung Bình tích lũy (hệ 4):</strong> 
                      <span className="fw-bold ms-2" style={{ 
                        color: getScoreColor(dtb.diem_tb_tich_luy_thang4 * 2.5),
                        fontSize: '1.1rem'
                      }}>{dtb.diem_tb_tich_luy_thang4 || '0.00'}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <i className="bi bi-stack text-info me-2"></i>
                      <strong>Tổng số tín chỉ tích lũy:</strong> 
                      <span className="ms-2">{dtb.tong_tin_chi_tich_luy || 0}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <i className={`bi bi-${dtb.tong_tin_chi_no > 0 ? 'exclamation-circle text-danger' : 'check-circle text-success'} me-2`}></i>
                      <strong>Tổng số tín chỉ nợ tính đến hiện tại:</strong> 
                      <span className={`fw-bold ms-2 ${dtb.tong_tin_chi_no > 0 ? 'text-danger' : 'text-success'}`}>
                        {dtb.tong_tin_chi_no || 0}
                      </span>
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <i className="bi bi-star text-warning me-2"></i>
                      <strong>Xếp loại học lực học kỳ:</strong> 
                      <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.85rem' }}>
                        {dtb.xep_loai_hoc_ky || 'Chưa xếp loại'}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      )
    })
  })()}
</tbody>

        </table>
        
      </div>
      </div>
      </div>
  </StudentLayout>
  )
}
