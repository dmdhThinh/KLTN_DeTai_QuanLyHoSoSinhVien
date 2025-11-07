import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import TeacherLayout from "../../components/TeacherLayout";

function NhapDiem() {
  const { lopHocPhanId } = useParams();
  const navigate = useNavigate();
  const [lopHocPhan, setLopHocPhan] = useState(null);
  const [sinhVienList, setSinhVienList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load thông tin lớp học phần và danh sách sinh viên
  useEffect(() => {
    if (!lopHocPhanId) return;

    const loadData = async () => {
      setLoading(true);
      setMessage("");

      try {
        // Lấy thông tin lớp học phần
        const lhpData = await apiFetch(`/api/lophocphan/${lopHocPhanId}`);
        console.log('Lớp học phần:', lhpData);
        setLopHocPhan(lhpData);

        // Lấy danh sách sinh viên đăng ký
        const dkData = await apiFetch(`/api/dkhp/lop-hoc-phan/${lopHocPhanId}`);
        console.log('Danh sách đăng ký:', dkData);
        
        if (Array.isArray(dkData)) {
          // Lấy điểm hiện tại của từng sinh viên
          const sinhVienWithScores = await Promise.all(
            dkData.map(async (dk) => {
              try {
                // Lấy tất cả điểm của sinh viên
                const ketQuaData = await apiFetch(`/api/ket-qua-hoc-tap/by-sinhvien?sinhVienId=${dk.sinh_vien_id}`);
                
                // Tìm điểm của học phần này
                const hocPhanId = lhpData.hocPhanId || lhpData.hoc_phan_id;
                const existingScore = ketQuaData?.find(
                  kq => (kq.hoc_phan_id === hocPhanId || kq.hocPhanId === hocPhanId)
                );

                return {
                  ...dk,
                  ketQuaId: existingScore?.id || null,
                  diem_ly_thuyet_1: existingScore?.diem_ly_thuyet_1 || '',
                  diem_ly_thuyet_2: existingScore?.diem_ly_thuyet_2 || '',
                  diem_ly_thuyet_3: existingScore?.diem_ly_thuyet_3 || '',
                  diem_ly_thuyet_4: existingScore?.diem_ly_thuyet_4 || '',
                  diem_thuc_hanh_1: existingScore?.diem_thuc_hanh_1 || '',
                  diem_thuc_hanh_2: existingScore?.diem_thuc_hanh_2 || '',
                  diem_thuc_hanh_3: existingScore?.diem_thuc_hanh_3 || '',
                  diem_giua_ky: existingScore?.diem_giua_ky || '',
                  diem_cuoi_ky: existingScore?.diem_cuoi_ky || '',
                  diem_tong_ket: existingScore?.diem_tong_ket || '',
                  diem_chu: existingScore?.diem_chu || '',
                };
              } catch {
                return {
                  ...dk,
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

    loadData();
  }, [lopHocPhanId]);

  // Cập nhật điểm cho một sinh viên
  const handleScoreChange = (svIndex, field, value) => {
    const newList = [...sinhVienList];
    newList[svIndex][field] = value;
    setSinhVienList(newList);
  };

  // Lưu điểm tất cả sinh viên
  const handleSaveAll = async () => {
    if (!lopHocPhan) return;
    
    setSaving(true);
    setMessage("");
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const sv of sinhVienList) {
        const scoreData = {
          sinh_vien_id: sv.sinh_vien_id,
          hoc_phan_id: lopHocPhan.hocPhanId || lopHocPhan.hoc_phan_id,
          diem_ly_thuyet_1: sv.diem_ly_thuyet_1 || null,
          diem_ly_thuyet_2: sv.diem_ly_thuyet_2 || null,
          diem_ly_thuyet_3: sv.diem_ly_thuyet_3 || null,
          diem_ly_thuyet_4: sv.diem_ly_thuyet_4 || null,
          diem_thuc_hanh_1: sv.diem_thuc_hanh_1 || null,
          diem_thuc_hanh_2: sv.diem_thuc_hanh_2 || null,
          diem_thuc_hanh_3: sv.diem_thuc_hanh_3 || null,
          diem_giua_ky: sv.diem_giua_ky || null,
          diem_cuoi_ky: sv.diem_cuoi_ky || null,
        };

        try {
          if (sv.ketQuaId) {
            // Update nếu đã có điểm
            await apiFetch(`/api/ket-qua-hoc-tap/${sv.ketQuaId}`, {
              method: 'PUT',
              body: JSON.stringify(scoreData),
            });
          } else {
            // Tạo mới nếu chưa có điểm
            await apiFetch('/api/ket-qua-hoc-tap', {
              method: 'POST',
              body: JSON.stringify(scoreData),
            });
          }
          successCount++;
        } catch (err) {
          console.error(`Error saving score for SV ${sv.ma_sv}:`, err);
          errorCount++;
        }
      }

      setMessage(`✅ Đã lưu thành công ${successCount} sinh viên${errorCount > 0 ? `, ${errorCount} lỗi` : ''}!`);
      
      // Reload lại danh sách sau khi lưu
      window.location.reload();
    } catch (err) {
      setMessage('❌ Có lỗi xảy ra khi lưu điểm!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="container-fluid mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">📝 Nhập điểm thủ công</h3>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/teacher/lophocphan')}>
            ← Quay lại danh sách lớp
          </button>
        </div>

        {lopHocPhan && (
          <div className="alert alert-info">
            <strong>Lớp học phần:</strong> {lopHocPhan.tenHocPhan || lopHocPhan.ten_hoc_phan} - {lopHocPhan.maLopHocPhan || lopHocPhan.ma_lop_hoc_phan} 
            <span className="ms-3">
              <strong>Học kỳ:</strong> {lopHocPhan.hocKy || lopHocPhan.hoc_ky} {lopHocPhan.namHoc || lopHocPhan.nam_hoc}
            </span>
          </div>
        )}

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
                <p className="small text-muted mb-0">
                  🔹 Nhập điểm vào các ô (0-10). <br />
                  🔹 Hệ thống sẽ <strong>tự động tính điểm tổng kết</strong> khi bạn lưu.
                </p>
                <button 
                  className="btn btn-success btn-lg" 
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
    </TeacherLayout>
  );
}

export default NhapDiem;
