import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api'; // Điều chỉnh đường dẫn import apiFetch tuỳ cấu trúc
import { ConfirmModal } from '../../components/Modal';

function DanhSachSinhVienModal({ show, onHide, lopHocPhan }) {
  const [sinhVienList, setSinhVienList] = useState([]);
  const [mssvInput, setMssvInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  // Load danh sách sinh viên khi modal mở
  useEffect(() => {
    if (show && lopHocPhan) {
      loadSinhVien();
      setMessage('');
      setError('');
      setMssvInput('');
    }
  }, [show, lopHocPhan]);

  const loadSinhVien = async () => {
    if (!lopHocPhan?.id) return;
    setLoading(true);
    try {
      const data = await apiFetch(`/api/lophocphan/${lopHocPhan.id}/sinhvien`);
      setSinhVienList(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách SV:', err);
      setError('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!mssvInput.trim()) return;
    setMessage('');
    setError('');

    try {
      const res = await apiFetch(`/api/lophocphan/${lopHocPhan.id}/add-student`, {
        method: 'POST',
        body: JSON.stringify({ mssv: mssvInput.trim() }),
      });
      
      // Nếu apiFetch không throw error khi status != 200, cần check res manually (tuỳ setup apiFetch của bạn)
      // Giả sử apiFetch trả về json response
      
      setMessage('✅ Thêm sinh viên thành công');
      setMssvInput('');
      loadSinhVien(); // Reload list
    } catch (err) {
      console.error('Lỗi thêm SV:', err);
      // apiFetch thường ném ra object lỗi hoặc message
      const msg = err.message || 'Lỗi khi thêm sinh viên';
      setError(`❌ ${msg}`);
    }
  };

  const handleRemove = (sinhVienId, tenSV) => {
    setConfirmModal({
      show: true,
      message: `Bạn có chắc muốn xóa sinh viên ${tenSV} khỏi lớp này?`,
      onConfirm: async () => {
        setMessage('');
        setError('');

        try {
          await apiFetch(`/api/lophocphan/${lopHocPhan.id}/remove-student/${sinhVienId}`, {
            method: 'DELETE',
          });
          setMessage('✅ Xóa sinh viên thành công');
          loadSinhVien();
        } catch (err) {
          console.error('Lỗi xóa SV:', err);
          setError(`❌ ${err.message || 'Lỗi khi xóa sinh viên'}`);
        }
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              Danh sách lớp: {lopHocPhan?.maLopHocPhan} - {lopHocPhan?.tenHocPhan}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            {/* Thông báo */}
            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}

            {/* Form thêm sinh viên */}
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Nhập MSSV cần thêm..."
                value={mssvInput}
                onChange={(e) => setMssvInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button className="btn btn-success" onClick={handleAdd} disabled={!mssvInput.trim()}>
                <i className="bi bi-plus-circle me-1"></i> Thêm vào lớp
              </button>
            </div>

            {/* Danh sách sinh viên */}
            {loading ? (
              <div className="text-center py-3">Đang tải...</div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Sĩ số hiện tại: {sinhVienList.length}</strong>
                  {lopHocPhan?.siSoToiDa && (
                    <span className={sinhVienList.length >= lopHocPhan.siSoToiDa ? 'text-danger fw-bold' : 'text-muted'}>
                      (Tối đa: {lopHocPhan.siSoToiDa})
                    </span>
                  )}
                </div>
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-bordered table-hover mb-0">
                    <thead className="table-light sticky-top" style={{ top: 0, zIndex: 1 }}>
                      <tr>
                        <th>STT</th>
                        <th>MSSV</th>
                        <th>Họ tên</th>
                        <th>Ngày sinh</th>
                        <th>Trạng thái</th>
                        <th className="text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sinhVienList.length > 0 ? (
                        sinhVienList.map((sv, index) => (
                          <tr key={sv.sinh_vien_id || index}>
                            <td>{index + 1}</td>
                            <td>{sv.ma_sv}</td>
                            <td>{sv.ho_ten}</td>
                            <td>{sv.ngay_sinh ? new Date(sv.ngay_sinh).toLocaleDateString('vi-VN') : '-'}</td>
                            <td>
                              <span className={`badge ${sv.trang_thai_dk === 'THANH_CONG' ? 'bg-success' : 'bg-secondary'}`}>
                                {sv.trang_thai_dk}
                              </span>
                            </td>
                            <td className="text-center">
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                title="Xóa khỏi lớp"
                                onClick={() => handleRemove(sv.sinh_vien_id, sv.ho_ten)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            Chưa có sinh viên nào trong lớp
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Đóng
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={confirmModal.show}
        message={confirmModal.message}
        onConfirm={() => {
          if (confirmModal.onConfirm) confirmModal.onConfirm();
          setConfirmModal({ show: false, message: '', onConfirm: null });
        }}
        onCancel={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
      />
    </div>
  );
}

export default DanhSachSinhVienModal;
