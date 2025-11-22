import { pool } from '../config/db.js'
import * as ChatbotModel from '../models/chatbot.js'

export async function chatWithBot(req, res) {
  try {
    const { message, sinhVienId } = req.body

    if (!message) {
      return res.status(400).json({ message: 'Thiếu nội dung tin nhắn' })
    }

    // Lấy dữ liệu từ model
    const sv = await ChatbotModel.getSinhVienInfo(sinhVienId)
    if (!sv) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' })
    }

    const diemRows = await ChatbotModel.getDiemMon(sinhVienId)
    const lichHocRows = await ChatbotModel.getLichHoc(sinhVienId)
    const diemTBRows = await ChatbotModel.getDiemTrungBinh(sinhVienId)

    // Chuẩn bị thông tin NGẮN GỌN (15 môn gần nhất) + HỌC KỲ + TÍN CHỈ
    const diemShort = diemRows.slice(0, 15).map(d => {
      let info = `${d.ten_hoc_phan} [${d.hoc_ky} ${d.nam_hoc}, ${d.so_tin_chi}TC]: `
      
      // TX (lấy tất cả nhưng ngắn gọn)
      const txLT = [d.diem_ly_thuyet_1, d.diem_ly_thuyet_2, d.diem_ly_thuyet_3, d.diem_ly_thuyet_4].filter(v => v !== null)
      const txTH = [d.diem_thuc_hanh_1, d.diem_thuc_hanh_2, d.diem_thuc_hanh_3].filter(v => v !== null)
      
      if (txLT.length > 0) info += `TXL=${txLT.join(',')} `
      if (txTH.length > 0) info += `TXH=${txTH.join(',')} `
      if (d.diem_giua_ky) info += `GK=${d.diem_giua_ky} `
      if (d.diem_cuoi_ky) info += `CK=${d.diem_cuoi_ky} `
      info += `Tong=${d.diem_tong_ket || 'chua'}(${d.diem_chu || '-'})`
      
      return info
    }).join('\n')

    const dtbInfo = diemTBRows[0] ? `HK ${diemTBRows[0].hoc_ky} ${diemTBRows[0].nam_hoc}: TB_HK=${diemTBRows[0].diem_tb_hoc_ky} (he4: ${diemTBRows[0].diem_tb_hoc_ky_thang4}), TB_TL=${diemTBRows[0].diem_tb_tich_luy} (he4: ${diemTBRows[0].diem_tb_tich_luy_thang4}), TC_TL=${diemTBRows[0].tong_tin_chi_tich_luy}, TC_No=${diemTBRows[0].tong_tin_chi_no}` : 'Chua co'

    const prompt = `SV: ${sv.ho_ten}. Cong thuc: Diem=(QT*0.2)+(GK*0.3)+(CK*0.5), QT=TB(TXL,TXH). Qua mon>=4.
Cong thuc DTB hoc ky: SUM(Diem_tong_ket * Tin_chi) / SUM(Tin_chi)

Diem TB gan nhat (co CA he 10 VA he 4):
${dtbInfo}

Diem 15 mon gan nhat (co hoc ky + tin chi):
${diemShort}

KHA NANG:
1. TINH CK CAN THIET: "Mon X can thi CK bao nhieu de dat diem Y?"
   Giai: CK = (Y - QT*0.2 - GK*0.3) / 0.5
   
2. TINH DIEM TONG KET: "Neu thi CK la X thi diem tong ket la bao nhieu?"
   Giai: Tong = QT*0.2 + GK*0.3 + X*0.5

3. TINH DTB HK GIA DINH: "Neu diem mon X la Y thi DTB HK la bao nhieu?"
   - Lay TAT CA mon trong HK do, thay diem mon X = Y
   - Tinh CA he 10 VA he 4: SUM(diem*TC) / SUM(TC)

4. TU VAN HOC TAP (MOI):
   - "Cach hoc [mon] gioi?" → Goi y phuong phap hoc tap hieu qua
   - "Giai thich [khai niem]?" → Giai thich kien thuc (OOP, CSDL, Toan, v.v.)
   - "Nen hoc AI hay Web?" → Tu van lo trinh, nghe nghiep
   - Co the tra loi MOI cau hoi, ke ca thoi su, thuong thuc neu duoc hoi

Tra loi NGAN, CHINH XAC, THAN THIEN, co tinh toan cu the khi can, CA he 10 va he 4, KHONG markdown.

Hoi: ${message}`

    // Gọi Gemini API
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY // Đổi tên biến môi trường sau nếu cần
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key chưa được cấu hình' })
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
            topP: 0.8,
            topK: 40
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json()
      console.error('❌ Gemini API Error:', JSON.stringify(errorData, null, 2))
      return res.status(500).json({ 
        message: 'Lỗi khi gọi Gemini API',
        error: errorData 
      })
    }

    const geminiData = await geminiResponse.json()
    console.log('📝 Gemini Response:', JSON.stringify(geminiData, null, 2))

    // Kiểm tra cấu trúc response
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      console.error('❌ Không có candidates trong response')
      return res.json({ reply: 'Xin lỗi, tôi không nhận được phản hồi từ AI. Vui lòng thử lại.' })
    }

    const candidate = geminiData.candidates[0]
    
    // Kiểm tra nếu bị block vì safety
    if (candidate.finishReason === 'SAFETY') {
      console.warn('⚠️ Response bị block vì safety:', candidate.safetyRatings)
      return res.json({ reply: 'Xin lỗi, câu hỏi của bạn không phù hợp với chính sách an toàn. Vui lòng thử câu hỏi khác.' })
    }

    const reply = candidate.content?.parts?.[0]?.text || 'Xin lỗi, tôi không thể trả lời câu hỏi này.'
    
    console.log('✅ Reply:', reply.substring(0, 100) + '...')

    res.json({ reply })

  } catch (err) {
    console.error('❌ Lỗi chatWithBot:', err)
    res.status(500).json({ 
      message: 'Lỗi server khi xử lý chatbot',
      error: err.message 
    })
  }
}
