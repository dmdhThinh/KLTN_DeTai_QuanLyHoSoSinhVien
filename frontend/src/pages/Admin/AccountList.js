import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function AccountList() {
  const [adminTeacherAccounts, setAdminTeacherAccounts] = useState([])
  const [studentAccounts, setStudentAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [pageAdminTeacher, setPageAdminTeacher] = useState(1)
  const [pageStudent, setPageStudent] = useState(1)
  const perPage = 5

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const adminRes = await apiFetch(`/api/taikhoan?q=${encodeURIComponent(query)}&role=Quản trị`)
      const teacherRes = await apiFetch(`/api/taikhoan?q=${encodeURIComponent(query)}&role=Giảng viên`)
      const studentRes = await apiFetch(`/api/taikhoan?q=${encodeURIComponent(query)}&role=Sinh viên`)

      setAdminTeacherAccounts([...(adminRes.data || []), ...(teacherRes.data || [])])
      setStudentAccounts(studentRes.data || [])
    } catch (err) {
      console.error('Lỗi loadAccounts:', err)
      setAdminTeacherAccounts([])
      setStudentAccounts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setPageAdminTeacher(1)
    setPageStudent(1)
    loadAccounts()
  }

  const handleResetPassword = async (id) => {
    try {
      await apiFetch(`/api/taikhoan/${id}/reset`, { method: 'PUT' })
      setMessage('✅ Đã reset mật khẩu về 123456')
      setTimeout(() => setMessage(''), 2500)
    } catch {
      setMessage('❌ Lỗi khi reset mật khẩu')
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      await apiFetch(`/api/taikhoan/${id}/toggle`, { method: 'PUT' })
      loadAccounts()
    } catch {
      setMessage('❌ Lỗi khi đổi trạng thái')
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/taikhoan/${id}`, { method: 'DELETE' })
      setMessage('✅ Đã xoá tài khoản thành công')
      setTimeout(() => setMessage(''), 2500)
      loadAccounts()
    } catch {
      setMessage('❌ Lỗi khi xoá tài khoản')
    }
  }

  // ✅ Cắt dữ liệu theo trang
  const adminTeacherPaged = adminTeacherAccounts.slice(
    (pageAdminTeacher - 1) * perPage,
    pageAdminTeacher * perPage
  )
  const studentPaged = studentAccounts.slice(
    (pageStudent - 1) * perPage,
    pageStudent * perPage
  )

  return (
    <AdminLayout title="Quản lý tài khoản" activeMenu="accounts">
      {message && <div className="alert alert-info text-center py-2">{message}</div>}

      <div className="d-flex justify-content-between mb-3">
        <form className="d-flex gap-2" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên đăng nhập..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 300 }}
          />
          <button className="btn btn-primary">Tìm</button>
        </form>
      </div>

      {loading ? (
        <div className="text-center p-4 text-muted">Đang tải...</div>
      ) : (
        <>
          {/* 🔹 Bảng Quản trị & Giảng viên */}
          <h5 className="mb-3 mt-2">Tài khoản Quản trị & Giảng viên</h5>
          <div className="card shadow-sm mb-4">
            <div className="card-body p-0">
              {adminTeacherAccounts.length === 0 ? (
                <div className="text-center p-3 text-muted">Không có tài khoản nào.</div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped mb-0 align-middle text-center">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Tên đăng nhập</th>
                          <th>Họ tên</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                          <th>Vai trò</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminTeacherPaged.map((acc, i) => (
                          <tr key={acc.id}>
                            <td>{(pageAdminTeacher - 1) * perPage + i + 1}</td>
                            <td>{acc.username}</td>
                            <td>{acc.hoTen || '-'}</td>
                            <td>
                              <span
                                className={`badge ${acc.trang_thai === 'Hoạt động' ? 'bg-success' : 'bg-secondary'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleToggleStatus(acc.id)}
                              >
                                {acc.trang_thai}
                              </span>
                            </td>
                            <td className="d-flex gap-2 justify-content-center">
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => handleResetPassword(acc.id)}
                              >
                                🔁 Reset MK
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(acc.id)}
                              >
                                ❌ Xoá
                              </button>
                            </td>
                            <td>{acc.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={pageAdminTeacher}
                    total={adminTeacherAccounts.length}
                    onChange={setPageAdminTeacher}
                  />
                </>
              )}
            </div>
          </div>

          {/* 🔹 Bảng Sinh viên */}
          <h5 className="mb-3 mt-4">Tài khoản Sinh viên</h5>
          <div className="card shadow-sm">
            <div className="card-body p-0">
              {studentAccounts.length === 0 ? (
                <div className="text-center p-3 text-muted">Không có tài khoản sinh viên.</div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped mb-0 align-middle text-center">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Tên đăng nhập</th>
                          <th>Họ tên</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentPaged.map((acc, i) => (
                          <tr key={acc.id}>
                            <td>{(pageStudent - 1) * perPage + i + 1}</td>
                            <td>{acc.username}</td>
                            <td>{acc.hoTen || '-'}</td>
                            <td>
                              <span
                                className={`badge ${acc.trang_thai === 'Hoạt động' ? 'bg-success' : 'bg-secondary'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleToggleStatus(acc.id)}
                              >
                                {acc.trang_thai}
                              </span>
                            </td>
                            <td className="d-flex gap-2 justify-content-center">
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => handleResetPassword(acc.id)}
                              >
                                🔁 Reset MK
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(acc.id)}
                              >
                                ❌ Xoá
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={pageStudent}
                    total={studentAccounts.length}
                    onChange={setPageStudent}
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}

// 🔸 Component phân trang tái sử dụng
function Pagination({ page, total, onChange }) {
  const perPage = 5
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null
  return (
    <div className="d-flex justify-content-center mt-2 mb-3">
      <nav>
        <ul className="pagination pagination-sm mb-0">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <li
              key={num}
              className={`page-item ${num === page ? 'active' : ''}`}
              onClick={() => onChange(num)}
              style={{ cursor: 'pointer' }}
            >
              <span className="page-link">{num}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}