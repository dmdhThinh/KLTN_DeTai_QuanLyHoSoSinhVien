import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';
import TeacherLayout from '../../components/TeacherLayout';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

function SinhVienTrongLop() {
  const { lopHocPhanId } = useParams();
  const navigate = useNavigate();
  const [lopHocPhan, setLopHocPhan] = useState(null);
  const [sinhVienList, setSinhVienList] = useState([]);
  const [lichHoc, setLichHoc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Load thông tin lớp và sinh viên
  useEffect(() => {
    loadData();
  }, [lopHocPhanId]);

  const loadData = async () => {
    if (!lopHocPhanId) return;
    setLoading(true);
    try {
      // Load thông tin lớp học phần
      const lopData = await apiFetch(`/api/lophocphan/${lopHocPhanId}`);
      setLopHocPhan(lopData);

      // Load danh sách sinh viên
      const svData = await apiFetch(`/api/lophocphan/${lopHocPhanId}/sinhvien`);
      setSinhVienList(svData || []);

      // Load lịch học
      const lichData = await apiFetch(`/api/lich/lop-hoc-phan/${lopHocPhanId}`);
      setLichHoc(lichData || []);
    } catch (err) {
      console.error('Lỗi load dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };


const exportDiemDanh = async (loaiDiemDanh) => {
  if (!lopHocPhan || !sinhVienList.length) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  if (!loaiDiemDanh) {
    alert('Vui lòng chọn loại buổi (lý thuyết / thực hành / trực tuyến) để xuất điểm danh.');
    return;
  }

  // ===== 1. Tính các buổi học =====
  const ngayBatDau = lopHocPhan.ngay_bat_dau || lopHocPhan.ngayBatDau;
  const ngayKetThuc = lopHocPhan.ngay_ket_thuc || lopHocPhan.ngayKetThuc;
  const cacNgayHoc = [];

  if (ngayBatDau && ngayKetThuc && lichHoc && lichHoc.length > 0) {
    const start = new Date(ngayBatDau);
    let end = new Date(ngayKetThuc);
    const endDow = end.getDay();
    const offsetToSunday = (7 - endDow) % 7;
    if (offsetToSunday > 0) {
      end.setDate(end.getDate() + offsetToSunday);
    }

    // Chỉ lấy các lịch học định kỳ của đúng loại buổi được chọn
    // (không có ngay_hoc / ngayHoc), bỏ qua lịch có ngày cụ thể (buổi bù / thi)
    const thuHocDB = lichHoc
      .filter(l => l.loai === loaiDiemDanh)
      .filter(l => !(l.ngay_hoc || l.ngayHoc))
      .map(l => l.thu || l.thu_hoc)
      .filter(Boolean)
      .map(Number);

    // Nếu sau khi lọc không còn thứ nào thì không sinh buổi nào
    if (thuHocDB.length > 0) {
      let current = new Date(start);
      while (current <= end) {
        const dow = current.getDay();
        const thuDB = dow === 0 ? 8 : dow + 1;
        if (thuHocDB.includes(thuDB)) {
          cacNgayHoc.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }
    }
  }

  if (cacNgayHoc.length === 0) {
    alert('Lỗi: Không tìm thấy buổi học nào!');
    return;
  }

  const soBuoi = cacNgayHoc.length;

  // ===== 2. Tạo workbook và worksheet =====
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  worksheet.views = [{ showGridLines: false }];

  // ===== 3. Thông tin lớp =====
  const hk = lopHocPhan.hoc_ky || lopHocPhan.hocKy || '';
  const namHoc = lopHocPhan.nam_hoc || lopHocPhan.namHoc || '';
  const hkDisplay = hk && namHoc ? `${hk} (${namHoc})` : (hk || namHoc);
  const maLHP = lopHocPhan.ma_lop_hoc_phan || lopHocPhan.maLopHocPhan || '';
  const tenMon = lopHocPhan.ten_hoc_phan || lopHocPhan.tenHocPhan || '';
  const lopHoc = lopHocPhan.ten_lop || lopHocPhan.tenLop || '';

  let currentRow = 1;

  // ===== 4. Header chính =====
  worksheet.mergeCells(currentRow, 1, currentRow, 12);
  const titleCell = worksheet.getCell(currentRow, 1);
  titleCell.value = 'DANH SÁCH ĐIỂM DANH LỚP HỌC PHẦN';
  titleCell.font = { name: 'Arial', size: 14, bold: true };
  // Canh trái để gần khối thông tin Đợt/Cơ sở/Lớp học
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  currentRow++;

  // ===== 5. Thông tin đợt, cơ sở, mã lớp... =====
  const infoRows = [
    ['Đợt:', '', hkDisplay],
    ['Cơ sở:', '', 'Cơ sở 1 '],
    ['Mã lớp học phần:', '', maLHP],
    ['Tên môn học:', '', `${tenMon} `],
    ['Lớp học', '', lopHoc]
  ];

  infoRows.forEach(info => {
    const row = worksheet.getRow(currentRow);
    row.values = info;

    // Gộp cột 1-2 cho nhãn (Đợt, Cơ sở, ...) và bôi đậm nhãn
    worksheet.mergeCells(currentRow, 1, currentRow, 2);
    const labelCell = worksheet.getCell(currentRow, 1);
    labelCell.font = { name: 'Arial', size: 10, bold: true };

    // Giá trị bên phải giữ font thường
    const valueCell = worksheet.getCell(currentRow, 3);
    valueCell.font = { name: 'Arial', size: 10 , bold: true};

    currentRow++;
  });

  currentRow++; // Dòng trống

  // ===== 6. Headers bảng =====
  const tableStartRow = currentRow;

  // Header 1: Tên buổi học
  const header1 = ['STT', 'Mã sinh viên', 'Họ đệm', 'Tên', 'Giới tính', 'Ngày sinh'];
  cacNgayHoc.forEach(date => {
    const thu = date.getDay();
    const thuStr = thu === 0 ? 'Chủ nhật' : `Thứ ${['hai','ba','tư','năm','sáu','bảy'][thu-1]}`;
    const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    header1.push(`[${thuStr}] - [7->9] - ${dateStr}`);
  });
  header1.push('Tổng cộng');

  const row1 = worksheet.getRow(currentRow);
  let colIndex = 1;
  // Tăng chiều cao dòng để hiển thị rõ ngày/thứ
  row1.height = 32;

  // Các cột cố định (STT, Mã SV, Họ đệm, Tên, Giới tính, Ngày sinh)
  for (let i = 0; i < 6; i++) {
    worksheet.mergeCells(currentRow, colIndex, currentRow + 1, colIndex);
    const cell = worksheet.getCell(currentRow, colIndex);
    cell.value = header1[i];
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    colIndex++;
  }

  // Các buổi học (mỗi buổi 3 cột)
  for (let i = 0; i < soBuoi; i++) {
    worksheet.mergeCells(currentRow, colIndex, currentRow, colIndex + 2);
    const cell = worksheet.getCell(currentRow, colIndex);
    cell.value = header1[6 + i];
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    colIndex += 3;
  }

  // Tổng cộng (4 cột)
  worksheet.mergeCells(currentRow, colIndex, currentRow, colIndex + 3);
  const totalCell = worksheet.getCell(currentRow, colIndex);
  totalCell.value = 'Tổng cộng';
  totalCell.font = { name: 'Arial', size: 10, bold: true };
  totalCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
  totalCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  currentRow++;

  // Header 2: (P/K), ST, LD
  const row2 = worksheet.getRow(currentRow);
  colIndex = 7; // Bắt đầu từ cột sau "Ngày sinh"

  for (let i = 0; i < soBuoi; i++) {
    ['(P/K)', 'ST', 'LD'].forEach(label => {
      const cell = worksheet.getCell(currentRow, colIndex);
      cell.value = label;
      cell.font = { name: 'Arial', size: 10, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      colIndex++;
    });
  }

  // Tổng cộng sub-headers
  ['Vắng có phép', 'Vắng không phép', 'Tổng số tiết', '(%) vắng'].forEach(label => {
    const cell = worksheet.getCell(currentRow, colIndex);
    cell.value = label;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    colIndex++;
  });

  currentRow++;

  // ===== 7. Dữ liệu sinh viên =====
  sinhVienList.forEach((sv, idx) => {
    const row = worksheet.getRow(currentRow);
    
    const hoTen = (sv.ho_ten || sv.hoTen || '').trim();
    const parts = hoTen.split(' ');
    const ten = parts.pop() || '';
    const hoDem = parts.join(' ');
    const ns = sv.ngay_sinh ? new Date(sv.ngay_sinh).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric'}) : '';

    const rowData = [
      idx + 1,
      sv.ma_sv || sv.maSV || '',
      hoDem,
      ten,
      sv.gioi_tinh || sv.gioiTinh || '',
      ns
    ];

    // Thêm các cột điểm danh
    for (let i = 0; i < soBuoi; i++) {
      rowData.push('', 0, ''); // (P/K), ST, LD
    }

    // Thêm tổng cộng
    rowData.push(0, 0, soBuoi * 3, 0);

    row.values = rowData;

    // Style cho từng cell
    for (let c = 1; c <= rowData.length; c++) {
      const cell = worksheet.getCell(currentRow, c);
      cell.font = { name: 'Arial', size: 10 };
      cell.alignment = { 
        horizontal: c === 1 ? 'center' : 'left', 
        vertical: 'middle' 
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }

    currentRow++;
  });

  // ===== 8. Độ rộng cột =====
  worksheet.columns = [
    { width: 6 },  // STT
    { width: 14 }, // Mã SV
    { width: 22 }, // Họ đệm
    { width: 12 }, // Tên
    { width: 10 }, // Giới tính
    { width: 14 }, // Ngày sinh
    ...Array(soBuoi * 3).fill(null).map((_, i) => ({ width: i % 3 === 0 ? 8 : 6 })),
    { width: 14 }, // Vắng có phép
    { width: 16 }, // Vắng không phép
    { width: 12 }, // Tổng số tiết
    { width: 10 }  // % vắng
  ];

  // ===== 8.1. Tô xám vùng ngoài form (dưới và bên phải) =====
  const tableEndRow = currentRow - 1;               // dòng dữ liệu cuối cùng
  const tableEndCol = worksheet.columns.length;     // cột cuối cùng của form
  const extraRows = 40;                             // số dòng xám thêm bên dưới
  const extraCols = 5;                             // số cột xám thêm bên phải
  const grayFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD0D0D0' } };

  // Dưới cùng: từ dòng ngay sau SV cuối đến vài dòng phía dưới
  for (let r = tableEndRow + 1; r <= tableEndRow + extraRows; r++) {
    for (let c = 1; c <= tableEndCol; c++) {
      const cell = worksheet.getCell(r, c);
      cell.fill = grayFill;
    }
  }

  // Bên phải: từ cột sau cột cuối cùng, phủ xám theo chiều dọc bảng (kể cả phần trên tiêu đề)
  for (let r = 1; r <= tableEndRow + extraRows; r++) {
    for (let c = tableEndCol + 1; c <= tableEndCol + extraCols; c++) {
      const cell = worksheet.getCell(r, c);
      cell.fill = grayFill;
    }
  }

  // ===== 9. Xuất file =====
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `diem-danh-sinh-vien-${Date.now()}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

  return (
    <TeacherLayout title="Danh sách sinh viên">
      <div className="container-fluid">
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : !lopHocPhan ? (
          <div className="alert alert-danger">
            Không tìm thấy thông tin lớp học phần!
          </div>
        ) : (
          <>
            {/* Nút quay lại */}
            <div className="mb-3">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate('/teacher/sv-lop')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Quay lại danh sách lớp
              </button>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-people me-2"></i>
                    Danh sách sinh viên
                  </h5>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-light dropdown-toggle"
                      onClick={() => setShowExportMenu(prev => !prev)}
                      disabled={!sinhVienList.length}
                    >
                      <i className="bi bi-file-earmark-excel me-1"></i>
                      Xuất Excel điểm danh
                    </button>
                    <ul
                      className={
                        "dropdown-menu dropdown-menu-end" +
                        (showExportMenu ? " show" : "")
                      }
                    >
                      <li>
                        <button
                          className="dropdown-item"
                          type="button"
                          onClick={() => {
                            setShowExportMenu(false);
                            exportDiemDanh('lythuyet');
                          }}
                          disabled={!lichHoc.some(l => l.loai === 'lythuyet')}
                        >
                          Lý thuyết
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          type="button"
                          onClick={() => {
                            setShowExportMenu(false);
                            exportDiemDanh('thuchanh');
                          }}
                          disabled={!lichHoc.some(l => l.loai === 'thuchanh')}
                        >
                          Thực hành
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          type="button"
                          onClick={() => {
                            setShowExportMenu(false);
                            exportDiemDanh('tructuyen');
                          }}
                          disabled={!lichHoc.some(l => l.loai === 'tructuyen')}
                        >
                          Trực tuyến
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {/* Thông tin lớp */}
                <div className="row mb-4 p-3 bg-light rounded">
                  <div className="col-md-3">
                    <strong>Mã LHP:</strong>
                    <div className="text-primary">{lopHocPhan.ma_lop_hoc_phan || lopHocPhan.maLopHocPhan}</div>
                  </div>
                  <div className="col-md-4">
                    <strong>Tên môn học:</strong>
                    <div className="text-primary">{lopHocPhan.ten_hoc_phan || lopHocPhan.tenHocPhan}</div>
                  </div>
                  <div className="col-md-3">
                    <strong>Lớp:</strong>
                    <div className="text-primary">{lopHocPhan.ten_lop || lopHocPhan.tenLop || 'N/A'}</div>
                  </div>
                  <div className="col-md-2">
                    <strong>Sĩ số:</strong>
                    <div className="text-primary fw-bold">{sinhVienList.length}</div>
                  </div>
                </div>

                {/* Bảng sinh viên */}
                {sinhVienList.length === 0 ? (
                  <div className="alert alert-info text-center">
                    <i className="bi bi-info-circle me-2"></i>
                    Chưa có sinh viên nào đăng ký lớp này
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover table-striped">
                      <thead className="table-success">
                        <tr>
                          <th style={{ width: '50px' }} className="text-center">STT</th>
                          <th style={{ width: '120px' }}>Mã SV</th>
                          <th>Họ và tên</th>
                          <th style={{ width: '120px' }} className="text-center">Ngày sinh</th>
                          <th style={{ width: '80px' }} className="text-center">Giới tính</th>
                          <th style={{ width: '120px' }}>SĐT</th>
                          <th style={{ width: '200px' }}>Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sinhVienList.map((sv, index) => (
                          <tr key={sv.sinh_vien_id || sv.dang_ky_id || index}>
                            <td className="text-center">{index + 1}</td>
                            <td>{sv.ma_sv}</td>
                            <td>{sv.ho_ten}</td>
                            <td className="text-center">
                              {sv.ngay_sinh
                                ? new Date(sv.ngay_sinh).toLocaleDateString('vi-VN')
                                : 'N/A'}
                            </td>
                            <td className="text-center">{sv.gioi_tinh || 'N/A'}</td>
                            <td>{sv.so_dien_thoai || 'N/A'}</td>
                            <td>{sv.email || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </TeacherLayout>
  );
}

export default SinhVienTrongLop;