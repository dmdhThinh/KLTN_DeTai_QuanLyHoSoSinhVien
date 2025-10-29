// src/pages/Admin/ThongBaoList.js
import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'

export default function ThongBaoList() {
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
  loadData()
  }, [])

const loadData = () => {
   fetch(`/api/thongbao`)
     .then((res) => res.json())
     .then((data) => {
       if (Array.isArray(data)) setList(data)
       else setList([])
     })
     .catch(() => setList([]))
 }

 const handleDelete = async (id) => {
   if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return
   await fetch(`/api/thongbao/${id}`, { method: 'DELETE' })
   loadData()
 }
  return (
    <AdminLayout title="Danh sách tin tức" activeMenu="thongbao">
      <div className="card shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold mb-0">Tin tức / Thông báo</h5>
          <a href="/admin/thongbao/new" className="btn btn-primary btn-sm">
            <i className="bi bi-plus-lg"></i> Đăng tin mới
          </a>
        </div>

        <div className="input-group mb-3" style={{ maxWidth: 400 }}>
         <input
           type="text"
           className="form-control"
           placeholder="Tìm theo tiêu đề..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
         />
         <button className="btn btn-outline-secondary" onClick={loadData}>
           <i className="bi bi-search"></i>
         </button>
       </div>

        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Tiêu đề</th>
              <th>Ngày đăng</th>
              <th>Nội dung</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(list) && list.map((t, i) => (
              <tr key={t.id}>
                <td>{i + 1}</td>
                <td className="fw-semibold">{t.tieu_de}</td>
                <td>{new Date(t.ngay_gui).toLocaleDateString('vi-VN')}</td>
                <td>{t.noi_dung}</td>
                <td className="text-center">
                 <a href={`/admin/thongbao/edit/${t.id}`} className="btn btn-sm btn-warning me-2">
                   <i className="bi bi-pencil"></i>
                 </a>
                 <button
                   onClick={() => handleDelete(t.id)}
                   className="btn btn-sm btn-danger"
                 >
                   <i className="bi bi-trash"></i>
                 </button>
               </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
