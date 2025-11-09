import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function LopHocPhanList() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [khoaId, setKhoaId] = useState('')
  const [nganhId, setNganhId] = useState('')
  const [khoas, setKhoas] = useState([])
  const [nganhs, setNganhs] = useState([])
  const [filteredNganhs, setFilteredNganhs] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [lopId, setLopId] = useState('') // Thêm state cho lớp học phần
  const [lops, setLops] = useState([]) // Thêm state cho danh sách lớp
  const [filteredLops, setFilteredLops] = useState([]) // Thêm state cho danh sách lớp đã lọc

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // 🚀 Load dữ liệu ban đầu
  useEffect(() => {
    loadDropdowns()
    loadLopHocPhan()
  }, [])

  // 🔹 Khi chọn Khoa → lọc ngành thuộc khoa đó
  useEffect(() => {
    if (!khoaId) {
      setFilteredNganhs(nganhs)
      setNganhId('')
    } else {
      const filteredList = nganhs.filter(n => String(n.khoaId) === String(khoaId))
      setFilteredNganhs(filteredList)
      setNganhId('') // reset ngành khi đổi khoa
    }
  }, [khoaId, nganhs])

  // 🔹 Khi chọn Ngành → lọc lớp thuộc ngành đó
  useEffect(() => {
    if (!nganhId) {
      setFilteredLops(lops)
      setLopId('')
    } else {
      const filteredList = lops.filter(l => String(l.nganhId) === String(nganhId))
      setFilteredLops(filteredList)
      setLopId('') // reset lớp khi đổi ngành
    }
  }, [nganhId, lops])

  // ===== Load dropdown (Khoa & Ngành)
  const loadDropdowns = async () => {
    try {
      const khoaData = await apiFetch('/api/khoa')
      const nganhData = await apiFetch('/api/nganh')
      const lopData = await apiFetch('/api/lop') // Gọi API để lấy danh sách lớp
      console.log('Khoa data:', khoaData)
      console.log('Nganh data:', nganhData)
      console.log('Lop data:', lopData)
      if (Array.isArray(khoaData)) {
        setKhoas(khoaData.map(k => ({ id: k.id, ten_khoa: k.ten_khoa || k.tenKhoa || 'Không xác định' })))
      } else {
        setKhoas([])
      }
      if (Array.isArray(nganhData)) {
        setNganhs(nganhData.map(n => ({ id: n.id, ten_nganh: n.ten_nganh || n.tenNganh || 'Không xác định', khoaId: n.khoaId })))
        setFilteredNganhs(nganhData.map(n => ({ id: n.id, ten_nganh: n.ten_nganh || n.tenNganh || 'Không xác định', khoaId: n.khoaId })))
      } else {
        setNganhs([])
        setFilteredNganhs([])
      }
      if (Array.isArray(lopData)) {
        setLops(lopData.map(l => ({ id: l.id, tenLop: l.tenLop || 'Không xác định', nganhId: l.nganhId })))
        setFilteredLops(lopData.map(l => ({ id: l.id, tenLop: l.tenLop || 'Không xác định', nganhId: l.nganhId })))
      } else {
        setLops([])
        setFilteredLops([])
      }
    } catch (err) {
      console.error('Error loading dropdowns:', err)
      setKhoas([])
      setNganhs([])
      setFilteredNganhs([])
      setLops([])
      setFilteredLops([])
    }
  }

  // ===== Load danh sách lớp học phần
  const loadLopHocPhan = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/lophocphan')
      console.log(data) 
      setList(data || [])
      setFiltered(data || [])
    } catch {
      setList([])
      setFiltered([])
    } finally {
      setLoading(false)
    }
  }

  // ===== Xử lý tìm kiếm & lọc (tự động)
  useEffect(() => {
    let result = [...list]

    // Lọc theo tên lớp học phần
    if (search.trim()) {
      const keyword = search.toLowerCase()
      result = result.filter(lop => lop.maLopHocPhan.toLowerCase().includes(keyword))
    }

    // Lọc theo khoa
    if (khoaId) {
      result = result.filter(lop => String(lop.khoaId) === String(khoaId))
    }

    // Lọc theo ngành
    if (nganhId) {
      result = result.filter(lop => String(lop.nganhId) === String(nganhId))
    }

    // Lọc theo lớp
    if (lopId) {
      result = result.filter(lop => String(lop.lopId) === String(lopId))
    }

    setFiltered(result)
    setCurrentPage(1) // Reset về trang 1 khi lọc
  }, [search, khoaId, nganhId, lopId, list])

  // ===== Xử lý xoá
  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/lophocphan/${id}`, { method: 'DELETE' })
      setMessage('✅ Đã xoá lớp học phần thành công!')
      loadLopHocPhan()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Xoá thất bại: ' + err.message)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <AdminLayout title="Danh sách Lớp Học Phần">
      {message && (
        <div className="alert alert-info text-center py-2">{message}</div>
      )}

      {/* Xác nhận xoá */}
      {confirmDelete && (
        <div
          className="position-fixed top-50 start-50 translate-middle bg-white shadow rounded p-4 text-center"
          style={{ zIndex: 1055, minWidth: 400 }}
        >
          <div className="fw-semibold mb-3">Bạn có chắc muốn xoá lớp học phần này?</div>
          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-danger"
              onClick={() => {
                handleDelete(confirmDelete.id)
                setConfirmDelete(null)
              }}
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

      {/* Thanh công cụ */}
      <div className="d-flex align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* 🔍 Tìm kiếm lớp học phần */}
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo mã lớp học phần..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 220 }}
          />

          {/* 🏫 Chọn khoa */}
          <select
            className="form-select"
            style={{ width: 200 }}
            value={khoaId}
            onChange={(e) => setKhoaId(e.target.value)}
          >
            <option value="">-- Tất cả khoa --</option>
            {khoas.map(k => (
              <option key={k.id} value={k.id}>{k.ten_khoa}</option>
            ))}
          </select>

          {/* 🎓 Chọn ngành (lọc theo khoa) */}
          <select
            className="form-select"
            style={{ width: 200 }}
            value={nganhId}
            onChange={(e) => setNganhId(e.target.value)}
            disabled={!filteredNganhs.length}
          >
            <option value="">-- Tất cả ngành --</option>
            {filteredNganhs.map(n => (
              <option key={n.id} value={n.id}>{n.ten_nganh}</option>
            ))}
          </select>

          {/* 🏫 Chọn lớp (lọc theo ngành) */}
          <select
            className="form-select"
            style={{ width: 200 }}
            value={lopId}
            onChange={(e) => setLopId(e.target.value)}
            disabled={!filteredLops.length}
          >
            <option value="">-- Tất cả lớp --</option>
            {filteredLops.map(l => (
              <option key={l.id} value={l.id}>{l.tenLop}</option>
            ))}
          </select>
        </div>

        <div className="ms-auto">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/lophocphan/new')}
          >
            ➕ Thêm lớp học phần
          </button>
        </div>
      </div>

      {/* Bảng danh sách lớp học phần */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4 text-muted">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-4 text-muted">
              Không tìm thấy lớp học phần nào phù hợp.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>Mã lớp học phần</th>
                    <th>Tên học phần</th>
                    <th>Tên lớp</th>
                    <th>Giảng viên</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th style={{ width: 150 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((lop, i) => (
                    <tr key={lop.id}>
                      <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td>{lop.maLopHocPhan}</td>
                      <td>{lop.tenHocPhan}</td>
                      <td>{lop.tenLop || '—'}</td>
                      <td>{lop.tenGiangVien || '—'}</td>
                      <td>{lop.ngayBatDau ? new Date(lop.ngayBatDau).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—'}</td>
                      <td>{lop.ngayKetThuc ? new Date(lop.ngayKetThuc).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => navigate(`/admin/lophocphan/edit/${lop.id}`)}
                        >
                           Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setConfirmDelete(lop)}
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

        {/* Phân trang */}
        {filtered.length > 0 && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)} - {Math.min(currentPage * itemsPerPage, filtered.length)} trong tổng số {filtered.length} lớp học phần
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    « Trước
                  </button>
                </li>
                {Array.from({ length: Math.ceil(filtered.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === Math.ceil(filtered.length / itemsPerPage) ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
                  >
                    Sau »
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}