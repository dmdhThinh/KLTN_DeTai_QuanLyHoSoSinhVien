// server/controllers/statisticsController.js
import { pool } from '../config/db.js'

export const getStatistics = async (req, res) => {
  try {
    // Tổng số sinh viên
    const [totalStudents] = await pool.query('SELECT COUNT(*) as count FROM SinhVien')
    
    // Tổng số giảng viên
    const [totalTeachers] = await pool.query('SELECT COUNT(*) as count FROM GiangVien')
    
    // Tổng số học phần
    const [totalCourses] = await pool.query('SELECT COUNT(*) as count FROM HocPhan')
    
    // Tổng số lớp học phần
    const [totalClasses] = await pool.query('SELECT COUNT(*) as count FROM LopHocPhan')
    
    // Phân bổ sinh viên theo khoa
    const [studentsByFaculty] = await pool.query(`
      SELECT k.ten_khoa as TenKhoa, COUNT(sv.ma_sv) as total
      FROM Khoa k
      LEFT JOIN Nganh n ON k.id = n.khoa_id
      LEFT JOIN Lop l ON n.id = l.nganh_id
      LEFT JOIN SinhVien sv ON l.id = sv.lop_id
      GROUP BY k.id, k.ten_khoa
      ORDER BY total DESC
    `)
    
    // Thống kê số sinh viên theo lớp học phần (chỉ lớp có SV > 0)
    const [studentsByClass] = await pool.query(`
      SELECT 
        lhp.ma_lop_hoc_phan as classCode,
        hp.ten_hoc_phan as courseName,
        lhp.hoc_ky as semester,
        lhp.nam_hoc as academicYear,
        COUNT(DISTINCT dk.sinh_vien_id) as students
      FROM LopHocPhan lhp
      JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      JOIN DangKyHocPhan dk ON dk.lop_hoc_phan_id = lhp.id
      GROUP BY lhp.id, lhp.ma_lop_hoc_phan, hp.ten_hoc_phan, lhp.hoc_ky, lhp.nam_hoc
      HAVING students > 0
      ORDER BY students DESC
      LIMIT 20
    `)
    
    res.json({
      success: true,
      data: {
        totalStudents: totalStudents[0].count,
        totalTeachers: totalTeachers[0].count,
        totalCourses: totalCourses[0].count,
        totalClasses: totalClasses[0].count,
        studentsByFaculty: studentsByFaculty,
        studentsByClass: studentsByClass
      }
    })
  } catch (error) {
    console.error('Error getting statistics:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thống kê', 
      error: error.message 
    })
  }
}
