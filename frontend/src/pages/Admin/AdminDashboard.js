// src/pages/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import axios from 'axios'
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
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
              title="Số khóa học" 
              value={stats?.totalCourses} 
              icon={BookOpen}
              color="#FFBB28"
            />
          </div>
          <div className="col-lg-3 col-md-6">
            <StatCard 
              title="Số lớp học phần" 
              value={stats?.totalClasses} 
              icon={School}
              color="#FF8042"
            />
          </div>
        </div>

        {/* Biểu đồ */}
        <div className="row g-4">
          {/* Biểu đồ cột - Số sinh viên theo lớp học phần */}
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h6 className="mb-0">Số sinh viên đăng ký theo lớp học phần</h6>
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
                    .sort((a, b) => a.students - b.students)
                    .slice(0, 10);
                  
                  return filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="classCode" 
                        angle={0} 
                        textAnchor="middle" 
                        height={60}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis />
                      <Tooltip />
                      
                      <Bar dataKey="students">
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

          {/* Biểu đồ tròn - Phân bổ theo khoa */}
          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h6 className="mb-0">Phân bổ sinh viên theo khoa</h6>
              </div>
              <div className="card-body">
                {stats?.studentsByFaculty?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.studentsByFaculty}
                        dataKey="total"
                        nameKey="TenKhoa"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => {
                          const total = stats.studentsByFaculty.reduce((sum, item) => sum + item.total, 0);
                          const percent = ((entry.total / total) * 100).toFixed(1);
                          return `${entry.TenKhoa}: ${percent}%`;
                        }}
                      >
                        {stats.studentsByFaculty.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const total = stats.studentsByFaculty.reduce((sum, item) => sum + item.total, 0);
                          const percent = ((value / total) * 100).toFixed(1);
                          return [`${value} (${percent}%)`, 'Số sinh viên'];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-pie-chart fs-1"></i>
                    <p className="mt-2">Chưa có dữ liệu phân bổ</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}