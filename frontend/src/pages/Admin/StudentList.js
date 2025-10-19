import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function StudentList() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [message, setMessage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [importResult, setImportResult] = useState(null) // ✅ Lưu kết quả import
  const limit = 10

  // Load dữ liệu sinh viên khi thay đổi trang
  useEffect(() => {
    loadStudents()
  }, [page])

  const loadStudents = async (q = query) => {
    setLoading(true)
    try {
      const data = await apiFetch(
        `/api/sinhviens?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}&sort=desc`
      )
      setStudents(data.data || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      console.error(err)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
  e.preventDefault()
  setPage(1)
  loadStudents(query.trim()) // dùng trim để loại khoảng trắng
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

  // ✅ Import danh sách sinh viên
  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/import/students', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Import thất bại')

      // ✅ Gán kết quả import vào state (hiển thị ở cuối trang)
      setImportResult(data)
      loadStudents() // tải lại danh sách sau import
    } catch (err) {
      setImportResult({
        message: 'Import thất bại',
        lỗi: [{ dòng: '-', lỗi: err.message }]
      })
    } finally {
      e.target.value = '' // reset input
    }
  }

  // ✅ Tải file mẫu có Khoa, Ngành, Lớp
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/import/students/template')
      if (!response.ok) throw new Error('Không thể tải file mẫu')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'MauNhapSinhVien.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <AdminLayout activeMenu="students" title="Danh sách sinh viên">
      {/* Thông báo trạng thái */}
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

      {/* Thanh tìm kiếm + nút thao tác */}
      <div className="d-flex align-items-center mb-3 flex-wrap gap-2">
        <form onSubmit={handleSearch} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo mã SV hoặc họ tên..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 300 }}
          />
          <button className="btn btn-outline-primary" type="submit">
            Tìm
          </button>
        </form>

        <div className="ms-auto d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline-secondary"
            onClick={handleDownloadTemplate}
          >
            📄 Tải file mẫu
          </button>

          <button
            className="btn btn-outline-success"
            onClick={() => document.getElementById('fileInput').click()}
          >
            📥 Import danh sách
          </button>
          <input
            id="fileInput"
            type="file"
            accept=".csv, .xlsx"
            style={{ display: 'none' }}
            onChange={handleImport}
          />

          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/students/new')}
          >
            ➕ Thêm sinh viên
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4 text-muted">Đang tải...</div>
          ) : students.length === 0 ? (
            <div className="text-center p-4 text-muted">
              Không có sinh viên nào.
            </div>
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
                      <td>{(page - 1) * limit + i + 1}</td>
                      <td>{sv.maSv}</td>
                      <td>{sv.hoTen}</td>
                      <td>
                        {sv.ngaySinh
                          ? new Date(sv.ngaySinh).toLocaleDateString('vi-VN')
                          : ''}
                      </td>
                      <td>{sv.gioiTinh}</td>
                      <td>{sv.khoaHoc}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() =>
                            navigate(`/admin/students/edit/${sv.id}`)
                          }
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

      {/* Phân trang */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted small">
          Trang {page} / {totalPages}
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Trước
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau →
          </button>
        </div>
      </div>

      {/* ✅ Hiển thị kết quả Import ở cuối trang */}
      {importResult && (
        <div className="card mt-4 shadow-sm">
          <div
            className={`card-header fw-semibold ${
              importResult.lỗi && importResult.lỗi.length > 0
                ? 'bg-danger text-white'
                : 'bg-success text-white'
            }`}
          >
            {importResult.lỗi && importResult.lỗi.length > 0
              ? `⚠️ Có ${importResult.lỗi.length} dòng lỗi`
              : '✅ Import thành công — không có lỗi'}
          </div>
          <div className="card-body p-0">
            {importResult.lỗi && importResult.lỗi.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>Dòng</th>
                      <th>Lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.lỗi.map((err, i) => (
                      <tr key={i}>
                        <td>{err.dòng}</td>
                        <td>{err.lỗi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 text-success fw-semibold">
                Import thành công! Tất cả dữ liệu hợp lệ.
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}