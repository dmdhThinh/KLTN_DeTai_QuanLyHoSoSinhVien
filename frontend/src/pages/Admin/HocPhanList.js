import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function HocPhanList() {
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

  // 🚀 Load dữ liệu ban đầu
  useEffect(() => {
    loadDropdowns()
    loadHocPhan()
  }, [])

  // 🔹 Khi chọn Khoa → lọc ngành thuộc khoa đó
  useEffect(() => {
    if (!khoaId) {
      setFilteredNganhs(nganhs)
      setNganhId('')
    } else {
      const filteredList = nganhs.filter(n => String(n.khoaId) === String(khoaId))
      setFilteredNganhs(filteredList)
      setNganhId('')
    }
  }, [khoaId, nganhs])

  // ===== Load dropdown (Khoa & Ngành)
  const loadDropdowns = async () => {
    try {
      const khoaData = await apiFetch('/api/khoa')
      const nganhData = await apiFetch('/api/nganh')
      if (Array.isArray(khoaData)) {
        setKhoas(khoaData.map(k => ({ id: k.id, ten_khoa: k.ten_khoa || k.tenKhoa })))
      }
      if (Array.isArray(nganhData)) {
        setNganhs(nganhData.map(n => ({
          id: n.id,
          ten_nganh: n.ten_nganh || n.tenNganh,
          khoaId: n.khoaId
        })))
        setFilteredNganhs(nganhData.map(n => ({
          id: n.id,
          ten_nganh: n.ten_nganh || n.tenNganh,
          khoaId: n.khoaId
        })))
      }
    } catch (err) {
      console.error('Error loading dropdowns:', err)
    }
  }

  // ===== Load danh sách học phần
  const loadHocPhan = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/hocphan')
      setList(data || [])
      setFiltered(data || [])
    } catch {
      setList([])
      setFiltered([])
    } finally {
      setLoading(false)
    }
  }

  // ===== Xử lý tìm kiếm & lọc
  const handleSubmit = (e) => {
    e.preventDefault()
    let result = [...list]

    if (search.trim()) {
      const keyword = search.toLowerCase()
      result = result.filter(hp =>
        hp.tenHocPhan.toLowerCase().includes(keyword) ||
        hp.maHocPhan.toLowerCase().includes(keyword)
      )
    }

    if (khoaId) {
      result = result.filter(hp => String(hp.khoaId) === String(khoaId))
    }

    if (nganhId) {
      result = result.filter(hp => String(hp.nganhId) === String(nganhId))
    }

    setFiltered(result)
  }

  // ===== Xử lý xoá
  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/hocphan/${id}`, { method: 'DELETE' })
      setMessage('✅ Đã xoá học phần thành công!')
      loadHocPhan()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Xoá thất bại: ' + err.message)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <AdminLayout title="Danh sách Học Phần">
      {message && <div className="alert alert-info text-center py-2">{message}</div>}

      {/* Xác nhận xoá */}
      {confirmDelete && (
        <div
          className="position-fixed top-50 start-50 translate-middle bg-white shadow rounded p-4 text-center"
          style={{ zIndex: 1055, minWidth: 400 }}
        >
          <div className="fw-semibold mb-3">Bạn có chắc muốn xoá học phần này?</div>
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
        <form
          onSubmit={handleSubmit}
          className="d-flex align-items-center gap-2 flex-wrap"
        >
          {/* 🔍 Tìm kiếm */}
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo mã / tên học phần..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
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

          {/* 🎓 Chọn ngành */}
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

          <button className="btn btn-outline-primary" type="submit">
            Tìm kiếm
          </button>
        </form>

        <div className="ms-auto">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/hocphan/new')}
          >
            ➕ Thêm học phần
          </button>
        </div>
      </div>

      {/* Bảng danh sách học phần */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4 text-muted">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-4 text-muted">
              Không tìm thấy học phần nào phù hợp.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>Mã học phần</th>
                    <th>Tên học phần</th>
                    <th>Số tín chỉ</th>
                    <th>Khoa</th>
                    <th>Ngành</th>
                    <th style={{ width: 150 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((hp, i) => (
                    <tr key={hp.id}>
                      <td>{i + 1}</td>
                      <td>{hp.maHocPhan}</td>
                      <td>{hp.tenHocPhan}</td>
                      <td>{hp.soTinChi}</td>
                      <td>{hp.tenKhoa || '—'}</td>
                      <td>{hp.tenNganh || '—'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => navigate(`/admin/hocphan/edit/${hp.id}`, { state: hp })}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setConfirmDelete(hp)}
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