// Test script để list các models có sẵn của Gemini API
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env từ thư mục server (giống như server/index.js)
dotenv.config({ path: path.join(__dirname, 'server', '.env') })

// Nếu không tìm thấy, thử load từ thư mục hiện tại
if (!process.env.GEMINI_API_KEY) {
  dotenv.config({ path: path.join(__dirname, '.env') })
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('❌ Không tìm thấy GEMINI_API_KEY trong .env')
  console.error(`💡 Đã thử tìm ở: ${path.join(__dirname, 'server', '.env')}`)
  console.error(`💡 Đã thử tìm ở: ${path.join(__dirname, '.env')}`)
  process.exit(1)
}

console.log('🔍 Đang lấy danh sách models từ Gemini API...\n')

// Hàm test quota của một model
async function testModelQuota(modelName) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hi' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      }
    )

    const result = await response.json()
    
    if (response.ok) {
      return { status: 'OK', message: 'Model hoạt động bình thường' }
    } else if (response.status === 429) {
      // Parse quota info từ error
      const quotaInfo = result?.error?.details?.find(d => d['@type']?.includes('QuotaFailure'))
      const retryInfo = result?.error?.details?.find(d => d['@type']?.includes('RetryInfo'))
      const quotaLimit = quotaInfo?.violations?.[0]?.quotaValue || 'Unknown'
      const quotaMetric = quotaInfo?.violations?.[0]?.quotaMetric || ''
      const retryAfter = retryInfo?.retryDelay ? Math.ceil(parseFloat(retryInfo.retryDelay)) : null
      
      return {
        status: 'QUOTA_EXCEEDED',
        quotaLimit,
        quotaMetric,
        retryAfter,
        message: `Đã vượt quota: ${quotaLimit} requests/ngày`
      }
    } else if (response.status === 403) {
      return { status: 'FORBIDDEN', message: 'Không có quyền truy cập model này' }
    } else if (response.status === 404) {
      return { status: 'NOT_FOUND', message: 'Model không tồn tại' }
    } else {
      return { status: 'ERROR', message: result?.error?.message || `HTTP ${response.status}` }
    }
  } catch (err) {
    return { status: 'EXCEPTION', message: err.message }
  }
}

// List models
fetch(`https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`)
  .then(res => res.json())
  .then(async (data) => {
    if (data.error) {
      console.error('❌ Lỗi:', data.error)
      return
    }

    console.log('✅ Các models có sẵn:\n')
    
    if (data.models && data.models.length > 0) {
      // Lọc các model hỗ trợ generateContent
      const generateModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      )

      console.log(`📊 Tìm thấy ${generateModels.length} model hỗ trợ generateContent\n`)
      console.log('🔍 Đang kiểm tra quota/rate limit của từng model...\n')

      // Test từng model
      const results = []
      for (const model of generateModels) {
        const modelName = model.name.replace('models/', '')
        process.stdout.write(`   Đang test ${modelName}... `)
        
        const quotaInfo = await testModelQuota(model.name)
        results.push({ model, quotaInfo })
        
        if (quotaInfo.status === 'QUOTA_EXCEEDED') {
          console.log(`${quotaInfo.quotaLimit} requests/ngày`)
        } else {
          console.log('Đang kiểm tra...')
        }
        
        // Delay nhỏ để tránh rate limit
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Hiển thị kết quả quota
      console.log('\n' + '='.repeat(80))
      console.log('📋 QUOTA/REQUEST MỖI NGÀY CỦA CÁC MODEL:\n')
      
      results.forEach(({ model, quotaInfo }) => {
        const modelName = model.name.replace('models/', '')
        
        if (quotaInfo.status === 'QUOTA_EXCEEDED') {
          console.log(`📌 ${modelName}: ${quotaInfo.quotaLimit} requests/ngày`)
        } else if (quotaInfo.status === 'OK') {
          console.log(`📌 ${modelName}: Chưa xác định (model đang hoạt động, chưa vượt quota)`)
        } else {
          console.log(`📌 ${modelName}: Không xác định được`)
        }
      })
    } else {
      console.log('Không tìm thấy model nào')
    }
  })
  .catch(err => {
    console.error('❌ Lỗi khi gọi API:', err.message)
  })
