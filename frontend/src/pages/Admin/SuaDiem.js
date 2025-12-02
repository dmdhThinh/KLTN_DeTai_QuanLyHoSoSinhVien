import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import AdminLayout from "../../components/AdminLayout";

function SuaDiem() {
  const { lopHocPhanId } = useParams();
  const navigate = useNavigate();
  const [lopHocPhan, setLopHocPhan] = useState(null);
  const [sinhVienList, setSinhVienList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load thông tin lớp học phần và danh sách sinh viên
  const loadData = async () => {
    if (!lopHocPhanId) return;
    setLoading(true);
    setMessage("");

    try {
      // Lấy thông tin lớp học phần
      const lhpData = await apiFetch(`/api/lophocphan/${lopHocPhanId}`);
      setLopHocPhan(lhpData);

      // Lấy danh sách sinh viên đã đăng ký
      const svData = await apiFetch(`/api/dkhp/lop-hoc-phan/${lopHocPhanId}`);
      
      if (Array.isArray(svData)) {
        const hocPhanId = lhpData.hocPhanId;
        const hocKy = lhpData.hocKy;
        const namHoc = lhpData.namHoc;
        
        const sinhVienWithScores = await Promise.all(
          svData.map(async (sv) => {
            try {
              // Lấy điểm của sinh viên cho học phần này
              const ketQuaData = await apiFetch(`/api/ket-qua-hoc-tap/by-sinhvien?sinhVienId=${sv.sinh_vien_id}`);
              
              // Tìm điểm của học phần + học kỳ này
              const existingScore = ketQuaData?.find(
                kq => {
                  const matchHP = (kq.hoc_phan_id === hocPhanId || kq.hocPhanId === hocPhanId);
                  const matchHK = (kq.hoc_ky === hocKy || kq.hocKy === hocKy);
                  const matchNH = (kq.nam_hoc === namHoc || kq.namHoc === namHoc);
                  
                  return matchHP && matchHK && matchNH;
                }
              );
              
              return {
                ...sv,
                ketQuaId: existingScore?.id || null,
                diem_ly_thuyet_1: existingScore?.diemThuongXuyen1 || existingScore?.diem_ly_thuyet_1 || '',
                diem_ly_thuyet_2: existingScore?.diemThuongXuyen2 || existingScore?.diem_ly_thuyet_2 || '',
                diem_ly_thuyet_3: existingScore?.diemThuongXuyen3 || existingScore?.diem_ly_thuyet_3 || '',
                diem_ly_thuyet_4: existingScore?.diemThuongXuyen4 || existingScore?.diem_ly_thuyet_4 || '',
                diem_thuc_hanh_1: existingScore?.diemThucHanh1 || existingScore?.diem_thuc_hanh_1 || '',
                diem_thuc_hanh_2: existingScore?.diemThucHanh2 || existingScore?.diem_thuc_hanh_2 || '',
                diem_thuc_hanh_3: existingScore?.diemThucHanh3 || existingScore?.diem_thuc_hanh_3 || '',
                diem_giua_ky: existingScore?.diemGiuaKy || existingScore?.diem_giua_ky || '',
                diem_cuoi_ky: existingScore?.diemCuoiKy || existingScore?.diem_cuoi_ky || '',
                diem_tong_ket: existingScore?.diemTongKet || existingScore?.diem_tong_ket || '',
                diem_chu: existingScore?.diemChu || existingScore?.diem_chu || '',
                xep_loai: existingScore?.xepLoai || existingScore?.xep_loai || '',
                dat: existingScore?.dat || existingScore?.dat || '',
              };
            } catch (err) {
              return {
                ...sv,
                ketQuaId: null,
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
      setMessage('❌ Lỗi khi tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

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

  // Lưu điểm cho một sinh viên (admin có thể sửa bất kỳ lúc nào)
  const handleSaveStudent = async (sv) => {
    if (!sv.ketQuaId) {
      setMessage('❌ Sinh viên chưa có điểm để sửa. Vui lòng tạo điểm mới trước.');
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const scoreData = {};
      
      // Chỉ gửi các field có giá trị
      if (sv.diem_ly_thuyet_1) scoreData.diem_ly_thuyet_1 = sv.diem_ly_thuyet_1;
      if (sv.diem_ly_thuyet_2) scoreData.diem_ly_thuyet_2 = sv.diem_ly_thuyet_2;
      if (sv.diem_ly_thuyet_3) scoreData.diem_ly_thuyet_3 = sv.diem_ly_thuyet_3;
      if (sv.diem_ly_thuyet_4) scoreData.diem_ly_thuyet_4 = sv.diem_ly_thuyet_4;
      if (sv.diem_thuc_hanh_1) scoreData.diem_thuc_hanh_1 = sv.diem_thuc_hanh_1;
      if (sv.diem_thuc_hanh_2) scoreData.diem_thuc_hanh_2 = sv.diem_thuc_hanh_2;
      if (sv.diem_thuc_hanh_3) scoreData.diem_thuc_hanh_3 = sv.diem_thuc_hanh_3;
      if (sv.diem_giua_ky) scoreData.diem_giua_ky = sv.diem_giua_ky;
      if (sv.diem_cuoi_ky) scoreData.diem_cuoi_ky = sv.diem_cuoi_ky;

      await apiFetch(`/api/ket-qua-hoc-tap/${sv.ketQuaId}`, {
        method: 'PUT',
        body: JSON.stringify(scoreData),
      });

      setMessage(`✅ Đã cập nhật điểm cho sinh viên ${sv.ma_sv} thành công!`);
      await loadData();
    } catch (err) {
      console.error('Error saving score:', err);
      setMessage(`❌ Lỗi khi cập nhật điểm cho sinh viên ${sv.ma_sv}: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Lưu tất cả điểm
  const handleSaveAll = async () => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn cập nhật điểm cho tất cả sinh viên?')) {
      return;
    }

    setSaving(true);
    setMessage("");
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const sv of sinhVienList) {
        if (!sv.ketQuaId) {
          errorCount++;
          continue;
        }

        try {
          const scoreData = {};
          
          if (sv.diem_ly_thuyet_1) scoreData.diem_ly_thuyet_1 = sv.diem_ly_thuyet_1;
          if (sv.diem_ly_thuyet_2) scoreData.diem_ly_thuyet_2 = sv.diem_ly_thuyet_2;
          if (sv.diem_ly_thuyet_3) scoreData.diem_ly_thuyet_3 = sv.diem_ly_thuyet_3;
          if (sv.diem_ly_thuyet_4) scoreData.diem_ly_thuyet_4 = sv.diem_ly_thuyet_4;
          if (sv.diem_thuc_hanh_1) scoreData.diem_thuc_hanh_1 = sv.diem_thuc_hanh_1;
          if (sv.diem_thuc_hanh_2) scoreData.diem_thuc_hanh_2 = sv.diem_thuc_hanh_2;
          if (sv.diem_thuc_hanh_3) scoreData.diem_thuc_hanh_3 = sv.diem_thuc_hanh_3;
          if (sv.diem_giua_ky) scoreData.diem_giua_ky = sv.diem_giua_ky;
          if (sv.diem_cuoi_ky) scoreData.diem_cuoi_ky = sv.diem_cuoi_ky;

          await apiFetch(`/api/ket-qua-hoc-tap/${sv.ketQuaId}`, {
            method: 'PUT',
            body: JSON.stringify(scoreData),
          });
          successCount++;
        } catch (err) {
          console.error(`Error saving score for ${sv.ma_sv}:`, err);
          errorCount++;
        }
      }

      setMessage(`✅ Đã cập nhật thành công ${successCount} sinh viên${errorCount > 0 ? `, ${errorCount} lỗi` : ''}!`);
      await loadData();
    } catch (err) {
      setMessage('❌ Có lỗi xảy ra khi cập nhật điểm!');
      console.error('Error in handleSaveAll:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">🔧 Admin - Sửa điểm</h3>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/lophocphan')}>
            ← Quay lại danh sách lớp
          </button>
        </div>

        {lopHocPhan && (
          <div className="alert alert-info mb-2">
            <strong>Lớp học phần:</strong> {lopHocPhan.tenHocPhan} - {lopHocPhan.maLopHocPhan} 
            <span className="ms-3">
              <strong>Học kỳ:</strong> {lopHocPhan.hocKy} {lopHocPhan.namHoc}
            </span>
            <span className="ms-3">
              <strong>Giảng viên:</strong> {lopHocPhan.tenGiangVien}
            </span>
          </div>
        )}

        <div className="alert alert-warning">
          <strong>⚠️ Lưu ý:</strong> Admin có thể sửa điểm bất kỳ lúc nào, kể cả khi điểm đã bị khóa. 
          Chỉ được sửa điểm trong cùng học kỳ và năm học.
        </div>

        <div className="card shadow-sm p-3">
          {message && (
            <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}

          {loading && (
            <p className="text-center text-muted py-5">⏳ Đang tải danh sách sinh viên...</p>
          )}

          {!loading && sinhVienList.length > 0 && (
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
                      <th style={{ minWidth: '100px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sinhVienList.map((sv, index) => (
                      <tr key={sv.sinh_vien_id}>
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
                            disabled={!sv.ketQuaId}
                            title={!sv.ketQuaId ? 'Sinh viên chưa có điểm' : ''}
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
                            disabled={!sv.ketQuaId}
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
                            disabled={!sv.ketQuaId}
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
                            disabled={!sv.ketQuaId}
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
                            disabled={!sv.ketQuaId}
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
                            disabled={!sv.ketQuaId}
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
                            disabled={!sv.ketQuaId}
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
                            disabled={!sv.ketQuaId}
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
                            disabled={!sv.ketQuaId}
                          />
                        </td>
                        <td className="text-center fw-bold">{sv.diem_tong_ket || '-'}</td>
                        <td className="text-center fw-bold">{sv.diem_chu || '-'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleSaveStudent(sv)}
                            disabled={!sv.ketQuaId || saving}
                            title={!sv.ketQuaId ? 'Sinh viên chưa có điểm' : 'Lưu điểm cho sinh viên này'}
                          >
                            💾 Lưu
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 d-flex justify-content-end">
                <button 
                  className="btn btn-success" 
                  onClick={handleSaveAll}
                  disabled={saving}
                >
                  {saving ? '⏳ Đang lưu...' : '💾 Lưu tất cả điểm'}
                </button>
              </div>
            </>
          )}

          {!loading && sinhVienList.length === 0 && lopHocPhan && (
            <p className="text-center text-muted py-5">Không có sinh viên nào đăng ký lớp học phần này.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default SuaDiem;

