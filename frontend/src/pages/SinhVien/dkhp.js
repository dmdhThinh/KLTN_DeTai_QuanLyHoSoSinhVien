import React, { useEffect, useState } from 'react';
import { getSinhVienId, apiFetch } from '../../api';
import StudentLayout from '../../components/StudentLayout';
import dayjs from 'dayjs';
import '../../styles/SinhVien/Dkhp.css'; // Tạo file CSS nếu cần

// Helper
const formatDate = (d) => dayjs(d).format('DD/MM/YYYY HH:mm');

// Popup chi tiết lớp học phần
function ChiTietLopHocPhan({ lhp, onClose, onRegister }) {
  const [data, setData] = useState({ header: null, lich: [] });

  useEffect(() => {
    (async () => {
      const rs = await apiFetch(`/api/dkhp/lich/${lhp.id}`);
      setData(rs);
    })();
  }, [lhp]);

  return (
    <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">CHI TIẾT LỚP HỌC PHẦN</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {data.header && (
              <div className="mb-3">
                <div><strong>{data.header.ten_hoc_phan}</strong> — {data.header.ma_lop_hoc_phan}</div>
                <div>GV: {data.header.giang_vien} • Thời gian: {dayjs(data.header.ngay_bat_dau).format('DD/MM/YYYY')} - {dayjs(data.header.ngay_ket_thuc).format('DD/MM/YYYY')}</div>
                <div>Sĩ số: {data.header.da_dang_ky}/{data.header.si_so_toi_da}</div>
              </div>
            )}
            <table className="table table-bordered table-sm">
              <thead className="table-primary">
                <tr>
                  <th>STT</th>
                  <th>Lịch học</th>
                  <th>Phòng</th>
                  <th>Dãy nhà</th>
                  <th>Cơ sở</th>
                  <th>Giảng viên</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {data.lich.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>Thứ {r.thu} (T{r.tiet_bat_dau} → T{r.tiet_ket_thuc})</td>
                    <td>{r.phong}</td>
                    <td>{r.day_nha || (r.phong ? r.phong.charAt(0) : '')}</td>
                    <td>{r.co_so}</td>
                    <td>{data.header?.giang_vien || ''}</td>
                    <td>
                      {data.header?.ngay_bat_dau && data.header?.ngay_ket_thuc ? (
                        `${dayjs(data.header.ngay_bat_dau).format('DD/MM/YYYY')} - ${dayjs(data.header.ngay_ket_thuc).format('DD/MM/YYYY')}`
                      ) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DkhpPage() {
  const [dot, setDot] = useState(null);
  const [available, setAvailable] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [pendingHP, setPendingHP] = useState([]);
  const [selectedHP, setSelectedHP] = useState(null);
  const [selectedLhp, setSelectedLhp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); // Thông báo thành công/lỗi
  const [messageType, setMessageType] = useState(''); // 'success' hoặc 'error'
  const sinhVienId = getSinhVienId();
  
  // Dropdown chọn học kỳ, năm học
  const [selectedHocKy, setSelectedHocKy] = useState('HK1');
  const [selectedNamHoc, setSelectedNamHoc] = useState('2025-2026');
  
  // Filter checkbox
  const [hideConflictClasses, setHideConflictClasses] = useState(false);
  
  // Loại đăng ký: HOC_MOI, HOC_LAI, HOC_CAI_THIEN
  const [loaiDangKy, setLoaiDangKy] = useState('HOC_MOI');
  
  // state mới
  const [selectedClass, setSelectedClass] = useState(null);     // lớp học phần đã chọn ở bảng giữa
  const [classDetail, setClassDetail] = useState({ header: null, lich: [] }); // lịch chi tiết lớp
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null); // { dangKyId, lopHocPhanId } cần hủy
  const [errorModal, setErrorModal] = useState(null); // Hiển thị lỗi không thể hủy
  
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);


// khi đổi môn => reset lớp & chi tiết
useEffect(() => {
  setSelectedClass(null);
  setClassDetail({ header: null, lich: [] });
}, [selectedHP]);

// hàm load chi tiết lịch của 1 lớp
const loadClassDetail = async (lop) => {
  setSelectedClass(lop);
  const rs = await apiFetch(`/api/dkhp/lich/${lop.id}`);
  setClassDetail(rs);
};


  // Load dữ liệu khi thay đổi học kỳ/năm học
  useEffect(() => {
    if (!sinhVienId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        let d = null;
        try {
          d = await apiFetch('/api/dkhp/dot/current');
        } catch (e) {
          // Không có đợt thì thôi, vẫn load dữ liệu xem chơi
        }
        setDot(d);

        // Sử dụng học kỳ/năm học từ dropdown
        const [avail, regs, pend] = await Promise.all([
          apiFetch(`/api/dkhp/available?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${d?.id || ''}`),
          apiFetch(`/api/dkhp/my?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${d?.id || ''}`),
          apiFetch(`/api/dkhp/hp/pending?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${d?.id || ''}`)
        ]);
        setAvailable(avail);
        setRegistered(regs);
        setPendingHP(pend);
      } catch (err) {
        console.error(err);
        setMessage('Lỗi tải dữ liệu: ' + (err.message || 'Unknown error'));
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sinhVienId, selectedHocKy, selectedNamHoc]);

  // Load danh sách môn theo loại đăng ký
  useEffect(() => {
    if (!sinhVienId) return; // Bỏ check dot để cho phép xem trước

    const loadPending = async () => {
      try {
        let pend = [];
        
        if (loaiDangKy === 'HOC_LAI') {
          // Lấy danh sách môn rớt
          pend = await apiFetch(`/api/dkhp/mon-rot?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
        } else if (loaiDangKy === 'HOC_CAI_THIEN') {
          // Lấy danh sách môn cải thiện
          pend = await apiFetch(`/api/dkhp/mon-cai-thien?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
        } else {
          // HOC_MOI: Lấy môn chưa học (pending)
          // Chú ý: API pending cũ cần dot_dang_ky_id, nhưng nếu xem trước thì có thể không cần hoặc API xử lý null
          // Tuy nhiên trong dkhpController mới tôi thấy nó vẫn nhận dot_dang_ky_id optional
          pend = await apiFetch(`/api/dkhp/hp/pending?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${dot?.id || ''}`);
        }
        
        setPendingHP(pend);
      } catch (err) {
        console.error('Lỗi load danh sách môn:', err);
      }
    };

    loadPending();
  }, [sinhVienId, loaiDangKy, selectedHocKy, selectedNamHoc, dot]);

  // Đăng ký
  const handleRegister = async (lhp) => {
    // Kiểm tra trùng lịch
    if (lhp.xung_dot_lich) {
      setMessage('⚠️ CẢNH BÁO: Lớp học phần này trùng lịch với các môn bạn đã đăng ký! Vui lòng chọn lớp học phần khác.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    try {
      // Gọi API đăng ký
      const res = await apiFetch('/api/dkhp/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sinh_vien_id: sinhVienId,
          lop_hoc_phan_id: lhp.id,
          dot_dang_ky_id: dot.id,
          loai_dang_ky: loaiDangKy  // Gửi loại đăng ký đã chọn
        })
      });

      // Thông báo nhẹ
      setMessage('✅ Đăng ký thành công!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);

      // ---- REFRESH dữ liệu để cập nhật "Đã đăng ký" + disable nút nếu hết chỗ ----
      // available: lớp đang mở trong kỳ
      const avail = await apiFetch(
        `/api/dkhp/available?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${dot?.id || ''}`
      );
      setAvailable(avail);

      // registered: các lớp SV đã đăng ký trong kỳ này
      const regs = await apiFetch(
        `/api/dkhp/my?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${dot?.id || ''}`
      );
      setRegistered(regs);

      // Refresh danh sách môn pending (để bỏ môn vừa đăng ký)
      let pend = [];
      if (loaiDangKy === 'HOC_LAI') {
        pend = await apiFetch(`/api/dkhp/mon-rot?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
      } else if (loaiDangKy === 'HOC_CAI_THIEN') {
        pend = await apiFetch(`/api/dkhp/mon-cai-thien?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
      } else {
        pend = await apiFetch(`/api/dkhp/hp/pending?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${dot?.id || ''}`);
      }
      setPendingHP(pend);

      // Chi tiết lớp đang chọn (để bảng "CHI TIẾT LỚP HỌC PHẦN" cập nhật ngay)
      if (selectedClass?.id === lhp.id) {
        const detail = await apiFetch(`/api/dkhp/lich/${lhp.id}`);
        setClassDetail(detail);
      }

    } catch (err) {
      // Lấy message rõ ràng từ backend nếu có
      let msg = 'Lỗi đăng ký';
      try {
        const data = await err.response?.json();
        if (data?.message) msg = data.message;
      } catch (_) {
        if (err.message) msg = err.message;
      }
      setMessage(msg);
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Hủy đăng ký
  // HỦY ĐĂNG KÝ: xoá ngay trên UI + refetch lại dữ liệu
  const handleCancel = async () => {
    if (!confirmCancel) return;
    const { dangKyId, lopHocPhanId } = confirmCancel;
    setConfirmCancel(null);

    try {
      await apiFetch(`/api/dkhp/register/${dangKyId}`, { method: 'DELETE' });

      // 1) Optimistic update: gỡ ngay khỏi bảng "đã đăng ký"
      setRegistered(prev => prev.filter(x => x.id !== dangKyId));

      // 2) Refetch lại 2 danh sách để đồng bộ số "Đã đăng ký"/slot
      const [avail, regs] = await Promise.all([
        apiFetch(`/api/dkhp/available?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${dot?.id || ''}`),
        apiFetch(`/api/dkhp/my?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${dot?.id || ''}`)
      ]);
      setAvailable(avail);
      setRegistered(regs);

      // Refresh danh sách môn pending (để môn xuất hiện lại sau khi hủy)
      let pend = [];
      if (loaiDangKy === 'HOC_LAI') {
        pend = await apiFetch(`/api/dkhp/mon-rot?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
      } else if (loaiDangKy === 'HOC_CAI_THIEN') {
        pend = await apiFetch(`/api/dkhp/mon-cai-thien?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
      } else {
        pend = await apiFetch(`/api/dkhp/hp/pending?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${dot?.id || ''}`);
      }
      setPendingHP(pend);

      // 3) Nếu đang mở chi tiết đúng lớp này thì load lại để cập nhật sĩ số
      if (selectedClass && (!lopHocPhanId || lopHocPhanId === selectedClass.id)) {
        const detail = await apiFetch(`/api/dkhp/lich/${selectedClass.id}`);
        setClassDetail(detail);
      }

      setMessage('✅ Đã hủy đăng ký thành công!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      // Parse message nếu backend trả về JSON string
      let errorMessage = err.message || 'Lỗi khi hủy đăng ký';
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.message) errorMessage = parsed.message;
      } catch (_) {
        // Nếu không parse được JSON, dùng message gốc
      }
      
      // Hiển thị modal lỗi
      setErrorModal({
        title: '⚠️ Không thể hủy đăng ký',
        message: errorMessage
      });
    }
  };


  if (loading) return <div className="text-center p-5">Đang tải...</div>;
// đặt trước phần return:
const getDaDangKy = (l) => {
  if (l.da_dang_ky != null) return l.da_dang_ky;           // API trả về trực tiếp
  if (l.so_da_dk != null) return l.so_da_dk;               // tên khác
  if (l.si_so_da_dk != null) return l.si_so_da_dk;         // cột đếm trong bảng LHP
  if (l.si_so_toi_da != null && l.slot_con != null) {      // chỉ có slot_con
    return l.si_so_toi_da - l.slot_con;
  }
  return '';
};

  return (
    
    <StudentLayout title="Đăng ký học phần">
      <div className="container-fluid py-4">
        <h3 className="text-center text-primary mb-4">ĐĂNG KÝ HỌC PHẦN</h3>
        {/* Thông báo thành công/lỗi */}
        {message && (
          <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
          </div>
        )}
        
        
        {/* Header: Dropdown chọn học kỳ, năm học */}
        <div className="row mb-4 align-items-center">
          <div className="col-md-6">
            <div className="d-flex gap-3 align-items-center">
              <label className="fw-bold" style={{ minWidth: '120px' }}>Đợt đăng ký</label>
              
              {/* Dropdown Học kỳ */}
              <select 
                className="form-select" 
                style={{ width: '150px' }}
                value={selectedHocKy}
                onChange={(e) => setSelectedHocKy(e.target.value)}
              >
                <option value="HK1">HK1</option>
                <option value="HK2">HK2</option>
                <option value="HK3">HK3</option>
              </select>
              
              {/* Dropdown Năm học */}
              <select 
                className="form-select" 
                style={{ width: '180px' }}
                value={selectedNamHoc}
                onChange={(e) => setSelectedNamHoc(e.target.value)}
              >
                <option value="2024-2025">2024 - 2025</option>
                <option value="2025-2026">2025 - 2026</option>
                <option value="2026-2027">2026 - 2027</option>
              </select>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="d-flex gap-3">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name="loaiDK" 
                  id="hocMoi" 
                  checked={loaiDangKy === 'HOC_MOI'}
                  onChange={() => setLoaiDangKy('HOC_MOI')}
                  disabled={!dot}
                />
                <label className="form-check-label" htmlFor="hocMoi">
                  HỌC MỚI
                </label>
              </div>
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name="loaiDK" 
                  id="hocLai"
                  checked={loaiDangKy === 'HOC_LAI'}
                  onChange={() => setLoaiDangKy('HOC_LAI')}
                  disabled={!dot}
                />
                <label className="form-check-label" htmlFor="hocLai">
                  HỌC LẠI
                </label>
              </div>
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name="loaiDK" 
                  id="hocCaiThien"
                  checked={loaiDangKy === 'HOC_CAI_THIEN'}
                  onChange={() => setLoaiDangKy('HOC_CAI_THIEN')}
                  disabled={!dot}
                />
                <label className="form-check-label" htmlFor="hocCaiThien">
                  HỌC CẢI THIỆN
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Cảnh báo nếu không có đợt */}
        {!dot && (
          <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: '1.2rem' }}></i>
            <div>
              <strong>Ngoài thời gian đăng ký!</strong> Bạn chỉ có thể xem danh sách môn học và lịch, không thể thực hiện đăng ký.
            </div>
          </div>
        )}

        {/* Bảng 1: MÔN HỌC PHẦN ĐANG CHỜ ĐĂNG KÝ */}
        <div className="card mb-4">
          <div className="card-header bg-warning text-dark">
            <strong>MÔN HỌC PHẦN ĐANG CHỜ ĐĂNG KÝ</strong>
          </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th></th>
                      <th>STT</th>
                      <th>Mã HP</th>
                      <th>Tên môn học</th>
                      <th>TC</th>
                      <th>Bắt buộc</th>
                      <th>HP tiên quyết</th>
                      <th>HP tương đương</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingHP.length === 0 ? (
                      <tr><td colSpan="8" className="text-center text-muted">Không có môn chờ đăng ký</td></tr>
                    ) : (
                      pendingHP.map((hp, idx) => (
                        <tr
                          key={hp.hoc_phan_id}
                          className={selectedHP?.hoc_phan_id === hp.hoc_phan_id ? 'table-info' : ''}
                          onClick={() => setSelectedHP(hp)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <input
                              type="radio"
                              checked={selectedHP?.hoc_phan_id === hp.hoc_phan_id}
                              readOnly
                            />
                          </td>
                          <td>{idx + 1}</td>
                          <td>{hp.ma_hoc_phan}</td>
                          <td>{hp.ten_hoc_phan}</td>
                          <td>{hp.tc}</td>
                          <td>{hp.bat_buoc ? 'Có' : 'Không'}</td>
                          <td>{hp.hoc_phan_tien_quyet || '-'}</td>
                          <td>{hp.hoc_phan_tuong_duong || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* ===== Bảng 2: LỚP HỌC PHẦN CHỜ ĐĂNG KÝ ===== */}
{selectedHP && (
<div className="card mb-4">
  <div className="card-header" style={{background:'#ffb100'}}>
    <div className="d-flex justify-content-between align-items-center">
      <strong>LỚP HỌC PHẦN CHỜ ĐĂNG KÝ</strong>
      <div className="form-check">
        <input 
          className="form-check-input" 
          type="checkbox" 
          id="hideConflict"
          checked={hideConflictClasses}
          onChange={(e) => setHideConflictClasses(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="hideConflict" style={{color: '#dc3545', fontWeight: 'bold'}}>
          HIỂN THỊ LỚP HỌC PHẦN KHÔNG TRÙNG LỊCH
        </label>
      </div>
    </div>
  </div>
  <div className="table-responsive">
    <table className="table table-hover mb-0">
      <thead className="table-light">
        <tr>
          <th></th>
          <th>STT</th>
          <th>Mã LHP</th>
          <th>Tên lớp học phần</th>
          
          <th>Sĩ số tối đa</th>
          <th>Đã đăng ký</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {available
          .filter(l => l.hoc_phan_id === selectedHP.hoc_phan_id)
          .filter(l => !hideConflictClasses || !l.xung_dot_lich)
          .map((l, i) => (
          <tr key={l.id}
              className={selectedClass?.id===l.id ? 'table-warning' : (l.xung_dot_lich ? 'table-danger' : '')}
              onClick={() => loadClassDetail(l)}
              style={{cursor:'pointer'}}
              title={l.xung_dot_lich ? '⚠️ Lớp này trùng lịch với các môn đã đăng ký' : ''}>
            <td>
              <input type="radio" readOnly checked={selectedClass?.id===l.id}/>
            </td>
            <td>{i+1}</td>
            <td>
              {l.ma_lop_hoc_phan || l.ma_lhp}
              {l.xung_dot_lich && <span className="badge bg-danger ms-1">Trùng lịch</span>}
            </td>
            <td>{l.ten_lop_hoc_phan || l.ten_hoc_phan}</td>
            <td>{l.si_so_toi_da ?? ''}</td>
            
            <td>{getDaDangKy(l)}</td>
            <td>{l.trang_thai_dk || l.trang_thai || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
)}


            {/* ===== Bảng 3: CHI TIẾT LỚP HỌC PHẦN ===== */}
<div className="card mb-4">
  <div className="card-header bg-primary text-white">
    <strong>CHI TIẾT LỚP HỌC PHẦN</strong>
  </div>

  {!selectedClass ? (
    <div className="p-3 text-muted">Hãy chọn 1 lớp học phần ở bảng trên.</div>
  ) : (
    <>
     
      
      <div className="table-responsive">
        <table className="table table-bordered table-sm mb-0">
          <thead className="table-primary">
            <tr>
              <th>STT</th><th>Thứ</th><th>Ca</th><th>Tiết</th><th>Phòng</th><th>Cơ sở</th><th>Giảng viên</th><th>Thời gian</th><th>Loại</th>
            </tr>
          </thead>
          <tbody>
            {classDetail.lich.map((r, i) => (
              <tr key={r.id}>
                <td>{i+1}</td>
                <td>Thứ {r.thu}</td>
                <td>{r.ca || ''}</td>
                <td>T{r.tiet_bat_dau} → T{r.tiet_ket_thuc}</td>
                <td>{r.phong}</td>
                
                <td>{r.co_so}</td>
                <td>{classDetail.header?.giang_vien || ''}</td>
                <td>
                  {classDetail.header?.ngay_bat_dau && classDetail.header?.ngay_ket_thuc ? (
                    <>
                      {dayjs(classDetail.header.ngay_bat_dau).format('DD/MM/YYYY')} → {dayjs(classDetail.header.ngay_ket_thuc).format('DD/MM/YYYY')}
                    </>
                  ) : (
                    r.ngay_hoc ? dayjs(r.ngay_hoc).format('DD/MM/YYYY') : ''
                  )}
                </td>
                <td>{r.loai}</td>
              </tr>
            ))}
            {classDetail.lich.length===0 && (
              <tr><td colSpan="10" className="text-center text-muted">Chưa có lịch</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3">
        {selectedClass?.xung_dot_lich && (
          <div className="alert alert-danger mb-3" role="alert">
            <strong>⚠️ CẢNH BÁO:</strong> Lớp học phần này trùng lịch với các môn bạn đã đăng ký!
          </div>
        )}
        {!selectedClass?.du_dieu_kien && (
          <div className="alert alert-warning mb-3" role="alert">
            <strong>⚠️ CẢNH BÁO:</strong> Bạn chưa đủ điều kiện học môn này (chưa hoàn thành học phần tiên quyết).
          </div>
        )}
        <button
          className="btn btn-success"
          disabled={
            !selectedClass?.du_dieu_kien ||
            selectedClass?.xung_dot_lich ||
            (selectedClass?.slot_con != null
              ? selectedClass.slot_con <= 0
              : (selectedClass?.si_so_toi_da != null && getDaDangKy(selectedClass) >= selectedClass.si_so_toi_da))
          }
          onClick={() => handleRegister(selectedClass)}
        >
          Đăng ký môn học
        </button>
      </div>
    </>
  )}
</div>


            {/* Bảng 3: LỚP HỌC PHẦN ĐÃ ĐĂNG KÝ */}
            <div className="card">
              <div className="card-header text-white" style={{ backgroundColor: '#fd7e14' }}>
                <strong>LỚP HỌC PHẦN ĐÃ ĐĂNG KÝ TRONG HỌC KỲ NÀY</strong>
              </div>
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Thao tác</th>
                      <th>STT</th>
                      <th>Mã LHP</th>
                      <th>Tên môn học</th>
                     
                      <th>Số TC</th>
                      <th>Học phí</th>
                      <th>Hạn nộp</th>
                      
                      <th>Ngày ĐK</th>
                      <th>Trạng thái LHP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registered.length === 0 ? (
                      <tr><td colSpan="10" className="text-center text-muted">Chưa đăng ký lớp nào</td></tr>
                    ) : (
                      registered.map((r, i) => (
                        <tr key={r.id}>
                          <td className="position-relative">
  <button
    className="btn btn-sm btn-outline-secondary"
    onClick={(e) => {
      e.stopPropagation();
      setOpenMenuId(openMenuId === r.id ? null : r.id);
    }}
  >
    ⋯
  </button>

  {openMenuId === r.id && (
    <div
      className="dropdown-menu show"
      style={{ position: 'absolute', inset: 'auto auto auto 0', zIndex: 1000 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="dropdown-item"
        onClick={() => {
          setSelectedLhp({ id: r.lop_hoc_phan_id });
          setOpenMenuId(null);
        }}
      >
        Xem
      </button>
      <button
        className="dropdown-item text-danger"
        onClick={() => {
          setOpenMenuId(null);
          setConfirmCancel({ dangKyId: r.id, lopHocPhanId: r.lop_hoc_phan_id });
        }}
      >
        Hủy đăng ký
      </button>
    </div>
  )}
</td>

                          <td>{i + 1}</td>
                          <td>{r.ma_lop_hoc_phan || ''}</td>
                          <td>{r.ten_hoc_phan}</td>
                          
                          <td>{r.so_tc || ''}</td>
                          <td>{r.hoc_phi ? `${r.hoc_phi.toLocaleString()}đ` : ''}</td>
                          <td>{r.han_nop ? dayjs(r.han_nop).format('DD/MM/YYYY') : ''}</td>
                          
                          <td>{formatDate(r.thoi_diem_dk)}</td>
                          <td>{r.trang_thai_lhp || ''}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal chi tiết lớp học phần */}
            {selectedLhp && (
              <ChiTietLopHocPhan
                lhp={selectedLhp}
                onClose={() => setSelectedLhp(null)}
                onRegister={handleRegister}
              />
            )}
             {/* Modal xác nhận hủy đăng ký */}
            {confirmCancel && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                      <h5 className="modal-title">⚠️ Xác nhận hủy đăng ký</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setConfirmCancel(null)}></button>
                    </div>
                    <div className="modal-body">
                      <p className="mb-2"><strong>Bạn có chắc chắn muốn hủy đăng ký lớp học phần này?</strong></p>
                      <p className="text-muted mb-0">
                        <small>⚠️ Hành động này không thể hoàn tác. Bạn sẽ phải đăng ký lại nếu muốn học lớp này.</small>
                      </p>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-secondary" onClick={() => setConfirmCancel(null)}>
                        Không, giữ lại
                      </button>
                      <button className="btn btn-danger" onClick={handleCancel}>
                        <i className="bi bi-trash me-1"></i> Xác nhận hủy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal hiển thị lỗi không thể hủy */}
            {errorModal && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                      <h5 className="modal-title">{errorModal.title}</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setErrorModal(null)}></button>
                    </div>
                    <div className="modal-body">
                      <p className="mb-3">
                        <i className="bi bi-exclamation-circle-fill text-danger me-2"></i>
                        <strong>{errorModal.message}</strong>
                      </p>
                      <p className="text-muted mb-0">
                        <small>💡 <strong>Lưu ý:</strong> Lớp học phần đã được chấp nhận mở không thể hủy đăng ký. Vui lòng liên hệ phòng đào tạo nếu cần hỗ trợ.</small>
                      </p>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-secondary" onClick={() => setErrorModal(null)}>
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
      </div>
    </StudentLayout>
  );
}