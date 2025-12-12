import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import TeacherLayout from "../../components/TeacherLayout";
import { exportDiemToExcel } from '../../components/excelExport';
import { exportDanhSachDuThiGK, exportDanhSachDuThiCK } from '../../components/excelExportDuThi';

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

  // Cập nhật điểm cho một sinh viên
  const handleScoreChange = (svIndex, field, value) => {
    const newList = [...sinhVienList];
    newList[svIndex][field] = value;
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
        
        // Skip nếu sinh viên không có dữ liệu gì để lưu
        const hasAnyData = sv.diem_ly_thuyet_1 || sv.diem_ly_thuyet_2 || sv.diem_ly_thuyet_3 || 
                          sv.diem_ly_thuyet_4 || sv.diem_thuc_hanh_1 || sv.diem_thuc_hanh_2 || 
                          sv.diem_thuc_hanh_3 || sv.diem_giua_ky || sv.diem_cuoi_ky;
        if (!hasAnyData) {
          continue;
        }
        let scoreData = {
          sinh_vien_id: sv.sinh_vien_id,
          hoc_phan_id: lopHocPhan.hocPhanId,
          hoc_ky: lopHocPhan.hocKy,
          nam_hoc: lopHocPhan.namHoc,
        };
        
        // Gửi đầy đủ điểm (chỉ field có giá trị)
        if (sv.diem_ly_thuyet_1) scoreData.diem_ly_thuyet_1 = sv.diem_ly_thuyet_1;
        if (sv.diem_ly_thuyet_2) scoreData.diem_ly_thuyet_2 = sv.diem_ly_thuyet_2;
        if (sv.diem_ly_thuyet_3) scoreData.diem_ly_thuyet_3 = sv.diem_ly_thuyet_3;
        if (sv.diem_ly_thuyet_4) scoreData.diem_ly_thuyet_4 = sv.diem_ly_thuyet_4;
        if (sv.diem_thuc_hanh_1) scoreData.diem_thuc_hanh_1 = sv.diem_thuc_hanh_1;
        if (sv.diem_thuc_hanh_2) scoreData.diem_thuc_hanh_2 = sv.diem_thuc_hanh_2;
        if (sv.diem_thuc_hanh_3) scoreData.diem_thuc_hanh_3 = sv.diem_thuc_hanh_3;
        if (sv.diem_giua_ky) scoreData.diem_giua_ky = sv.diem_giua_ky;
        if (sv.diem_cuoi_ky) scoreData.diem_cuoi_ky = sv.diem_cuoi_ky;

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
      // Sau khi reload, các ô đã lưu sẽ tự động khóa (dựa vào ketQuaId)
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
                    - Sau khi lưu, hệ thống khóa chỉnh sửa; cần thay đổi hãy liên hệ Admin.
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