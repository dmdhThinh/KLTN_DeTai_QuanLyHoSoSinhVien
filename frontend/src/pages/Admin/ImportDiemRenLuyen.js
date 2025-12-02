import React, { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'

export default function ImportDiemRenLuyen() {
  const [importResult, setImportResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Gọi trực tiếp API fetch mà không qua apiFetch để gửi formData
      // Vì apiFetch thường mặc định JSON
      const res = await fetch('http://localhost:8080/api/import/training-scores', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Import thất bại')

      setImportResult(data)
    } catch (err) {
      console.error(err)
      setImportResult({
        message: 'Import thất bại',
        lỗi: [{ dòng: '-', lỗi: err.message }]
      })
    } finally {
      setLoading(false)
      e.target.value = '' // Reset input
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/import/training-scores/template')
      if (!response.ok) throw new Error('Không thể tải file mẫu')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'MauNhapDiemRenLuyen.xlsx'
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <AdminLayout activeMenu="diem-ren-luyen" title="Nhập điểm rèn luyện">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex gap-3 align-items-center mb-3">
             <button className="btn btn-outline-primary" onClick={handleDownloadTemplate}>
              📄 Tải file Excel mẫu
            </button>
            <div>
              <input
                type="file"
                accept=".xlsx, .xls"
                className="form-control"
                onChange={handleImport}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="alert alert-light border">
             <strong>Lưu ý:</strong>
             <ul className="mb-0 mt-1 ps-3">
               <li>File Excel cần có các cột: <strong>Mã sinh viên, Học kỳ, Năm học, Điểm rèn luyện</strong></li>
               <li>Xếp loại sẽ được tự động tính toán nếu không nhập.</li>
               <li>Hệ thống sẽ cập nhật điểm nếu sinh viên đã có điểm trong học kỳ đó.</li>
             </ul>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-3">Đang xử lý import...</div>}

      {/* Kết quả Import */}
      {importResult && (
        <div className="card shadow-sm">
          <div
            className={`card-header fw-semibold ${
              importResult.lỗi && importResult.lỗi.length > 0 ? 'bg-danger text-white' : 'bg-success text-white'
            }`}
          >
            {importResult.lỗi && importResult.lỗi.length > 0
              ? `⚠️ Có ${importResult.lỗi.length} dòng lỗi (Thành công: ${importResult.thành_công})`
              : `✅ Import thành công toàn bộ (${importResult.thành_công} dòng)`}
          </div>
          
          <div className="card-body p-0">
            {importResult.lỗi && importResult.lỗi.length > 0 ? (
              <div className="table-responsive" style={{ maxHeight: '400px' }}>
                <table className="table table-bordered mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th style={{ width: 80 }}>Dòng</th>
                      <th>Lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.lỗi.map((err, i) => (
                      <tr key={i}>
                        <td>{err.dòng}</td>
                        <td className="text-danger">{err.lỗi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-success">
                <h5 className="mb-0">🎉 Đã cập nhật điểm rèn luyện thành công!</h5>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
