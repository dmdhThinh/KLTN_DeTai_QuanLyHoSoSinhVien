import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function StudentList() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async (q = '') => {
    setLoading(true)
    try {
      const data = await apiFetch(`/api/sinhviens?q=${encodeURIComponent(q)}`)
      setStudents(data || [])
    } catch {
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadStudents(query)
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/sinhviens/${id}`, { method: 'DELETE' })
      setMessage('Đã xoá sinh viên thành công!')
      setConfirmDelete(null)
      loadStudents()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Xoá thất bại: ' + err.message)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <AdminLayout activeMenu="students" title="Danh sách sinh viên">
      {/* Thông báo */}
      {message && (
        <div className="alert alert-info text-center py-2">{message}</div>
      )}

      {/* Hộp xác nhận xoá */}
      {confirmDelete && (
        <div
          className="position-fixed top-50 start-50 translate-middle bg-white shadow rounded p-4 text-center"
          style={{ zIndex: 1055, minWidth: 400 }}
        >
          <div className="fw-semibold mb-3">
            Bạn có chắc muốn xoá sinh viên này?
          </div>
          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-danger"
              onClick={() => handleDelete(confirmDelete.id)}
            >
              Xoá
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setConfirmDelete(null)}
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Thanh tìm kiếm và nút thêm */}
      <div className="d-flex align-items-center mb-3">
        <form onSubmit={handleSearch} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo mã SV hoặc họ tên..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 300 }}
          />
          <button className="btn btn-outline-primary" type="submit">Tìm</button>
        </form>
        <div className="ms-auto">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/students/new')}
          >
            ➕ Thêm sinh viên
          </button>
        </div>
      </div>

      {/* Bảng danh sách sinh viên */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4 text-muted">Đang tải...</div>
          ) : students.length === 0 ? (
            <div className="text-center p-4 text-muted">Không có sinh viên nào.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Mã SV</th>
                    <th>Họ tên</th>
                    <th>Ngày sinh</th>
                    <th>Giới tính</th>
                    <th>Khóa học</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((sv, i) => (
                    <tr key={sv.id}>
                      <td>{i + 1}</td>
                      <td>{sv.maSv}</td>
                      <td>{sv.hoTen}</td>
                      <td>{sv.ngaySinh}</td>
                      <td>{sv.gioiTinh}</td>
                      <td>{sv.khoaHoc}</td>
                      <td>
                            <button
                                className="btn btn-sm btn-outline-secondary me-2"
                                onClick={() => navigate(`/admin/students/edit/${sv.id}`)}
                            >
                                ✏️ Sửa
                            </button>
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setConfirmDelete(sv)}
                            >
                                Xoá
                            </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
