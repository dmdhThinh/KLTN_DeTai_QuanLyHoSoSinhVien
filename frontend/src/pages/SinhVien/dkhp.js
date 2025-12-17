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

const normalizePendingList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

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
  
  // Dropdown chọn học kỳ, năm học (gộp thành 1 combobox)
  const [selectedHocKy, setSelectedHocKy] = useState('HK1');
  const [selectedNamHoc, setSelectedNamHoc] = useState('2025-2026');
  const [autoSetFromDot, setAutoSetFromDot] = useState(false); // Flag để tránh set lại nhiều lần
  
  // Tạo danh sách các học kỳ/năm học để hiển thị trong combobox
  const generateHocKyOptions = () => {
    const hocKys = ['HK1', 'HK2', 'HK3'];
    const namHocs = ['2024-2025', '2025-2026', '2026-2027'];
    const options = [];
    
    // Tạo options theo thứ tự: HK3 -> HK2 -> HK1 của năm mới nhất trước
    for (let i = namHocs.length - 1; i >= 0; i--) {
      for (let j = hocKys.length - 1; j >= 0; j--) {
        const value = `${hocKys[j]}|${namHocs[i]}`;
        const label = `${hocKys[j]} (${namHocs[i].split('-')[0]} - ${namHocs[i].split('-')[1]})`;
        options.push({ value, label, hocKy: hocKys[j], namHoc: namHocs[i] });
      }
    }
    
    return options;
  };
  
  const hocKyOptions = generateHocKyOptions();
  
  // Giá trị combobox hiện tại (dạng "HK1|2025-2026")
  const selectedHocKyNamHoc = `${selectedHocKy}|${selectedNamHoc}`;
  
  // Hàm xử lý khi chọn combobox
  const handleHocKyNamHocChange = (value) => {
    const [hocKy, namHoc] = value.split('|');
    setSelectedHocKy(hocKy);
    setSelectedNamHoc(namHoc);
  };
  
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
  // Tổng số tín chỉ theo chương trình khung cho học kỳ đang chọn
  const [hpTotals, setHpTotals] = useState({
    tongTc: 0,
    tongTcBatBuoc: 0,
    tongTcTuChon: 0
  });
  
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


  // Load đợt đăng ký và tự động set học kỳ/năm học (chỉ 1 lần khi mount)
  useEffect(() => {
    if (!sinhVienId) {
      setLoading(false);
      return;
    }

    const loadDot = async () => {
      try {
        let d = null;
        try {
          d = await apiFetch('/api/dkhp/dot/current');
        } catch (e) {
          // Không có đợt thì thôi, vẫn load dữ liệu xem chơi
        }
        setDot(d);
        
        // Tự động set học kỳ/năm học từ đợt đăng ký (chỉ 1 lần khi chưa set)
        if (d && d.hoc_ky && d.nam_hoc && !autoSetFromDot) {
          // Set học kỳ/năm học ngay lập tức
          setSelectedHocKy(d.hoc_ky);
          setSelectedNamHoc(d.nam_hoc);
      setAutoSetFromDot(true);
    }
      } catch (err) {
        console.error('Lỗi load đợt đăng ký:', err);
        setAutoSetFromDot(true); // Đánh dấu đã load xong (dù có lỗi)
      }
    };

    // Chỉ load đợt 1 lần khi component mount
    if (!autoSetFromDot) {
      loadDot();
    }
  }, [sinhVienId, autoSetFromDot]);

  // Reset selectedHP khi đổi học kỳ/năm học
  useEffect(() => {
    setSelectedHP(null);
    setSelectedClass(null);
    setClassDetail({ header: null, lich: [] });
  }, [selectedHocKy, selectedNamHoc]);

  // Load dữ liệu khi thay đổi học kỳ/năm học
  useEffect(() => {
    if (!sinhVienId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true); // Set loading khi bắt đầu load
      try {
        // Lấy lại đợt đăng ký để có dot_dang_ky_id mới nhất
        let d = null;
        try {
          d = await apiFetch('/api/dkhp/dot/current');
        } catch (e) {
          // Không có đợt thì thôi
        }

        // Sử dụng học kỳ/năm học từ dropdown
        const [avail, regs] = await Promise.all([
          apiFetch(`/api/dkhp/available?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${d?.id || ''}`),
          apiFetch(`/api/dkhp/my?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}&dot_dang_ky_id=${d?.id || ''}`)
        ]);
        setAvailable(avail);
        setRegistered(regs);
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

  // Load danh sách môn theo loại đăng ký (chỉ load khi đã có học kỳ/năm học hợp lệ)
  useEffect(() => {
    if (!sinhVienId || !selectedHocKy || !selectedNamHoc) return;
    
    // Nếu có đợt đăng ký, đợi cho đến khi đã set học kỳ từ đợt xong
    // Nếu không có đợt, load ngay với học kỳ hiện tại
    if (dot && !autoSetFromDot) {
      // Có đợt nhưng chưa set học kỳ từ đợt → đợi
      return;
    }

    const loadPending = async () => {
      try {
        let pendRes = [];
        
        if (loaiDangKy === 'HOC_LAI') {
          // Lấy danh sách môn rớt
          pendRes = await apiFetch(`/api/dkhp/mon-rot?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
          console.log('📋 Môn học lại:', pendRes);
        } else if (loaiDangKy === 'HOC_CAI_THIEN') {
          // Lấy danh sách môn cải thiện
          pendRes = await apiFetch(`/api/dkhp/mon-cai-thien?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
          console.log('📋 Môn cải thiện:', pendRes);
        } else {
          // HOC_MOI: Lấy TẤT CẢ môn của học kỳ (cho phép học vượt)
          pendRes = await apiFetch(`/api/dkhp/all-courses?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
        }
        const items = normalizePendingList(pendRes);
        // Map dữ liệu để đảm bảo có field tc và bat_buoc
        const mappedItems = items.map(item => ({
          ...item,
          tc: item.tc || item.so_tin_chi || 0, // Map so_tin_chi thành tc
          bat_buoc: item.bat_buoc !== undefined ? item.bat_buoc : null // Môn học lại/cải thiện có thể không có bat_buoc
        }));
        console.log('📦 Items sau normalize và map:', mappedItems);
        setPendingHP(mappedItems);
        // Reset selectedHP sau khi load xong danh sách môn mới
        setSelectedHP(null);
        if (loaiDangKy === 'HOC_MOI') {
          if (pendRes.tong_tc !== undefined) {
            setHpTotals({
              tongTc: pendRes.tong_tc,
              tongTcBatBuoc: pendRes.tong_tc_bat_buoc,
              tongTcTuChon: pendRes.tong_tc_tu_chon
            });
          } else {
            const bb = items.filter(hp => hp.bat_buoc).reduce((s, hp) => s + (hp.tc || 0), 0);
            const tc = items.filter(hp => !hp.bat_buoc).reduce((s, hp) => s + (hp.tc || 0), 0);
            setHpTotals({ tongTc: bb + tc, tongTcBatBuoc: bb, tongTcTuChon: tc });
          }
        } else {
          // Học lại / cải thiện: không áp tổng TC CTK
          setHpTotals({ tongTc: 0, tongTcBatBuoc: 0, tongTcTuChon: 0 });
        }
      } catch (err) {
        console.error('Lỗi load danh sách môn:', err);
      }
    };

    loadPending();
  }, [sinhVienId, loaiDangKy, selectedHocKy, selectedNamHoc, dot, autoSetFromDot]);

  // Đăng ký
  const handleRegister = async (lhp) => {
    // Kiểm tra trùng lịch
    if (lhp.xung_dot_lich) {
      setMessage('CẢNH BÁO: Lớp học phần này trùng lịch với các môn bạn đã đăng ký! Vui lòng chọn lớp học phần khác.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    // Kiểm tra điều kiện tiên quyết và số tín chỉ
    if (!lhp.du_dieu_kien) {
      const errorMessages = [];
      
      if (lhp.missing_prereqs && lhp.missing_prereqs.length > 0) {
        const missingList = lhp.missing_prereqs.map(m => 
          `${m.ten_hoc_phan} (${m.ma_hoc_phan}) - ${m.loai_text}`
        ).join(', ');
        errorMessages.push(`Cần hoàn thành: ${missingList}`);
      }
      
      if (lhp.missing_tc_condition) {
        errorMessages.push(`Bạn cần ít nhất ${lhp.missing_tc_condition.so_tc_bat_buoc_toi_thieu} tín chỉ bắt buộc. Hiện tại bạn có ${lhp.missing_tc_condition.tong_tc_bat_buoc_hien_tai} TC, còn thiếu ${lhp.missing_tc_condition.con_thieu} TC.`);
      }
      
      if (errorMessages.length > 0) {
        setMessage(`Bạn chưa đủ điều kiện đăng ký môn này. ${errorMessages.join(' ')}`);
        setMessageType('error');
        setTimeout(() => setMessage(''), 10000);
        return;
      }
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

      // Refresh danh sách môn (HOC_MOI: lấy tất cả môn của học kỳ)
      let pend = [];
      if (loaiDangKy === 'HOC_LAI') {
        pend = await apiFetch(`/api/dkhp/mon-rot?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
      } else if (loaiDangKy === 'HOC_CAI_THIEN') {
        pend = await apiFetch(`/api/dkhp/mon-cai-thien?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
      } else {
        // HOC_MOI: Lấy TẤT CẢ môn của học kỳ (cho phép học vượt)
        pend = await apiFetch(`/api/dkhp/all-courses?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
      }
      setPendingHP(normalizePendingList(pend));

      // Chi tiết lớp đang chọn (để bảng "CHI TIẾT LỚP HỌC PHẦN" cập nhật ngay)
      if (selectedClass?.id === lhp.id) {
        const detail = await apiFetch(`/api/dkhp/lich/${lhp.id}`);
        setClassDetail(detail);
      }

    } catch (err) {
      // Lấy message rõ ràng từ backend nếu có
      let msg = 'Lỗi đăng ký';
      try {
        // apiFetch throw Error với text từ response, có thể là JSON string
        const errorText = err.message || err.toString();
        try {
          const data = JSON.parse(errorText);
        if (data?.message) msg = data.message;
        } catch {
          // Nếu không parse được JSON, dùng message gốc
          if (errorText) msg = errorText;
        }
      } catch (_) {
        if (err.message) msg = err.message;
      }
      setMessage(msg);
      setMessageType('error');
      setTimeout(() => setMessage(''), 8000); // Tăng thời gian hiển thị để user đọc được danh sách môn
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

      // Refresh danh sách môn (HOC_MOI: lấy tất cả môn của học kỳ)
      let pend = [];
      if (loaiDangKy === 'HOC_LAI') {
        pend = await apiFetch(`/api/dkhp/mon-rot?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
      } else if (loaiDangKy === 'HOC_CAI_THIEN') {
        pend = await apiFetch(`/api/dkhp/mon-cai-thien?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
      } else {
        // HOC_MOI: Lấy TẤT CẢ môn của học kỳ (cho phép học vượt)
        pend = await apiFetch(`/api/dkhp/all-courses?sinh_vien_id=${sinhVienId}&hoc_ky=${selectedHocKy}&nam_hoc=${selectedNamHoc}`);
      }
      setPendingHP(normalizePendingList(pend));

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
        title: 'Không thể hủy đăng ký',
        message: errorMessage
      });
    }
  };


  if (loading) {
    return (
      <StudentLayout title="Đăng ký học phần">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <div className="mt-3">
            <h5>Đang tải dữ liệu...</h5>
            <p className="text-muted">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </StudentLayout>
    );
  }
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

  // Nhóm môn chờ đăng ký thành 2 loại: Bắt buộc / Tự chọn (giống trang Chương trình khung)
  // Lưu ý: Môn học lại/cải thiện có thể không có field bat_buoc, nên hiển thị tất cả trong phần "Tự chọn"
  const monChoDangKyBatBuoc = pendingHP.filter((hp) => hp.bat_buoc === true);
  const monChoDangKyTuChon = pendingHP.filter((hp) => hp.bat_buoc !== true || hp.bat_buoc === null || hp.bat_buoc === undefined);

  // Hàm render 1 dòng môn chờ đăng ký
  const renderPendingRow = (hp, idx) => (
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
      <td>{hp.tc || hp.so_tin_chi || ''}</td>
      <td>
        {hp.bat_buoc ? (
          <span className="badge bg-danger">Bắt buộc</span>
        ) : (
          <span className="badge bg-secondary">Tự chọn</span>
        )}
      </td>
    </tr>
  );

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
        
        
        {/* Header: Combobox chọn học kỳ, năm học */}
        <div className="row mb-4 align-items-center">
          <div className="col-md-6">
            <div className="d-flex gap-3 align-items-center">
              <label className="fw-bold" style={{ minWidth: '120px' }}>Đợt đăng ký</label>
              
              {/* Combobox gộp Học kỳ + Năm học */}
              <select 
                className="form-select" 
                style={{ width: '250px' }}
                value={selectedHocKyNamHoc}
                onChange={(e) => handleHocKyNamHocChange(e.target.value)}
              >
                {hocKyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
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
                    </tr>
                  </thead>
                  <tbody>
                    {pendingHP.length === 0 ? (
                      <tr><td colSpan="6" className="text-center text-muted">
                        {loaiDangKy === 'HOC_LAI' ? 'Không có môn rớt để học lại' : 
                         loaiDangKy === 'HOC_CAI_THIEN' ? 'Không có môn để cải thiện' : 
                         'Không có môn chờ đăng ký'}
                      </td></tr>
                    ) : (
                      <>
                        {monChoDangKyBatBuoc.length > 0 && (
                          <>
                            <tr className="table-secondary">
                              <td colSpan="6">
                                <strong>HỌC PHẦN BẮT BUỘC</strong>
                              </td>
                            </tr>
                            {monChoDangKyBatBuoc.map((hp, idx) => renderPendingRow(hp, idx))}
                          </>
                        )}

                        {monChoDangKyTuChon.length > 0 && (
                          <>
                            {monChoDangKyBatBuoc.length > 0 && (
                            <tr className="table-secondary">
                              <td colSpan="6">
                                <strong>HỌC PHẦN TỰ CHỌN</strong>
                              </td>
                            </tr>
                            )}
                            {monChoDangKyTuChon.map((hp, idx) =>
                              renderPendingRow(hp, idx + monChoDangKyBatBuoc.length)
                            )}
                          </>
                        )}
                      </>
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
              className={selectedClass?.id===l.id ? 'table-warning' : (l.xung_dot_lich ? 'table-danger' : (!l.du_dieu_kien ? 'table-warning' : ''))}
              onClick={() => loadClassDetail(l)}
              style={{cursor:'pointer'}}
              title={
                l.xung_dot_lich ? 'Lớp này trùng lịch với các môn đã đăng ký' : 
                !l.du_dieu_kien ? 'Bạn chưa đủ điều kiện đăng ký môn này' : ''
              }>
            <td>
              <input type="radio" readOnly checked={selectedClass?.id===l.id}/>
            </td>
            <td>{i+1}</td>
            <td>
              {l.ma_lop_hoc_phan || l.ma_lhp}
              {l.xung_dot_lich && <span className="badge bg-danger ms-1">Trùng lịch</span>}
              {!l.du_dieu_kien && <span className="badge bg-warning text-dark ms-1">Chưa đủ điều kiện</span>}
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
            <strong>CẢNH BÁO:</strong> Lớp học phần này trùng lịch với các môn bạn đã đăng ký!
          </div>
        )}
        {!selectedClass?.du_dieu_kien && (
          <div className="alert alert-warning mb-3" role="alert">
            <strong>CẢNH BÁO:</strong> Bạn chưa đủ điều kiện đăng ký môn này.
            {selectedClass?.missing_prereqs && selectedClass.missing_prereqs.length > 0 && (
              <>
                <div className="mt-2">Bạn cần hoàn thành các môn sau:</div>
                <ul className="mb-2 mt-2">
                  {selectedClass.missing_prereqs.map((prereq, idx) => (
                    <li key={idx}>
                      <strong>{prereq.ten_hoc_phan}</strong> ({prereq.ma_hoc_phan}) - <span className="badge bg-info">{prereq.loai_text}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {selectedClass?.missing_tc_condition && (
              <div className="mt-2">
                <strong>Điều kiện số tín chỉ bắt buộc:</strong> Bạn cần ít nhất <strong>{selectedClass.missing_tc_condition.so_tc_bat_buoc_toi_thieu} tín chỉ bắt buộc</strong>.
                Hiện tại bạn có <strong>{selectedClass.missing_tc_condition.tong_tc_bat_buoc_hien_tai} TC</strong>, còn thiếu <strong>{selectedClass.missing_tc_condition.con_thieu} TC</strong>.
              </div>
            )}
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
                      <h5 className="modal-title">Xác nhận hủy đăng ký</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setConfirmCancel(null)}></button>
                    </div>
                    <div className="modal-body">
                      <p className="mb-2"><strong>Bạn có chắc chắn muốn hủy đăng ký lớp học phần này?</strong></p>
                      <p className="text-muted mb-0">
                        <small>Hành động này không thể hoàn tác. Bạn sẽ phải đăng ký lại nếu muốn học lớp này.</small>
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