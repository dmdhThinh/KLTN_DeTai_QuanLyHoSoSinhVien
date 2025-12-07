import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../api';
import dayjs from 'dayjs';
import { ConfirmModal, AlertModal } from '../../components/Modal';

export default function QuanLyChungChiTiengAnh() {
  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [khoaHoc, setKhoaHoc] = useState('');
  const [lopId, setLopId] = useState('');
  const [khoaHocList, setKhoaHocList] = useState([]);
  const [lopList, setLopList] = useState([]);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedSinhVien, setSelectedSinhVien] = useState(null);
  const [formData, setFormData] = useState({
    loai_chung_chi: 'TOEIC',
    ngay_cap: '',
    diem: '',
    ghi_chu: ''
  });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' });

  // Load danh sách filter
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const result = await apiFetch('/api/import/english-certificates/filters');
        if (result.success) {
          setKhoaHocList(result.khoaHocList || []);
          setLopList(result.lopList || []);
        }
      } catch (err) {
        console.error('Lỗi load filters:', err);
      }
    };
    loadFilters();
  }, []);

  // Load danh sách sinh viên
  const loadDanhSach = async (page = pagination.page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: search,
        khoa_hoc: khoaHoc,
        lop_id: lopId
      });
      
      const result = await apiFetch(`/api/import/english-certificates/manage?${params.toString()}`);
      if (result.success) {
        setDanhSach(result.data || []);
        setPagination(result.pagination || pagination);
      }
    } catch (err) {
      console.error('Lỗi load danh sách:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDanhSach(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, khoaHoc, lopId]);

  // Mở modal thêm
  const handleAdd = (sinhVien) => {
    setSelectedSinhVien(sinhVien);
    setModalMode('add');
    setFormData({
      loai_chung_chi: 'TOEIC',
      ngay_cap: '',
      diem: '',
      ghi_chu: ''
    });
    setShowModal(true);
  };

  // Mở modal sửa
  const handleEdit = (sinhVien) => {
    setSelectedSinhVien(sinhVien);
    setModalMode('edit');
    setFormData({
      loai_chung_chi: sinhVien.loai_chung_chi || 'TOEIC',
      ngay_cap: sinhVien.ngay_cap ? dayjs(sinhVien.ngay_cap).format('YYYY-MM-DD') : '',
      diem: sinhVien.diem || '',
      ghi_chu: sinhVien.ghi_chu || ''
    });
    setShowModal(true);
  };

  // Lưu chứng chỉ
  const handleSave = async () => {
    try {
      if (modalMode === 'add') {
        await apiFetch('/api/import/english-certificates', {
          method: 'POST',
          body: JSON.stringify({
            sinh_vien_id: selectedSinhVien.sinh_vien_id,
            ...formData
          })
        });
      } else {
        await apiFetch(`/api/import/english-certificates/${selectedSinhVien.chung_chi_id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      }
      
      setShowModal(false);
      loadDanhSach(pagination.page);
    } catch (err) {
      setAlertModal({ show: true, message: 'Lỗi: ' + (err.message || 'Không thể lưu chứng chỉ'), type: 'danger' });
    }
  };

  // Xóa chứng chỉ
  const handleDelete = (chungChiId, sinhVienId) => {
    setConfirmModal({
      show: true,
      message: 'Bạn có chắc chắn muốn xóa chứng chỉ này?',
      onConfirm: async () => {
        try {
          await apiFetch(`/api/import/english-certificates/${chungChiId}`, {
            method: 'DELETE'
          });
          loadDanhSach(pagination.page);
        } catch (err) {
          setAlertModal({ show: true, message: 'Lỗi: ' + (err.message || 'Không thể xóa chứng chỉ'), type: 'danger' });
        }
      }
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      loadDanhSach(newPage);
    }
  };

  return (
    <AdminLayout activeMenu="quan-ly-chung-chi" title="Quản lý Chứng chỉ Tiếng Anh">
      {/* Filter */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Tìm kiếm</label>
              <input
                type="text"
                className="form-control"
                placeholder="Mã SV hoặc tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Khóa học</label>
              <select
                className="form-select"
                value={khoaHoc}
                onChange={(e) => setKhoaHoc(e.target.value)}
              >
                <option value="">Tất cả</option>
                {khoaHocList.map(kh => (
                  <option key={kh} value={kh}>{kh}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Lớp</label>
              <select
                className="form-select"
                value={lopId}
                onChange={(e) => setLopId(e.target.value)}
              >
                <option value="">Tất cả</option>
                {lopList.map(lop => (
                  <option key={lop.id} value={lop.id}>{lop.ten_lop}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={() => loadDanhSach(1)}>
                🔄 Tải lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách */}
      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">📋 Danh sách Sinh viên và Chứng chỉ Tiếng Anh</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : danhSach.length === 0 ? (
            <div className="text-center py-4 text-muted">Không có dữ liệu</div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '600px' }}>
              <table className="table table-bordered table-hover mb-0">
                <thead className="table-light sticky-top">
                  <tr>
                    <th style={{ width: '50px' }}>STT</th>
                    <th style={{ width: '120px' }}>Mã SV</th>
                    <th>Họ tên</th>
                    <th style={{ width: '100px' }}>Khóa học</th>
                    <th style={{ width: '120px' }}>Lớp</th>
                    <th style={{ width: '120px' }}>Loại CC</th>
                    <th style={{ width: '100px' }}>Điểm</th>
                    <th style={{ width: '120px' }}>Ngày cấp</th>
                    <th>Ghi chú</th>
                    <th style={{ width: '150px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {danhSach.map((item, index) => (
                    <tr 
                      key={item.sinh_vien_id} 
                      className={item.co_chung_chi ? '' : 'table-warning'}
                    >
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td><strong>{item.ma_sv}</strong></td>
                      <td>{item.ho_ten}</td>
                      <td>{item.khoa_hoc}</td>
                      <td>{item.ten_lop || '-'}</td>
                      <td>
                        {item.co_chung_chi ? (
                          <span className="badge bg-success">{item.loai_chung_chi}</span>
                        ) : (
                          <span className="badge bg-secondary">Chưa có</span>
                        )}
                      </td>
                      <td className="text-center fw-bold">
                        {item.co_chung_chi ? (item.diem || '-') : '-'}
                      </td>
                      <td>
                        {item.co_chung_chi && item.ngay_cap 
                          ? dayjs(item.ngay_cap).format('DD/MM/YYYY') 
                          : '-'}
                      </td>
                      <td><small>{item.co_chung_chi ? (item.ghi_chu || '-') : '-'}</small></td>
                      <td>
                        {item.co_chung_chi ? (
                          <>
                            <button
                              className="btn btn-sm btn-warning me-1"
                              onClick={() => handleEdit(item)}
                              title="Sửa"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(item.chung_chi_id, item.sinh_vien_id)}
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleAdd(item)}
                            title="Thêm chứng chỉ"
                          >
                            ➕ Thêm
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} bản ghi
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(pagination.page - 1)}>Trước</button>
                </li>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
                  if (pageNum > pagination.totalPages) return null;
                  return (
                    <li key={pageNum} className={`page-item ${pageNum === pagination.page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(pageNum)}>{pageNum}</button>
                    </li>
                  );
                })}
                <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(pagination.page + 1)}>Sau</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'add' ? '➕ Thêm chứng chỉ' : '✏️ Sửa chứng chỉ'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Sinh viên</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`${selectedSinhVien?.ma_sv} - ${selectedSinhVien?.ho_ten}`}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Loại chứng chỉ <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={formData.loai_chung_chi}
                    onChange={(e) => setFormData({ ...formData, loai_chung_chi: e.target.value })}
                  >
                    <option value="TOEIC">TOEIC</option>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEFL ITP">TOEFL ITP</option>
                    <option value="TOEFL IBT">TOEFL IBT</option>
                    <option value="VSTEP">VSTEP</option>
                    <option value="TOEIC 4 kỹ năng">TOEIC 4 kỹ năng</option>
                    <option value="Cambridge Tests">Cambridge Tests</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Ngày cấp</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.ngay_cap}
                    onChange={(e) => setFormData({ ...formData, ngay_cap: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Điểm</label>
                  <input
                    type="number"
                    className="form-control"
                    step="0.1"
                    value={formData.diem}
                    onChange={(e) => setFormData({ ...formData, diem: e.target.value })}
                    placeholder="VD: 650 (TOEIC) hoặc 6.5 (IELTS)"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.ghi_chu}
                    onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
                    placeholder="VD: Đã nộp bản gốc"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                  {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

