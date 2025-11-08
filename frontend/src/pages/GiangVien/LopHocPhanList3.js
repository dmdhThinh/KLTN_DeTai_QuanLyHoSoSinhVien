import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TeacherLayout from '../../components/TeacherLayout'
import { apiFetch, getGiangVienId } from '../../api'

export default function LopHocPhanList3() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const giangVienId = getGiangVienId()

  useEffect(() => {
    const loadData = async () => {
      if (!giangVienId) return
      setLoading(true)
      try {
        const data = await apiFetch(`/api/lophocphan/by-giangvien/${giangVienId}`);
        setList(data || [])
      } catch (err) {
        console.error('Lỗi tải lớp học phần:', err)
        setList([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [giangVienId])

  return (
    <TeacherLayout title="Danh sách sinh viên theo lớp" activeMenu="sv-lop">
      <div className="container mt-4">
        <h3 className="mb-3">
          <i className="bi bi-people me-2"></i>
          Danh sách lớp học phần
        </h3>

        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : list.length === 0 ? (
          <div className="alert alert-info text-center mt-3">
            Không có lớp học phần nào được phân công.
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Mã lớp học phần</th>
                      <th>Tên học phần</th>
                      <th>Tên lớp</th>
                      <th style={{ width: '100px' }}>Sĩ số</th>
                      <th style={{ width: '120px' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((lop, i) => (
                      <tr key={lop.id}>
                        <td className="text-center">{i + 1}</td>
                        <td>{lop.maLopHocPhan}</td>
                        <td>{lop.tenHocPhan}</td>
                        <td>{lop.tenLop}</td>
                        <td className="text-center">{lop.siSo || '—'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => navigate(`/teacher/sv-lop/${lop.id}`)}
                          >
                            
                            Xem sinh viên
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
