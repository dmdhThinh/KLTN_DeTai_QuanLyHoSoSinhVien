import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import AdminLayout from '../../components/AdminLayout';
import dayjs from 'dayjs';
import { ConfirmModal, AlertModal } from '../../components/Modal';

function QuanLyDotDangKy() {
  const [dotList, setDotList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false); // New state for Auto Modal
  const [autoNamHoc, setAutoNamHoc] = useState(new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)); // Default year
  const [isEditing, setIsEditing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' });
  
  const [formData, setFormData] = useState({
    id: null,
    hocKy: 'HK1',
    namHoc: '',
    thoiGianMo: '',
    thoiGianDong: '',
    ghiChu: ''
  });

  useEffect(() => {
    loadDotDangKy();
  }, []);

  const loadDotDangKy = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/dot-dang-ky');
      setDotList(data);
    } catch (err) {
      console.error('Lỗi load đợt đăng ký:', err);
      setMessage('❌ Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.namHoc || !formData.thoiGianMo || !formData.thoiGianDong) {
      setMessage('❌ Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (dayjs(formData.thoiGianMo).isAfter(dayjs(formData.thoiGianDong))) {
      setMessage('❌ Thời gian đóng phải sau thời gian mở');
      return;
    }

    try {
      if (isEditing) {
        await apiFetch(`/api/dot-dang-ky/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setMessage('✅ Cập nhật thành công!');
      } else {
        await apiFetch('/api/dot-dang-ky', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        setMessage('✅ Tạo đợt mới thành công!');
      }
      
      setShowModal(false);
      loadDotDangKy();
    } catch (err) {
      console.error('Lỗi lưu:', err);
      setMessage(err.message || '❌ Lỗi lưu dữ liệu');
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      show: true,
      message: '⚠️ Xác nhận XÓA đợt đăng ký này?',
      onConfirm: async () => {
        try {
          await apiFetch(`/api/dot-dang-ky/${id}`, {
            method: 'DELETE'
          });
          setMessage('✅ Đã xóa đợt đăng ký!');
          loadDotDangKy();
        } catch (err) {
          console.error('Lỗi xóa:', err);
          setMessage('❌ Lỗi xóa đợt đăng ký');
        }
      }
    });
  };

  const handleAutoGenerate = () => {
    // Tự động tính toán năm tiếp theo dựa trên dữ liệu hiện có
    let nextYear = new Date().getFullYear();
    
    if (dotList && dotList.length > 0) {
      // Lấy ra danh sách các năm bắt đầu (VD: "2025-2026" -> 2025)
      const startYears = dotList.map(dot => {
        if (!dot.nam_hoc) return 0;
        const parts = dot.nam_hoc.split('-');
        return parseInt(parts[0]) || 0;
      });
      
      const maxYear = Math.max(...startYears);
      if (maxYear > 0) {
        nextYear = maxYear + 1;
      }
    }

    setAutoNamHoc(`${nextYear}-${nextYear + 1}`);
    setShowAutoModal(true);
  };

  const executeAutoGenerate = async (e) => {
    e.preventDefault();
    
    // Validate format đơn giản
    if (!/^\d{4}-\d{4}$/.test(autoNamHoc)) {
      setAlertModal({ show: true, message: 'Định dạng năm học không đúng! Vui lòng nhập YYYY-YYYY (VD: 2025-2026)', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch('/api/dot-dang-ky/auto-generate', {
        method: 'POST',
        body: JSON.stringify({ namHoc: autoNamHoc })
      });
      setMessage(`✅ ${res.message}`);
      setShowAutoModal(false);
      loadDotDangKy();
    } catch (err) {
      console.error('Lỗi tạo tự động:', err);
      setMessage(err.message || '❌ Lỗi tạo tự động');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dot) => {
    setIsEditing(true);
    setFormData({
      id: dot.id,
      hocKy: dot.hoc_ky,
      namHoc: dot.nam_hoc,
      thoiGianMo: dayjs(dot.thoi_gian_mo).format('YYYY-MM-DDTHH:mm'),
      thoiGianDong: dayjs(dot.thoi_gian_dong).format('YYYY-MM-DDTHH:mm'),
      ghiChu: dot.ghi_chu || ''
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      hocKy: 'HK1',
      namHoc: '',
      thoiGianMo: '',
      thoiGianDong: '',
      ghiChu: ''
    });
    setShowModal(true);
  };

  const getTrangThaiBadge = (trangThai) => {
    const map = {
      'SAP_MO': 'secondary',
      'DANG_MO': 'success',
      'DA_DONG': 'danger'
    };
    return map[trangThai] || 'secondary';
  };

  const getTrangThaiText = (trangThai) => {
    const map = {
      'SAP_MO': '⏸️ Sắp mở',
      'DANG_MO': '⚡ Đang mở',
      'DA_DONG': '🔒 Đã đóng'
    };
    return map[trangThai] || trangThai;
  };

  // Hàm cưỡng chế Đóng/Mở nhanh
  const handleQuickToggle = (dot, currentStatus) => {
    const newStatus = currentStatus === 'DANG_MO' ? 'DA_DONG' : 'DANG_MO';
    setConfirmModal({
      show: true,
      message: `Xác nhận chuyển sang trạng thái: ${newStatus}?`,
      onConfirm: async () => {
        try {
          await apiFetch(`/api/dot-dang-ky/${dot.id}`, {
            method: 'PUT',
            body: JSON.stringify({ trangThai: newStatus })
          });
          setMessage(`✅ Đã chuyển trạng thái sang ${newStatus}`);
          loadDotDangKy();
        } catch (err) {
          console.error('Lỗi:', err);
          setMessage('❌ Lỗi cập nhật trạng thái');
        }
      }
    });
  };

  return (
    <AdminLayout>
      <div className="container-fluid mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">📅 Quản lý đợt đăng ký học phần</h3>
          <div>
            <button className="btn btn-success me-2" onClick={handleAutoGenerate}>
              ⚡ Tạo tự động theo năm
            </button>
            <button className="btn btn-primary" onClick={handleAddNew}>
              ➕ Thêm đợt mới
            </button>
          </div>
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
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Học kỳ</th>
                      <th>Năm học</th>
                      <th>Thời gian mở</th>
                      <th>Thời gian đóng</th>
                      <th>Trạng thái</th>
                      <th>Ghi chú</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dotList.map((dot) => (
                      <tr key={dot.id}>
                        <td><strong>{dot.hoc_ky}</strong></td>
                        <td><strong>{dot.nam_hoc}</strong></td>
                        <td>{dayjs(dot.thoi_gian_mo).format('DD/MM/YYYY HH:mm')}</td>
                        <td>{dayjs(dot.thoi_gian_dong).format('DD/MM/YYYY HH:mm')}</td>
                        <td>
                          <span className={`badge bg-${getTrangThaiBadge(dot.trang_thai)}`}>
                            {getTrangThaiText(dot.trang_thai)}
                          </span>
                        </td>
                        <td className="text-muted small">{dot.ghi_chu || '-'}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(dot)}
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>
                            
                            {/* Nút toggle nhanh */}
                            {dot.trang_thai === 'DANG_MO' ? (
                              <button 
                                className="btn btn-outline-warning"
                                onClick={() => handleQuickToggle(dot, 'DANG_MO')}
                                title="Đóng ngay"
                              >
                                🔒
                              </button>
                            ) : (
                              <button 
                                className="btn btn-outline-success"
                                onClick={() => handleQuickToggle(dot, 'DA_DONG')} // hoặc SAP_MO
                                title="Mở ngay"
                              >
                                ⚡
                              </button>
                            )}

                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(dot.id)}
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Form */}
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {isEditing ? '✏️ Cập nhật đợt đăng ký' : '➕ Tạo đợt đăng ký mới'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
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
                      <div className="col-md-6">
                        <label className="form-label">Năm học <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="VD: 2025-2026"
                          value={formData.namHoc}
                          onChange={(e) => setFormData({ ...formData, namHoc: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Thời gian mở <span className="text-danger">*</span></label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.thoiGianMo}
                          onChange={(e) => setFormData({ ...formData, thoiGianMo: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Thời gian đóng <span className="text-danger">*</span></label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.thoiGianDong}
                          onChange={(e) => setFormData({ ...formData, thoiGianDong: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Ghi chú</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Ghi chú..."
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
                      {isEditing ? '💾 Lưu thay đổi' : '✅ Tạo mới'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Tự động tạo */}
        {showAutoModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">⚡ Tự động tạo đợt đăng ký</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAutoModal(false)}></button>
                </div>
                <form onSubmit={executeAutoGenerate}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Nhập năm học</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="VD: 2025-2026"
                        value={autoNamHoc}
                        onChange={(e) => setAutoNamHoc(e.target.value)}
                        autoFocus
                        required
                      />
                      <div className="form-text">
                        Hệ thống sẽ tự động tính toán thời gian cho 3 học kỳ (HK1, HK2, HK3) dựa trên năm học này.
                      </div>
                    </div>
                    <div className="alert alert-info small mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Quy tắc:</strong>
                      <ul className="mb-0 ps-3 mt-1">
                        <li>HK1: Đăng ký 01/08 - 15/08</li>
                        <li>HK2: Đăng ký 01/12 - 15/12</li>
                        <li>HK3: Đăng ký 01/05 - 15/05 (năm sau)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAutoModal(false)}>
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-success">
                      <i className="bi bi-lightning-charge-fill me-1"></i> Thực hiện ngay
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
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

      <AlertModal
        show={alertModal.show}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ show: false, message: '', type: 'info' })}
      />
    </AdminLayout>
  );
}

export default QuanLyDotDangKy;
