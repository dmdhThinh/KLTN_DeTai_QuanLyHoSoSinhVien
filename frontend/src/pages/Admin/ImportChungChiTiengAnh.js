import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { apiFetch } from '../../api'
import { AlertModal } from '../../components/Modal'

const API_BASE = process.env.REACT_APP_API_BASE || ''

export default function ImportChungChiTiengAnh() {
  const [importResult, setImportResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [chungChiList, setChungChiList] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [search, setSearch] = useState('')
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' })

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/api/import/english-certificate`, {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Import thất bại')

      setImportResult(data)
      // Reload danh sách sau khi import thành công
      if (data.thành_công > 0) {
        loadChungChiList()
      }
    } catch (err) {
      console.error(err)
      setImportResult({
        message: 'Import thất bại',
        lỗi: [{ dòng: '-', lỗi: err.message }]
      })
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/import/english-certificate/template`)
      if (!response.ok) throw new Error('Không thể tải file mẫu')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'MauNhapChungChiTiengAnh.xlsx'
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setAlertModal({ show: true, message: err.message, type: 'danger' })
    }
  }

  // Load danh sách chứng chỉ
  const loadChungChiList = async () => {
    setLoadingList(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) {
        params.append('search', search.trim())
      }
      
      const result = await apiFetch(`/api/import/english-certificate?${params.toString()}`)
      setChungChiList(result.data || [])
    } catch (err) {
      console.error('Lỗi load danh sách chứng chỉ:', err)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadChungChiList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // Reload danh sách sau khi import thành công
  useEffect(() => {
    if (importResult && importResult.thành_công > 0) {
      loadChungChiList()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importResult])

  return (
    <AdminLayout activeMenu="chung-chi-tieng-anh" title="Nhập chứng chỉ tiếng Anh">
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
               <li>File Excel cần có các cột: <strong>Mã sinh viên, Loại chứng chỉ, Ngày cấp, Điểm, Ghi chú</strong></li>
               <li>Loại chứng chỉ: TOEIC, IELTS, TOEFL, hoặc các loại khác</li>
               <li>Hệ thống sẽ cập nhật chứng chỉ nếu sinh viên đã có chứng chỉ.</li>
               <li>Nếu trong file có nhiều dòng cùng mã SV, chỉ dòng cuối cùng được lưu.</li>
             </ul>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-3">Đang xử lý import...</div>}

      {/* Danh sách chứng chỉ đã import */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <strong>DANH SÁCH CHỨNG CHỈ TIẾNG ANH ĐÃ IMPORT</strong>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: '250px' }}
              placeholder="Tìm kiếm mã SV hoặc tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-sm btn-light" onClick={loadChungChiList}>
              🔄 Tải lại
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          {loadingList ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : chungChiList.length === 0 ? (
            <div className="text-center py-4 text-muted">Chưa có dữ liệu chứng chỉ tiếng Anh</div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '500px' }}>
              <table className="table table-bordered table-hover mb-0">
                <thead className="table-light sticky-top">
                  <tr>
                    <th style={{ width: '50px' }}>STT</th>
                    <th style={{ width: '120px' }}>Mã SV</th>
                    <th>Họ tên</th>
                    <th style={{ width: '100px' }}>Lớp</th>
                    <th style={{ width: '120px' }}>Loại chứng chỉ</th>
                    <th style={{ width: '120px' }}>Ngày cấp</th>
                    <th style={{ width: '100px' }} className="text-center">Điểm</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {chungChiList.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.ma_sv}</td>
                      <td>{item.ho_ten}</td>
                      <td>{item.ten_lop || '-'}</td>
                      <td>
                        <span className="badge bg-primary">{item.loai_chung_chi}</span>
                      </td>
                      <td>{item.ngay_cap ? new Date(item.ngay_cap).toLocaleDateString('vi-VN') : '-'}</td>
                      <td className="text-center fw-bold">{item.diem || '-'}</td>
                      <td><small>{item.ghi_chu || '-'}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Kết quả Import */}
      {importResult && (
        <div className="card shadow-sm">
          <div
            className={`card-header fw-semibold ${
              importResult.lỗi && importResult.lỗi.length > 0 ? 'bg-danger text-white' : 'bg-success text-white'
            }`}
          >
            {importResult.lỗi && importResult.lỗi.length > 0
              ? `Có ${importResult.lỗi.length} dòng lỗi (Thành công: ${importResult.thành_công})`
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
                <h5 className="mb-0">🎉 Đã cập nhật chứng chỉ tiếng Anh thành công!</h5>
              </div>
            )}
          </div>
        </div>
      )}

      <AlertModal
        show={alertModal.show}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ show: false, message: '', type: 'info' })}
      />
    </AdminLayout>
  )
}

