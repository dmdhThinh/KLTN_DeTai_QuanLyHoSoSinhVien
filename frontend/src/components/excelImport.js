import ExcelJS from 'exceljs';

/**
 * Tạo và tải xuống template Excel để nhập điểm
 * @param {Array} sinhVienList - Danh sách sinh viên trong lớp
 * @param {Object} lopHocPhan - Thông tin lớp học phần
 */
export async function downloadDiemTemplate(sinhVienList, lopHocPhan) {
  if (!sinhVienList || sinhVienList.length === 0 || !lopHocPhan) {
    throw new Error('Không có dữ liệu để tạo template!');
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Nhập điểm');

  // Style cho header
  const headerStyle = {
    font: { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  const borderThin = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  // Header row
  const headers = [
    'STT',
    'Mã SV',
    'Họ và tên',
    'TX1',
    'TX2',
    'TX3',
    'TX4',
    'TH1',
    'TH2',
    'TH3',
    'Giữa kỳ',
    'Cuối kỳ'
  ];

  // Set header
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(1, index + 1);
    cell.value = header;
    cell.style = headerStyle;
  });

  worksheet.getRow(1).height = 30;

  // Set column widths
  worksheet.getColumn(1).width = 8;  // STT
  worksheet.getColumn(2).width = 15; // Mã SV
  worksheet.getColumn(3).width = 30; // Họ và tên
  worksheet.getColumn(4).width = 10; // TX1
  worksheet.getColumn(5).width = 10; // TX2
  worksheet.getColumn(6).width = 10; // TX3
  worksheet.getColumn(7).width = 10; // TX4
  worksheet.getColumn(8).width = 10; // TH1
  worksheet.getColumn(9).width = 10; // TH2
  worksheet.getColumn(10).width = 10; // TH3
  worksheet.getColumn(11).width = 12; // Giữa kỳ
  worksheet.getColumn(12).width = 12; // Cuối kỳ

  // Data rows
  sinhVienList.forEach((sv, index) => {
    const row = worksheet.getRow(index + 2);
    
    row.getCell(1).value = index + 1; // STT
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(1).border = borderThin;
    
    row.getCell(2).value = sv.ma_sv || ''; // Mã SV
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).border = borderThin;
    row.getCell(2).protection = { locked: true }; // Khóa cột Mã SV
    
    row.getCell(3).value = sv.ho_ten || ''; // Họ và tên
    row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(3).border = borderThin;
    row.getCell(3).protection = { locked: true }; // Khóa cột Họ tên

    // Các cột điểm (có thể nhập)
    const diemColumns = [
      { col: 4, field: 'diem_ly_thuyet_1' },
      { col: 5, field: 'diem_ly_thuyet_2' },
      { col: 6, field: 'diem_ly_thuyet_3' },
      { col: 7, field: 'diem_ly_thuyet_4' },
      { col: 8, field: 'diem_thuc_hanh_1' },
      { col: 9, field: 'diem_thuc_hanh_2' },
      { col: 10, field: 'diem_thuc_hanh_3' },
      { col: 11, field: 'diem_giua_ky' },
      { col: 12, field: 'diem_cuoi_ky' }
    ];

    diemColumns.forEach(({ col, field }) => {
      const cell = row.getCell(col);
      // Hiển thị điểm hiện tại nếu có
      const currentValue = sv[field] || '';
      cell.value = currentValue !== '' && currentValue !== null ? Number(currentValue) : '';
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = borderThin;
      cell.numFmt = '0.0'; // Format số với 1 chữ số thập phân
      
      // Data validation: chỉ cho phép nhập số từ 0 đến 10
      cell.dataValidation = {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 10],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Giá trị không hợp lệ',
        error: 'Điểm phải từ 0 đến 10'
      };
    });

    row.height = 25;
  });

  // Protect worksheet nhưng cho phép chỉnh sửa các ô điểm
  worksheet.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    sort: false,
    autoFilter: false,
    pivotTables: false,
    editObjects: false,
    editScenarios: false
  });

  // Unlock các ô điểm để có thể nhập
  for (let row = 2; row <= sinhVienList.length + 1; row++) {
    for (let col = 4; col <= 12; col++) {
      worksheet.getCell(row, col).protection = { locked: false };
    }
  }

  // Thêm sheet hướng dẫn
  const instructionSheet = workbook.addWorksheet('Hướng dẫn');
  instructionSheet.getColumn(1).width = 100;
  
  const instructions = [
    'HƯỚNG DẪN NHẬP ĐIỂM',
    '',
    '1. Chỉ được nhập điểm vào các cột: TX1, TX2, TX3, TX4, TH1, TH2, TH3, Giữa kỳ, Cuối kỳ',
    '2. Điểm phải từ 0 đến 10 (có thể nhập số thập phân, ví dụ: 7.5)',
    '3. Cột "Mã SV" và "Họ và tên" đã được khóa, không thể chỉnh sửa',
    '4. Sau khi nhập xong, lưu file và import lại vào hệ thống',
    '5. Điểm sẽ được hiển thị trên màn hình trước khi lưu vào database',
    '',
    'Lưu ý:',
    '- Nếu để trống, điểm sẽ không được cập nhật',
    '- Chỉ cập nhật các ô có giá trị',
    '- File này chỉ dùng để nhập điểm, không thay đổi cấu trúc file'
  ];

  instructions.forEach((text, index) => {
    const cell = instructionSheet.getCell(index + 1, 1);
    cell.value = text;
    if (index === 0) {
      cell.font = { name: 'Times New Roman', size: 14, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      cell.font = { name: 'Times New Roman', size: 11 };
      cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    }
  });

  // Tạo file và tải xuống
  const maLHP = lopHocPhan.maLopHocPhan || lopHocPhan.ma_lop_hoc_phan || 'LopHocPhan';
  const fileName = `Template_NhapDiem_${maLHP}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Đọc file Excel và trả về dữ liệu điểm
 * @param {File} file - File Excel được chọn
 * @param {Array} sinhVienList - Danh sách sinh viên hiện tại (để match theo Mã SV)
 * @returns {Promise<Array>} - Mảng các object chứa điểm đã import
 */
export async function importDiemFromExcel(file, sinhVienList) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const buffer = e.target.result;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        // Lấy sheet đầu tiên
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
          reject(new Error('File Excel không có dữ liệu!'));
          return;
        }

        // Tạo map Mã SV -> Sinh viên để match nhanh
        const svMap = new Map();
        sinhVienList.forEach(sv => {
          svMap.set(sv.ma_sv, sv);
        });

        const importedData = [];
        const errors = [];

        // Bỏ qua dòng header (dòng 1), bắt đầu từ dòng 2
        for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
          const row = worksheet.getRow(rowNum);
          
          // Lấy Mã SV
          const maSV = row.getCell(2).value;
          if (!maSV) {
            // Nếu không có Mã SV, bỏ qua dòng này
            continue;
          }

          const maSVStr = String(maSV).trim();
          const sv = svMap.get(maSVStr);

          if (!sv) {
            errors.push(`Dòng ${rowNum}: Không tìm thấy sinh viên với Mã SV "${maSVStr}"`);
            continue;
          }

          // Lấy các điểm
          const diemData = {
            sinh_vien_id: sv.sinh_vien_id,
            ma_sv: maSVStr,
            ho_ten: sv.ho_ten,
            diem_ly_thuyet_1: parseDiem(row.getCell(4).value),
            diem_ly_thuyet_2: parseDiem(row.getCell(5).value),
            diem_ly_thuyet_3: parseDiem(row.getCell(6).value),
            diem_ly_thuyet_4: parseDiem(row.getCell(7).value),
            diem_thuc_hanh_1: parseDiem(row.getCell(8).value),
            diem_thuc_hanh_2: parseDiem(row.getCell(9).value),
            diem_thuc_hanh_3: parseDiem(row.getCell(10).value),
            diem_giua_ky: parseDiem(row.getCell(11).value),
            diem_cuoi_ky: parseDiem(row.getCell(12).value)
          };

          // Validate điểm
          const validationErrors = validateDiem(diemData, rowNum);
          if (validationErrors.length > 0) {
            errors.push(...validationErrors);
            continue;
          }

          importedData.push(diemData);
        }

        if (errors.length > 0 && importedData.length === 0) {
          reject(new Error(`Không thể import dữ liệu:\n${errors.join('\n')}`));
          return;
        }

        resolve({
          data: importedData,
          errors: errors
        });
      } catch (error) {
        reject(new Error(`Lỗi đọc file Excel: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Lỗi đọc file!'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse giá trị điểm từ Excel
 * @param {*} value - Giá trị từ cell
 * @returns {String|Number|null} - Điểm đã parse hoặc null nếu rỗng
 */
function parseDiem(value) {
  // Cho phép cả điểm 0 (điểm 0 là hợp lệ)
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // Convert sang number (bao gồm cả 0)
  const num = Number(value);
  if (isNaN(num)) {
    return null;
  }
  
  // Trả về số (bao gồm cả 0)
  return num;
}

/**
 * Validate điểm có trong khoảng 0-10
 * @param {Object} diemData - Object chứa các điểm
 * @param {Number} rowNum - Số dòng trong Excel
 * @returns {Array} - Mảng các lỗi (nếu có)
 */
function validateDiem(diemData, rowNum) {
  const errors = [];
  const diemFields = [
    'diem_ly_thuyet_1', 'diem_ly_thuyet_2', 'diem_ly_thuyet_3', 'diem_ly_thuyet_4',
    'diem_thuc_hanh_1', 'diem_thuc_hanh_2', 'diem_thuc_hanh_3',
    'diem_giua_ky', 'diem_cuoi_ky'
  ];

  diemFields.forEach(field => {
    const value = diemData[field];
    // Cho phép cả điểm 0 (điểm 0 là hợp lệ)
    // Chỉ validate nếu có giá trị (không phải null, undefined, hoặc rỗng)
    if (value !== null && value !== undefined && value !== '') {
      const num = Number(value);
      // Validate: 0 <= num <= 10 (cho phép cả 0)
      if (isNaN(num) || num < 0 || num > 10) {
        const fieldName = field.replace('diem_', '').replace(/_/g, ' ').toUpperCase();
        errors.push(`Dòng ${rowNum} (${diemData.ma_sv}): ${fieldName} = ${value} không hợp lệ (phải từ 0 đến 10)`);
      }
    }
  });

  return errors;
}

