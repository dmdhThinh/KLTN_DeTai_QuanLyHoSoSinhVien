import ExcelJS from 'exceljs';

/**
 * Xuất bảng điểm ra file Excel
 * @param {Array} sinhVienList - Danh sách sinh viên
 * @param {Object} lopHocPhan - Thông tin lớp học phần
 * @param {String} loaiBang - Loại bảng điểm: 'lythuyet', 'thuchanh', 'lt_th_gk', 'tongket'
 * @returns {Promise<void>}
 */
export async function exportDiemToExcel(sinhVienList, lopHocPhan, loaiBang) {
  if (!sinhVienList || sinhVienList.length === 0 || !lopHocPhan) {
    throw new Error('⚠️ Không có dữ liệu để xuất!');
  }

  if (!loaiBang) {
    throw new Error('⚠️ Vui lòng chọn loại bảng điểm để xuất!');
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Bảng điểm');
  worksheet.views = [{ showGridLines: false }];

  let titleSuffix = '';
  let columns = [];

  // Cấu hình cột theo loại bảng
  switch (loaiBang) {
    case 'lythuyet':
      titleSuffix = 'LÝ THUYẾT';
      columns = [
        { header: 'STT', key: 'stt', width: 6, align: 'center' },
        { header: 'Mã sinh viên', key: 'ma_sv', width: 14, align: 'center' },
        { header: 'Họ đệm', key: 'ho_dem', width: 22 },
        { header: 'Tên', key: 'ten', width: 12 },
        { header: 'TX1', key: 'tx1', width: 8, align: 'center' },
        { header: 'TX2', key: 'tx2', width: 8, align: 'center' },
        { header: 'TX3', key: 'tx3', width: 8, align: 'center' },
        { header: 'TX4', key: 'tx4', width: 8, align: 'center' },
        { header: 'Ký tên', key: 'ky_ten', width: 18 }
      ];
      break;
    case 'thuchanh':
      titleSuffix = 'THỰC HÀNH';
      columns = [
        { header: 'STT', key: 'stt', width: 6, align: 'center' },
        { header: 'Mã sinh viên', key: 'ma_sv', width: 14, align: 'center' },
        { header: 'Họ đệm', key: 'ho_dem', width: 22 },
        { header: 'Tên', key: 'ten', width: 12 },
        { header: 'TH1', key: 'th1', width: 8, align: 'center' },
        { header: 'TH2', key: 'th2', width: 8, align: 'center' },
        { header: 'TH3', key: 'th3', width: 8, align: 'center' },
        { header: 'Ký tên', key: 'ky_ten', width: 18 }
      ];
      break;
    case 'lt_th_gk':
      titleSuffix = 'LÝ THUYẾT - THỰC HÀNH - GIỮA KỲ';
      columns = [
        { header: 'STT', key: 'stt', width: 6, align: 'center' },
        { header: 'Mã sinh viên', key: 'ma_sv', width: 14, align: 'center' },
        { header: 'Họ đệm', key: 'ho_dem', width: 22 },
        { header: 'Tên', key: 'ten', width: 12 },
        { header: 'TX1', key: 'tx1', width: 8, align: 'center' },
        { header: 'TX2', key: 'tx2', width: 8, align: 'center' },
        { header: 'TX3', key: 'tx3', width: 8, align: 'center' },
        { header: 'TX4', key: 'tx4', width: 8, align: 'center' },
        { header: 'TH1', key: 'th1', width: 8, align: 'center' },
        { header: 'TH2', key: 'th2', width: 8, align: 'center' },
        { header: 'TH3', key: 'th3', width: 8, align: 'center' },
        { header: 'Giữa kỳ', key: 'gk', width: 10, align: 'center' },
        { header: 'Ký tên', key: 'ky_ten', width: 18 }
      ];
      break;
    case 'tongket':
      titleSuffix = 'TỔNG KẾT';
      columns = [
        { header: 'STT', key: 'stt', width: 6, align: 'center' },
        { header: 'Mã sinh viên', key: 'ma_sv', width: 14, align: 'center' },
        { header: 'Họ đệm', key: 'ho_dem', width: 22 },
        { header: 'Tên', key: 'ten', width: 12 },
        { header: 'TX1', key: 'tx1', width: 8, align: 'center' },
        { header: 'TX2', key: 'tx2', width: 8, align: 'center' },
        { header: 'TX3', key: 'tx3', width: 8, align: 'center' },
        { header: 'TX4', key: 'tx4', width: 8, align: 'center' },
        { header: 'TH1', key: 'th1', width: 8, align: 'center' },
        { header: 'TH2', key: 'th2', width: 8, align: 'center' },
        { header: 'TH3', key: 'th3', width: 8, align: 'center' },
        { header: 'Giữa kỳ', key: 'gk', width: 10, align: 'center' },
        { header: 'Cuối kỳ', key: 'ck', width: 10, align: 'center' },
        { header: 'Tổng kết', key: 'tk', width: 10, align: 'center' },
        { header: 'Điểm chữ', key: 'chu', width: 10, align: 'center' },
        { header: 'Xếp loại', key: 'xep_loai', width: 12, align: 'center' },
        { header: 'Kết quả', key: 'ket_qua', width: 12, align: 'center' },
        { header: 'Ký tên', key: 'ky_ten', width: 18 }
      ];
      break;
    default:
      throw new Error('⚠️ Loại bảng điểm không hợp lệ!');
  }

  const totalCols = columns.length;
  let currentRow = 1;
  const half = Math.floor(totalCols / 2);

  const borderThin = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  // ===== Header quốc hiệu, tên trường =====
  worksheet.mergeCells(currentRow, 1, currentRow, half);
  const left1 = worksheet.getCell(currentRow, 1);
  left1.value = 'BỘ CÔNG THƯƠNG';
  left1.font = { name: 'Times New Roman', size: 12, bold: true };
  left1.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(currentRow, half + 1, currentRow, totalCols);
  const right1 = worksheet.getCell(currentRow, half + 1);
  right1.value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
  right1.font = { name: 'Times New Roman', size: 12, bold: true };
  right1.alignment = { horizontal: 'center', vertical: 'middle' };

  currentRow++;

  worksheet.mergeCells(currentRow, 1, currentRow, half);
  const left2 = worksheet.getCell(currentRow, 1);
  left2.value = 'TRƯỜNG ĐẠI HỌC PHƯƠNG NAM';
  left2.font = { name: 'Times New Roman', size: 12, bold: true };
  left2.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(currentRow, half + 1, currentRow, totalCols);
  const right2 = worksheet.getCell(currentRow, half + 1);
  right2.value = 'Độc lập - Tự do - Hạnh phúc';
  right2.font = { name: 'Times New Roman', size: 12, italic: true };
  right2.alignment = { horizontal: 'center', vertical: 'middle' };

  currentRow += 2;

  // ===== Tiêu đề bảng điểm =====
  worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
  const titleCell = worksheet.getCell(currentRow, 1);
  titleCell.value = `BẢNG ĐIỂM ${titleSuffix} LỚP HỌC PHẦN`;
  titleCell.font = { name: 'Times New Roman', size: 14, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  currentRow += 2;

  // ===== Thông tin lớp học phần =====
  const hk = lopHocPhan.hocKy || lopHocPhan.hoc_ky || '';
  const namHoc = lopHocPhan.namHoc || lopHocPhan.nam_hoc || '';
  const hkDisplay = hk && namHoc ? `${hk} (${namHoc})` : (hk || namHoc);
  const maLHP = lopHocPhan.maLopHocPhan || lopHocPhan.ma_lop_hoc_phan || '';
  const tenMon = lopHocPhan.tenHocPhan || lopHocPhan.ten_hoc_phan || '';
  const lopHoc = lopHocPhan.tenLop || lopHocPhan.ten_lop || '';

  const infoRows = [
    ['Môn học:', tenMon],
    ['Mã lớp học phần:', maLHP],
    ['Lớp học:', lopHoc],
    ['Học kỳ / Năm học:', hkDisplay]
  ];

  infoRows.forEach(info => {
    const row = worksheet.getRow(currentRow);
    row.height = 18;

    worksheet.mergeCells(currentRow, 1, currentRow, 2);
    const labelCell = worksheet.getCell(currentRow, 1);
    labelCell.value = info[0];
    labelCell.font = { name: 'Times New Roman', size: 11, bold: true };
    labelCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

    worksheet.mergeCells(currentRow, 3, currentRow, totalCols);
    const valueCell = worksheet.getCell(currentRow, 3);
    valueCell.value = info[1];
    valueCell.font = { name: 'Times New Roman', size: 11, bold: true };
    valueCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

    currentRow++;
  });

  currentRow++;

  // ===== Header bảng điểm =====
  worksheet.columns = columns.map(col => ({
    width: col.width
  }));

  const tableStartRow = currentRow;
  const headerRow = worksheet.getRow(currentRow);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Times New Roman', size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    cell.border = borderThin;
  });

  currentRow++;

  // ===== Dữ liệu sinh viên =====
  sinhVienList.forEach((sv, index) => {
    const row = worksheet.getRow(currentRow);

    const hoTen = (sv.ho_ten || sv.hoTen || '').trim();
    const parts = hoTen.split(' ');
    const ten = parts.pop() || '';
    const hoDem = parts.join(' ');

    const baseData = {
      stt: index + 1,
      ma_sv: sv.ma_sv || sv.maSV || '',
      ho_dem: hoDem,
      ten: ten
    };

    let rowData = {};
    if (loaiBang === 'lythuyet') {
      rowData = {
        ...baseData,
        tx1: sv.diem_ly_thuyet_1 || '',
        tx2: sv.diem_ly_thuyet_2 || '',
        tx3: sv.diem_ly_thuyet_3 || '',
        tx4: sv.diem_ly_thuyet_4 || '',
        ky_ten: ''
      };
    } else if (loaiBang === 'thuchanh') {
      rowData = {
        ...baseData,
        th1: sv.diem_thuc_hanh_1 || '',
        th2: sv.diem_thuc_hanh_2 || '',
        th3: sv.diem_thuc_hanh_3 || '',
        ky_ten: ''
      };
    } else if (loaiBang === 'lt_th_gk') {
      rowData = {
        ...baseData,
        tx1: sv.diem_ly_thuyet_1 || '',
        tx2: sv.diem_ly_thuyet_2 || '',
        tx3: sv.diem_ly_thuyet_3 || '',
        tx4: sv.diem_ly_thuyet_4 || '',
        th1: sv.diem_thuc_hanh_1 || '',
        th2: sv.diem_thuc_hanh_2 || '',
        th3: sv.diem_thuc_hanh_3 || '',
        gk: sv.diem_giua_ky || '',
        ky_ten: ''
      };
    } else if (loaiBang === 'tongket') {
      rowData = {
        ...baseData,
        tx1: sv.diem_ly_thuyet_1 || '',
        tx2: sv.diem_ly_thuyet_2 || '',
        tx3: sv.diem_ly_thuyet_3 || '',
        tx4: sv.diem_ly_thuyet_4 || '',
        th1: sv.diem_thuc_hanh_1 || '',
        th2: sv.diem_thuc_hanh_2 || '',
        th3: sv.diem_thuc_hanh_3 || '',
        gk: sv.diem_giua_ky || '',
        ck: sv.diem_cuoi_ky || '',
        tk: sv.diem_tong_ket || '',
        chu: sv.diem_chu || '',
        xep_loai: sv.xep_loai || '',
        ket_qua: sv.dat || '',
        ky_ten: ''
      };
    }

    columns.forEach((col, idx) => {
      const cell = row.getCell(idx + 1);
      const value = rowData[col.key];
      cell.value = value !== undefined ? value : '';
      cell.font = { name: 'Times New Roman', size: 10 };
      cell.alignment = { horizontal: col.align || (idx === 0 ? 'center' : 'left'), vertical: 'middle' };
      cell.border = borderThin;
    });

    currentRow++;
  });

  // ===== Tô xám vùng ngoài form =====
  const tableEndRow = currentRow - 1;
  const tableEndCol = columns.length;
  const extraRows = 40;
  const extraCols = 5;
  const grayFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD0D0D0' } };

  // Dưới cùng
  for (let r = tableEndRow + 1; r <= tableEndRow + extraRows; r++) {
    for (let c = 1; c <= tableEndCol; c++) {
      const cell = worksheet.getCell(r, c);
      cell.fill = grayFill;
    }
  }

  // Bên phải
  for (let r = 1; r <= tableEndRow + extraRows; r++) {
    for (let c = tableEndCol + 1; c <= tableEndCol + extraCols; c++) {
      const cell = worksheet.getCell(r, c);
      cell.fill = grayFill;
    }
  }

  // ===== Tạo file và tải xuống =====
  const fileTypeLabel =
    loaiBang === 'lythuyet' ? 'LyThuyet' :
    loaiBang === 'thuchanh' ? 'ThucHanh' :
    loaiBang === 'lt_th_gk' ? 'LT_TH_GK' :
    'TongKet';

  const fileName = `BangDiem_${fileTypeLabel}_${maLHP || 'LopHocPhan'}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Xuất dữ liệu mảng ra Excel (Chung)
 * @param {Array} data - Dữ liệu cần xuất (Mảng các Object)
 * @param {String} fileName - Tên file
 */
export async function exportToExcel(data, fileName) {
  if (!data || !data.length) return

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet1')

  // Lấy headers từ key của object đầu tiên
  const columns = Object.keys(data[0]).map(key => ({
    header: key,
    key: key,
    width: 20
  }))
  
  worksheet.columns = columns

  // Add rows
  data.forEach(row => {
    worksheet.addRow(row)
  })

  // Style header
  worksheet.getRow(1).font = { bold: true }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.xlsx`
  link.click()
  window.URL.revokeObjectURL(url)
}
