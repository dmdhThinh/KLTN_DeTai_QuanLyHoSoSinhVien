import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TeacherLayout from '../../components/TeacherLayout'
import { apiFetch, getGiangVienId } from '../../api'

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

// Helper: Tạo danh sách option học kỳ/năm học
const generateHocKyOptions = (list) => {
  const hocKys = ['HK1', 'HK2', 'HK3']
  const namHocs = [...new Set(list.map(l => l.namHoc).filter(y => y))].sort().reverse()
  
  const options = []
  for (const namHoc of namHocs) {
    for (const hocKy of hocKys) {
      const value = `${hocKy}|${namHoc}`
      const label = `${hocKy} (${namHoc.split('-')[0]} - ${namHoc.split('-')[1]})`
      options.push({ value, label, hocKy, namHoc })
    }
  }
  return options
}

export default function LopHocPhanList3() {
  const { semester: currentSemester, academicYear: currentYear } = getCurrentSemesterAndYear()
  const [list, setList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [selectedSemester, setSelectedSemester] = useState('HK2')
  const [selectedYear, setSelectedYear] = useState('2025-2026')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const giangVienId = getGiangVienId()

  // Tạo danh sách option học kỳ/năm học
  const hocKyOptions = generateHocKyOptions(list)
  const selectedHocKyNamHoc = `${selectedSemester}|${selectedYear}`
  
  const handleHocKyNamHocChange = (value) => {
    if (value === '') {
      setSelectedSemester('')
      setSelectedYear('')
    } else {
      const [hocKy, namHoc] = value.split('|')
      setSelectedSemester(hocKy)
      setSelectedYear(namHoc)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      if (!giangVienId) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
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
    const filtered = list.filter(lop => 
      (!selectedSemester || lop.hocKy === selectedSemester) &&
      (!selectedYear || lop.namHoc === selectedYear)
    )
    setFilteredList(filtered)
  }, [list, selectedSemester, selectedYear])

  return (
    <TeacherLayout title="Danh sách sinh viên theo lớp" activeMenu="sv-lop">
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
                  style={{ width: '250px' }}
                  value={selectedHocKyNamHoc}
                  onChange={(e) => handleHocKyNamHocChange(e.target.value)}
                >
                  <option value="">Tất cả học kỳ/năm học</option>
                  {hocKyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-auto ms-auto">
                <span className="badge bg-success">Tổng: {filteredList.length} lớp</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="alert alert-info text-center mt-3">
            Không có lớp học phần nào được phân công.
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Mã lớp học phần</th>
                      <th>Tên học phần</th>
                      <th>Tên lớp</th>
                      <th style={{ width: '100px' }}>Sĩ số</th>
                      <th style={{ width: '120px' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((lop, i) => (
                      <tr key={lop.id}>
                        <td className="text-center">{i + 1}</td>
                        <td>{lop.maLopHocPhan}</td>
                        <td>{lop.tenHocPhan}</td>
                        <td>{lop.tenLop}</td>
                        <td className="text-center">{lop.siSo || '—'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => navigate(`/teacher/sv-lop/${lop.id}`)}
                          >
                            
                            Xem sinh viên
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