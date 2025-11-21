import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import isBetween from 'dayjs/plugin/isBetween'
import '../../styles/SinhVien/LichHocLichThi.css'

dayjs.extend(isBetween)

// 🧭 Hàm lấy thứ 2 đầu tuần
function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export default function LichList() {
  const [lich, setLich] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weekStart, setWeekStart] = useState(getMonday(new Date()))
  const [lopId, setLopId] = useState('')
  const [lopHocPhanId, setLopHocPhanId] = useState('')

  const [lops, setLops] = useState([]);
  const [lopHocPhans, setLopHocPhans] = useState([]);
  const [khoaId, setKhoaId] = useState('');
  const [nganhId, setNganhId] = useState('');
  const [nganhs, setNganhs] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [hocKyNamHoc, setHocKyNamHoc] = useState('');
  const [ngayNghiKhoa, setNgayNghiKhoa] = useState('');
  const [showNghiKhoaModal, setShowNghiKhoaModal] = useState(false);
  const [showConfirmNghiKhoaModal, setShowConfirmNghiKhoaModal] = useState(false);
  const [globalMessage, setGlobalMessage] = useState(null);
  const [nghiKhoaError, setNghiKhoaError] = useState('');
  
  // State cho modal đánh dấu nghỉ
  const [showNghiModal, setShowNghiModal] = useState(false)
  const [selectedLich, setSelectedLich] = useState(null)
  const [selectedNgay, setSelectedNgay] = useState(null)
  const [lyDoNghi, setLyDoNghi] = useState('')
  

  const navigate = useNavigate()

  useEffect(() => {
    if (!globalMessage) return
    const timer = setTimeout(() => setGlobalMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [globalMessage])

  // 🚀 Load Khoa (tự động chọn khoa đầu tiên, không hiển thị combobox)
  useEffect(() => {
    apiFetch('/api/khoa')
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setKhoas(list)
        if (list.length > 0) {
          setKhoaId(list[0].id)
        }
      })
      .catch(() => {
        setKhoas([])
        setKhoaId('')
      })
  }, [])

  // 🚀 Load Ngành based on selected Khoa
  useEffect(() => {
    if (khoaId) {
      apiFetch(`/api/nganh?khoaId=${khoaId}`)
        .then((data) => setNganhs(data || []))
        .catch(() => setNganhs([]));
    } else {
      setNganhs([]);
      setNganhId('');
    }
  }, [khoaId]);

  // 🚀 Load Lớp based on selected Ngành
  useEffect(() => {
    if (nganhId) {
      apiFetch(`/api/lop?nganhId=${nganhId}`)
        .then((data) => setLops(data || []))
        .catch(() => setLops([]));
    } else {
      setLops([]);
      setLopId('');
    }
  }, [nganhId]);

  // 🚀 Load Lớp Học Phần based on selected Lớp
  useEffect(() => {
    setHocKyNamHoc('')
    setLopHocPhanId('')

    if (lopId) {
      console.log('🔍 Fetching LopHocPhan for lopId:', lopId)
      apiFetch(`/api/lich-admin/combo/lophocphan?lopId=${lopId}`)
        .then((data) => {
          console.log('✅ LopHocPhan data received:', data)
          setLopHocPhans(data || [])
        })
        .catch((err) => {
          console.error('❌ Error fetching LopHocPhan:', err)
          setLopHocPhans([])
        })
    } else {
      setLopHocPhans([])
    }
  }, [lopId])



  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return {
      label: i < 6 ? `Thứ ${i + 2}` : 'Chủ nhật',
      date: dayjs(d).format('DD/MM/YYYY'),
      dateObj: d,
    }
  })

  const caHoc = ['Sáng', 'Chiều', 'Tối']

  // Danh sách học kỳ - năm học rút gọn từ các lớp học phần
  const hocKyNamHocOptions = Array.from(
    new Map(
      lopHocPhans
        .filter((lhp) => lhp.hoc_ky && lhp.nam_hoc)
        .map((lhp) => {
          const value = `${lhp.hoc_ky}-${lhp.nam_hoc}`
          return [value, { value, label: `${lhp.hoc_ky} (${lhp.nam_hoc})` }]
        })
    ).values()
  )

  // Filter lớp học phần theo học kỳ - năm học đã chọn
  const filteredLopHocPhans = hocKyNamHoc
    ? lopHocPhans.filter(
        (lhp) => `${lhp.hoc_ky}-${lhp.nam_hoc}` === hocKyNamHoc
      )
    : lopHocPhans

  // 🧠 Gọi API lịch học (theo lớp học phần, tuần)
