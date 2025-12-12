import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import TeacherLayout from "../../components/TeacherLayout";
import { exportDiemToExcel } from '../../components/excelExport';
import { exportDanhSachDuThiGK, exportDanhSachDuThiCK } from '../../components/excelExportDuThi';
import { downloadDiemTemplate, importDiemFromExcel } from '../../components/excelImport';

function NhapDiem() {
  const { lopHocPhanId } = useParams();
  const navigate = useNavigate();
  const [lopHocPhan, setLopHocPhan] = useState(null);
  const [sinhVienList, setSinhVienList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false); // Modal xác nhận
  const [viewMode, setViewMode] = useState('input');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [importErrors, setImportErrors] = useState([]); // Lỗi khi import Excel

  // Nếu không có lopHocPhanId (truy cập trực tiếp /teacher/nhapdiem), điều hướng về danh sách lớp học phần
  useEffect(() => {
    if (!lopHocPhanId) {
      navigate('/teacher/lophocphan', { replace: true });
    }
  }, [lopHocPhanId, navigate]);
  // Load thông tin lớp học phần và danh sách sinh viên
  const loadData = async () => {
    if (!lopHocPhanId) return;
      setLoading(true);
      setMessage("");

      try {
        // Lấy thông tin lớp học phần
        const lhpData = await apiFetch(`/api/lophocphan/${lopHocPhanId}`);
        setLopHocPhan(lhpData);

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
                // Lưu các giá trị gốc từ DB để so sánh sau khi lưu
                const originalScores = {
                  diem_ly_thuyet_1: existingScore?.diemThuongXuyen1 || existingScore?.diem_ly_thuyet_1 || '',
                  diem_ly_thuyet_2: existingScore?.diemThuongXuyen2 || existingScore?.diem_ly_thuyet_2 || '',
                  diem_ly_thuyet_3: existingScore?.diemThuongXuyen3 || existingScore?.diem_ly_thuyet_3 || '',
                  diem_ly_thuyet_4: existingScore?.diemThuongXuyen4 || existingScore?.diem_ly_thuyet_4 || '',
                  diem_thuc_hanh_1: existingScore?.diemThucHanh1 || existingScore?.diem_thuc_hanh_1 || '',
                  diem_thuc_hanh_2: existingScore?.diemThucHanh2 || existingScore?.diem_thuc_hanh_2 || '',
                  diem_thuc_hanh_3: existingScore?.diemThucHanh3 || existingScore?.diem_thuc_hanh_3 || '',
                  diem_giua_ky: existingScore?.diemGiuaKy || existingScore?.diem_giua_ky || '',
                  diem_cuoi_ky: originalCK,
                };
                return {
                  ...sv,
                  ketQuaId: existingScore?.id || null,
                  originalCK: originalCK, // Lưu giá trị CK gốc từ DB
                  originalScores: originalScores, // Lưu tất cả điểm gốc từ DB
                  // Backend trả về camelCase, cần map sang snake_case
                  diem_ly_thuyet_1: originalScores.diem_ly_thuyet_1,
                  diem_ly_thuyet_2: originalScores.diem_ly_thuyet_2,
                  diem_ly_thuyet_3: originalScores.diem_ly_thuyet_3,
                  diem_ly_thuyet_4: originalScores.diem_ly_thuyet_4,
                  diem_thuc_hanh_1: originalScores.diem_thuc_hanh_1,
                  diem_thuc_hanh_2: originalScores.diem_thuc_hanh_2,
                  diem_thuc_hanh_3: originalScores.diem_thuc_hanh_3,
                  diem_giua_ky: originalScores.diem_giua_ky,
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
                  originalScores: {}, // Không có điểm gốc
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
          
          // Không cần set inputLocked global nữa, mỗi ô sẽ tự kiểm tra
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

  // Cập nhật điểm cho một sinh viên với validation
  const handleScoreChange = (svIndex, field, value) => {
    const newList = [...sinhVienList];
    
    // Validate: chỉ cho phép số từ 0 đến 10
    if (value === '' || value === null || value === undefined) {
      newList[svIndex][field] = '';
      setSinhVienList(newList);
      return;
    }
    
    const numValue = Number(value);
    if (isNaN(numValue)) {
      // Không phải số, giữ nguyên giá trị cũ
      return;
    }
    
    // Kiểm tra khoảng 0-10
    if (numValue < 0) {
      newList[svIndex][field] = 0;
    } else if (numValue > 10) {
      newList[svIndex][field] = 10;
    } else {
      // Giữ tối đa 1 chữ số thập phân
      newList[svIndex][field] = Math.round(numValue * 10) / 10;
    }
    
    setSinhVienList(newList);
  };

  // Kiểm tra xem cột nào được phép nhập
  // Chỉ khóa các ô đã có điểm gốc từ DB (đã lưu trước đó), không khóa các ô trống hoặc mới nhập
  const isInputDisabled = (sv, field) => {
    // Nếu đã có bản ghi điểm (ketQuaId) và ô này đã có giá trị gốc từ DB, thì khóa
    if (sv.ketQuaId && sv.originalScores && sv.originalScores[field] && sv.originalScores[field] !== '') {
      return true;
    }
    return false;
  };

  // Kiểm tra đã hoàn tất chưa (chỉ để highlight, không ảnh hưởng đến khóa)
  const isFullyLocked = (sv) => {
    // Chỉ highlight nếu đã có bản ghi điểm và đã có điểm cuối kỳ
    return !!sv.ketQuaId && sv.diem_cuoi_ky && sv.diem_cuoi_ky !== '';
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

    try {
      for (const sv of sinhVienList) {
        // Chỉ lưu các điểm MỚI NHẬP (chưa bị khóa - chưa có trong originalScores)
        // Cho phép cập nhật các cột NULL trong database
        let scoreData = {
          sinh_vien_id: sv.sinh_vien_id,
          hoc_phan_id: lopHocPhan.hocPhanId,
          hoc_ky: lopHocPhan.hocKy,
          nam_hoc: lopHocPhan.namHoc,
        };
        
        let hasNewData = false; // Kiểm tra xem có điểm mới để lưu không
        
        // Hàm helper: chỉ thêm điểm nếu ô đó CHƯA BỊ KHÓA (chưa có trong originalScores)
        // Lưu ý: Điểm 0 cũng là điểm hợp lệ, cần xử lý đúng
        const addScoreIfNotLocked = (field, value) => {
          // Kiểm tra xem ô này có bị khóa không
          const isLocked = isInputDisabled(sv, field);
          
          // Nếu ô đã bị khóa → bỏ qua
          if (isLocked) {
            return;
          }
          
          // Kiểm tra giá trị: cho phép cả 0 (điểm 0 là hợp lệ)
          // Chỉ bỏ qua nếu: null, undefined, hoặc chuỗi rỗng
          if (value === null || value === undefined || value === '') {
            return;
          }
          
          // Convert sang number và validate
          const numValue = Number(value);
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
            scoreData[field] = numValue; // Lưu cả điểm 0
            hasNewData = true;
          }
        };
        
        // Chỉ thêm các điểm mới nhập (chưa bị khóa)
        addScoreIfNotLocked('diem_ly_thuyet_1', sv.diem_ly_thuyet_1);
        addScoreIfNotLocked('diem_ly_thuyet_2', sv.diem_ly_thuyet_2);
        addScoreIfNotLocked('diem_ly_thuyet_3', sv.diem_ly_thuyet_3);
        addScoreIfNotLocked('diem_ly_thuyet_4', sv.diem_ly_thuyet_4);
        addScoreIfNotLocked('diem_thuc_hanh_1', sv.diem_thuc_hanh_1);
        addScoreIfNotLocked('diem_thuc_hanh_2', sv.diem_thuc_hanh_2);
        addScoreIfNotLocked('diem_thuc_hanh_3', sv.diem_thuc_hanh_3);
        addScoreIfNotLocked('diem_giua_ky', sv.diem_giua_ky);
        addScoreIfNotLocked('diem_cuoi_ky', sv.diem_cuoi_ky);
        
        // Chỉ gửi request nếu có điểm mới để lưu
        if (!hasNewData) {
          continue;
        }

        try {
          // UPSERT (POST) - backend sẽ merge: giữ lại điểm cũ, cập nhật các cột NULL
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
      
      // Reload để cập nhật originalScores và điểm tính toán
      // Sau khi reload, các ô đã lưu sẽ tự động khóa (dựa vào originalScores)
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
    try {
      await exportDiemToExcel(sinhVienList, lopHocPhan, loaiBang);
      setMessage('✅ Đã xuất file Excel thành công!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message || '❌ Có lỗi khi xuất Excel!');
      console.error('Export error:', err);
    }
  };

  // Xuất danh sách dự thi GIỮA KỲ
  const exportDSGK = async () => {
    try {
      await exportDanhSachDuThiGK(sinhVienList, lopHocPhan, '');
      setMessage('✅ Đã xuất danh sách dự thi Giữa kỳ!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message || '❌ Có lỗi khi xuất danh sách dự thi!');
      console.error('Export error:', err);
    }
  };

  // Xuất danh sách dự thi CUỐI KỲ
  const exportDSCK = async () => {
    try {
      await exportDanhSachDuThiCK(sinhVienList, lopHocPhan, '');
      setMessage('✅ Đã xuất danh sách dự thi Cuối kỳ!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message || '❌ Có lỗi khi xuất danh sách dự thi!');
      console.error('Export error:', err);
    }
  };

  // Tải template Excel
  const handleDownloadTemplate = async () => {
    try {
      if (!sinhVienList || sinhVienList.length === 0) {
        setMessage('❌ Không có danh sách sinh viên để tạo template!');
        return;
      }
      await downloadDiemTemplate(sinhVienList, lopHocPhan);
      setMessage('✅ Đã tải template Excel thành công!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message || '❌ Có lỗi khi tải template!');
      console.error('Download template error:', err);
    }
  };

  // Import điểm từ Excel
  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset input để có thể chọn lại file cùng tên
    event.target.value = '';

    // Kiểm tra định dạng file
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessage('❌ File phải có định dạng .xlsx hoặc .xls!');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setImportErrors([]);

      const result = await importDiemFromExcel(file, sinhVienList);

      if (result.errors && result.errors.length > 0) {
        setImportErrors(result.errors);
        setMessage(`⚠️ Import thành công ${result.data.length} sinh viên, nhưng có ${result.errors.length} lỗi. Xem chi tiết bên dưới.`);
      } else {
        setMessage(`✅ Đã import thành công sinh viên!`);
      }

      // Cập nhật điểm vào danh sách sinh viên
      // CHỈ cập nhật các ô CHƯA BỊ KHÓA (chưa có điểm gốc từ DB)
      if (result.data && result.data.length > 0) {
        const updatedList = [...sinhVienList];
        const skippedFields = []; // Để thống kê các ô bị bỏ qua
        
        result.data.forEach(importedItem => {
          const index = updatedList.findIndex(sv => sv.sinh_vien_id === importedItem.sinh_vien_id);
          if (index !== -1) {
            const sv = updatedList[index];
            
            // Danh sách các trường điểm
            const diemFields = [
              { key: 'diem_ly_thuyet_1', value: importedItem.diem_ly_thuyet_1 },
              { key: 'diem_ly_thuyet_2', value: importedItem.diem_ly_thuyet_2 },
              { key: 'diem_ly_thuyet_3', value: importedItem.diem_ly_thuyet_3 },
              { key: 'diem_ly_thuyet_4', value: importedItem.diem_ly_thuyet_4 },
              { key: 'diem_thuc_hanh_1', value: importedItem.diem_thuc_hanh_1 },
              { key: 'diem_thuc_hanh_2', value: importedItem.diem_thuc_hanh_2 },
              { key: 'diem_thuc_hanh_3', value: importedItem.diem_thuc_hanh_3 },
              { key: 'diem_giua_ky', value: importedItem.diem_giua_ky },
              { key: 'diem_cuoi_ky', value: importedItem.diem_cuoi_ky }
            ];

            diemFields.forEach(({ key, value }) => {
              // Chỉ cập nhật nếu:
              // 1. Có giá trị trong file import
              // 2. Ô đó CHƯA BỊ KHÓA (chưa có điểm gốc từ DB)
              if (value !== null && value !== undefined && value !== '') {
                // Kiểm tra xem ô này có bị khóa không
                const isLocked = isInputDisabled(sv, key);
                
                if (isLocked) {
                  // Ô đã bị khóa, bỏ qua và ghi nhận
                  skippedFields.push(`${sv.ma_sv} - ${key}`);
                } else {
                  // Ô chưa bị khóa, cho phép cập nhật
                  updatedList[index][key] = value;
                }
              }
            });
          }
        });

        setSinhVienList(updatedList);
        
        // Thông báo nếu có ô bị bỏ qua
        if (skippedFields.length > 0) {
          const skippedCount = skippedFields.length;
          const existingErrors = result.errors || [];
          setImportErrors([
            ...existingErrors,
            `⚠️ Đã bỏ qua ${skippedCount} ô điểm đã bị khóa (đã lưu trước đó)`
          ]);
        }
      }

      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage(err.message || '❌ Có lỗi khi import file Excel!');
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
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
          
          <div className="d-flex gap-2 align-items-center">
            {/* Nút Excel - chỉ hiển thị khi ở chế độ nhập điểm */}
            {viewMode === 'input' && (
              <>
                <button 
                  className="btn btn-outline-primary" 
                  onClick={handleDownloadTemplate}
                  disabled={loading || !sinhVienList || sinhVienList.length === 0}
                  title="Tải file Excel mẫu để nhập điểm"
                >
                  <i className="bi bi-download me-1"></i> Tải template Excel
                </button>
                <label className="btn btn-outline-info" style={{ cursor: 'pointer', marginBottom: 0 }}>
                  <i className="bi bi-upload me-1"></i> Import từ Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImportExcel}
                    style={{ display: 'none' }}
                    disabled={loading || !sinhVienList || sinhVienList.length === 0}
                  />
                </label>
              </>
            )}
            <button className="btn btn-outline-secondary" onClick={() => navigate('/teacher/lophocphan')}>
              ← Quay lại danh sách lớp
            </button>
          </div>
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
                            style={{ backgroundColor: isInputDisabled(sv, 'diem_cuoi_ky') ? '#e9ecef' : 'white' }}
                            title={isInputDisabled(sv, 'diem_cuoi_ky') ? ' Đã khóa' : ''}
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
                  <p className="mb-0 text-muted">
                    - Nhập đầy đủ điểm thành phần cho từng sinh viên trước khi bấm "Lưu tất cả điểm".<br/>
                    - Điểm phải từ 0 đến 10 (có thể nhập số thập phân, ví dụ: 7.5).<br/>
                    - Sau khi lưu, hệ thống khóa chỉnh sửa; cần thay đổi hãy liên hệ Admin.<br/>
                    - Import Excel chỉ cập nhật các ô chưa bị khóa (chưa lưu trước đó).
                  </p>
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
              
              {/* Hiển thị lỗi import nếu có */}
              {importErrors.length > 0 && (
                <div className="mt-3 alert alert-warning">
                  
                  <ul className="mb-0 mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {importErrors.map((error, idx) => (
                      <li key={idx} className="small">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => { setShowExportMenu(false); exportDSGK(); }}
                      >
                        Danh sách dự thi Giữa kỳ
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => { setShowExportMenu(false); exportDSCK(); }}
                      >
                        Danh sách dự thi Cuối kỳ
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