import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'
import { exportToExcel } from '../../components/excelExport' 

export default function XetHocBong() {
  const [namHoc, setNamHoc] = useState('2023-2024')
  const [hocKy, setHocKy] = useState('HK1')
  const [minTinChi, setMinTinChi] = useState(14)
  
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load saved results on init
  useEffect(() => {
    fetchSavedResults()
  }, [namHoc, hocKy])

  const fetchSavedResults = async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/api/hoc-bong?hoc_ky=${hocKy}&nam_hoc=${namHoc}`)
      setResults(data || [])
      setSaved(data && data.length > 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCalculate = async () => {
    if (!window.confirm('Hệ thống sẽ tính toán lại dựa trên điểm hiện tại. Tiếp tục?')) return

    setLoading(true)
    try {
      const res = await apiFetch('/api/hoc-bong/xet-duyet', {
        method: 'POST',
        body: JSON.stringify({
          hoc_ky: hocKy,
          nam_hoc: namHoc,
          min_tin_chi: Number(minTinChi),
          save: false // Preview mode
        })
      })
      setResults(res.data || [])
      setSaved(false) // Đánh dấu là đang xem preview (chưa lưu mới)
    } catch (err) {
      alert('Lỗi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!results.length) return
    if (!window.confirm('Lưu kết quả này vào hệ thống? Dữ liệu cũ của kỳ này sẽ bị thay thế.')) return

    setLoading(true)
    try {
      await apiFetch('/api/hoc-bong/xet-duyet', {
        method: 'POST',
        body: JSON.stringify({
          hoc_ky: hocKy,
          nam_hoc: namHoc,
          min_tin_chi: Number(minTinChi),
          save: true
        })
      })
      setSaved(true)
      alert('Đã lưu thành công!')
    } catch (err) {
      alert('Lỗi lưu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleExport = () => {
    if (!results.length) return
    
    const dataToExport = results.map((item, index) => ({
      'STT': index + 1,
      'Mã SV': item.ma_sv,
      'Họ tên': item.ho_ten,
      'Lớp': item.ten_lop,
      'Khoa': item.ten_khoa,
      'GPA': item.diem_tb_hoc_ky || item.gpa, // API trả về gpa (preview) hoặc diem_tb_hoc_ky (saved)
      'ĐRL': item.diem_ren_luyen || item.drl,
      'Xếp loại': item.loai_hoc_bong,
      'Số tiền': item.so_tien ? Number(item.so_tien).toLocaleString('vi-VN') : 0
    }))

    exportToExcel(dataToExport, `HocBong_${namHoc}_${hocKy}`)
  }

  const totalMoney = results.reduce((sum, item) => sum + (Number(item.so_tien) || 0), 0)

  return (
    <AdminLayout activeMenu="hoc-bong" title="Xét Học Bổng KKHT">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-2">
              <label className="form-label fw-bold">Năm học</label>
              <input
                type="text"
                className="form-control"
                value={namHoc}
                onChange={e => setNamHoc(e.target.value)}
                placeholder="Ví dụ: 2025-2026"
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Học kỳ</label>
              <select className="form-select" value={hocKy} onChange={e => setHocKy(e.target.value)}>
                <option value="HK1">Học kỳ 1</option>
                <option value="HK2">Học kỳ 2</option>
                <option value="HK3">Học kỳ 3</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Min Tín chỉ</label>
              <input 
                type="number" 
                className="form-control" 
                value={minTinChi} 
                onChange={e => setMinTinChi(e.target.value)} 
              />
            </div>
            <div className="col-md-auto">
              <button className="btn btn-primary me-2" onClick={handleCalculate} disabled={loading}>
                <i className="bi bi-calculator me-2"></i>
                {loading ? 'Đang tính...' : 'Tính toán lại'}
              </button>
              {results.length > 0 && !saved && (
                <button className="btn btn-success me-2" onClick={handleSave} disabled={loading}>
                  <i className="bi bi-save me-2"></i> Lưu kết quả
                </button>
              )}
              {results.length > 0 && (
                <button className="btn btn-outline-success" onClick={handleExport}>
                   <i className="bi bi-file-earmark-excel me-2"></i> Xuất Excel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Thống kê */}
      {results.length > 0 && (
        <div className="row mb-4">
          <div className="col-md-3">
             <div className="card bg-info text-white">
               <div className="card-body text-center">
                 <h3>{results.length}</h3>
                 <div>Sinh viên đạt HB</div>
               </div>
             </div>
          </div>
          <div className="col-md-3">
             <div className="card bg-success text-white">
               <div className="card-body text-center">
                 <h3>{totalMoney.toLocaleString('vi-VN')} đ</h3>
                 <div>Tổng ngân sách</div>
               </div>
             </div>
          </div>
          <div className="col-md-6">
            <div className="card">
               <div className="card-body d-flex justify-content-around align-items-center">
                  <div className="text-center">
                    <h4 className="text-warning">{results.filter(r => r.loai_hoc_bong === 'Xuất sắc').length}</h4>
                    <small>Xuất sắc</small>
                  </div>
                  <div className="text-center">
                    <h4 className="text-primary">{results.filter(r => r.loai_hoc_bong === 'Giỏi').length}</h4>
                    <small>Giỏi</small>
                  </div>
                  <div className="text-center">
                    <h4 className="text-secondary">{results.filter(r => r.loai_hoc_bong === 'Khá').length}</h4>
                    <small>Khá</small>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {saved ? '✅ Danh sách đã lưu' : '⚠️ Danh sách dự kiến (Chưa lưu)'}
          </h5>
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Lớp</th>
                <th>Khoa</th>
                <th className="text-center">GPA</th>
                <th className="text-center">ĐRL</th>
                <th>Xếp loại</th>
                <th className="text-end">Mức thưởng</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    Chưa có dữ liệu. Nhấn "Tính toán" để bắt đầu.
                  </td>
                </tr>
              ) : (
                results.map((sv, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{sv.ma_sv}</td>
                    <td className="fw-semibold">{sv.ho_ten}</td>
                    <td>{sv.ten_lop}</td>
                    <td>{sv.ten_khoa}</td>
                    <td className="text-center fw-bold">{sv.diem_tb_hoc_ky || sv.gpa}</td>
                    <td className="text-center">{sv.diem_ren_luyen || sv.drl}</td>
                    <td>
                      <span className={`badge ${
                        sv.loai_hoc_bong === 'Xuất sắc' ? 'bg-warning text-dark' :
                        sv.loai_hoc_bong === 'Giỏi' ? 'bg-primary' : 'bg-secondary'
                      }`}>
                        {sv.loai_hoc_bong}
                      </span>
                    </td>
                    <td className="text-end text-success fw-bold">
                      {Number(sv.so_tien).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  )
}
