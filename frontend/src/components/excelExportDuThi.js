import ExcelJS from 'exceljs';

/**
 * Xuất danh sách sinh viên dự thi GIỮA KỲ ra file Excel
 * @param {Array} sinhVienList - Danh sách sinh viên
 * @param {Object} lopHocPhan - Thông tin lớp học phần
 * @param {String} phong - Phòng thi (optional)
 * @returns {Promise<void>}
 */
export async function exportDanhSachDuThiGK(sinhVienList, lopHocPhan, phong = '') {
  if (!sinhVienList || sinhVienList.length === 0 || !lopHocPhan) {
    throw new Error('Không có dữ liệu để xuất!');
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh sách dự thi GK');
  worksheet.views = [{ showGridLines: false }];

  const borderThin = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  let currentRow = 1;

  // ===== HEADER =====
  worksheet.mergeCells(currentRow, 1, currentRow, 4);
  const leftHeader = worksheet.getCell(currentRow, 1);
  leftHeader.value = 'BỘ CÔNG THƯƠNG\nTRƯỜNG ĐẠI HỌC PHƯƠNG NAM';
  leftHeader.font = { name: 'Times New Roman', size: 11, bold: true };
  leftHeader.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  worksheet.mergeCells(currentRow, 5, currentRow, 10);
  const rightHeader = worksheet.getCell(currentRow, 5);
  rightHeader.value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc';
  rightHeader.font = { name: 'Times New Roman', size: 11, bold: true };
  rightHeader.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  worksheet.getRow(currentRow).height = 30;

  currentRow += 2;

  // ===== TIÊU ĐỀ =====
  worksheet.mergeCells(currentRow, 1, currentRow, 10);
  const title = worksheet.getCell(currentRow, 1);
  title.value = 'DANH SÁCH SINH VIÊN DỰ THI GIỮA KỲ';
  title.font = { name: 'Times New Roman', size: 14, bold: true };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 20;

  currentRow += 2;

  // ===== THÔNG TIN =====
  const hk = lopHocPhan.hocKy || lopHocPhan.hoc_ky || '';
  const namHoc = lopHocPhan.namHoc || lopHocPhan.nam_hoc || '';
  const maLHP = lopHocPhan.maLopHocPhan || lopHocPhan.ma_lop_hoc_phan || '';
  const tenMon = lopHocPhan.tenHocPhan || lopHocPhan.ten_hoc_phan || '';
  const lopHoc = lopHocPhan.tenLop || lopHocPhan.ten_lop || '';
  const soTC = lopHocPhan.soTinChi || lopHocPhan.so_tin_chi || '03';

  const infoData = [
    ['Môn thi', tenMon, 'Lớp học phần', maLHP],
    ['Lớp học', lopHoc, 'Số TC', soTC],
    ['Ngày thi', '', 'Niên học', `${namHoc}`],
    ['Học kỳ', hk, 'Phòng', phong]
  ];

  infoData.forEach(row => {
    worksheet.getCell(currentRow, 1).value = row[0];
    worksheet.getCell(currentRow, 1).font = { name: 'Times New Roman', size: 11, bold: true };
    worksheet.getCell(currentRow, 1).alignment = { horizontal: 'left' };
    
    worksheet.mergeCells(currentRow, 2, currentRow, 5);
    worksheet.getCell(currentRow, 2).value = row[1];
    worksheet.getCell(currentRow, 2).font = { name: 'Times New Roman', size: 11 , bold: true};
    worksheet.getCell(currentRow, 2).alignment = { horizontal: 'left' };

    worksheet.getCell(currentRow, 6).value = row[2];
    worksheet.getCell(currentRow, 6).font = { name: 'Times New Roman', size: 11, bold: true };
    worksheet.getCell(currentRow, 6).alignment = { horizontal: 'left' };

    worksheet.mergeCells(currentRow, 7, currentRow, 10);
    worksheet.getCell(currentRow, 7).value = row[3];
    worksheet.getCell(currentRow, 7).font = { name: 'Times New Roman', size: 11, bold: true };
    worksheet.getCell(currentRow, 7).alignment = { horizontal: 'left' };

    worksheet.getRow(currentRow).height = 20;
    currentRow++;
  });

  currentRow++;

  // ===== BẢNG SINH VIÊN =====
  const columns = [
    { header: 'STT', width: 5 },
    { header: 'Mã số', width: 12 },
    { header: 'Họ đệm', width: 18 },
    { header: 'Tên', width: 10 },
    { header: 'Lớp học', width: 14 },
    { header: 'Số tờ', width: 7 },
    { header: 'Mã đề', width: 7 },
    { header: 'Ký tên', width: 14 },
    { header: 'Điểm GK/TH', width: 12 },
    { header: 'Ghi chú', width: 12 }
  ];

  worksheet.columns = columns.map(col => ({ width: col.width }));
  
  // Set lại width cho cột info label để không bị khuất (phải set sau khi set columns)
  worksheet.getColumn(1).width = 15;
  worksheet.getColumn(6).width = 15;

  const headerRow = worksheet.getRow(currentRow);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Times New Roman', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    cell.border = borderThin;
  });
  worksheet.getRow(currentRow).height = 30;
  currentRow++;

  // Data rows
  sinhVienList.forEach((sv, index) => {
    const hoTen = (sv.ho_ten || sv.hoTen || '').trim();
    const parts = hoTen.split(' ');
    const ten = parts.pop() || '';
    const hoDem = parts.join(' ');

    const rowData = [
      index + 1,
      sv.ma_sv || sv.maSV || '',
      hoDem,
      ten,
      sv.ten_lop || lopHoc || '',
      '', // Số tờ
      '', // Mã đề
      '', // Ký tên
      '', // Điểm GK/TH (GV điền tay)
      '' // Ghi chú
    ];

    const row = worksheet.getRow(currentRow);
    rowData.forEach((value, idx) => {
      const cell = row.getCell(idx + 1);
      cell.value = value;
      cell.font = { name: 'Times New Roman', size: 10 };
      cell.alignment = { horizontal: idx === 0 ? 'center' : 'left', vertical: 'middle' };
      cell.border = borderThin;
    });
    worksheet.getRow(currentRow).height = 18;
    currentRow++;
  });

  currentRow += 1;

  // ===== THỐNG KÊ =====
  worksheet.mergeCells(currentRow, 1, currentRow, 3);
  worksheet.getCell(currentRow, 1).value = `Tổng số\t\t${sinhVienList.length}`;
  worksheet.getCell(currentRow, 1).font = { name: 'Times New Roman', size: 11 };

  worksheet.mergeCells(currentRow, 4, currentRow, 7);
  worksheet.getCell(currentRow, 4).value = 'Số bài thi .........';
  worksheet.getCell(currentRow, 4).font = { name: 'Times New Roman', size: 11 };

  currentRow++;

  worksheet.mergeCells(currentRow, 1, currentRow, 3);
  worksheet.getCell(currentRow, 1).value = 'Số sinh viên có mặt ............';
  worksheet.getCell(currentRow, 1).font = { name: 'Times New Roman', size: 11 };

  worksheet.mergeCells(currentRow, 4, currentRow, 7);
  worksheet.getCell(currentRow, 4).value = 'Số tờ giấy thi .........';
  worksheet.getCell(currentRow, 4).font = { name: 'Times New Roman', size: 11 };

  currentRow++;

  worksheet.mergeCells(currentRow, 1, currentRow, 3);
  worksheet.getCell(currentRow, 1).value = 'Số sinh viên vắng mặt ............';
  worksheet.getCell(currentRow, 1).font = { name: 'Times New Roman', size: 11 };

  currentRow += 3;

  // ===== CHỮ KÝ =====
  // 3 Giám thị, mỗi người 3 cột (tổng 9 cột, còn 1 cột trống)
  ['Giám thị 1', 'Giám thị 2', 'Giám thị 3'].forEach((label, idx) => {
    const col = 1 + idx * 3;
    worksheet.mergeCells(currentRow, col, currentRow, col + 2);
    const cell = worksheet.getCell(currentRow, col);
    cell.value = label;
    cell.font = { name: 'Times New Roman', size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  currentRow++;

  ['(Họ tên và chữ ký)', '(Họ tên và chữ ký)', '(Họ tên và chữ ký)'].forEach((label, idx) => {
    const col = 1 + idx * 3;
    worksheet.mergeCells(currentRow, col, currentRow, col + 2);
    const cell = worksheet.getCell(currentRow, col);
    cell.value = label;
    cell.font = { name: 'Times New Roman', size: 11, italic: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  currentRow += 5;

  worksheet.mergeCells(currentRow, 1, currentRow, 2);
  worksheet.getCell(currentRow, 1).value = 'Ngày nộp ...../...../........';
  worksheet.getCell(currentRow, 1).font = { name: 'Times New Roman', size: 11 };

  worksheet.mergeCells(currentRow, 4, currentRow, 6);
  worksheet.getCell(currentRow, 4).value = 'Giáo vụ';
  worksheet.getCell(currentRow, 4).font = { name: 'Times New Roman', size: 11, bold: true };
  worksheet.getCell(currentRow, 4).alignment = { horizontal: 'center' };

  worksheet.mergeCells(currentRow, 8, currentRow, 10);
  worksheet.getCell(currentRow, 8).value = 'Trưởng khoa';
  worksheet.getCell(currentRow, 8).font = { name: 'Times New Roman', size: 11, bold: true };
  worksheet.getCell(currentRow, 8).alignment = { horizontal: 'center' };

  currentRow++;

  worksheet.mergeCells(currentRow, 4, currentRow, 6);
  worksheet.getCell(currentRow, 4).value = '(Họ tên và chữ ký)';
  worksheet.getCell(currentRow, 4).font = { name: 'Times New Roman', size: 11, italic: true };
  worksheet.getCell(currentRow, 4).alignment = { horizontal: 'center' };

  worksheet.mergeCells(currentRow, 8, currentRow, 10);
  worksheet.getCell(currentRow, 8).value = '(Họ tên và chữ ký)';
  worksheet.getCell(currentRow, 8).font = { name: 'Times New Roman', size: 11, italic: true };
  worksheet.getCell(currentRow, 8).alignment = { horizontal: 'center' };

  // ===== TẢI FILE =====
  const fileName = `DanhSachDuThi_GK_${maLHP || 'LHP'}.xlsx`;
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
 * Xuất danh sách sinh viên dự thi CUỐI KỲ ra file Excel (có thêm điểm quá trình + điểm GK)
 */
export async function exportDanhSachDuThiCK(sinhVienList, lopHocPhan, phong = '') {
  if (!sinhVienList || sinhVienList.length === 0 || !lopHocPhan) {
    throw new Error('Không có dữ liệu để xuất!');
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh sách dự thi CK');
  worksheet.views = [{ showGridLines: false }];

  const borderThin = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  let currentRow = 1;

  // ===== HEADER =====
  worksheet.mergeCells(currentRow, 1, currentRow, 9);
  const leftHeader = worksheet.getCell(currentRow, 1);
  leftHeader.value = 'BỘ CÔNG THƯƠNG\nTRƯỜNG ĐẠI HỌC PHƯƠNG NAM';
  leftHeader.font = { name: 'Times New Roman', size: 11, bold: true };
  leftHeader.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  worksheet.mergeCells(currentRow, 10, currentRow, 18);
  const rightHeader = worksheet.getCell(currentRow, 10);
  rightHeader.value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc';
  rightHeader.font = { name: 'Times New Roman', size: 11, bold: true };
  rightHeader.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  worksheet.getRow(currentRow).height = 30;

  currentRow += 2;

  // ===== TIÊU ĐỀ =====
  worksheet.mergeCells(currentRow, 1, currentRow, 18);
  const title = worksheet.getCell(currentRow, 1);
  title.value = 'DANH SÁCH SINH VIÊN DỰ THI CUỐI KỲ';
  title.font = { name: 'Times New Roman', size: 14, bold: true };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 20;

  currentRow += 2;

  // ===== THÔNG TIN =====
  const hk = lopHocPhan.hocKy || lopHocPhan.hoc_ky || '';
  const namHoc = lopHocPhan.namHoc || lopHocPhan.nam_hoc || '';
  const maLHP = lopHocPhan.maLopHocPhan || lopHocPhan.ma_lop_hoc_phan || '';
  const tenMon = lopHocPhan.tenHocPhan || lopHocPhan.ten_hoc_phan || '';
  const lopHoc = lopHocPhan.tenLop || lopHocPhan.ten_lop || '';
  const soTC = lopHocPhan.soTinChi || lopHocPhan.so_tin_chi || '03';

  const infoData = [
    ['Môn thi', tenMon, 'Lớp học phần', maLHP],
    ['Lớp học', lopHoc, 'Số TC', soTC],
    ['Ngày thi', '', 'Niên học', `${namHoc}`],
    ['Học kỳ', hk, 'Phòng', phong]
  ];

  infoData.forEach(row => {
    worksheet.getCell(currentRow, 1).value = row[0];
    worksheet.getCell(currentRow, 1).font = { name: 'Times New Roman', size: 11, bold: true };
    worksheet.getCell(currentRow, 1).alignment = { horizontal: 'left' };
    
    worksheet.mergeCells(currentRow, 2, currentRow, 9);
    worksheet.getCell(currentRow, 2).value = row[1];
    worksheet.getCell(currentRow, 2).font = { name: 'Times New Roman', size: 11, bold: true };
    worksheet.getCell(currentRow, 2).alignment = { horizontal: 'left' };

    worksheet.getCell(currentRow, 10).value = row[2];
    worksheet.getCell(currentRow, 10).font = { name: 'Times New Roman', size: 11, bold: true };
    worksheet.getCell(currentRow, 10).alignment = { horizontal: 'left' };

    worksheet.mergeCells(currentRow, 11, currentRow, 18);
    worksheet.getCell(currentRow, 11).value = row[3];
    worksheet.getCell(currentRow, 11).font = { name: 'Times New Roman', size: 11, bold: true };
    worksheet.getCell(currentRow, 11).alignment = { horizontal: 'left' };

    worksheet.getRow(currentRow).height = 20;
    currentRow++;
  });

  currentRow++;

  // ===== BẢNG SINH VIÊN (CÓ ĐẦY ĐỦ CÁC CỘT ĐIỂM THÀNH PHẦN) =====
  const columns = [
    { header: 'STT', width: 4 },
    { header: 'Mã số', width: 10 },
    { header: 'Họ đệm', width: 15 },
    { header: 'Tên', width: 8 },
    { header: 'Lớp học', width: 12 },
    { header: 'Số tờ', width: 6 },
    { header: 'Mã đề', width: 6 },
    { header: 'Ký tên', width: 12 },
    { header: 'TX1', width: 6 },
    { header: 'TX2', width: 6 },
    { header: 'TX3', width: 6 },
    { header: 'TX4', width: 6 },
    { header: 'TH1', width: 6 },
    { header: 'TH2', width: 6 },
    { header: 'TH3', width: 6 },
    { header: 'GK', width: 6 },
    { header: 'Điểm CK', width: 10 },
    { header: 'Ghi chú', width: 10 }
  ];

  worksheet.columns = columns.map(col => ({ width: col.width }));
  
  // Set lại width cho cột info label để không bị khuất (phải set sau khi set columns)
  worksheet.getColumn(1).width = 15;
  worksheet.getColumn(10).width = 15;

  const headerRow = worksheet.getRow(currentRow);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Times New Roman', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    cell.border = borderThin;
  });
  worksheet.getRow(currentRow).height = 30;
  currentRow++;

  // Data rows
  sinhVienList.forEach((sv, index) => {
    const hoTen = (sv.ho_ten || sv.hoTen || '').trim();
    const parts = hoTen.split(' ');
    const ten = parts.pop() || '';
    const hoDem = parts.join(' ');

    const rowData = [
      index + 1,
      sv.ma_sv || sv.maSV || '',
      hoDem,
      ten,
      sv.ten_lop || lopHoc || '',
      '', // Số tờ
      '', // Mã đề
      '', // Ký tên
      sv.diem_ly_thuyet_1 || '', // TX1
      sv.diem_ly_thuyet_2 || '', // TX2
      sv.diem_ly_thuyet_3 || '', // TX3
      sv.diem_ly_thuyet_4 || '', // TX4
      sv.diem_thuc_hanh_1 || '', // TH1
      sv.diem_thuc_hanh_2 || '', // TH2
      sv.diem_thuc_hanh_3 || '', // TH3
      sv.diem_giua_ky || '',     // GK
      '', // Điểm CK (GV điền tay)
      '' // Ghi chú
    ];

    const row = worksheet.getRow(currentRow);
    rowData.forEach((value, idx) => {
      const cell = row.getCell(idx + 1);
      cell.value = value;
      cell.font = { name: 'Times New Roman', size: 10 };
      cell.alignment = { horizontal: idx === 0 ? 'center' : 'left', vertical: 'middle' };
      cell.border = borderThin;
    });
    worksheet.getRow(currentRow).height = 18;
    currentRow++;
  });

  currentRow += 1;

  // ===== THỐNG KÊ =====
  worksheet.mergeCells(currentRow, 1, currentRow, 5);
  worksheet.getCell(currentRow, 1).value = `Tổng số\t\t${sinhVienList.length}`;
  worksheet.getCell(currentRow, 1).font = { name: 'Times New Roman', size: 11 };

  worksheet.mergeCells(currentRow, 6, currentRow, 12);
  worksheet.getCell(currentRow, 6).value = 'Số bài thi .........';
  worksheet.getCell(currentRow, 6).font = { name: 'Times New Roman', size: 11 };

  currentRow++;

  worksheet.mergeCells(currentRow, 1, currentRow, 5);
  worksheet.getCell(currentRow, 1).value = 'Số sinh viên có mặt ............';
  worksheet.getCell(currentRow, 1).font = { name: 'Times New Roman', size: 11 };

  worksheet.mergeCells(currentRow, 6, currentRow, 12);
  worksheet.getCell(currentRow, 6).value = 'Số tờ giấy thi .........';
  worksheet.getCell(currentRow, 6).font = { name: 'Times New Roman', size: 11 };

  currentRow++;

  worksheet.mergeCells(currentRow, 1, currentRow, 5);
  worksheet.getCell(currentRow, 1).value = 'Số sinh viên vắng mặt ............';
  worksheet.getCell(currentRow, 1).font = { name: 'Times New Roman', size: 11 };

  currentRow += 3;

  // ===== CHỮ KÝ =====
  ['Giám thị 1', 'Giám thị 2', 'Giám thị 3'].forEach((label, idx) => {
    const col = 1 + idx * 6;
    worksheet.mergeCells(currentRow, col, currentRow, col + 5);
    const cell = worksheet.getCell(currentRow, col);
    cell.value = label;
    cell.font = { name: 'Times New Roman', size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  currentRow++;

  ['(Họ tên và chữ ký)', '(Họ tên và chữ ký)', '(Họ tên và chữ ký)'].forEach((label, idx) => {
    const col = 1 + idx * 6;
    worksheet.mergeCells(currentRow, col, currentRow, col + 5);
    const cell = worksheet.getCell(currentRow, col);
    cell.value = label;
    cell.font = { name: 'Times New Roman', size: 11, italic: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  currentRow += 5;

  worksheet.mergeCells(currentRow, 1, currentRow, 3);
  worksheet.getCell(currentRow, 1).value = 'Ngày nộp ...../...../........';
  worksheet.getCell(currentRow, 1).font = { name: 'Times New Roman', size: 11 };

  worksheet.mergeCells(currentRow, 7, currentRow, 10);
  worksheet.getCell(currentRow, 7).value = 'Giáo vụ';
  worksheet.getCell(currentRow, 7).font = { name: 'Times New Roman', size: 11, bold: true };
  worksheet.getCell(currentRow, 7).alignment = { horizontal: 'center' };

  worksheet.mergeCells(currentRow, 14, currentRow, 18);
  worksheet.getCell(currentRow, 14).value = 'Trưởng khoa';
  worksheet.getCell(currentRow, 14).font = { name: 'Times New Roman', size: 11, bold: true };
  worksheet.getCell(currentRow, 14).alignment = { horizontal: 'center' };

  currentRow++;

  worksheet.mergeCells(currentRow, 7, currentRow, 10);
  worksheet.getCell(currentRow, 7).value = '(Họ tên và chữ ký)';
  worksheet.getCell(currentRow, 7).font = { name: 'Times New Roman', size: 11, italic: true };
  worksheet.getCell(currentRow, 7).alignment = { horizontal: 'center' };

  worksheet.mergeCells(currentRow, 14, currentRow, 18);
  worksheet.getCell(currentRow, 14).value = '(Họ tên và chữ ký)';
  worksheet.getCell(currentRow, 14).font = { name: 'Times New Roman', size: 11, italic: true };
  worksheet.getCell(currentRow, 14).alignment = { horizontal: 'center' };

  // ===== TẢI FILE =====
  const fileName = `DanhSachDuThi_CK_${maLHP || 'LHP'}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}