useEffect(() => {
  if (!lopHocPhanId) {
    setLich([])
    setLoading(false)
    return
  }

  setLoading(true)
  setError(null)

  const from = dayjs(weekStart).format('YYYY-MM-DD')

  Promise.all([
    apiFetch(`/api/lich-admin/hoc?lopHocPhanId=${lopHocPhanId}&from=${from}`),
    apiFetch(`/api/lich-admin/thi?lopHocPhanId=${lopHocPhanId}&from=${from}`)
  ])
    .then(([hoc, thi]) => {
      console.log('📚 Lịch học:', hoc)
      console.log('📝 Lịch thi:', thi)
      // gộp lịch học + lịch thi vào cùng 1 mảng
      setLich([...(Array.isArray(hoc) ? hoc : []), ...(Array.isArray(thi) ? thi : [])])
    })
    .catch((err) => {
      console.error('❌ Lỗi khi tải lịch:', err)
      setError('Không thể tải dữ liệu lịch học / lịch thi.')
      setLich([])
    })
    .finally(() => setLoading(false))
}, [lopHocPhanId, weekStart])

// Hàm đánh dấu nghỉ
const handleDanhDauNghi = async () => {
  if (!selectedLich || !selectedNgay) return
  
  try {
    await apiFetch('/api/lich-nghi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lichHocId: selectedLich.id,
        ngayNghi: selectedNgay,
        lyDo: lyDoNghi
      })
    })
    setGlobalMessage({ type: 'success', text: 'Đã đánh dấu nghỉ thành công!' })
    setShowNghiModal(false)
    setLyDoNghi('')
    // Reload lịch
    setLoading(true)
    const from = dayjs(weekStart).format('YYYY-MM-DD')
    Promise.all([
      apiFetch(`/api/lich-admin/hoc?lopHocPhanId=${lopHocPhanId}&from=${from}`),
      apiFetch(`/api/lich-admin/thi?lopHocPhanId=${lopHocPhanId}&from=${from}`)
    ])
      .then(([hoc, thi]) => {
        setLich([...(Array.isArray(hoc) ? hoc : []), ...(Array.isArray(thi) ? thi : [])])
      })
      .finally(() => setLoading(false))
  } catch (err) {
    setGlobalMessage({
      type: 'error',
      text: 'Lỗi: ' + (err.message || 'Không thể đánh dấu nghỉ'),
    })
  }
}

