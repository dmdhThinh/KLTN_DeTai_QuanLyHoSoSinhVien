// src/pages/Teacher/TeacherDashboard.js
import React, { useEffect, useState } from 'react'
import { getGiangVienId, getGiangVienById, apiFetch } from '../../api'
import TeacherLayout from '../../components/TeacherLayout'

export default function TeacherDashboard() {
  const [gvName, setGvName] = useState('')
  const [gvInfo, setGvInfo] = useState(null)
  const [lopHocPhanList, setLopHocPhanList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const id = getGiangVienId()
    if (id) {
      // Lấy thông tin giảng viên
      getGiangVienById(id)
        .then((data) => {
          console.log('🔍 Dữ liệu giảng viên:', data)
          if (data) {
            setGvInfo(data)
            setGvName(data.ho_ten || data.hoTen || '')
          }
        })
        .catch((error) => {
          console.error('❌ Lỗi khi lấy thông tin giảng viên:', error)
        })

      // Lấy danh sách lớp học phần
      loadLopHocPhan(id)
    } else {
      setLoading(false)
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

  // Lọc danh sách lớp học phần theo từ khóa tìm kiếm
  const filteredLopHocPhanList = lopHocPhanList.filter((lhp) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      lhp.maLopHocPhan?.toLowerCase().includes(searchLower) ||
      lhp.tenHocPhan?.toLowerCase().includes(searchLower) ||
      lhp.tenLop?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <TeacherLayout title="Bảng điều khiển" activeMenu="overview" gvName={gvName}>
      <div className="container-fluid">
        <div className="row g-4">
          {/* Thông tin giảng viên */}
          {gvInfo && (
            <div className="col-12">
              <div 
                className="card border-0 shadow-lg" 
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px',
                  overflow: 'hidden'
                }}
              >
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    {/* Avatar Section */}
                    <div className="col-auto">
                      <div 
                        className="position-relative"
                        style={{ width: '120px', height: '120px' }}
                      >
                        <div 
                          className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-lg" 
                          style={{ 
                            width: '120px', 
                            height: '120px', 
                            overflow: 'hidden',
                            border: '5px solid rgba(255,255,255,0.3)'
                          }}
                        >
                          {gvInfo.anh_the || gvInfo.anhThe ? (
                            <img 
                              src={gvInfo.anh_the || gvInfo.anhThe} 
                              alt="Avatar"
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <i className="bi bi-person-circle" style={{ fontSize: '80px', color: '#667eea' }}></i>
                          )}
                        </div>
                        <div 
                          className="position-absolute bg-success rounded-circle"
                          style={{
                            width: '20px',
                            height: '20px',
                            bottom: '10px',
                            right: '10px',
                            border: '3px solid white'
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Info Section */}
                    <div className="col">
                      <div className="text-white">
                        <h3 className="mb-2 fw-bold">{gvInfo.ho_ten || gvInfo.hoTen}</h3>
                        <div className="d-flex align-items-center mb-3">
                          <span className="badge bg-white bg-opacity-25 text-white px-3 py-2 me-2">
                            <i className="bi bi-person-badge me-1"></i>
                            {gvInfo.ma_gv || gvInfo.maGv}
                          </span>
                          {(gvInfo.chuc_vu || gvInfo.chucVu) && (
                            <span className="badge bg-warning text-dark px-3 py-2">
                              <i className="bi bi-award me-1"></i>
                              {gvInfo.chuc_vu || gvInfo.chucVu}
                            </span>
                          )}
                        </div>
                        
                        <div className="row g-3">
                          <div className="col-md-4">
                            <div className="d-flex align-items-start mb-2">
                              <div 
                                className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center me-2"
                                style={{ width: '32px', height: '32px', flexShrink: 0 }}
                              >
                                <i className="bi bi-envelope"></i>
                              </div>
                              <div>
                                <small className="d-block opacity-75">Email</small>
                                <span className="fw-semibold">{gvInfo.email || 'Chưa cập nhật'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-md-4">
                            <div className="d-flex align-items-start mb-2">
                              <div 
                                className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center me-2"
                                style={{ width: '32px', height: '32px', flexShrink: 0 }}
                              >
                                <i className="bi bi-telephone"></i>
                              </div>
                              <div>
                                <small className="d-block opacity-75">Số điện thoại</small>
                                <span className="fw-semibold">{gvInfo.so_dien_thoai || gvInfo.soDienThoai || 'Chưa cập nhật'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-md-4">
                            <div className="d-flex align-items-start mb-2">
                              <div 
                                className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center me-2"
                                style={{ width: '32px', height: '32px', flexShrink: 0 }}
                              >
                                <i className="bi bi-building"></i>
                              </div>
                              <div>
                                <small className="d-block opacity-75">Khoa</small>
                                <span className="fw-semibold">{gvInfo.tenKhoa || gvInfo.ten_khoa || 'Chưa cập nhật'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-md-4">
                            <div className="d-flex align-items-start">
                              <div 
                                className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center me-2"
                                style={{ width: '32px', height: '32px', flexShrink: 0 }}
                              >
                                <i className="bi bi-mortarboard"></i>
                              </div>
                              <div>
                                <small className="d-block opacity-75">Ngành</small>
                                <span className="fw-semibold">{gvInfo.tenNganh || gvInfo.ten_nganh || 'Chưa cập nhật'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danh sách lớp học phần */}
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      <i className="bi bi-book text-white fs-5"></i>
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">Danh sách lớp học phần</h5>
                      <small className="text-muted">
                        {searchTerm 
                          ? `${filteredLopHocPhanList.length} lớp tìm thấy`
                          : `Tổng ${lopHocPhanList.length} lớp đang giảng dạy`}
                      </small>
                    </div>
                  </div>
                  
                  {/* Search Box */}
                  <div className="position-relative" style={{ width: '300px' }}>
                    <i 
                      className="bi bi-search position-absolute text-muted" 
                      style={{ 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                      }}
                    ></i>
                    <input
                      type="text"
                      className="form-control ps-5 border-0 shadow-sm"
                      placeholder="Tìm kiếm lớp học phần..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa'
                      }}
                    />
                    {searchTerm && (
                      <button
                        className="btn btn-link position-absolute text-muted p-0"
                        style={{ 
                          right: '12px', 
                          top: '50%', 
                          transform: 'translateY(-50%)'
                        }}
                        onClick={() => setSearchTerm('')}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                ) : filteredLopHocPhanList.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-inbox fs-1"></i>
                    <p className="mt-3">
                      {searchTerm 
                        ? `Không tìm thấy lớp học phần với từ khóa "${searchTerm}"`
                        : 'Chưa có lớp học phần nào'}
                    </p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {filteredLopHocPhanList.map((lhp, index) => (
                      <div key={lhp.id} className="col-md-6 col-lg-4">
                        <div 
                          className="card h-100 border-0 shadow-sm"
                          style={{ 
                            cursor: 'pointer', 
                            transition: 'all 0.3s',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                          onClick={() => handleClassClick(lhp.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)'
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(102,126,234,0.25)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = ''
                          }}
                        >
                          {/* Gradient Top Border */}
                          <div 
                            style={{
                              height: '4px',
                              background: `linear-gradient(135deg, ${
                                index % 3 === 0 ? '#667eea, #764ba2' :
                                index % 3 === 1 ? '#f093fb, #f5576c' :
                                '#4facfe, #00f2fe'
                              })`
                            }}
                          ></div>
                          
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h6 className="mb-1 fw-bold" style={{ 
                                  color: index % 3 === 0 ? '#667eea' :
                                         index % 3 === 1 ? '#f5576c' : '#4facfe'
                                }}>
                                  {lhp.maLopHocPhan}
                                </h6>
                                <span className="badge" style={{
                                  background: index % 3 === 0 ? 'rgba(102,126,234,0.1)' :
                                             index % 3 === 1 ? 'rgba(245,87,108,0.1)' :
                                             'rgba(79,172,254,0.1)',
                                  color: index % 3 === 0 ? '#667eea' :
                                         index % 3 === 1 ? '#f5576c' : '#4facfe'
                                }}>
                                  <i className="bi bi-people-fill me-1"></i>
                                  {lhp.siSo || 0} SV
                                </span>
                              </div>
                            </div>
                            
                            <h6 className="mb-3 fw-semibold text-dark">{lhp.tenHocPhan}</h6>
                            
                            <div className="small">
                              <div className="d-flex align-items-center mb-2 text-muted">
                                <div 
                                  className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2"
                                  style={{ width: '28px', height: '28px', flexShrink: 0 }}
                                >
                                  <i className="bi bi-diagram-3" style={{ fontSize: '12px' }}></i>
                                </div>
                                <span>Lớp: <strong className="text-dark">{lhp.tenLop}</strong></span>
                              </div>
                              <div className="d-flex align-items-center mb-2 text-muted">
                                <div 
                                  className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2"
                                  style={{ width: '28px', height: '28px', flexShrink: 0 }}
                                >
                                  <i className="bi bi-calendar3" style={{ fontSize: '12px' }}></i>
                                </div>
                                <span>HK {lhp.hocKy} - {lhp.namHoc}</span>
                              </div>
                              <div className="d-flex align-items-center text-muted">
                                <div 
                                  className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2"
                                  style={{ width: '28px', height: '28px', flexShrink: 0 }}
                                >
                                  <i className="bi bi-journal-bookmark" style={{ fontSize: '12px' }}></i>
                                </div>
                                <span>{lhp.soTinChi} tín chỉ</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="card-footer bg-transparent border-0 pt-0 px-4 pb-3">
                            <div className="d-flex align-items-center justify-content-end" style={{
                              color: index % 3 === 0 ? '#667eea' :
                                     index % 3 === 1 ? '#f5576c' : '#4facfe'
                            }}>
                              <small className="fw-semibold">
                                Xem chi tiết <i className="bi bi-arrow-right ms-1"></i>
                              </small>
                            </div>
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
