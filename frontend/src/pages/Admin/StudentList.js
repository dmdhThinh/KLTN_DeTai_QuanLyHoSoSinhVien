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
  const [importResult, setImportResult] = useState(null)
  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])
  const [lops, setLops] = useState([])
  const [selectedKhoa, setSelectedKhoa] = useState('')
  const [selectedNganh, setSelectedNganh] = useState('')
  const [selectedLop, setSelectedLop] = useState('')
  const limit = 10

  useEffect(() => {
    loadStudents()
  }, [page])

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [khoaRes, nganhRes, lopRes] = await Promise.all([
          apiFetch('/api/khoa'),
          apiFetch('/api/nganh'),
          apiFetch('/api/lop')
        ])
        setKhoas(khoaRes || [])
        setNganhs(nganhRes || [])
        setLops(lopRes || [])
      } catch (err) {
        console.error('Lỗi tải Khoa/Ngành/Lớp:', err)
      }
    }
    fetchFilters()
  }, [])

  const loadStudents = async (q = query, filters = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: q || '',
        page,
        limit,
        ...(filters.khoaId ? { khoaId: filters.khoaId } : {}),
        ...(filters.nganhId ? { nganhId: filters.nganhId } : {}),
        ...(filters.lopId ? { lopId: filters.lopId } : {})
      })

      const data = await apiFetch(`/api/sinhviens?${params.toString()}`)
      setStudents(data.data || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      console.error(err)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setPage(1)
    await loadStudents(query.trim(), {
      khoaId: selectedKhoa,
      nganhId: selectedNganh,
      lopId: selectedLop
    })
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

      setImportResult(data)
      loadStudents()
    } catch (err) {
      setImportResult({
        message: 'Import thất bại',
        lỗi: [{ dòng: '-', lỗi: err.message }]
      })
    } finally {
      e.target.value = ''
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/import/students/template')
      if (!response.ok) throw new Error('Không thể tải file mẫu')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'MauNhapSinhVien.xlsx'
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <AdminLayout activeMenu="students" title="Danh sách sinh viên">
      {message && <div className="alert alert-info text-center py-2">{message}</div>}

      {confirmDelete && (
        <div
          className="position-fixed top-50 start-50 translate-middle bg-white shadow rounded p-4 text-center"
          style={{ zIndex: 1055, minWidth: 400 }}
        >
          <div className="fw-semibold mb-3">Bạn có chắc muốn xoá sinh viên này?</div>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete.id)}>
              Xoá
            </button>
            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Bộ lọc tìm kiếm sinh viên */}
      <form onSubmit={handleSearch} className="d-flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm theo mã SV hoặc họ tên..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 250 }}
        />

        <select
          className="form-select"
          value={selectedKhoa}
          onChange={(e) => {
            setSelectedKhoa(e.target.value)
            setSelectedNganh('')
            setSelectedLop('')
          }}
          style={{ maxWidth: 200 }}
        >
          <option value="">-- Tất cả khoa --</option>
          {khoas.map((khoa) => (
            <option key={khoa.id} value={khoa.id}>
              {khoa.tenKhoa || khoa.ten_khoa}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          value={selectedNganh}
          onChange={(e) => {
            setSelectedNganh(e.target.value)
            setSelectedLop('')
          }}
          style={{ maxWidth: 200 }}
          disabled={!selectedKhoa}
        >
          <option value="">-- Tất cả ngành --</option>
          {nganhs
            .filter((n) => String(n.khoaId) === String(selectedKhoa))
            .map((n) => (
              <option key={n.id} value={n.id}>
                {n.tenNganh || n.ten_nganh}
              </option>
            ))}
        </select>

        <select
          className="form-select"
          value={selectedLop}
          onChange={(e) => setSelectedLop(e.target.value)}
          style={{ maxWidth: 200 }}
          disabled={!selectedNganh}
        >
          <option value="">-- Tất cả lớp --</option>
          {lops
            .filter((l) => String(l.nganhId) === String(selectedNganh))
            .map((l) => (
              <option key={l.id} value={l.id}>
                {l.tenLop}
              </option>
            ))}
        </select>

        <button type="submit" className="btn btn-primary">
          Tìm kiếm
        </button>
      </form>

      {/* Nút thao tác */}
      <div className="d-flex justify-content-end mb-3 flex-wrap gap-2">
        <button className="btn btn-outline-secondary" onClick={handleDownloadTemplate}>
          📄 Tải file mẫu
        </button>
        <button className="btn btn-outline-success" onClick={() => document.getElementById('fileInput').click()}>
          📥 Import danh sách
        </button>
        <input id="fileInput" type="file" accept=".csv, .xlsx" style={{ display: 'none' }} onChange={handleImport} />
        <button className="btn btn-primary" onClick={() => navigate('/admin/students/new')}>
          ➕ Thêm sinh viên
        </button>
      </div>

      {/* Bảng dữ liệu */}
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
                    <th style={{ width: 60 }}>#</th>
                    <th>Mã SV</th>
                    <th>Họ tên</th>
                    <th>Giới tính</th>
                    <th>Ngày sinh</th>
                    <th>Khoa</th>
                    <th>Ngành</th>
                    <th>Lớp</th>
                    <th style={{ width: 150 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((sv, i) => (
                    <tr key={sv.id}>
                      <td>{(page - 1) * limit + i + 1}</td>
                      <td>{sv.maSv}</td>
                      <td>{sv.hoTen}</td>
                      <td>{sv.gioiTinh || '-'}</td>
                      <td>{sv.ngaySinh ? new Date(sv.ngaySinh).toLocaleDateString('vi-VN') : '-'}</td>
                      <td>{sv.tenKhoa || '-'}</td>
                      <td>{sv.tenNganh || '-'}</td>
                      <td>{sv.tenLop || '-'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => navigate(`/admin/students/edit/${sv.id}`)}
                        >
                          Sửa
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(sv)}>
                          Xóa
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
          <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
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

      {/* Kết quả Import */}
      {importResult && (
        <div className="card mt-4 shadow-sm">
          <div
            className={`card-header fw-semibold ${
              importResult.lỗi && importResult.lỗi.length > 0 ? 'bg-danger text-white' : 'bg-success text-white'
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
              <div className="p-3 text-success fw-semibold">Import thành công! Tất cả dữ liệu hợp lệ.</div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}