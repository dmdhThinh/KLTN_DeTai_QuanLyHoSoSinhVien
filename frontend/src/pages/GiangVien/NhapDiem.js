import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import TeacherLayout from "../../components/TeacherLayout";
import ExcelJS from 'exceljs';

function NhapDiem() {
  const { lopHocPhanId } = useParams();
  const navigate = useNavigate();
  const [lopHocPhan, setLopHocPhan] = useState(null);
  const [sinhVienList, setSinhVienList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [trangThaiDot, setTrangThaiDot] = useState(null); // Trạng thái đợt nhập điểm từ DB
  const [showConfirm, setShowConfirm] = useState(false); // Modal xác nhận
  const [viewMode, setViewMode] = useState('input');
  const [showExportMenu, setShowExportMenu] = useState(false);
  // Load thông tin lớp học phần và danh sách sinh viên
  const loadData = async () => {
    if (!lopHocPhanId) return;
      setLoading(true);
      setMessage("");

      try {
        // Lấy thông tin lớp học phần
        const lhpData = await apiFetch(`/api/lophocphan/${lopHocPhanId}`);
        setLopHocPhan(lhpData);

        // Lấy trạng thái đợt nhập điểm
        const dotData = await apiFetch(`/api/dot-nhap-diem/trang-thai?hocKy=${lhpData.hocKy}&namHoc=${lhpData.namHoc}`);
        setTrangThaiDot(dotData?.trang_thai || 'CHUA_MO');

        // Lấy danh sách sinh viên đã đăng ký từ API mới
        const svData = await apiFetch(`/api/dkhp/lop-hoc-phan/${lopHocPhanId}`);
        
        if (Array.isArray(svData)) {
          // Lấy điểm hiện tại của từng sinh viên (API đã trả về camelCase)
          const hocPhanId = lhpData.hocPhanId;
          const hocKy = lhpData.hocKy;
          const namHoc = lhpData.namHoc;
          
          const sinhVienWithScores = await Promise.all(
            svData.map(async (sv) => {
              try {
                // Lấy điểm của sinh viên cho học phần này
                const ketQuaData = await apiFetch(`/api/ket-qua-hoc-tap/by-sinhvien?sinhVienId=${sv.sinh_vien_id}`);
                
                // Tìm điểm của học phần + học kỳ này (xử lý cả snake_case và camelCase)
                const existingScore = ketQuaData?.find(
                  kq => {
                    const matchHP = (kq.hoc_phan_id === hocPhanId || kq.hocPhanId === hocPhanId);
                    const matchHK = (kq.hoc_ky === hocKy || kq.hocKy === hocKy);
                    const matchNH = (kq.nam_hoc === namHoc || kq.namHoc === namHoc);
                    
                    return matchHP && matchHK && matchNH;
                  }
                );
                // Lưu giá trị gốc từ DB để kiểm tra sau
                const originalCK = existingScore?.diemCuoiKy || existingScore?.diem_cuoi_ky || '';
                return {
                  ...sv,
                  ketQuaId: existingScore?.id || null,
                  originalCK: originalCK, // Lưu giá trị CK gốc từ DB
                  // Backend trả về camelCase, cần map sang snake_case
                  diem_ly_thuyet_1: existingScore?.diemThuongXuyen1 || existingScore?.diem_ly_thuyet_1 || '',
                  diem_ly_thuyet_2: existingScore?.diemThuongXuyen2 || existingScore?.diem_ly_thuyet_2 || '',
                  diem_ly_thuyet_3: existingScore?.diemThuongXuyen3 || existingScore?.diem_ly_thuyet_3 || '',
                  diem_ly_thuyet_4: existingScore?.diemThuongXuyen4 || existingScore?.diem_ly_thuyet_4 || '',
                  diem_thuc_hanh_1: existingScore?.diemThucHanh1 || existingScore?.diem_thuc_hanh_1 || '',
                  diem_thuc_hanh_2: existingScore?.diemThucHanh2 || existingScore?.diem_thuc_hanh_2 || '',
                  diem_thuc_hanh_3: existingScore?.diemThucHanh3 || existingScore?.diem_thuc_hanh_3 || '',
                  diem_giua_ky: existingScore?.diemGiuaKy || existingScore?.diem_giua_ky || '',
                  diem_cuoi_ky: originalCK,
                  diem_tong_ket: existingScore?.diemTongKet || existingScore?.diem_tong_ket || '',
                  diem_chu: existingScore?.diemChu || existingScore?.diem_chu || '',
                  xep_loai: existingScore?.xepLoai || existingScore?.xep_loai || '',
                  dat: existingScore?.dat || existingScore?.dat || '',
                };
              } catch (err) {
                return {
                  ...sv,
                  ketQuaId: null,
                  originalCK: '',
                  diem_ly_thuyet_1: '',
                  diem_ly_thuyet_2: '',
                  diem_ly_thuyet_3: '',
                  diem_ly_thuyet_4: '',
                  diem_thuc_hanh_1: '',
                  diem_thuc_hanh_2: '',
                  diem_thuc_hanh_3: '',
                  diem_giua_ky: '',
                  diem_cuoi_ky: '',
                  diem_tong_ket: '',
                  diem_chu: '',
                  xep_loai: '',
                  dat: '',
                };
              }
            })
          );
          
          setSinhVienList(sinhVienWithScores);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setMessage(' Lỗi khi tải dữ liệu!');
      } finally {
        setLoading(false);
      }
  };

  // useEffect để gọi loadData khi component mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lopHocPhanId]);

  // Cập nhật điểm cho một sinh viên
  const handleScoreChange = (svIndex, field, value) => {
    const newList = [...sinhVienList];
    newList[svIndex][field] = value;
    setSinhVienList(newList);
  };

  // Kiểm tra xem cột nào được phép nhập (dựa vào trạng thái đợt từ DB)
  const isInputDisabled = (sv, field) => {
    // Nếu chưa có trạng thái đợt hoặc chưa mở → Khóa tất cả
    if (!trangThaiDot || trangThaiDot === 'CHUA_MO' || trangThaiDot === 'DA_KHOA') {
      return true;
    }

    // Đợt 1 đang mở → Cho nhập TX, TH, GK | KHÔNG cho nhập CK
    if (trangThaiDot === 'DOT_1_DANG_MO') {
      if (field === 'diem_cuoi_ky') return true; // KHÔNG cho nhập CK
      
      // Nếu đã lưu Đợt 1 (có ketQuaId) → Khóa tất cả TX, TH, GK
      if (sv.ketQuaId) {
        return true;
      }
      
      return false; // Cho nhập TX, TH, GK (chưa lưu lần đầu)
    }

    // Đợt 1 đã đóng → Khóa tất cả (chờ đợt 2)
    if (trangThaiDot === 'DOT_1_DA_DONG') {
      return true;
    }

    // Đợt 2 đang mở → Chỉ cho nhập CK | Khóa TX, TH, GK
    if (trangThaiDot === 'DOT_2_DANG_MO') {
      if (field === 'diem_cuoi_ky') {
        // Kiểm tra xem SV đã hoàn tất (có cả ketQuaId và CK đã được load từ DB)
        // Nếu đang nhập lần đầu thì sv.originalCK sẽ là rỗng
        const isSavedInDB = sv.ketQuaId && sv.originalCK !== '' && sv.originalCK !== null && sv.originalCK !== undefined;
        if (isSavedInDB) return true; // Đã lưu CK rồi → khóa
        // Chưa lưu → Cho nhập
        return false;
      }
      
      // TX, TH, GK: Nếu đã có bản ghi → Khóa
      if (sv.ketQuaId) return true;
      
      // Nếu chưa có bản ghi → Cho nhập (sinh viên đăng ký muộn)
      return false;
    }

    return true;
  };

  // Helper: Kiểm tra sinh viên đã hoàn tất chưa
  const getDotNhap = (sv) => {
    // Sử dụng originalCK (giá trị từ DB) thay vì diem_cuoi_ky (có thể đang sửa)
    const hasCK = sv.originalCK !== '' && sv.originalCK !== null && sv.originalCK !== undefined;
    const hasSavedRecord = sv.ketQuaId !== null && sv.ketQuaId !== undefined;

    if (hasCK && hasSavedRecord) return 'HOAN_TAT';
    if (hasSavedRecord && !hasCK) return 'DOT_2';
    return 'DOT_1';
  };

  // Kiểm tra đã hoàn tất chưa
  const isFullyLocked = (sv) => {
    return getDotNhap(sv) === 'HOAN_TAT';
  };

  // Hiện modal xác nhận
  const confirmSaveAll = () => {
    if (!lopHocPhan) return;
    setShowConfirm(true);
  };

  // Lưu điểm tất cả sinh viên (sau khi confirm)
  const handleSaveAll = async () => {
    setShowConfirm(false);
    setSaving(true);
    setMessage("");
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    try {
      for (const sv of sinhVienList) {
        
        // Skip nếu sinh viên không có dữ liệu gì để lưu
        const hasAnyData = sv.diem_ly_thuyet_1 || sv.diem_ly_thuyet_2 || sv.diem_ly_thuyet_3 || 
                          sv.diem_ly_thuyet_4 || sv.diem_thuc_hanh_1 || sv.diem_thuc_hanh_2 || 
                          sv.diem_thuc_hanh_3 || sv.diem_giua_ky || sv.diem_cuoi_ky;
        if (!hasAnyData) {
          skippedCount++;
          continue;
        }
        
        // Logic: Nếu đang đợt 2 VÀ đã có điểm từ đợt 1 → CHỈ cập nhật CK
        const isDot2AndHasRecord = trangThaiDot === 'DOT_2_DANG_MO' && sv.ketQuaId;
        
        let scoreData = {
          sinh_vien_id: sv.sinh_vien_id,
          hoc_phan_id: lopHocPhan.hocPhanId,
          hoc_ky: lopHocPhan.hocKy,
          nam_hoc: lopHocPhan.namHoc,
        };
        
        if (isDot2AndHasRecord) {
          // Đợt 2: CHỈ gửi điểm cuối kỳ (nếu có)
          if (sv.diem_cuoi_ky) {
            scoreData.diem_cuoi_ky = sv.diem_cuoi_ky;
          }
        } else {
          // Đợt 1 hoặc tạo mới: gửi đầy đủ (chỉ field có giá trị)
          if (sv.diem_ly_thuyet_1) scoreData.diem_ly_thuyet_1 = sv.diem_ly_thuyet_1;
          if (sv.diem_ly_thuyet_2) scoreData.diem_ly_thuyet_2 = sv.diem_ly_thuyet_2;
          if (sv.diem_ly_thuyet_3) scoreData.diem_ly_thuyet_3 = sv.diem_ly_thuyet_3;
          if (sv.diem_ly_thuyet_4) scoreData.diem_ly_thuyet_4 = sv.diem_ly_thuyet_4;
          if (sv.diem_thuc_hanh_1) scoreData.diem_thuc_hanh_1 = sv.diem_thuc_hanh_1;
          if (sv.diem_thuc_hanh_2) scoreData.diem_thuc_hanh_2 = sv.diem_thuc_hanh_2;
          if (sv.diem_thuc_hanh_3) scoreData.diem_thuc_hanh_3 = sv.diem_thuc_hanh_3;
          if (sv.diem_giua_ky) scoreData.diem_giua_ky = sv.diem_giua_ky;
          if (sv.diem_cuoi_ky) scoreData.diem_cuoi_ky = sv.diem_cuoi_ky;
        }

        try {
          // Luôn dùng UPSERT (POST) - backend tự xử lý
          await apiFetch('/api/ket-qua-hoc-tap', {
            method: 'POST',
            body: JSON.stringify(scoreData),
          });
          successCount++;
        } catch (err) {
          console.error(` Lỗi lưu điểm cho SV ${sv.ma_sv}:`, err);
          errorCount++;
        }
      }

      setMessage(`✅ Đã lưu thành công ${successCount} sinh viên${errorCount > 0 ? `, ${errorCount} lỗi` : ''}!`);
      
      // Reload để cập nhật ketQuaId và điểm tính toán
      await loadData();
      
    } catch (err) {
      setMessage(' Có lỗi xảy ra khi lưu điểm!');
      console.error('Error in handleSaveAll:', err);
    } finally {
      setSaving(false);
    }
  };

  // Xuất bảng điểm ra Excel với nhiều loại (LT, TH, LT+TH+GK, tổng kết)
  const exportBangDiem = async (loaiBang) => {
    if (!sinhVienList || sinhVienList.length === 0 || !lopHocPhan) {
      setMessage('⚠️ Không có dữ liệu để xuất!');
      return;
    }

    if (!loaiBang) {
      setMessage('⚠️ Vui lòng chọn loại bảng điểm để xuất!');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bảng điểm');
    worksheet.views = [{ showGridLines: false }];

    let titleSuffix = '';
    let columns = [];

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
        // Bảng điểm tổng kết: hiển thị đầy đủ tất cả cột thành phần
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
        setMessage('⚠️ Loại bảng điểm không hợp lệ!');
        return;
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
    left2.value = 'TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM';
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
      row.height = 18; // cao hơn chút để không bị khuất chữ

      // Nhãn: gộp cột 1-2 để chữ không bị thiếu
      worksheet.mergeCells(currentRow, 1, currentRow, 2);
      const labelCell = worksheet.getCell(currentRow, 1);
      labelCell.value = info[0];
      labelCell.font = { name: 'Times New Roman', size: 11, bold: true };
      labelCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

      // Giá trị: gộp từ cột 3 đến hết, đủ rộng cho cả chuỗi dài
      worksheet.mergeCells(currentRow, 3, currentRow, totalCols);
      const valueCell = worksheet.getCell(currentRow, 3);
      valueCell.value = info[1];
      valueCell.font = { name: 'Times New Roman', size: 11, bold: true };
      valueCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

      currentRow++;
    });

    currentRow++; // dòng trống trước bảng

    // ===== Header bảng điểm =====
    // Chỉ set độ rộng cột, KHÔNG set header để tránh ExcelJS tự tạo dòng header ở dòng 1
    worksheet.columns = columns.map(col => ({
      width: col.width
    }));

    const tableStartRow = currentRow; // dùng cho tô xám bên phải
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

    // ===== Tô xám vùng ngoài form (dưới và bên phải) giống file điểm danh =====
    const tableEndRow = currentRow - 1;               // dòng dữ liệu cuối cùng
    const tableEndCol = columns.length;               // cột cuối cùng của bảng
    const extraRows = 40;                             // số dòng xám thêm bên dưới
    const extraCols = 5;                              // số cột xám thêm bên phải
    const grayFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD0D0D0' } };

    // Dưới cùng: từ dòng ngay sau SV cuối đến vài dòng phía dưới
    for (let r = tableEndRow + 1; r <= tableEndRow + extraRows; r++) {
      for (let c = 1; c <= tableEndCol; c++) {
        const cell = worksheet.getCell(r, c);
        cell.fill = grayFill;
      }
    }

    // Bên phải: từ cột sau cột cuối cùng, phủ xám theo chiều dọc (từ hàng 1 trở xuống)
    for (let r = 1; r <= tableEndRow + extraRows; r++) {
      for (let c = tableEndCol + 1; c <= tableEndCol + extraCols; c++) {
        const cell = worksheet.getCell(r, c);
        cell.fill = grayFill;
      }
    }

    const fileTypeLabel =
      loaiBang === 'lythuyet' ? 'LyThuyet' :
      loaiBang === 'thuchanh' ? 'ThucHanh' :
      loaiBang === 'lt_th_gk' ? 'LT_TH_GK' :
      'TongKet';

    const fileName = `BangDiem_${fileTypeLabel}_${lopHocPhan.maLopHocPhan || lopHocPhan.ma_lop_hoc_phan || 'LopHocPhan'}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <TeacherLayout>
      <div className="container-fluid mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-3">
            <h3 className="mb-0"> Quản lý điểm</h3>
            
            {/* Tab chuyển đổi */}
            <div className="btn-group" role="group">
              <button
                className={`btn ${viewMode === 'input' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('input')}
              >
                 Nhập điểm
              </button>
              <button
                className={`btn ${viewMode === 'view' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('view')}
              >
                 Xem điểm
              </button>
            </div>
          </div>
          
          <button className="btn btn-outline-secondary" onClick={() => navigate('/teacher/lophocphan')}>
            ← Quay lại danh sách lớp
          </button>
        </div>

        {lopHocPhan && (
          <>
            <div className="alert alert-info mb-2">
              <strong>Lớp học phần:</strong> {lopHocPhan.tenHocPhan} - {lopHocPhan.maLopHocPhan} 
              <span className="ms-3">
                <strong>Học kỳ:</strong> {lopHocPhan.hocKy} {lopHocPhan.namHoc}
              </span>
              <span className="ms-3">
                <strong>Giảng viên:</strong> {lopHocPhan.tenGiangVien}
              </span>
            </div>
            
            {/* Thông báo trạng thái đợt */}
            {trangThaiDot === 'CHUA_MO' && (
              <div className="alert alert-warning">
                ⏸ <strong>Đợt nhập điểm chưa mở.</strong> Vui lòng chờ phòng Đào tạo mở đợt nhập điểm.
              </div>
            )}
            {trangThaiDot === 'DOT_1_DANG_MO' && (
              <div className="alert alert-success">
                 <strong>Đợt 1 đang mở:</strong> Nhập điểm TX1-4, TH1-3, GK (KHÔNG nhập CK)
              </div>
            )}
            {trangThaiDot === 'DOT_1_DA_DONG' && (
              <div className="alert alert-secondary">
                 <strong>Đợt 1 đã đóng.</strong> Chờ mở đợt 2 để nhập điểm cuối kỳ.
              </div>
            )}
            {trangThaiDot === 'DOT_2_DANG_MO' && (
              <div className="alert alert-success">
                 <strong>Đợt 2 đang mở:</strong> Chỉ nhập điểm Cuối kỳ (TX, TH, GK đã khóa)
              </div>
            )}
            {trangThaiDot === 'DA_KHOA' && (
              <div className="alert alert-danger">
                 <strong>Đã khóa điểm.</strong> Không thể nhập/sửa điểm nữa.
              </div>
            )}
          </>
        )}

        <div className="card shadow-sm p-3">
          {message && (
            <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}

          {loading && (
            <p className="text-center text-muted py-5"> Đang tải danh sách sinh viên...</p>
          )}

          {!loading && sinhVienList.length > 0 && viewMode === 'input' && (
            <>
              <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="table table-bordered table-hover table-sm">
                  <thead className="table-primary" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={{ minWidth: '50px' }}>STT</th>
                      <th style={{ minWidth: '100px' }}>Mã SV</th>
                      <th style={{ minWidth: '150px' }}>Họ và tên</th>
                      <th style={{ minWidth: '70px' }}>TX1</th>
                      <th style={{ minWidth: '70px' }}>TX2</th>
                      <th style={{ minWidth: '70px' }}>TX3</th>
                      <th style={{ minWidth: '70px' }}>TX4</th>
                      <th style={{ minWidth: '70px' }}>TH1</th>
                      <th style={{ minWidth: '70px' }}>TH2</th>
                      <th style={{ minWidth: '70px' }}>TH3</th>
                      <th style={{ minWidth: '80px' }}>Giữa kỳ</th>
                      <th style={{ minWidth: '80px' }}>Cuối kỳ</th>
                      <th style={{ minWidth: '90px' }}>Tổng kết</th>
                      <th style={{ minWidth: '70px' }}>Chữ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sinhVienList.map((sv, index) => (
                      <tr key={sv.sinh_vien_id} style={{ backgroundColor: isFullyLocked(sv) ? '#f0f0f0' : 'transparent' }}>
                        <td className="text-center">{index + 1}</td>
                        <td>{sv.ma_sv}</td>
                        <td>{sv.ho_ten}</td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-control form-control-sm"
                            value={sv.diem_ly_thuyet_1}
                            onChange={(e) => handleScoreChange(index, 'diem_ly_thuyet_1', e.target.value)}
                            disabled={isInputDisabled(sv, 'diem_ly_thuyet_1')}
                            style={{ backgroundColor: isInputDisabled(sv, 'diem_ly_thuyet_1') ? '#e9ecef' : 'white' }}
                            title={isInputDisabled(sv, 'diem_ly_thuyet_1') ? ' Đã khóa' : ''}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-control form-control-sm"
                            value={sv.diem_ly_thuyet_2}
                            onChange={(e) => handleScoreChange(index, 'diem_ly_thuyet_2', e.target.value)}
                            disabled={isInputDisabled(sv, 'diem_ly_thuyet_2')}
                            style={{ backgroundColor: isInputDisabled(sv, 'diem_ly_thuyet_2') ? '#e9ecef' : 'white' }}
                            title={isInputDisabled(sv, 'diem_ly_thuyet_2') ? ' Đã khóa' : ''}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-control form-control-sm"
                            value={sv.diem_ly_thuyet_3}
                            onChange={(e) => handleScoreChange(index, 'diem_ly_thuyet_3', e.target.value)}
                            disabled={isInputDisabled(sv, 'diem_ly_thuyet_3')}
                            style={{ backgroundColor: isInputDisabled(sv, 'diem_ly_thuyet_3') ? '#e9ecef' : 'white' }}
                            title={isInputDisabled(sv, 'diem_ly_thuyet_3') ? ' Đã khóa' : ''}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-control form-control-sm"
                            value={sv.diem_ly_thuyet_4}
                            onChange={(e) => handleScoreChange(index, 'diem_ly_thuyet_4', e.target.value)}
                            disabled={isInputDisabled(sv, 'diem_ly_thuyet_4')}
                            style={{ backgroundColor: isInputDisabled(sv, 'diem_ly_thuyet_4') ? '#e9ecef' : 'white' }}
                            title={isInputDisabled(sv, 'diem_ly_thuyet_4') ? ' Đã khóa' : ''}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-control form-control-sm"
                            value={sv.diem_thuc_hanh_1}
                            onChange={(e) => handleScoreChange(index, 'diem_thuc_hanh_1', e.target.value)}
                            disabled={isInputDisabled(sv, 'diem_thuc_hanh_1')}
                            style={{ backgroundColor: isInputDisabled(sv, 'diem_thuc_hanh_1') ? '#e9ecef' : 'white' }}
                            title={isInputDisabled(sv, 'diem_thuc_hanh_1') ? ' Đã khóa' : ''}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-control form-control-sm"
                            value={sv.diem_thuc_hanh_2}
                            onChange={(e) => handleScoreChange(index, 'diem_thuc_hanh_2', e.target.value)}
                            disabled={isInputDisabled(sv, 'diem_thuc_hanh_2')}
                            style={{ backgroundColor: isInputDisabled(sv, 'diem_thuc_hanh_2') ? '#e9ecef' : 'white' }}
                            title={isInputDisabled(sv, 'diem_thuc_hanh_2') ? ' Đã khóa' : ''}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-control form-control-sm"
                            value={sv.diem_thuc_hanh_3}
                            onChange={(e) => handleScoreChange(index, 'diem_thuc_hanh_3', e.target.value)}
                            disabled={isInputDisabled(sv, 'diem_thuc_hanh_3')}
                            style={{ backgroundColor: isInputDisabled(sv, 'diem_thuc_hanh_3') ? '#e9ecef' : 'white' }}
                            title={isInputDisabled(sv, 'diem_thuc_hanh_3') ? ' Đã khóa' : ''}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-control form-control-sm"
                            value={sv.diem_giua_ky}
                            onChange={(e) => handleScoreChange(index, 'diem_giua_ky', e.target.value)}
                            disabled={isInputDisabled(sv, 'diem_giua_ky')}
                            style={{ backgroundColor: isInputDisabled(sv, 'diem_giua_ky') ? '#e9ecef' : 'white' }}
                            title={isInputDisabled(sv, 'diem_giua_ky') ? ' Đã khóa' : ''}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-control form-control-sm"
                            value={sv.diem_cuoi_ky}
                            onChange={(e) => handleScoreChange(index, 'diem_cuoi_ky', e.target.value)}
                            disabled={isInputDisabled(sv, 'diem_cuoi_ky')}
                            style={{ backgroundColor: isInputDisabled(sv, 'diem_cuoi_ky') ? '#e9ecef' : getDotNhap(sv) === 'DOT_1' ? '#fff3cd' : 'white', borderColor: isInputDisabled(sv, 'diem_cuoi_ky') ? '#28a745' : getDotNhap(sv) === 'DOT_2' ? '#ffc107' : '#ced4da' }}
                            title={isInputDisabled(sv, 'diem_cuoi_ky') ? ' Đã lưu điểm' : getDotNhap(sv) === 'DOT_2' ? '⚡ Đợt 2: Chỉ nhập CK' : '⏳ Đợt 1: Chưa được nhập CK'}
                          />
                        </td>
                        <td className="text-center fw-bold">{sv.diem_tong_ket || '-'}</td>
                        <td className="text-center fw-bold">{sv.diem_chu || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 d-flex justify-content-between align-items-center">
                <div className="small mb-0">
                  <p className="mb-2"><strong> Hướng dẫn nhập điểm:</strong></p>
                  <div className="d-flex gap-4">
                    <div>
                      <span className="badge bg-primary">Đợt 1</span>
                      <p className="mb-0 mt-1 text-muted">Nhập TX1-4, TH1-3, GK<br/> KHÔNG nhập CK (ô màu vàng)</p>
                    </div>
                    <div>
                      <span className="badge bg-warning text-dark">Đợt 2</span>
                      <p className="mb-0 mt-1 text-muted">Chỉ nhập CK (ô viền vàng)<br/> TX, TH, GK đã khóa</p>
                    </div>
                    <div>
                      <span className="badge bg-success">Hoàn tất</span>
                      <p className="mb-0 mt-1 text-muted">Đã nhập đủ 2 đợt<br/> Tất cả đã khóa</p>
                    </div>
                  </div>
                  <p className="mb-0 mt-2 text-danger"><strong> Không thể sửa điểm sau khi lưu!</strong></p>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-success" 
                    onClick={confirmSaveAll}
                    disabled={saving}
                  >
                    {saving ? ' Đang lưu...' : ' Lưu tất cả điểm'}
                  </button>
                  
                </div>
              </div>
            </>
          )}

          {/* Chế độ xem điểm (read-only) */}
          {!loading && sinhVienList.length > 0 && viewMode === 'view' && (
            <>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1"> Bảng điểm tổng hợp</h5>
                  <p className="text-muted small mb-0">
                    Hiển thị tất cả điểm đã nhập. Chỉ để xem, không chỉnh sửa.
                  </p>
                </div>
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-primary dropdown-toggle"
                    onClick={() => setShowExportMenu(prev => !prev)}
                    disabled={sinhVienList.length === 0}
                  >
                    Xuất Excel bảng điểm
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
                        onClick={() => { setShowExportMenu(false); exportBangDiem('lythuyet'); }}
                      >
                        Bảng điểm lý thuyết
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => { setShowExportMenu(false); exportBangDiem('thuchanh'); }}
                      >
                        Bảng điểm thực hành
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => { setShowExportMenu(false); exportBangDiem('lt_th_gk'); }}
                      >
                        Bảng điểm LT + TH + GK
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => { setShowExportMenu(false); exportBangDiem('tongket'); }}
                      >
                        Bảng điểm tổng kết
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="table table-bordered table-striped table-sm">
                  <thead className="table-dark" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th>STT</th>
                      <th>Mã SV</th>
                      <th>Họ và tên</th>
                      <th>TX1</th>
                      <th>TX2</th>
                      <th>TX3</th>
                      <th>TX4</th>
                      <th>TH1</th>
                      <th>TH2</th>
                      <th>TH3</th>
                      <th>GK</th>
                      <th>CK</th>
                      <th>TK</th>
                      <th>Chữ</th>
                      <th>Xếp loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sinhVienList.map((sv, index) => (
                      <tr key={sv.sinh_vien_id}>
                        <td className="text-center">{index + 1}</td>
                        <td><strong>{sv.ma_sv}</strong></td>
                        <td>{sv.ho_ten}</td>
                        <td className="text-center">{sv.diem_ly_thuyet_1 || '-'}</td>
                        <td className="text-center">{sv.diem_ly_thuyet_2 || '-'}</td>
                        <td className="text-center">{sv.diem_ly_thuyet_3 || '-'}</td>
                        <td className="text-center">{sv.diem_ly_thuyet_4 || '-'}</td>
                        <td className="text-center">{sv.diem_thuc_hanh_1 || '-'}</td>
                        <td className="text-center">{sv.diem_thuc_hanh_2 || '-'}</td>
                        <td className="text-center">{sv.diem_thuc_hanh_3 || '-'}</td>
                        <td className="text-center">{sv.diem_giua_ky || '-'}</td>
                        <td className="text-center">{sv.diem_cuoi_ky || '-'}</td>
                        <td className="text-center">
                          <strong className={sv.diem_tong_ket ? 'text-primary' : 'text-muted'}>
                            {sv.diem_tong_ket || '-'}
                          </strong>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${
                            sv.diem_chu === 'A' ? 'bg-success' :
                            sv.diem_chu === 'B+' || sv.diem_chu === 'B' ? 'bg-primary' :
                            sv.diem_chu === 'C+' || sv.diem_chu === 'C' ? 'bg-info' :
                            sv.diem_chu === 'D+' || sv.diem_chu === 'D' ? 'bg-warning text-dark' :
                            sv.diem_chu === 'F' ? 'bg-danger' : 'bg-secondary'
                          }`}>
                            {sv.diem_chu || '-'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${
                            sv.xep_loai === 'Xuất sắc' ? 'bg-success' :
                            sv.xep_loai === 'Giỏi' ? 'bg-primary' :
                            sv.xep_loai === 'Khá' ? 'bg-info' :
                            sv.xep_loai === 'Trung bình' ? 'bg-warning text-dark' :
                            sv.xep_loai === 'Yếu' ? 'bg-danger' : 'bg-secondary'
                          }`}>
                            {sv.xep_loai || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Thống kê */}
              <div className="mt-4 p-3 bg-light rounded">
                <div className="row">
                  <div className="col-md-3">
                    <strong>Tổng sinh viên:</strong> {sinhVienList.length}
                  </div>
                  <div className="col-md-3">
                    <strong>Đã nhập đủ điểm:</strong> {sinhVienList.filter(sv => sv.diem_cuoi_ky).length}
                  </div>
                  <div className="col-md-3">
                    <strong className="text-success">Đạt:</strong> <span className="text-success fw-bold">{sinhVienList.filter(sv => sv.dat === 'Đạt').length}</span>
                  </div>
                  <div className="col-md-3">
                    <strong className="text-danger">Không đạt:</strong> <span className="text-danger fw-bold">{sinhVienList.filter(sv => sv.dat === 'Không đạt').length}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {!loading && sinhVienList.length === 0 && lopHocPhan && (
            <p className="text-center text-muted py-5">Không có sinh viên nào đăng ký lớp học phần này.</p>
          )}
        </div>
      </div>
      {/* Modal xác nhận lưu điểm */}
      {showConfirm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">⚠️ Xác nhận lưu điểm</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-2"><strong>Bạn có chắc chắn muốn lưu tất cả điểm?</strong></p>
                <p className="text-muted mb-0">
                  <small>⚠️ Hành động này sẽ cập nhật điểm cho tất cả sinh viên có dữ liệu. Điểm đã lưu sẽ không thể sửa lại!</small>
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                  Hủy
                </button>
                <button className="btn btn-success" onClick={handleSaveAll}>
                  <i className="bi bi-check-circle me-1"></i> Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default NhapDiem;
