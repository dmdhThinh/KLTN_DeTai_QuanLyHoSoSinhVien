// src/pages/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import axios from 'axios'
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { Users, GraduationCap, BookOpen, School } from 'lucide-react'

function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <div className="bg-white rounded-3 shadow-sm p-4 h-100">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <div className="text-muted small mb-2">{title}</div>
          <div className="fs-2 fw-bold" style={{ color }}>{value?.toLocaleString() || 0}</div>
          {trend && (
            <div className={`small mt-2 ${trend > 0 ? 'text-success' : 'text-danger'}`}>
              <i className={`bi bi-arrow-${trend > 0 ? 'up' : 'down'}`}></i> {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="rounded-circle p-3" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} color={color} />
        </div>
      </div>
    </div>
  )
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B9D', '#C0C0C0', '#9D4EDD', '#06FFA5']

// Helper: Tính học kỳ và năm học hiện tại
const getCurrentSemesterAndYear = () => {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const year = now.getFullYear()
  
  let semester, academicYear
  if (month >= 1 && month <= 7) {
    semester = 'HK2'
    academicYear = `${year - 1}-${year}`
  } else {
    semester = 'HK1'
    academicYear = `${year}-${year + 1}`
  }
  
  return { semester, academicYear }
}

export default function AdminDashboard() {
  const { semester: currentSemester, academicYear: currentYear } = getCurrentSemesterAndYear()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSemester, setSelectedSemester] = useState(currentSemester)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [viewMode, setViewMode] = useState('khoa') // 'khoa' hoặc 'nganh'
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/statistics')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Bảng điều khiển" activeMenu="dashboard">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Tổng quan hệ thống" activeMenu="dashboard">
      <div className="container-fluid">
        

        {/* Các ô thống kê */}
        <div className="row g-4 mb-4">
          <div className="col-lg-3 col-md-6">
            <StatCard 
              title="Tổng số sinh viên" 
              value={stats?.totalStudents} 
              icon={Users}
              color="#0088FE"
              trend={12}
            />
          </div>
          <div className="col-lg-3 col-md-6">
            <StatCard 
              title="Tổng số giảng viên" 
              value={stats?.totalTeachers} 
              icon={GraduationCap}
              color="#00C49F"
              trend={5}
            />
          </div>
          <div className="col-lg-3 col-md-6">
            <StatCard 
              title="Tổng số học phần" 
              value={stats?.totalCourses} 
              icon={BookOpen}
              color="#FFBB28"
            />
          </div>
          <div className="col-lg-3 col-md-6">
            <StatCard 
              title="Tổng số lớp học phần" 
              value={stats?.totalClasses} 
              icon={School}
              color="#FF8042"
            />
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="row g-4 mb-4">
          <div className="col-lg-12">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white">
                <h6 className="mb-0">Thống kê nhanh</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded">
                      <div className="text-muted small mb-1">Số lớp đang mở</div>
                      <div className="fs-4 fw-bold text-primary">
                        {stats?.totalClasses || 0}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded">
                      <div className="text-muted small mb-1">Số sinh viên đã đăng ký học phần</div>
                      <div className="fs-4 fw-bold text-success">
                        {stats?.studentsByClass?.reduce((sum, item) => sum + (item.students || 0), 0) || 0}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded">
                      <div className="text-muted small mb-1">Số khoa</div>
                      <div className="fs-4 fw-bold text-info">
                        {stats?.studentsByFaculty?.length || 0}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded position-relative">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <div className="text-muted small">Tỷ lệ tốt nghiệp trung bình</div>
                        <div className="position-relative">
                          <i 
                            className="bi bi-info-circle text-primary" 
                            style={{ fontSize: '16px', cursor: 'help' }}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          ></i>
                          {showTooltip && (
                            <div 
                              className="position-absolute bg-dark text-white p-2 rounded shadow-lg"
                              style={{
                                width: '280px',
                                fontSize: '12px',
                                zIndex: 1000,
                                bottom: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                marginBottom: '8px',
                                lineHeight: '1.5',
                                animation: 'fadeIn 0.2s ease-in'
                              }}
                              onMouseEnter={() => setShowTooltip(true)}
                              onMouseLeave={() => setShowTooltip(false)}
                            >
                              <div className="fw-semibold mb-1">Giải thích:</div>
                              <div>Tỷ lệ trung bình của tất cả các khóa học.</div>
                              <div className="mt-1">Ví dụ: <strong>25%</strong> nghĩa là trung bình <strong>25% sinh viên</strong> trong mỗi khóa đã tốt nghiệp.</div>
                              <div 
                                className="position-absolute"
                                style={{
                                  bottom: '-6px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  width: 0,
                                  height: 0,
                                  borderLeft: '6px solid transparent',
                                  borderRight: '6px solid transparent',
                                  borderTop: '6px solid #212529'
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="fs-4 fw-bold text-warning">
                        {stats?.totNghiepTheoKhoa?.length > 0 
                          ? (() => {
                              const validItems = stats.totNghiepTheoKhoa.filter(item => item.tyLe != null && !isNaN(item.tyLe))
                              if (validItems.length === 0) return '0%'
                              const avg = validItems.reduce((sum, item) => sum + Number(item.tyLe), 0) / validItems.length
                              return `${avg.toFixed(1)}%`
                            })()
                          : '0%'}
                      </div>
                      <div className="text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                        Trung bình của {stats?.totNghiepTheoKhoa?.filter(item => item.tyLe != null && !isNaN(item.tyLe)).length || 0} khóa học
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ */}
        <div className="row g-4">
          {/* Biểu đồ cột - Top lớp học phần có nhiều sinh viên nhất */}
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h6 className="mb-0">Top 10 lớp học phần có nhiều sinh viên nhất</h6>
                <div className="d-flex gap-2">
                  <select 
                    className="form-select form-select-sm" 
                    style={{ width: '120px' }}
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                  >
                    <option value="">Tất cả HK</option>
                    {stats?.studentsByClass && [...new Set(stats.studentsByClass.map(c => c.semester))]
                      .filter(s => s)
                      .sort()
                      .map(sem => (
                        <option key={sem} value={sem}>Học kỳ {sem}</option>
                      ))}
                  </select>
                  <select 
                    className="form-select form-select-sm" 
                    style={{ width: '140px' }}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="">Tất cả năm</option>
                    {stats?.studentsByClass && [...new Set(stats.studentsByClass.map(c => c.academicYear))]
                      .filter(y => y)
                      .sort()
                      .reverse()
                      .map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="card-body">
                {stats?.studentsByClass?.length > 0 ? (() => {
                  const filteredData = stats.studentsByClass
                    .filter(item => 
                      (!selectedSemester || item.semester === selectedSemester) &&
                      (!selectedYear || item.academicYear === selectedYear)
                    )
                    .sort((a, b) => b.students - a.students)
                    .slice(0, 10)
                    .map((item, index) => ({
                      ...item,
                      shortName: item.courseName?.length > 30 
                        ? item.courseName.substring(0, 30) + '...' 
                        : item.courseName
                    }));
                  
                  return filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={filteredData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="shortName" 
                        type="category" 
                        width={200}
                        style={{ fontSize: '11px' }}
                      />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} sinh viên`,
                          props.payload.courseName
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                      <Bar dataKey="students" radius={[0, 8, 8, 0]}>
                        {filteredData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-bar-chart fs-1"></i>
                    <p className="mt-2">Không có dữ liệu cho bộ lọc này</p>
                  </div>
                );
                })() : (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-bar-chart fs-1"></i>
                    <p className="mt-2">Chưa có dữ liệu sinh viên</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Biểu đồ - Tỷ lệ tốt nghiệp theo khóa/ngành */}
          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h6 className="mb-0">Tỷ lệ tốt nghiệp</h6>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn ${viewMode === 'khoa' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('khoa')}
                  >
                    Theo khóa
                  </button>
                  <button
                    type="button"
                    className={`btn ${viewMode === 'nganh' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('nganh')}
                  >
                    Theo ngành
                  </button>
                </div>
              </div>
              <div className="card-body">
                {viewMode === 'khoa' ? (
                  stats?.totNghiepTheoKhoa?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart 
                        data={stats.totNghiepTheoKhoa}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]} 
                          unit="%" 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          dataKey="khoaHoc" 
                          type="category" 
                          width={60}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            return [
                              `${value}% (${props.payload.daTotNghiep}/${props.payload.tongSo} sinh viên)`,
                              'Tỷ lệ tốt nghiệp'
                            ];
                          }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                        <Bar dataKey="tyLe" radius={[0, 8, 8, 0]}>
                          {stats.totNghiepTheoKhoa.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-bar-chart fs-1"></i>
                      <p className="mt-2">Chưa có dữ liệu tốt nghiệp theo khóa</p>
                    </div>
                  )
                ) : (
                  stats?.totNghiepTheoNganh?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart 
                        data={stats.totNghiepTheoNganh.slice(0, 8)}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]} 
                          unit="%" 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          dataKey="tenNganh" 
                          type="category" 
                          width={100}
                          style={{ fontSize: '11px' }}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            return [
                              `${value}% (${props.payload.daTotNghiep}/${props.payload.tongSo} sinh viên)`,
                              'Tỷ lệ tốt nghiệp'
                            ];
                          }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                        <Bar dataKey="tyLe" radius={[0, 8, 8, 0]}>
                          {stats.totNghiepTheoNganh.slice(0, 8).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-bar-chart fs-1"></i>
                      <p className="mt-2">Chưa có dữ liệu tốt nghiệp theo ngành</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}