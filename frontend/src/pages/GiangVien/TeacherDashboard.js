// src/pages/Teacher/TeacherDashboard.js
import React, { useEffect, useState } from 'react'
import { getGiangVienId, getGiangVienById, apiFetch } from '../../api'
import TeacherLayout from '../../components/TeacherLayout'

export default function TeacherDashboard() {
  const [gvName, setGvName] = useState('')
  const [lopHocPhanList, setLopHocPhanList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = getGiangVienId()
    if (id) {
      // Lấy thông tin giảng viên
      getGiangVienById(id)
        .then((data) => {
          if (data && data.hoTen) setGvName(data.hoTen)
        })
        .catch(() => {})

      // Lấy danh sách lớp học phần
      loadLopHocPhan(id)
    }
  }, [])

  const loadLopHocPhan = async (giangVienId) => {
    try {
      setLoading(true)
      const data = await apiFetch(`/api/lophocphan/by-giangvien/${giangVienId}`)
      setLopHocPhanList(data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách lớp học phần:', error)
      setLopHocPhanList([])
    } finally {
      setLoading(false)
    }
  }

  const handleClassClick = (lopHocPhanId) => {
    window.location.href = `/teacher/sv-lop/${lopHocPhanId}`
  }

  return (
    <TeacherLayout title="Bảng điều khiển" activeMenu="overview" gvName={gvName}>
      <div className="container-fluid">
        <div className="row g-4">
          {/* Thông tin tổng quan */}
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title mb-4">
                  <i className="bi bi-book me-2 text-primary"></i>
                  Danh sách lớp học phần đang giảng dạy
                </h5>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                ) : lopHocPhanList.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-inbox fs-1"></i>
                    <p className="mt-3">Chưa có lớp học phần nào</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {lopHocPhanList.map((lhp) => (
                      <div key={lhp.id} className="col-md-6 col-lg-4">
                        <div 
                          className="card h-100 border shadow-sm hover-shadow"
                          style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                          onClick={() => handleClassClick(lhp.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)'
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = ''
                          }}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h6 className="card-title mb-0 fw-bold text-primary">
                                {lhp.maLopHocPhan}
                              </h6>
                              <span className="badge bg-info text-dark">
                                <i className="bi bi-people-fill me-1"></i>
                                {lhp.siSo || 0} SV
                              </span>
                            </div>
                            
                            <p className="mb-2 fw-semibold">{lhp.tenHocPhan}</p>
                            
                            <div className="small text-muted">
                              <div className="mb-1">
                                <i className="bi bi-diagram-3 me-2"></i>
                                Lớp: <span className="fw-semibold">{lhp.tenLop}</span>
                              </div>
                              <div className="mb-1">
                                <i className="bi bi-calendar3 me-2"></i>
                                HK {lhp.hocKy} - {lhp.namHoc}
                              </div>
                              <div>
                                <i className="bi bi-journal-bookmark me-2"></i>
                                {lhp.soTinChi} tín chỉ
                              </div>
                            </div>
                          </div>
                          <div className="card-footer bg-light border-top-0 text-end">
                            <small className="text-primary">
                              Xem chi tiết <i className="bi bi-arrow-right"></i>
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  )
}
