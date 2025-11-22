// Test script để list các models có sẵn của Gemini API
import dotenv from 'dotenv'
dotenv.config({ path: './server/.env' })

const GEMINI_API_KEY = process.env.OPENAI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('❌ Không tìm thấy API key trong .env')
  process.exit(1)
}

console.log('🔍 Đang lấy danh sách models từ Gemini API...\n')

// List models
fetch(`https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.error('❌ Lỗi:', data.error)
      return
    }

    console.log('✅ Các models có sẵn:\n')
    
    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        console.log(`📌 ${model.name}`)
        console.log(`   Display Name: ${model.displayName}`)
        console.log(`   Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`)
        console.log(`   Input token limit: ${model.inputTokenLimit || 'N/A'}`)
        console.log(`   Output token limit: ${model.outputTokenLimit || 'N/A'}`)
        console.log('')
      })

      // Tìm model free phù hợp nhất
      console.log('\n💡 Gợi ý model FREE tốt nhất:\n')
      
      const generateModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      )

      if (generateModels.length > 0) {
        const bestModel = generateModels[0]
        console.log(`✅ Dùng model: ${bestModel.name}`)
        console.log(`   URL: https://generativelanguage.googleapis.com/v1/${bestModel.name}:generateContent?key=YOUR_KEY`)
      }
    } else {
      console.log('⚠️ Không tìm thấy model nào')
    }
  })
  .catch(err => {
    console.error('❌ Lỗi khi gọi API:', err.message)
  })
