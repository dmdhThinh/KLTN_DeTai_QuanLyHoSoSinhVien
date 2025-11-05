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
                  <th>#</th><th>Thứ</th><th>Ca</th><th>Tiết</th><th>Phòng</th><th>Cơ sở</th><th>Ngày</th><th>Loại</th>
                </tr>
              </thead>
              <tbody>
                {data.lich.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>Thứ {r.thu}</td>
                    <td>{r.ca}</td>
                    <td>T{r.tiet_bat_dau} → T{r.tiet_ket_thuc}</td>
                    <td>{r.phong}</td>
                    <td>{r.co_so}</td>
                    <td>{r.ngay_hoc ? dayjs(r.ngay_hoc).format('DD/MM/YYYY') : ''}</td>
                    <td>{r.loai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
            <button className="btn btn-success" onClick={() => onRegister(lhp)}>Đăng ký</button>
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
  const sinhVienId = getSinhVienId();
  // state mới
const [selectedClass, setSelectedClass] = useState(null);     // lớp học phần đã chọn ở bảng giữa
const [classDetail, setClassDetail] = useState({ header: null, lich: [] }); // lịch chi tiết lớp
const [openMenuId, setOpenMenuId] = useState(null);
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


  // Load dữ liệu
  useEffect(() => {
    if (!sinhVienId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const d = await apiFetch('/api/dkhp/dot/current');
        setDot(d);

        if (d) {
          const [avail, regs, pend] = await Promise.all([
            apiFetch(`/api/dkhp/available?sinh_vien_id=${sinhVienId}&hoc_ky=${d.hoc_ky}&nam_hoc=${d.nam_hoc}&dot_dang_ky_id=${d.id}`),
            apiFetch(`/api/dkhp/my?sinh_vien_id=${sinhVienId}&dot_dang_ky_id=${d.id}`),
            apiFetch(`/api/dkhp/hp/pending?sinh_vien_id=${sinhVienId}&hoc_ky=${d.hoc_ky}&nam_hoc=${d.nam_hoc}&dot_dang_ky_id=${d.id}`)
          ]);
          setAvailable(avail);
          setRegistered(regs);
          setPendingHP(pend);
        }
      } catch (err) {
        console.error(err);
        alert('Lỗi tải dữ liệu: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sinhVienId]);

  // Đăng ký
  const handleRegister = async (lhp) => {
  if (!window.confirm('Xác nhận đăng ký lớp này?')) return;

  try {
    // Gọi API đăng ký
    const res = await apiFetch('/api/dkhp/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sinh_vien_id: sinhVienId,
        lop_hoc_phan_id: lhp.id,
        dot_dang_ky_id: dot.id,
        loai_dang_ky: 'HOC_MOI'
      })
    });

    // Thông báo nhẹ
    alert('Đăng ký thành công!');

    // ---- REFRESH dữ liệu để cập nhật "Đã đăng ký" + disable nút nếu hết chỗ ----
    // available: lớp đang mở trong kỳ
    const avail = await apiFetch(
      `/api/dkhp/available?sinh_vien_id=${sinhVienId}&hoc_ky=${dot.hoc_ky}&nam_hoc=${dot.nam_hoc}&dot_dang_ky_id=${dot.id}`
    );
    setAvailable(avail);

    // registered: các lớp SV đã đăng ký trong kỳ này
    const regs = await apiFetch(
      `/api/dkhp/my?sinh_vien_id=${sinhVienId}&dot_dang_ky_id=${dot.id}`
    );
    setRegistered(regs);

    // Chi tiết lớp đang chọn (để bảng "CHI TIẾT LỚP HỌC PHẦN" cập nhật ngay)
    if (selectedClass?.id === lhp.id) {
      const detail = await apiFetch(`/api/dkhp/lich/${lhp.id}`);
      setClassDetail(detail);
    }

    // (Tuỳ bạn) nếu bạn đang lưu selectedHP => giữ nguyên; không cần reload toàn trang nữa.
  } catch (err) {
    // Lấy message rõ ràng từ backend nếu có
    let msg = 'Lỗi đăng ký';
    try {
      const data = await err.response?.json();
      if (data?.message) msg = data.message;
    } catch (_) {
      if (err.message) msg = err.message;
    }
    alert(msg);
  }
};


  // Hủy đăng ký
 // HỦY ĐĂNG KÝ: xoá ngay trên UI + refetch lại dữ liệu
const handleCancel = async (dangKyId, lopHocPhanId) => {
  if (!window.confirm('Hủy đăng ký lớp này?')) return;

  try {
    await apiFetch(`/api/dkhp/register/${dangKyId}`, { method: 'DELETE' });

    // 1) Optimistic update: gỡ ngay khỏi bảng "đã đăng ký"
    setRegistered(prev => prev.filter(x => x.id !== dangKyId));

    // 2) Refetch lại 2 danh sách để đồng bộ số "Đã đăng ký"/slot
    const [avail, regs] = await Promise.all([
      apiFetch(`/api/dkhp/available?sinh_vien_id=${sinhVienId}&hoc_ky=${dot.hoc_ky}&nam_hoc=${dot.nam_hoc}&dot_dang_ky_id=${dot.id}`),
      apiFetch(`/api/dkhp/my?sinh_vien_id=${sinhVienId}&dot_dang_ky_id=${dot.id}`)
    ]);
    setAvailable(avail);
    setRegistered(regs);

    // 3) Nếu đang mở chi tiết đúng lớp này thì load lại để cập nhật sĩ số
    if (selectedClass && (!lopHocPhanId || lopHocPhanId === selectedClass.id)) {
      const detail = await apiFetch(`/api/dkhp/lich/${selectedClass.id}`);
      setClassDetail(detail);
    }

    alert('Đã hủy!');
  } catch (err) {
    alert(err?.message || 'Lỗi hủy');
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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="hienThiKoTrung" />
            <label className="form-check-label" htmlFor="hienThiKoTrung">
              Hiện thị lớp học phần không trùng lịch
            </label>
          </div>
        </div>

        {/* Không có đợt */}
        {!dot && (
          <div className="alert alert-info text-center">
            Không có đợt đăng ký đang mở
          </div>
        )}

        {dot && (
          <>
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
<div className="card mb-4">
  <div className="card-header" style={{background:'#ffb100'}}>
    <strong>LỚP HỌC PHẦN CHỜ ĐĂNG KÝ</strong>
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
          .filter(l => !selectedHP || l.hoc_phan_id === selectedHP.hoc_phan_id)
          .map((l, i) => (
          <tr key={l.id}
              className={selectedClass?.id===l.id ? 'table-warning' : ''}
              onClick={() => loadClassDetail(l)}
              style={{cursor:'pointer'}}>
            <td>
              <input type="radio" readOnly checked={selectedClass?.id===l.id}/>
            </td>
            <td>{i+1}</td>
            <td>{l.ma_lop_hoc_phan || l.ma_lhp}</td>
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


            {/* ===== Bảng 3: CHI TIẾT LỚP HỌC PHẦN ===== */}
<div className="card mb-4">
  <div className="card-header bg-primary text-white">
    <strong>CHI TIẾT LỚP HỌC PHẦN</strong>
  </div>

  {!selectedClass ? (
    <div className="p-3 text-muted">Hãy chọn 1 lớp học phần ở bảng trên.</div>
  ) : (
    <>
      <div className="p-3">
      
        <div className="d-flex gap-2 mb-2">
          <select className="form-select" style={{maxWidth:240}}>
            <option>Nhóm thực hành</option>
          </select>
          <button className="btn btn-outline-warning">Xem lịch trùng</button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-sm mb-0">
          <thead className="table-primary">
            <tr>
              <th>STT</th><th>Thứ</th><th>Ca</th><th>Tiết</th><th>Phòng</th><th>Cơ sở</th><th>Giảng viên</th><th>Ngày</th><th>Loại</th>
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
                <td>{r.ngay_hoc ? dayjs(r.ngay_hoc).format('DD/MM/YYYY') : ''}</td>
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
                      <th>Nhóm TH</th>
                      <th>Học phí</th>
                      <th>Hạn nộp</th>
                      <th>Thu</th>
                      
                      <th>Ngày ĐK</th>
                      <th>Trạng thái LHP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registered.length === 0 ? (
                      <tr><td colSpan="13" className="text-center text-muted">Chưa đăng ký lớp nào</td></tr>
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
          handleCancel(r.id, r.lop_hoc_phan_id);
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
                          <td>{r.nhom_th || ''}</td>
                          <td>{r.hoc_phi ? `${r.hoc_phi.toLocaleString()}đ` : ''}</td>
                          <td>{r.han_nop ? dayjs(r.han_nop).format('DD/MM/YYYY') : ''}</td>
                          <td>{r.lan_thu || ''}</td>
                          
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
          </>
        )}
      </div>
    </StudentLayout>
  );
}