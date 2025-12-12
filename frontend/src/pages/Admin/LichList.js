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
  const [lopHocPhanId, setLopHocPhanId] = useState('')

  const [lopHocPhans, setLopHocPhans] = useState([])
  const [searchText, setSearchText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [khoaId, setKhoaId] = useState('')
  const [ngayNghiKhoa, setNgayNghiKhoa] = useState('')
  const [showNghiKhoaModal, setShowNghiKhoaModal] = useState(false)
  const [showConfirmNghiKhoaModal, setShowConfirmNghiKhoaModal] = useState(false)
  const [globalMessage, setGlobalMessage] = useState(null)
  const [nghiKhoaError, setNghiKhoaError] = useState('')
  const [danhSachNghiToanKhoa, setDanhSachNghiToanKhoa] = useState([])
  const [loadingNghiKhoa, setLoadingNghiKhoa] = useState(false)

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
        if (list.length > 0) {
          setKhoaId(list[0].id)
        }
      })
      .catch(() => {
        setKhoaId('')
      })
  }, [])

  // 🚀 Load danh sách nghỉ toàn khoa
  useEffect(() => {
    const loadDanhSachNghiToanKhoa = async () => {
      if (!khoaId) return
      try {
        const url = `/api/lich-nghi/khoa-nghi?khoaId=${khoaId}`
        const data = await apiFetch(url)
        setDanhSachNghiToanKhoa(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('❌ Error loading danh sách nghỉ toàn khoa:', err)
        setDanhSachNghiToanKhoa([])
      }
    }
    loadDanhSachNghiToanKhoa()
  }, [khoaId])

  // 🚀 Load tất cả lớp học phần
  useEffect(() => {
    apiFetch('/api/lophocphan')
      .then((data) => {
        setLopHocPhans(data || [])
      })
      .catch((err) => {
        console.error('❌ Error fetching LopHocPhan:', err)
        setLopHocPhans([])
      })
  }, [])

  // Filter lớp học phần theo text search
  const filteredSuggestions = searchText
    ? lopHocPhans.filter(lhp => {
        const maLopHocPhan = (lhp.maLopHocPhan || lhp.ma_lop_hoc_phan || '').toLowerCase()
        const tenHocPhan = (lhp.tenHocPhan || lhp.ten_hoc_phan || '').toLowerCase()
        const search = searchText.toLowerCase()
        return maLopHocPhan.includes(search) || tenHocPhan.includes(search)
      }).slice(0, 10) // Giới hạn 10 kết quả
    : []

  const handleSearchChange = (value) => {
    setSearchText(value)
    setShowSuggestions(true)
    if (!value) {
      setLopHocPhanId('')
    } else {
      // Kiểm tra xem có khớp với lớp học phần nào không
      const matched = lopHocPhans.find(lhp => {
        const maLopHocPhan = (lhp.maLopHocPhan || lhp.ma_lop_hoc_phan || '').toLowerCase()
        const tenHocPhan = (lhp.tenHocPhan || lhp.ten_hoc_phan || '').toLowerCase()
        const search = value.toLowerCase()
        return maLopHocPhan === search || `${maLopHocPhan} - ${tenHocPhan}` === search
      })
      
      if (matched) {
        setLopHocPhanId(matched.id)
      } else {
        setLopHocPhanId('')
      }
    }
  }

  const handleSelectSuggestion = (lhp) => {
    setSearchText(`${lhp.maLopHocPhan || lhp.ma_lop_hoc_phan} - ${lhp.tenHocPhan || lhp.ten_hoc_phan}`)
    setLopHocPhanId(lhp.id)
    setShowSuggestions(false)
  }

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }



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
const handleDanhDauNghi = async (lichHocId, ngayNghi) => {
  try {
    await apiFetch('/api/lich-nghi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lichHocId: lichHocId,
        ngayNghi: ngayNghi,
        lyDo: 'Nghỉ học'
      })
    })
    setGlobalMessage({ type: 'success', text: 'Đã đánh dấu nghỉ thành công!' })
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

