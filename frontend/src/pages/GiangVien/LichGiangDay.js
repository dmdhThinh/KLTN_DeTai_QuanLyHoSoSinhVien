import React, { useEffect, useState } from 'react'
import { apiFetch, getGiangVienId } from '../../api'
import TeacherLayout from '../../components/TeacherLayout'
import dayjs from 'dayjs'
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

export default function LichGiangDay() {
  const [lich, setLich] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weekStart, setWeekStart] = useState(getMonday(new Date()))

  // 🧠 Gọi API lịch học + lịch thi
  useEffect(() => {
    const id = getGiangVienId()
    
    if (!id) {
      setLoading(false)
      setError('Không tìm thấy thông tin giảng viên!')
      return
    }

    setLoading(true)
    setError(null)

    const from = dayjs(weekStart).format('YYYY-MM-DD')

    // Lấy cả lịch học + lịch thi
    Promise.all([
      apiFetch(`/api/lich/giangvien/hoc?giangVienId=${id}&from=${from}`),
      apiFetch(`/api/lich/giangvien/thi?giangVienId=${id}&from=${from}`)
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
  }, [weekStart])

  // 🕐 Loading
  if (loading)
    return (
      <TeacherLayout title="Lịch giảng dạy" activeMenu="lich">
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải lịch giảng dạy...</p>
        </div>
      </TeacherLayout>
    )

  // ❌ Error
  if (error)
    return (
      <TeacherLayout title="Lịch giảng dạy" activeMenu="lich">
        <div className="alert alert-danger">{error}</div>
      </TeacherLayout>
    )

  // 📅 Tạo 7 ngày trong tuần
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    days.push({
      dayName: i === 0 ? 'Thứ 2' : i === 6 ? 'Chủ nhật' : `Thứ ${i + 2}`,
      date: dayjs(d).format('DD/MM/YYYY'),
      dateObj: d
    })
  }

  const caHoc = ['Sáng', 'Chiều', 'Tối']

  return (
    <TeacherLayout title="Lịch giảng dạy" activeMenu="lich">
      <div className="page-lichhoc">
        <div className="d-flex justify-content-center">
          <div className="w-100 bg-white" style={{ maxWidth: 1370, border: 'none', boxShadow: 'none' }}>
            
            {/* Toolbar */}
            <div className="toolbar d-flex align-items-center gap-2 flex-wrap">
              <input
                type="date"
                className="form-control form-control-sm"
                style={{ width: 160, minWidth: 160 }}
                value={dayjs(weekStart).format('YYYY-MM-DD')}
                onChange={(e) => setWeekStart(getMonday(new Date(e.target.value)))}
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
                ← Trước
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
            <div className="lichhoc-table">
            <table>
              <thead>
                <tr>
                  <th>Ca học</th>
                  {days.map((d, i) => (
                    <th key={i}>
                      <div>{d.dayName}</div>
                      <div>{d.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {caHoc.map((ca, caIndex) => (
                  <tr key={caIndex}>
                    <td>{ca}</td>
                {days.map((d, i) => {
                  const cells = lich.filter((x) => {
                    const normalizeCa = (str) => {
                      if (!str) return ''
                      return str.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                    }

                    const matchCa = normalizeCa(x.ca) === normalizeCa(ca)

                    // Lịch học lặp hàng tuần
                    if (x.thu && !x.ngayHoc) {
                      return Number(x.thu) === i + 2 && matchCa
                    }

                    // Lịch học/thi có ngày cụ thể
                    if (x.ngayHoc) {
                      return (
                        dayjs(x.ngayHoc).format('DD/MM/YYYY') === days[i].date &&
                        matchCa
                      )
                    }

                    return false
                  })

                  return (
                    <td key={i}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {cells.map((cell) => {
                          // Kiểm tra ngày nghỉ
                          const isNghi = cell.danhSachNgayNghi && cell.danhSachNgayNghi.includes(days[i].date.split('/').reverse().join('-'))

                          return (
                            <div key={cell.id} className={`monhoc-box ${cell.loai} ${isNghi ? 'nghi' : ''}`}>
                              <div className="fw-semibold">
                                {cell.tenHocPhan}
                              </div>
                              <div className="small text-muted">
                                {cell.maLopHocPhan}
                              </div>
                              {cell.tenLop && (
                                <div className="small">
                                  Lớp: {cell.tenLop}
                                </div>
                              )}

                              {cell.loai === 'thi' ? (
                                <>
                                  <div className="small">
                                    Tiết: {cell.tietBatDau} - {cell.tietKetThuc}
                                  </div>
                                  <div className="small">Phòng: {cell.phong}</div>
                                  <div className="small text-danger fw-semibold">(Thi)</div>
                                </>
                              ) : (
                                <>
                                  <div className="small">
                                    Tiết: {cell.tietBatDau} - {cell.tietKetThuc}
                                  </div>
                                  <div className="small">Phòng: {cell.phong}</div>
                                </>
                              )}
                              {isNghi && (
                                <div className="small text-white fw-bold mt-1">❌ Nghỉ</div>
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
        </div>
      </div>
    </TeacherLayout>
  )
}
