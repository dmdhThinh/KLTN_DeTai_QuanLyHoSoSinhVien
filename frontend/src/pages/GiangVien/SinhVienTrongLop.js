import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';
import TeacherLayout from '../../components/TeacherLayout';
import * as XLSX from 'xlsx';

function SinhVienTrongLop() {
  const { lopHocPhanId } = useParams();
  const navigate = useNavigate();
  const [lopHocPhan, setLopHocPhan] = useState(null);
  const [sinhVienList, setSinhVienList] = useState([]);
  const [lichHoc, setLichHoc] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load thông tin lớp và sinh viên
  useEffect(() => {
    loadData();
  }, [lopHocPhanId]);

  const loadData = async () => {
    if (!lopHocPhanId) return;
    setLoading(true);
    try {
      // Load thông tin lớp học phần
      const lopData = await apiFetch(`/api/lophocphan/${lopHocPhanId}`);
      setLopHocPhan(lopData);

      // Load danh sách sinh viên
      const svData = await apiFetch(`/api/lophocphan/${lopHocPhanId}/sinhvien`);
      setSinhVienList(svData || []);

      // Load lịch học
      const lichData = await apiFetch(`/api/lich/lop-hoc-phan/${lopHocPhanId}`);
      setLichHoc(lichData || []);
    } catch (err) {
      console.error('Lỗi load dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  // Xuất Excel điểm danh
  const exportDiemDanh = () => {
    if (!lopHocPhan || !sinhVienList.length) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    // Tạo workbook
    const wb = XLSX.utils.book_new();

    // Chuẩn bị dữ liệu
    const data = [];
    
    // Row 1-3: Thông tin lớp
    data.push(['Mã lớp học phần:', lopHocPhan.ma_lop_hoc_phan || lopHocPhan.maLopHocPhan]);
    data.push(['Tên môn học:', lopHocPhan.ten_hoc_phan || lopHocPhan.tenHocPhan]);
    data.push(['Lớp học:', lopHocPhan.ten_lop || lopHocPhan.tenLop || 'N/A']);
    data.push([]); // Row trống
    data.push([]); // Row trống

    // Tính các ngày học dựa trên lịch học
    const ngayBatDau = lopHocPhan.ngay_bat_dau || lopHocPhan.ngayBatDau;
    const ngayKetThuc = lopHocPhan.ngay_ket_thuc || lopHocPhan.ngayKetThuc;
    const cacNgayHoc = [];
    
    if (ngayBatDau && ngayKetThuc && lichHoc.length > 0) {
      // Lấy các thứ học từ lịch học (2 = Thứ 2, 3 = Thứ 3, ...)
      const cacThuHoc = lichHoc.map(l => l.thu || l.thu_hoc).filter(t => t);
      
      const startDate = new Date(ngayBatDau);
      const endDate = new Date(ngayKetThuc);
      let currentDate = new Date(startDate);
      
      // Lặp qua từng ngày từ ngày bắt đầu đến ngày kết thúc
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); // 0=CN, 1=T2, 2=T3,...
        // Convert sang format DB: T2=2, T3=3,..., CN=8
        let thuHoc;
        if (dayOfWeek === 0) {
          thuHoc = 8; // Chủ nhật
        } else {
          thuHoc = dayOfWeek + 1; // 1->2(T2), 2->3(T3),..., 6->7(T7)
        }
        
        // Nếu thứ này có trong lịch học
        if (cacThuHoc.includes(thuHoc)) {
          cacNgayHoc.push(new Date(currentDate));
        }
        
        // Tăng lên 1 ngày
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    // Row 6: Header - STT | Họ đệm | Tên | Các cột ngày học
    const headerRow = ['STT', 'Họ đệm', 'Tên'];
    if (cacNgayHoc.length > 0) {
      cacNgayHoc.forEach(date => {
        // Format: dd/MM/yyyy
        headerRow.push(date.toLocaleDateString('vi-VN', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }));
      });
    } else {
      // Fallback nếu không có lịch: 8 cột trống
      for (let i = 1; i <= 8; i++) {
        headerRow.push('');
      }
    }
    data.push(headerRow);

    // Số ngày học để tính cột
    const soNgayHoc = cacNgayHoc.length > 0 ? cacNgayHoc.length : 8;
    
    // Dữ liệu sinh viên
    sinhVienList.forEach((sv, index) => {
      // Tách họ đệm và tên
      const fullName = sv.ho_ten || sv.hoTen || '';
      const nameParts = fullName.trim().split(' ');
      const ten = nameParts.length > 0 ? nameParts[nameParts.length - 1] : '';
      const hoDem = nameParts.slice(0, -1).join(' ');

      const row = [
        index + 1,
        hoDem,
        ten
      ];
      
      // Thêm ô trống cho mỗi ngày học
      for (let i = 0; i < soNgayHoc; i++) {
        row.push('');
      }
      data.push(row);
    });

    // Tạo worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set độ rộng cột động theo số ngày học
    const colWidths = [
      { wch: 5 },  // STT
      { wch: 20 }, // Họ đệm
      { wch: 10 }, // Tên
    ];
    
    // Thêm độ rộng cho các cột ngày học
    for (let i = 0; i < soNgayHoc; i++) {
      colWidths.push({ wch: 12 });
    }
    
    ws['!cols'] = colWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm danh');

    // Xuất file
    const fileName = `DiemDanh_${lopHocPhan.ma_lop_hoc_phan || lopHocPhan.maLopHocPhan}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <TeacherLayout title="Danh sách sinh viên">
      <div className="container-fluid">
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : !lopHocPhan ? (
          <div className="alert alert-danger">
            Không tìm thấy thông tin lớp học phần!
          </div>
        ) : (
          <>
            {/* Nút quay lại */}
            <div className="mb-3">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate('/teacher/sv-lop')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Quay lại danh sách lớp
              </button>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-people me-2"></i>
                    Danh sách sinh viên
                  </h5>
                  <button
                    className="btn btn-light"
                    onClick={exportDiemDanh}
                    disabled={!sinhVienList.length}
                  >
                    <i className="bi bi-file-earmark-excel me-1"></i>
                    Xuất Excel điểm danh
                  </button>
                </div>
              </div>
              <div className="card-body">
                {/* Thông tin lớp */}
                <div className="row mb-4 p-3 bg-light rounded">
                  <div className="col-md-3">
                    <strong>Mã LHP:</strong>
                    <div className="text-primary">{lopHocPhan.ma_lop_hoc_phan || lopHocPhan.maLopHocPhan}</div>
                  </div>
                  <div className="col-md-4">
                    <strong>Tên môn học:</strong>
                    <div className="text-primary">{lopHocPhan.ten_hoc_phan || lopHocPhan.tenHocPhan}</div>
                  </div>
                  <div className="col-md-3">
                    <strong>Lớp:</strong>
                    <div className="text-primary">{lopHocPhan.ten_lop || lopHocPhan.tenLop || 'N/A'}</div>
                  </div>
                  <div className="col-md-2">
                    <strong>Sĩ số:</strong>
                    <div className="text-primary fw-bold">{sinhVienList.length}</div>
                  </div>
                </div>

                {/* Bảng sinh viên */}
                {sinhVienList.length === 0 ? (
                  <div className="alert alert-info text-center">
                    <i className="bi bi-info-circle me-2"></i>
                    Chưa có sinh viên nào đăng ký lớp này
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover table-striped">
                      <thead className="table-success">
                        <tr>
                          <th style={{ width: '50px' }} className="text-center">STT</th>
                          <th style={{ width: '120px' }}>Mã SV</th>
                          <th>Họ và tên</th>
                          <th style={{ width: '120px' }} className="text-center">Ngày sinh</th>
                          <th style={{ width: '80px' }} className="text-center">Giới tính</th>
                          <th style={{ width: '120px' }}>SĐT</th>
                          <th style={{ width: '200px' }}>Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sinhVienList.map((sv, index) => (
                          <tr key={sv.sinh_vien_id || sv.dang_ky_id || index}>
                            <td className="text-center">{index + 1}</td>
                            <td>{sv.ma_sv}</td>
                            <td>{sv.ho_ten}</td>
                            <td className="text-center">
                              {sv.ngay_sinh
                                ? new Date(sv.ngay_sinh).toLocaleDateString('vi-VN')
                                : 'N/A'}
                            </td>
                            <td className="text-center">{sv.gioi_tinh || 'N/A'}</td>
                            <td>{sv.so_dien_thoai || 'N/A'}</td>
                            <td>{sv.email || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </TeacherLayout>
  );
}

export default SinhVienTrongLop;