// Hàm hủy nghỉ (reset)
const handleHuyNghi = async (lichHocId, ngayNghi) => {
  try {
    // Lấy danh sách buổi nghỉ để tìm ID
    const danhSachNghi = await apiFetch(`/api/lich-nghi?lichHocId=${lichHocId}`)
    const buoiNghi = Array.isArray(danhSachNghi) 
      ? danhSachNghi.find(n => {
          const ngayNghiFormat = dayjs(ngayNghi).format('YYYY-MM-DD')
          const ngayNghiInDb = dayjs(n.ngay_nghi || n.ngayNghi).format('YYYY-MM-DD')
          return ngayNghiFormat === ngayNghiInDb
        })
      : null
    
    if (!buoiNghi || !buoiNghi.id) {
      setGlobalMessage({
        type: 'error',
        text: 'Không tìm thấy bản ghi nghỉ để xóa',
      })
      return
    }

    await apiFetch(`/api/lich-nghi/${buoiNghi.id}`, {
      method: 'DELETE'
    })
    setGlobalMessage({ type: 'success', text: 'Đã hủy nghỉ thành công!' })
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
      text: 'Lỗi: ' + (err.message || 'Không thể hủy nghỉ'),
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
    
    // Reload danh sách nghỉ toàn khoa
    const reloadDanhSachNghi = async () => {
      try {
        const url = khoaId ? `/api/lich-nghi/khoa-nghi?khoaId=${khoaId}` : '/api/lich-nghi/khoa-nghi'
        const data = await apiFetch(url)
        setDanhSachNghiToanKhoa(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('❌ Error loading danh sách nghỉ toàn khoa:', err)
      }
    }
    reloadDanhSachNghi()
  } catch (err) {
    setGlobalMessage({
      type: 'error',
      text: 'Lỗi: ' + (err.message || 'Không thể đánh dấu nghỉ toàn khoa'),
    })
  }
}

// Hàm reset nghỉ toàn khoa
const handleResetNghiToanKhoa = async (ngayNghi) => {
  setLoadingNghiKhoa(true)
  try {
    const response = await apiFetch('/api/lich-nghi/khoa-nghi', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        khoaId: khoaId || null,
        ngayNghi: ngayNghi,
      }),
    })

    console.log('✅ Reset nghỉ toàn khoa response:', response)
    setGlobalMessage({ type: 'success', text: 'Đã hủy nghỉ toàn khoa thành công!' })
    
    // Reload danh sách nghỉ toàn khoa
    try {
      const url = khoaId ? `/api/lich-nghi/khoa-nghi?khoaId=${khoaId}` : '/api/lich-nghi/khoa-nghi'
      const data = await apiFetch(url)
      setDanhSachNghiToanKhoa(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('❌ Error loading danh sách nghỉ toàn khoa:', err)
    }
    
    // Reload lịch tuần hiện tại
    setWeekStart((prev) => new Date(prev))
  } catch (err) {
    console.error('❌ Error reset nghỉ toàn khoa:', err)
    setGlobalMessage({
      type: 'error',
      text: 'Lỗi: ' + (err.message || 'Không thể hủy nghỉ toàn khoa'),
    })
  } finally {
    setLoadingNghiKhoa(false)
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

        

        {/* Thanh chọn lớp học phần */}
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

        {/* Danh sách nghỉ toàn khoa */}
        {danhSachNghiToanKhoa.length > 0 && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="small text-muted">Đã nghỉ:</span>
            {danhSachNghiToanKhoa.map((item) => (
              <div key={item.ngay_nghi} className="d-flex align-items-center gap-1">
                <span className="badge bg-danger">
                  {dayjs(item.ngay_nghi).format('DD/MM/YYYY')}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  style={{ fontSize: '11px', padding: '2px 6px' }}
                  onClick={() => handleResetNghiToanKhoa(item.ngay_nghi)}
                  disabled={loadingNghiKhoa}
                  title="Hủy nghỉ toàn khoa"
                >
                  ↻ Reset
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ position: 'relative', width: 300 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo mã / tên lớp học phần..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              setShowSuggestions(true)
            }}
            onBlur={handleSearchBlur}
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              className="list-group"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #ced4da',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                marginTop: '2px'
              }}
            >
              {filteredSuggestions.map(lhp => (
                <button
                  key={lhp.id}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSelectSuggestion(lhp)}
                  style={{ textAlign: 'left', cursor: 'pointer' }}
                >
                  <div className="fw-semibold">{lhp.maLopHocPhan || lhp.ma_lop_hoc_phan}</div>
                  <div className="small text-muted">{lhp.tenHocPhan || lhp.ten_hoc_phan}</div>
                </button>
              ))}
            </div>
          )}
        </div>

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
                                style={{ minHeight: '80px', position: 'relative' }}
                                title={
                                  cell.loai === 'thi'
                                    ? `Môn: ${cell.tenHocPhan}\nNgày thi: ${dayjs(cell.ngayHoc).format('DD/MM/YYYY')}\nCa: ${cell.ca}\nPhòng: ${cell.phong}\nGV: ${cell.tenGiangVien}`
                                    : `Môn: ${cell.tenHocPhan}\nGV: ${cell.tenGiangVien}\nPhòng: ${cell.phong}\n${isNghi ? 'Buổi này đã nghỉ' : 'Click nút ❌ để đánh dấu nghỉ'}`
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
                                  <div>
                                    <div className="small text-danger fw-bold mb-1">❌ Nghỉ</div>
                                    <button
                                      className="btn btn-sm btn-outline-success"
                                      style={{ fontSize: '11px', padding: '2px 6px' }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const ngayNghiFormat = d.dateObj.toISOString().split('T')[0]
                                        handleHuyNghi(cell.id, ngayNghiFormat)
                                      }}
                                      title="Hủy nghỉ (học lại bình thường)"
                                    >
                                      ↻ Reset
                                    </button>
                                  </div>
                                ) : (
                                  // Chỉ hiển thị nút nghỉ cho lịch học thường (không phải thi, không có ngày cụ thể)
                                  cell.loai !== 'thi' && !cell.ngayHoc && (
                                    <button
                                      className="btn btn-sm btn-outline-danger mt-2"
                                      style={{ fontSize: '11px', padding: '2px 6px' }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const ngayNghiFormat = d.dateObj.toISOString().split('T')[0]
                                        handleDanhDauNghi(cell.id, ngayNghiFormat)
                                      }}
                                      title="Đánh dấu nghỉ buổi này"
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

      </div>
    </AdminLayout>
  )
}
