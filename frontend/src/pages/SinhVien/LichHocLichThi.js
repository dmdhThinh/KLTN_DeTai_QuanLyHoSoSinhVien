import React, { useEffect, useState } from 'react'
import { getSinhVienId, apiFetch } from '../../api'
import { useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import StudentLayout from '../../components/StudentLayout'
import '../../styles/SinhVien/LichHocLichThi.css'

// 🧭 Hàm lấy thứ 2 đầu tuần
function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export default function LichHocLichThi() {
  const [lich, setLich] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weekStart, setWeekStart] = useState(getMonday(new Date()))
  const { search } = useLocation()
  const mode = new URLSearchParams(search).get('mode') || 'hoc'

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

  // 🧠 Gọi API lịch học hoặc lịch thi
  useEffect(() => {
    const id = getSinhVienId()
    if (!id) {
      setLoading(false)
      setError('Không tìm thấy thông tin sinh viên!')
      return
    }

    setLoading(true)
    setError(null)

    const from = dayjs(weekStart).format('YYYY-MM-DD')

    if (mode === 'tatca') {
    // Lấy cả lịch học + lịch thi
    Promise.all([
      apiFetch(`/api/lich/hoc?sinhVienId=${id}&from=${from}`),
      apiFetch(`/api/lich/thi?sinhVienId=${id}&from=${from}`)
    ])
      .then(([hoc, thi]) => {
        setLich([
          ...(Array.isArray(hoc) ? hoc : []),
          ...(Array.isArray(thi) ? thi : [])
        ])
      })
      .catch((err) => {
        console.error('❌ Lỗi khi tải lịch:', err)
        setError('Không thể tải dữ liệu lịch.')
        setLich([])
      })
      .finally(() => setLoading(false))
      return // ⬅️ tránh chạy tiếp lời gọi đơn lẻ bên dưới
  }

  // Chỉ lịch học hoặc chỉ lịch thi
      apiFetch(`/api/lich/${mode}?sinhVienId=${id}&from=${from}`)
        .then((data) => {
          setLich(Array.isArray(data) ? data : [])
        })
        .catch((err) => {
          console.error('❌ Lỗi khi tải lịch:', err)
          setError('Không thể tải dữ liệu lịch.')
          setLich([])
        })
        .finally(() => setLoading(false))
    }, [mode, weekStart])

  // 🕐 Loading
  if (loading)
    return (
      <div className="text-center mt-5 fw-semibold">
        ⏳ Đang tải dữ liệu...
      </div>
    )

  // ⚠️ Lỗi
  

  return (
    <StudentLayout title='Lịch học lịch thi' div  className="page-lichhoc">
          <div className="d-flex justify-content-center">
          <div
      className="w-100 bg-white"
      style={{
        maxWidth: 1370,
        border: 'none',
        boxShadow: 'none',
      }}
    >
      {/* Thông báo lỗi (hiển thị trên trang) */}
{error && (
  <div className="text-center text-danger fw-semibold mt-3">
    {error}
  </div>
)}

      <div className="toolbar d-flex align-items-center gap-2 flex-wrap">
        <div className="form-check form-check-inline ms-2">
        <input
          className="form-check-input"
          type="radio"
          name="mode"
          checked={mode === 'hoc'}
          onChange={() => (window.location.search = '?mode=hoc')}
        />
        <label className="form-check-label ms-1">Lịch học</label>
      </div>

      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          name="mode"
          checked={mode === 'thi'}
          onChange={() => (window.location.search = '?mode=thi')}
        />
        <label className="form-check-label ms-1">Lịch thi</label>
      </div>

      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          name="mode"
          checked={mode === 'tatca'}
          onChange={() => (window.location.search = '?mode=tatca')}
        />
        <label className="form-check-label ms-1">Tất cả</label>
</div>
        <input
          type="date"
          className="form-control form-control-sm"
          style={{ width: 160, minWidth: 160 }}
          value={dayjs(weekStart).format('YYYY-MM-DD')}
          onChange={(e) => setWeekStart(getMonday(e.target.value))}
        />
        <button
          className="btn btn-sm btn-primary"
          onClick={() => setWeekStart(getMonday(new Date()))}
        >
          Hiện tại
        </button>
        <button className="btn btn-sm btn-outline-primary">In lịch</button>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => {
            const d = new Date(weekStart)
            d.setDate(d.getDate() - 7)
            setWeekStart(getMonday(d))
          }}
        >
          Trở về
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

      {/* Bảng lịch */}
      <div className="lichhoc-table table-responsive">
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
                {days.map((_, i) => {
                  const cell = lich.find((x) => {
  // Nếu là lịch học lặp hàng tuần
  if (x.thu && !x.ngayHoc) {
    return Number(x.thu) === i + 2 && x.ca?.toLowerCase() === ca.toLowerCase()
  }

  // Nếu là lịch học/thi có ngày cụ thể
  if (x.ngayHoc) {
    return (
      dayjs(x.ngayHoc).format('DD/MM/YYYY') === days[i].date &&
      x.ca?.toLowerCase() === ca.toLowerCase()
    )
  }

  return false
})

                  return (
                    <td key={i}>
                      {cell ? (
                        <div className={`monhoc-box ${cell.loai}`}>
  <div className="fw-semibold">
    {cell.tenHocPhan || cell.monHoc}
  </div>
  <div className="small text-muted">
    {cell.maLopHocPhan || cell.lopHocPhan}
  </div>

  {cell.loai === 'thi' ? (
    <>
      <div className="small">Phòng: {cell.phong}</div>
      <div className="small">GV: {cell.tenGiangVien || cell.giangVien}</div>
      <div className="small text-danger fw-semibold">(Thi)</div>
    </>
  ) : (
    <>
      <div className="small">
        Tiết: {cell.tietBatDau || cell.tiet?.split('-')[0]} -{' '}
        {cell.tietKetThuc || cell.tiet?.split('-')[1]}
      </div>
      <div className="small">Phòng: {cell.phong}</div>
      <div className="small">GV: {cell.tenGiangVien || cell.giangVien}</div>
    </>
  )}
</div>
                      ) : (
                        <div style={{ height: 60 }}></div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Không có dữ liệu */}
      {(!lich || lich.length === 0) && (
        <div className="text-center text-muted mt-3" style={{ fontSize: 15, fontWeight: 500 }}>
          Không có dữ liệu {mode === 'hoc' ? 'lịch học' : 'lịch thi'} cho tuần này.
        </div>
      )}

      {/* Ghi chú */}
      <div className="legend">
        <div className="legend-item">
          <span style={{ background: '#bdbdbd' }}></span> Lịch học lý thuyết
        </div>
        <div className="legend-item">
          <span style={{ background: '#8fd14f', border: '1px solid #388e3c' }}></span> Lịch học thực hành
        </div>
        <div className="legend-item">
          <span style={{ background: '#b3e5fc', border: '1px solid #0288d1' }}></span> Lịch học trực tuyến
        </div>
        <div className="legend-item">
          <span style={{ background: '#fff9c4', border: '1px solid #fbc02d' }}></span> Lịch thi
        </div>
        <div className="legend-item">
          <span style={{ background: '#ef5350', border: '1px solid #b71c1c' }}></span> Lịch tạm ngưng
        </div>
      </div>
    </div>
    </div>
    </StudentLayout>
  )
}