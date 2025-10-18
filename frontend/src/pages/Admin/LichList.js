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
  const [hocKy, setHocKy] = useState('')
  const [namHoc, setNamHoc] = useState('')
  const [lops, setLops] = useState([])
  const navigate = useNavigate()

  // 🧩 Tải danh sách lớp
  useEffect(() => {
    apiFetch('/api/lop')
      .then((data) => setLops(data || []))
      .catch(() => setLops([]))
  }, [])

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

  // 🧠 Gọi API lịch học (theo lớp, tuần)
useEffect(() => {
  if (!lopId) {
    setLich([])
    setLoading(false)
    return
  }

  setLoading(true)
  setError(null)

  const from = dayjs(weekStart).format('YYYY-MM-DD')

  Promise.all([
    apiFetch(`/api/lich-admin/hoc?lopId=${lopId}&from=${from}`),
    apiFetch(`/api/lich-admin/thi?lopId=${lopId}&from=${from}`)
  ])
    .then(([hoc, thi]) => {
      // gộp lịch học + lịch thi vào cùng 1 mảng
      setLich([...(Array.isArray(hoc) ? hoc : []), ...(Array.isArray(thi) ? thi : [])])
    })
    .catch((err) => {
      console.error('❌ Lỗi khi tải lịch:', err)
      setError('Không thể tải dữ liệu lịch học / lịch thi.')
      setLich([])
    })
    .finally(() => setLoading(false))
}, [lopId, hocKy, namHoc, weekStart])


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

          <select
            className="form-select"
            style={{ width: 200 }}
            value={lopId}
            onChange={(e) => setLopId(e.target.value)}
          >
            <option value="">-- Chọn lớp --</option>
            {lops.map((lop) => (
              <option key={lop.id} value={lop.id}>
                {lop.tenLop}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 140 }}
            value={hocKy}
            onChange={(e) => setHocKy(e.target.value)}
          >
            <option value="">-- Học kỳ --</option>
            <option value="HK1">HK1</option>
            <option value="HK2">HK2</option>
            <option value="Hè">Hè</option>
          </select>

          <select
            className="form-select"
            style={{ width: 160 }}
            value={namHoc}
            onChange={(e) => setNamHoc(e.target.value)}
          >
            <option value="">-- Năm học --</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
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
                      const cell = lich.find((x) => {
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
                        <td key={i}>

                          {cell ? (
                            <div
  className={`monhoc-box ${cell.loai}`}
  style={{ cursor: 'pointer' }}
  onClick={() => navigate(`/admin/lich/edit/${cell.id}`)} 
  title={
    cell.loai === 'thi'
      ? `Môn: ${cell.tenHocPhan}\nNgày thi: ${dayjs(cell.ngayHoc).format('DD/MM/YYYY')}\nCa: ${cell.ca}\nPhòng: ${cell.phong}\nGV: ${cell.tenGiangVien}`
      : `Môn: ${cell.tenHocPhan}\nGV: ${cell.tenGiangVien}\nPhòng: ${cell.phong}`
  }
>
  <div className="fw-semibold">{cell.tenHocPhan}</div>
  <div className="small text-muted">{cell.maLopHocPhan}</div>
  {cell.loai === 'thi' ? (
    <>
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
      </div>
    </AdminLayout>
  )
}
