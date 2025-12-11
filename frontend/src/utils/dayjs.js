// Utility để format thời gian theo múi giờ Việt Nam (UTC+7)
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Cài đặt plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Hàm format thời gian theo giờ Việt Nam
// MySQL đang ở timezone Asia/Bangkok (UTC+7), cùng múi giờ với VN
// MySQL trả về datetime string không có timezone, browser parse như UTC
// Cần trừ 7 giờ để hiển thị đúng giờ VN
export const formatVNTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '-'
  
  try {
    let dateObj
    
    // Nếu có 'Z' ở cuối hoặc '+00:00'
    // LƯU Ý: Server trả về UTC string nhưng thực tế đã là VN time (UTC+7)
    // Nếu server đã ở timezone VN, thì UTC string thực chất là VN time, không cần cộng
    if (typeof date === 'string' && (date.endsWith('Z') || date.includes('+00:00'))) {
      // Server trả về UTC string nhưng thực tế đã là VN time
      // Parse như UTC nhưng KHÔNG cộng thêm 7 giờ (vì đã là VN time rồi)
      dateObj = dayjs.utc(date)
    } else {
      // Tất cả các trường hợp khác: MySQL datetime đã là VN time nhưng browser parse như UTC
      // Parse như UTC rồi trừ 7 giờ để đúng
      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
        // MySQL datetime string: parse như UTC rồi trừ 7 giờ
        dateObj = dayjs.utc(date.replace(' ', 'T') + 'Z').subtract(7, 'hour')
      } else if (typeof date === 'string' && date.includes('T')) {
        // ISO string: parse như UTC rồi trừ 7 giờ
        dateObj = dayjs.utc(date + (date.endsWith('Z') ? '' : 'Z')).subtract(7, 'hour')
      } else {
        // Fallback: parse và trừ 7 giờ
        dateObj = dayjs(date).subtract(7, 'hour')
      }
    }
    
    // Kiểm tra tính hợp lệ
    if (!dateObj || !dateObj.isValid()) {
      // Fallback: parse như UTC rồi trừ 7 giờ
      if (typeof date === 'string') {
        dateObj = dayjs.utc(date.replace(' ', 'T') + 'Z').subtract(7, 'hour')
      } else {
        dateObj = dayjs(date).subtract(7, 'hour')
      }
    }
    
    return dateObj.format(format)
  } catch (error) {
    console.error('❌ Lỗi format thời gian:', error, date)
    // Fallback cuối cùng: format và trừ 7 giờ
    try {
      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
        return dayjs.utc(date.replace(' ', 'T') + 'Z').subtract(7, 'hour').format(format)
      }
      return dayjs(date).subtract(7, 'hour').format(format)
    } catch (e) {
      return '-'
    }
  }
}

// Hàm format thời gian cho chat (HH:mm - DD/MM/YYYY)
export const formatChatTime = (date) => {
  return formatVNTime(date, 'HH:mm - DD/MM/YYYY')
}

// Hàm format thời gian ngắn gọn (DD/MM/YYYY HH:mm)
export const formatShortTime = (date) => {
  return formatVNTime(date, 'DD/MM/YYYY HH:mm')
}

// Export dayjs đã cấu hình
export default dayjs

