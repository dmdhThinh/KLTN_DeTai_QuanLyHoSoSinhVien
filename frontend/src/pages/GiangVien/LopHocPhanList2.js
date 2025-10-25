import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TeacherLayout from '../../components/TeacherLayout'
import { apiFetch, getGiangVienId } from '../../api' // ✅ dùng apiFetch & getGiangVienId

export default function LopHocPhanList() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // ✅ lấy ID giảng viên đang đăng nhập (giống TeacherDashboard)
  const giangVienId = getGiangVienId()

  useEffect(() => {
    const loadData = async () => {
      if (!giangVienId) return
      setLoading(true)
      try {
        // ✅ dùng apiFetch để backend tự nhận base URL
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
    <TeacherLayout title="Danh sách Lớp học phần" activeMenu="lophocphan">
      <div className="container mt-4">
        <h3 className="mb-3"> Danh sách lớp học phần giảng dạy</h3>

        {loading ? (
          <div className="text-center text-muted p-3">Đang tải...</div>
        ) : list.length === 0 ? (
          <div className="alert alert-info text-center mt-3">
            Không có lớp học phần nào được phân công.
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Mã lớp học phần</th>
                      <th>Tên học phần</th>
                      <th>Tên lớp</th>
                      <th>Sĩ số</th>
                      <th style={{ width: 120 }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((lop, i) => (
                      <tr key={lop.id}>
                        <td>{i + 1}</td>
                        <td>{lop.maLopHocPhan}</td>
                        <td>{lop.tenHocPhan}</td>
                        <td>{lop.tenLop}</td>
                        <td>{lop.siSo || '—'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/teacher/nhapdiem/${lop.id}`)}
                          >
                            Nhập điểm
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
