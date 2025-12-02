import { pool } from '../config/db.js'

// 🕒 CRON: Tự động chốt lớp khi hết hạn đợt đăng ký
export async function autoCloseClasses() {
  console.log('🔄 [CRON] Checking for classes to finalize...')
  const conn = await pool.getConnection()
  try {
    // 1. Tìm các đợt đăng ký VỪA kết thúc (trong vòng 24h qua chẳng hạn, hoặc cứ check hết các đợt đã đóng)
    // Giả sử chỉ check các đợt có trạng thái = 'DA_KHOA' hoặc thời gian kết thúc < NOW()
    // Để đơn giản, ta tìm các lớp học phần có trạng thái 'Chờ sinh viên đăng ký'
    // và thuộc về một đợt đăng ký ĐÃ HẾT HẠN.
    
    // Tuy nhiên, LopHocPhan không trực tiếp link tới DotDangKy. 
    // Ta phải dựa vào NamHoc/HocKy của LHP so với các Đợt đã đóng.
    
    // Cách tốt nhất: Duyệt tất cả các Lớp đang "Chờ sinh viên đăng ký"
    // Nếu thời điểm hiện tại > Hạn chót của đợt đăng ký (dành cho HK/NamHoc đó) -> Xử lý
    
    // Lấy danh sách các đợt đã đóng
    const [expiredDots] = await conn.execute(`
      SELECT * FROM DotDangKy 
      WHERE thoi_gian_dong < NOW() 
    `)
    
    if (expiredDots.length === 0) {
      console.log('✅ No expired registration periods found.')
      return
    }
    
    for (const dot of expiredDots) {
       console.log(`   Checking expired dot: ${dot.ten_dot} (${dot.hoc_ky}/${dot.nam_hoc})`)
       
       // Tìm các lớp thuộc HK/NamHoc này mà vẫn đang 'Chờ sinh viên đăng ký'
       const [classes] = await conn.execute(`
         SELECT lhp.id, lhp.ma_lop_hoc_phan, lhp.si_so_da_dk
         FROM LopHocPhan lhp
         WHERE lhp.hoc_ky = ? AND lhp.nam_hoc = ?
           AND lhp.trang_thai = 'Chờ sinh viên đăng ký'
       `, [dot.hoc_ky, dot.nam_hoc])
       
       for (const lhp of classes) {
         if (lhp.si_so_da_dk >= 10) {
           // Đủ điều kiện -> Chấp nhận
           await conn.execute(`
             UPDATE LopHocPhan SET trang_thai = 'Chấp nhận mở lớp' WHERE id = ?
           `, [lhp.id])
           console.log(`      --> Class ${lhp.ma_lop_hoc_phan} (SiSo: ${lhp.si_so_da_dk}) -> ACCEPTED`)
         } else {
           // Không đủ -> Hủy
           await conn.execute(`
             UPDATE LopHocPhan SET trang_thai = 'Hủy mở lớp' WHERE id = ?
           `, [lhp.id])
           console.log(`      --> Class ${lhp.ma_lop_hoc_phan} (SiSo: ${lhp.si_so_da_dk}) -> CANCELLED`)
           
           // (Optional) Hủy luôn các đăng ký của sinh viên trong lớp này?
           // await conn.execute(`UPDATE DangKyHocPhan SET trang_thai_dk = 'HUY' WHERE lop_hoc_phan_id = ?`, [lhp.id])
         }
       }
    }
    
    console.log('✅ Auto-close classes check completed.')
  } catch (err) {
    console.error('❌ Error in autoCloseClasses:', err)
  } finally {
    conn.release()
  }
}
