import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TeacherLayout from '../../components/TeacherLayout'
import { apiFetch, getGiangVienId } from '../../api' // ✅ dùng apiFetch & getGiangVienId

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

export default function LopHocPhanList() {
  const { semester: currentSemester, academicYear: currentYear } = getCurrentSemesterAndYear()
  const [list, setList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [selectedSemester, setSelectedSemester] = useState(currentSemester)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [searchCode, setSearchCode] = useState('') // Tìm theo mã lớp học phần
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // ✅ lấy ID giảng viên đang đăng nhập (giống TeacherDashboard)
  const giangVienId = getGiangVienId()

  useEffect(() => {
    const loadData = async () => {
      if (!giangVienId) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        // ✅ dùng apiFetch để backend tự nhận base URL
        const data = await apiFetch(`/api/lophocphan/by-giangvien/${giangVienId}`);
        setList(data || [])
      } catch (err) {
        console.error('Lỗi tải lớp học phần:', err)
        setList([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [giangVienId])

  // Lọc danh sách theo học kỳ và năm học
  useEffect(() => {
    const normalizedSearch = searchCode.trim().toLowerCase()

    const filtered = list.filter(lop => {
      const matchSemester = !selectedSemester || lop.hocKy === selectedSemester
      const matchYear = !selectedYear || lop.namHoc === selectedYear
      const matchCode =
        !normalizedSearch ||
        (lop.maLopHocPhan || '').toLowerCase().includes(normalizedSearch)

      return matchSemester && matchYear && matchCode
    })
    setFilteredList(filtered)
  }, [list, selectedSemester, selectedYear, searchCode])

  return (
    <TeacherLayout title="Danh sách lớp học phần giảng dạy" activeMenu="lophocphan">
      <div className="container mt-4">
        {/* Combobox lọc */}
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="row g-3 align-items-center">
              <div className="col-auto">
                <label className="form-label mb-0 fw-semibold">Lọc theo:</label>
              </div>
              <div className="col-auto">
                <select 
                  className="form-select" 
                  style={{ width: '150px' }}
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="">Tất cả học kỳ</option>
                  {[...new Set(list.map(l => l.hocKy))].filter(s => s).sort().map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
              <div className="col-auto">
                <select 
                  className="form-select" 
                  style={{ width: '180px' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">Tất cả năm học</option>
                  {[...new Set(list.map(l => l.namHoc))].filter(y => y).sort().reverse().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              {/* Ô tìm kiếm theo mã lớp học phần */}
              <div className="col-auto">
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '220px' }}
                  placeholder="Tìm theo mã lớp học phần..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                />
              </div>
              <div className="col-auto ms-auto">
                <span className="badge bg-primary">Tổng: {filteredList.length} lớp</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted p-3">Đang tải...</div>
        ) : filteredList.length === 0 ? (
          <div className="alert alert-info text-center mt-3">
            Không có lớp học phần nào được phân công.
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Mã lớp học phần</th>
                      <th>Tên học phần</th>
                      <th>Tên lớp</th>
                      <th>Sĩ số</th>
                      <th style={{ width: 120 }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((lop, i) => (
                      <tr key={lop.id}>
                        <td>{i + 1}</td>
                        <td>{lop.maLopHocPhan}</td>
                        <td>{lop.tenHocPhan}</td>
                        <td>{lop.tenLop}</td>
                        <td>{lop.siSo || '—'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/teacher/nhapdiem/${lop.id}`)}
                          >
                          
                            Nhập điểm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}