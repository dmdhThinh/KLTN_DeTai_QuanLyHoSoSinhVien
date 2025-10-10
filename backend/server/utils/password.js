import bcrypt from 'bcrypt'

// Với dữ liệu mẫu trong SQL, password hiện đang là plaintext '123456' trong cột password_hash.
// Ta hỗ trợ "dual-mode":
// - Nếu trong DB đã được băm (bcrypt), dùng bcrypt.compare.
// - Nếu không phải hash (plaintext), so sánh chuỗi thường.

export async function comparePassword(input, stored) {
  // stored có thể là bcrypt hash (bắt đầu bằng $2) hoặc plaintext
  if (typeof stored === 'string' && stored.startsWith('$2')) {
    try {
      return await bcrypt.compare(input, stored)
    } catch {
      return false
    }
  }
  // plaintext fallback
  return input === stored
}
