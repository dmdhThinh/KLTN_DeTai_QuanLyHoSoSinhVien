import React, { useEffect, useState } from 'react'
import { getSinhVienId, apiFetch } from '../../api'
import StudentLayout from '../../components/StudentLayout'

export default function HocBong() {
  const [hocBong, setHocBong] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sinhVienId = getSinhVienId()
    if (sinhVienId) {
      apiFetch(`/api/hoc-bong/sinh-vien/${sinhVienId}`)
        .then(data => {
          setHocBong(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(err => {
          console.error('Lỗi khi lấy học bổng:', err)
          setHocBong([])
          setLoading(false)
        })
    }
  }, [])

  return (
    <StudentLayout title="Học bổng">
      <div className="card shadow-sm">
        <div className="card-header bg-success text-white">
          <strong>💰 HỌC BỔNG</strong>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : hocBong.length === 0 ? (
            <div className="text-center text-muted py-4">Chưa có học bổng</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>STT</th>
                    <th>Học kỳ</th>
                    <th>Năm học</th>
                    <th>Loại học bổng</th>
                    <th className="text-center">Điểm TB học kỳ</th>
                    <th className="text-center">Điểm rèn luyện</th>
                    <th className="text-end">Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {hocBong.map((hb, index) => (
                    <tr key={hb.id}>
                      <td>{index + 1}</td>
                      <td>{hb.hoc_ky}</td>
                      <td>{hb.nam_hoc}</td>
                      <td>
                        <span className={`badge ${
                          hb.loai_hoc_bong === 'Xuất sắc' ? 'bg-success' :
                          hb.loai_hoc_bong === 'Giỏi' ? 'bg-info' :
                          'bg-primary'
                        }`}>
                          {hb.loai_hoc_bong}
                        </span>
                      </td>
                      <td className="text-center fw-bold">{hb.diem_tb_hoc_ky?.toFixed(2) || '-'}</td>
                      <td className="text-center fw-bold">{hb.diem_ren_luyen || '-'}</td>
                      <td className="text-end fw-bold text-success">
                        {hb.so_tien ? `${Number(hb.so_tien).toLocaleString('vi-VN')} ₫` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}