// Hàm đánh dấu ngày nghỉ cho toàn khoa
const handleNghiToanKhoa = async () => {
  if (!ngayNghiKhoa) {
    setNghiKhoaError('Vui lòng chọn ngày nghỉ toàn khoa')
    return
  }

  setNghiKhoaError('')

  try {
    await apiFetch('/api/lich-nghi/khoa-nghi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        khoaId: khoaId || null,
        ngayNghi: ngayNghiKhoa,
        lyDo: 'Nghỉ toàn khoa',
      }),
    })

    setGlobalMessage({ type: 'success', text: 'Đã đánh dấu nghỉ cho toàn khoa!' })

    // Đóng modal và reset ngày nghỉ
    setShowNghiKhoaModal(false)
    setShowConfirmNghiKhoaModal(false)
    setNgayNghiKhoa('')

    // Reload lịch tuần hiện tại (tạo object Date mới để useEffect chạy lại)
    setWeekStart((prev) => new Date(prev))
  } catch (err) {
    setGlobalMessage({
      type: 'error',
      text: 'Lỗi: ' + (err.message || 'Không thể đánh dấu nghỉ toàn khoa'),
    })
  }
}

  return (
    <AdminLayout title="Lịch học của sinh viên" activeMenu="lich">
        <div
          className="page-lichhoc"
          style={{
                width: '100%',
                maxWidth: '1250px',      // Giới hạn độ rộng
                margin: '0 auto',
                padding: '0 20px',       // Cách đều hai bên
                boxSizing: 'border-box',
            }}
          >

        <div className="title-lg">Lịch học theo tuần (Admin)</div>

        {/* Thanh chọn lớp, học kỳ, năm học */}
        <div className="toolbar d-flex align-items-center gap-2 flex-wrap">
        <button
  className="btn btn-success btn-sm"
  onClick={() => navigate('/admin/lich/new')}
>

  ➕ Thêm tiết học
</button>

<button
  className="btn btn-danger btn-sm"
  onClick={() => setShowNghiKhoaModal(true)}
>
  Nghỉ toàn khoa
</button>

        <select
          className="form-select"
          style={{ width: 200 }}
          value={nganhId}
          onChange={(e) => setNganhId(e.target.value)}
          disabled={!khoaId}
        >
          <option value="">-- Chọn Ngành --</option>
          {nganhs.map((n) => (
            <option key={n.id} value={n.id}>
              {n.tenNganh}
            </option>
          ))}
        </select>

         <select
          className="form-select"
          style={{ width: 200 }}
          value={lopId}
          onChange={(e) => setLopId(e.target.value)}
          disabled={!nganhId}
        >
          <option value="">-- Chọn Lớp --</option>
          {lops.map((l) => (
            <option key={l.id} value={l.id}>
              {l.tenLop}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 180 }}
          value={hocKyNamHoc}
          onChange={(e) => {
            setHocKyNamHoc(e.target.value)
            setLopHocPhanId('')
          }}
          disabled={lopHocPhans.length === 0}
        >
          <option value="">Tất cả học kỳ</option>
          {hocKyNamHocOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 300 }}
          value={lopHocPhanId}
          onChange={(e) => setLopHocPhanId(e.target.value)}
          disabled={!lopId || filteredLopHocPhans.length === 0}
        >
          <option value="">-- Chọn Lớp Học Phần --</option>
          {filteredLopHocPhans.map((lhp) => (
            <option key={lhp.id} value={lhp.id}>
              {lhp.ma_lop_hoc_phan} - {lhp.ten_hoc_phan} ({lhp.hoc_ky} {lhp.nam_hoc})
            </option>
          ))}
        </select>

          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: 160 }}
            value={dayjs(weekStart).format('YYYY-MM-DD')}
            onChange={(e) => setWeekStart(getMonday(e.target.value))}
          />

          <button
            className="btn btn-sm btn-primary"
            onClick={() => setWeekStart(getMonday(new Date()))}
          >
            Hiện tại
          </button>

          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              const d = new Date(weekStart)
              d.setDate(d.getDate() - 7)
              setWeekStart(getMonday(d))
            }}
          >
            ← Trở về
          </button>

          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              const d = new Date(weekStart)
              d.setDate(d.getDate() + 7)
              setWeekStart(getMonday(d))
            }}
          >
            Tiếp →
          </button>
        </div>

        {globalMessage && (
          <div
            className={`alert mt-3 ${
              globalMessage.type === 'error' ? 'alert-danger' : 'alert-success'
            }`}
            style={{ fontSize: 14 }}
          >
            {globalMessage.text}
          </div>
        )}

        {/* Lỗi */}
        {error && (
          <div className="text-center text-danger fw-semibold mt-3">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center mt-4 fw-semibold text-muted">
            ⏳ Đang tải dữ liệu...
          </div>
        )}

        {/* Bảng lịch */}
        {!loading && (
          <div className="lichhoc-table table-responsive mt-3">
            <table className="align-middle text-center m-0">
              <thead>
                <tr>
                  <th>Ca học</th>
                  {days.map((d) => (
                    <th key={d.label}>
                      <div>{d.label}</div>
                      <div>{d.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {caHoc.map((ca) => (
                  <tr key={ca}>
                    <td className="ca-cell">{ca}</td>
                    {days.map((d, i) => {
                      const cells = lich.filter((x) => {
  // Nếu là lịch học (có trường thu)
  if (x.thu) {
    return (
      Number(x.thu) === i + 2 &&
      x.ca?.toLowerCase() === ca.toLowerCase()
    )
  }

  // Nếu là lịch thi (có ngàyHoc)
  if (x.ngayHoc) {
    return (
      dayjs(x.ngayHoc).format('DD/MM/YYYY') === d.date &&
      x.ca?.toLowerCase() === ca.toLowerCase()
    )
  }

  return false
})

                    

                      return (
                        <td key={i} style={{ padding: '8px', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {cells.map((cell) => {
                              // Kiểm tra xem ngày hiện tại có trong danh sách ngày nghỉ không
                              const isNghi = cell.danhSachNgayNghi && cell.danhSachNgayNghi.includes(d.date.split('/').reverse().join('-'))
                              
                              return (
                              <div
                                key={cell.id}
                                className={`monhoc-box ${cell.loai} ${isNghi ? 'nghi' : ''}`}
                                style={{ cursor: 'pointer', minHeight: '80px', position: 'relative' }}
                                onClick={() => navigate(`/admin/lich/edit/${cell.id}`)}
                                title={
                                  cell.loai === 'thi'
                                    ? `Môn: ${cell.tenHocPhan}\nNgày thi: ${dayjs(cell.ngayHoc).format('DD/MM/YYYY')}\nCa: ${cell.ca}\nPhòng: ${cell.phong}\nGV: ${cell.tenGiangVien}`
                                    : `Môn: ${cell.tenHocPhan}\nGV: ${cell.tenGiangVien}\nPhòng: ${cell.phong}\n${isNghi ? '⚠️ Buổi này đã nghỉ' : 'Click nút ❌ để đánh dấu nghỉ'}`
                                }
                              >
                                <div className="fw-semibold">{cell.tenHocPhan}</div>
                                <div className="small text-muted">{cell.maLopHocPhan}</div>
                                {cell.loai === 'thi' ? (
                                  <>
                                    <div className="small">
                                      Tiết: {cell.tietBatDau} - {cell.tietKetThuc}
                                    </div>
                                    <div className="small">Phòng: {cell.phong}</div>
                                    <div className="small">GV: {cell.tenGiangVien}</div>
                                    <div className="small text-danger fw-semibold">(Thi)</div>
                                  </>
                                ) : (
                                  <>
                                    <div className="small">
                                      Tiết: {cell.tietBatDau} - {cell.tietKetThuc}
                                    </div>
                                    <div className="small">Phòng: {cell.phong}</div>
                                    <div className="small">GV: {cell.tenGiangVien}</div>
                                  </>
                                )}
                                {isNghi ? (
                                  <div className="small text-danger fw-bold">❌ Nghỉ</div>
                                ) : (
                                  // Chỉ hiển thị nút nghỉ cho lịch học thường (không phải thi, không có ngày cụ thể)
                                  cell.loai !== 'thi' && !cell.ngayHoc && (
                                    <button
                                      className="btn btn-sm btn-outline-danger mt-2"
                                      style={{ fontSize: '11px', padding: '2px 6px' }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedLich(cell)
                                        setSelectedNgay(d.dateObj.toISOString().split('T')[0])
                                        setShowNghiModal(true)
                                      }}
                                    >
                                      ❌ Nghỉ buổi này
                                    </button>
                                  )
                                )}
                              </div>
                            )}
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Không có dữ liệu */}
        {!loading && lich.length === 0 && (
          <div className="text-center text-muted mt-3" style={{ fontSize: 15, fontWeight: 500 }}>
            Không có dữ liệu lịch học cho tuần này.
          </div>
        )}

        {/* Ghi chú */}
        <div className="legend">
          <div className="legend-item">
            <span style={{ background: '#bdbdbd' }}></span> Lịch lý thuyết
          </div>
          <div className="legend-item">
            <span style={{ background: '#8fd14f', border: '1px solid #388e3c' }}></span> Lịch thực hành
          </div>
          <div className="legend-item">
            <span style={{ background: '#b3e5fc', border: '1px solid #0288d1' }}></span> Trực tuyến
          </div>
          <div className="legend-item">
          <span style={{ background: '#fff9c4', border: '1px solid #fbc02d' }}></span> Lịch thi
        </div>
          <div className="legend-item">
            <span style={{ background: '#ef5350', border: '1px solid #b71c1c' }}></span> Tạm ngưng
          </div>
        </div>

        {/* Modal nghỉ toàn khoa */}
        {showNghiKhoaModal && (
          <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">Nghỉ toàn khoa</h5>
                  <button className="btn-close" onClick={() => setShowNghiKhoaModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Chọn ngày nghỉ:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={ngayNghiKhoa}
                      onChange={(e) => setNgayNghiKhoa(e.target.value)}
                    />
                  </div>
                  <div className="small text-muted">
                    Tất cả các lớp thuộc khoa sẽ được đánh dấu nghỉ trong ngày này.
                  </div>
                  {nghiKhoaError && (
                    <div className="mt-2 text-danger small">
                      {nghiKhoaError}
                    </div>
                  )}
                  
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowNghiKhoaModal(false)}>
                    Hủy
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      if (!ngayNghiKhoa) {
                        setNghiKhoaError('Vui lòng chọn ngày nghỉ toàn khoa')
                        return
                      }
                      setNghiKhoaError('')
                      setShowNghiKhoaModal(false)
                      setShowConfirmNghiKhoaModal(true)
                    }}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal xác nhận nghỉ toàn khoa */}
        {showConfirmNghiKhoaModal && (
          <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">Xác nhận nghỉ toàn khoa</h5>
                  <button className="btn-close" onClick={() => setShowConfirmNghiKhoaModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div>
                    Bạn chắc chắn cho toàn khoa nghỉ ngày{' '}
                    {ngayNghiKhoa ? dayjs(ngayNghiKhoa).format('DD/MM/YYYY') : '...'}?
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowConfirmNghiKhoaModal(false)
                      setShowNghiKhoaModal(true)
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleNghiToanKhoa}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal đánh dấu nghỉ */}
        {showNghiModal && (
          <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-warning">
                  <h5 className="modal-title">Đánh dấu buổi nghỉ</h5>
                  <button className="btn-close" onClick={() => setShowNghiModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>Môn học:</strong> {selectedLich?.tenHocPhan}</p>
                  <p><strong>Ngày:</strong> {dayjs(selectedNgay).format('DD/MM/YYYY')}</p>
                  <div className="mb-3">
                    <label className="form-label">Lý do nghỉ:</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      value={lyDoNghi}
                      onChange={(e) => setLyDoNghi(e.target.value)}
                      placeholder="Ví dụ: Giảng viên nghỉ phép, Lễ Quốc khánh..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowNghiModal(false)}>
                    Hủy
                  </button>
                  <button className="btn btn-warning" onClick={handleDanhDauNghi}>
                    Đánh dấu nghỉ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
