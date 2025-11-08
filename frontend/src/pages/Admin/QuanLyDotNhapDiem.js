import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import AdminLayout from '../../components/AdminLayout';

function QuanLyDotNhapDiem() {
  const [dotList, setDotList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    hocKy: 'HK1',
    namHoc: '',
    ghiChu: ''
  });

  useEffect(() => {
    loadDotNhapDiem();
  }, []);

  const loadDotNhapDiem = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/dot-nhap-diem/all');
      setDotList(data);
    } catch (err) {
      console.error('Lỗi load đợt nhập điểm:', err);
      setMessage('❌ Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTrangThai = async (hocKy, namHoc, trangThai) => {
    if (!window.confirm(`Xác nhận chuyển sang trạng thái: ${getTrangThaiText(trangThai)}?`)) {
      return;
    }

    try {
      await apiFetch('/api/dot-nhap-diem/update', {
        method: 'PUT',
        body: JSON.stringify({ hocKy, namHoc, trangThai })
      });
      setMessage(`✅ Đã cập nhật trạng thái: ${getTrangThaiText(trangThai)}`);
      loadDotNhapDiem();
    } catch (err) {
      console.error('Lỗi update:', err);
      setMessage('❌ Lỗi cập nhật trạng thái');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.namHoc) {
      setMessage('❌ Vui lòng nhập năm học');
      return;
    }

    try {
      await apiFetch('/api/dot-nhap-diem/create', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setMessage('✅ Tạo học kỳ mới thành công!');
      setShowModal(false);
      setFormData({ hocKy: 'HK1', namHoc: '', ghiChu: '' });
      loadDotNhapDiem();
    } catch (err) {
      console.error('Lỗi tạo:', err);
      setMessage(err.message || '❌ Lỗi tạo học kỳ mới');
    }
  };

  const handleDelete = async (hocKy, namHoc) => {
    if (!window.confirm(`⚠️ Xác nhận XÓA đợt nhập điểm ${hocKy} ${namHoc}?\n\nLưu ý: Điểm đã nhập sẽ KHÔNG bị xóa, chỉ xóa thông tin đợt nhập điểm.`)) {
      return;
    }

    try {
      await apiFetch(`/api/dot-nhap-diem/delete/${hocKy}/${namHoc}`, {
        method: 'DELETE'
      });
      setMessage('✅ Đã xóa đợt nhập điểm!');
      loadDotNhapDiem();
    } catch (err) {
      console.error('Lỗi xóa:', err);
      setMessage('❌ Lỗi xóa đợt nhập điểm');
    }
  };

  const getTrangThaiText = (trangThai) => {
    const map = {
      'CHUA_MO': '⏸️ Chưa mở',
      'DOT_1_DANG_MO': '✅ Đợt 1 đang mở',
      'DOT_1_DA_DONG': '🔒 Đợt 1 đã đóng',
      'DOT_2_DANG_MO': '⚡ Đợt 2 đang mở',
      'DA_KHOA': '🔐 Đã khóa hoàn toàn'
    };
    return map[trangThai] || trangThai;
  };

  const getTrangThaiBadge = (trangThai) => {
    const map = {
      'CHUA_MO': 'secondary',
      'DOT_1_DANG_MO': 'success',
      'DOT_1_DA_DONG': 'warning',
      'DOT_2_DANG_MO': 'primary',
      'DA_KHOA': 'danger'
    };
    return map[trangThai] || 'secondary';
  };

  return (
    <AdminLayout>
      <div className="container-fluid mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">🎯 Quản lý đợt nhập điểm</h3>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            ➕ Thêm học kỳ mới
          </button>
        </div>

        {message && (
          <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Học kỳ</th>
                      <th>Năm học</th>
                      <th>Trạng thái hiện tại</th>
                      <th>Ghi chú</th>
                      <th style={{ width: '400px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dotList.map((dot) => (
                      <tr key={`${dot.hoc_ky}-${dot.nam_hoc}`}>
                        <td><strong>{dot.hoc_ky}</strong></td>
                        <td><strong>{dot.nam_hoc}</strong></td>
                        <td>
                          <span className={`badge bg-${getTrangThaiBadge(dot.trang_thai)}`}>
                            {getTrangThaiText(dot.trang_thai)}
                          </span>
                        </td>
                        <td className="text-muted small">{dot.ghi_chu || '-'}</td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            {dot.trang_thai === 'CHUA_MO' && (
                              <button
                                className="btn btn-success"
                                onClick={() => handleUpdateTrangThai(dot.hoc_ky, dot.nam_hoc, 'DOT_1_DANG_MO')}
                              >
                                ▶️ Mở đợt 1
                              </button>
                            )}
                            
                            {dot.trang_thai === 'DOT_1_DANG_MO' && (
                              <button
                                className="btn btn-warning"
                                onClick={() => handleUpdateTrangThai(dot.hoc_ky, dot.nam_hoc, 'DOT_1_DA_DONG')}
                              >
                                ⏸️ Đóng đợt 1
                              </button>
                            )}
                            
                            {dot.trang_thai === 'DOT_1_DA_DONG' && (
                              <button
                                className="btn btn-primary"
                                onClick={() => handleUpdateTrangThai(dot.hoc_ky, dot.nam_hoc, 'DOT_2_DANG_MO')}
                              >
                                ⚡ Mở đợt 2
                              </button>
                            )}
                            
                            {dot.trang_thai === 'DOT_2_DANG_MO' && (
                              <button
                                className="btn btn-danger"
                                onClick={() => handleUpdateTrangThai(dot.hoc_ky, dot.nam_hoc, 'DA_KHOA')}
                              >
                                🔒 Khóa điểm
                              </button>
                            )}

                            {/* Nút khẩn cấp */}
                            {dot.trang_thai !== 'CHUA_MO' && (
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleUpdateTrangThai(dot.hoc_ky, dot.nam_hoc, 'CHUA_MO')}
                                title="Reset về chưa mở (khẩn cấp)"
                              >
                                🔄 Reset
                              </button>
                            )}
                            
                            {/* Nút xóa - chỉ cho những đợt chưa mở hoặc đã khóa */}
                            {(dot.trang_thai === 'CHUA_MO' || dot.trang_thai === 'DA_KHOA') && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(dot.hoc_ky, dot.nam_hoc)}
                                title="Xóa đợt nhập điểm này"
                              >
                                🗑️ Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="mb-3">📋 Hướng dẫn:</h6>
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-2"><strong>Quy trình chuẩn:</strong></p>
                    <ol className="small mb-0">
                      <li><strong>Mở đợt 1:</strong> Giảng viên nhập TX, TH, GK</li>
                      <li><strong>Đóng đợt 1:</strong> Chờ sinh viên thi xong</li>
                      <li><strong>Mở đợt 2:</strong> Giảng viên nhập Cuối kỳ</li>
                      <li><strong>Khóa điểm:</strong> Hoàn tất, không sửa được nữa</li>
                    </ol>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2"><strong>⚠️ Lưu ý:</strong></p>
                    <ul className="small mb-0">
                      <li>Chỉ chuyển sang bước tiếp theo khi chắc chắn</li>
                      <li>Nút "Reset" dùng trong trường hợp khẩn cấp</li>
                      <li>Điểm đã nhập sẽ KHÔNG bị mất khi đóng/mở đợt</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal thêm học kỳ mới */}
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">➕ Thêm học kỳ mới</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleCreate}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Học kỳ <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={formData.hocKy}
                        onChange={(e) => setFormData({ ...formData, hocKy: e.target.value })}
                        required
                      >
                        <option value="HK1">HK1</option>
                        <option value="HK2">HK2</option>
                        <option value="HK3">HK3 (Hè)</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Năm học <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="VD: 2025-2026"
                        value={formData.namHoc}
                        onChange={(e) => setFormData({ ...formData, namHoc: e.target.value })}
                        required
                      />
                      <small className="text-muted">Định dạng: YYYY-YYYY (VD: 2025-2026)</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Ghi chú</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Ghi chú về đợt nhập điểm này..."
                        value={formData.ghiChu}
                        onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary">
                      ✅ Tạo mới
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default QuanLyDotNhapDiem;