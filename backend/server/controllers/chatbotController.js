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
    const thongBaoRows = await ChatbotModel.getThongBao(sinhVienId)
    const diemRenLuyenRows = await ChatbotModel.getDiemRenLuyen(sinhVienId)
    const hocBongRows = await ChatbotModel.getHocBong(sinhVienId)
    const congNoData = await ChatbotModel.getCongNoHocPhi(sinhVienId)

    // Lấy danh sách tất cả học kỳ mà sinh viên có dữ liệu
    const allHocKy = await ChatbotModel.getAllHocKy(sinhVienId)
    
    // Lấy học kỳ gần nhất từ điểm trung bình hoặc lịch học
    let currentHocKy = null
    let currentNamHoc = null
    if (diemTBRows.length > 0) {
      currentHocKy = diemTBRows[0].hoc_ky
      currentNamHoc = diemTBRows[0].nam_hoc
    } else if (lichHocRows.length > 0) {
      currentHocKy = lichHocRows[0].hoc_ky
      currentNamHoc = lichHocRows[0].nam_hoc
    }

    // Lấy danh sách môn đã đăng ký và chưa đăng ký cho TẤT CẢ các học kỳ
    const dkInfoByHocKy = {}
    for (const hk of allHocKy) {
      try {
        const monDaDangKy = await ChatbotModel.getMonDaDangKy(sinhVienId, hk.hoc_ky, hk.nam_hoc)
        const monChuaDangKy = await ChatbotModel.getMonChuaDangKy(sinhVienId, hk.hoc_ky, hk.nam_hoc)
        dkInfoByHocKy[`${hk.hoc_ky}_${hk.nam_hoc}`] = {
          hocKy: hk.hoc_ky,
          namHoc: hk.nam_hoc,
          monDaDangKy,
          monChuaDangKy
        }
      } catch (err) {
        console.error(`Lỗi khi lấy thông tin đăng ký học phần cho ${hk.hoc_ky} ${hk.nam_hoc}:`, err.message)
      }
    }

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

    // Chuẩn bị thông tin lịch học (chi tiết)
    const lichHocInfo = lichHocRows.length > 0
      ? lichHocRows.map(lh => {
          const thuLabel = lh.thu === 2 ? 'Thứ 2' : lh.thu === 3 ? 'Thứ 3' : lh.thu === 4 ? 'Thứ 4' : 
                          lh.thu === 5 ? 'Thứ 5' : lh.thu === 6 ? 'Thứ 6' : lh.thu === 7 ? 'Thứ 7' : 
                          lh.thu === 8 ? 'Chủ nhật' : `Thứ ${lh.thu}`
          const caLabel = lh.ca || ''
          const tiet = lh.tiet_bat_dau && lh.tiet_ket_thuc ? `${lh.tiet_bat_dau}-${lh.tiet_ket_thuc}` : ''
          const phong = lh.phong || ''
          const ngayHoc = lh.ngay_hoc ? new Date(lh.ngay_hoc).toLocaleDateString('vi-VN') : null
          return `${thuLabel}${ngayHoc ? ` (${ngayHoc})` : ''} - ${lh.ten_hoc_phan} - Ca ${caLabel}${tiet ? ` (Tiết ${tiet})` : ''}${phong ? ` - Phòng ${phong}` : ''}${lh.ten_giang_vien ? ` - GV: ${lh.ten_giang_vien}` : ''} [${lh.hoc_ky} ${lh.nam_hoc}]`
        }).join('\n')
      : 'Chua co lich hoc'

    // Chuẩn bị thông tin thông báo
    const thongBaoInfo = thongBaoRows.length > 0 
      ? thongBaoRows.map(tb => {
          const ngayGui = tb.ngay_gui ? new Date(tb.ngay_gui).toLocaleDateString('vi-VN') : ''
          return `[${tb.da_doc}] ${tb.tieu_de} (${ngayGui})`
        }).join('\n')
      : 'Chua co thong bao'

    // Chuẩn bị thông tin điểm rèn luyện
    const diemRenLuyenInfo = diemRenLuyenRows.length > 0
      ? diemRenLuyenRows.map(drl => `HK ${drl.hoc_ky} ${drl.nam_hoc}: ${drl.so_diem} diem (${drl.xep_loai})`).join('\n')
      : 'Chua co diem ren luyen'

    // Chuẩn bị thông tin học bổng
    const hocBongInfo = hocBongRows.length > 0
      ? hocBongRows.map(hb => `HK ${hb.hoc_ky} ${hb.nam_hoc}: ${hb.loai_hoc_bong} (TB: ${hb.diem_tb_hoc_ky}, DRL: ${hb.diem_ren_luyen}, So tien: ${hb.so_tien ? hb.so_tien.toLocaleString('vi-VN') + ' VND' : 'N/A'})`).join('\n')
      : 'Chua co hoc bong'

    // Chuẩn bị thông tin công nợ
    const congNoInfo = congNoData.tongCongNo
      ? `Tong cong no: ${congNoData.tongCongNo.con_no ? congNoData.tongCongNo.con_no.toLocaleString('vi-VN') : '0'} VND\n` +
        `Da thanh toan: ${congNoData.tongCongNo.da_thanh_toan ? congNoData.tongCongNo.da_thanh_toan.toLocaleString('vi-VN') : '0'} VND\n` +
        `So mon chua nop: ${congNoData.tongCongNo.so_hoc_phan_chua_nop || 0}\n` +
        `So mon qua han: ${congNoData.tongCongNo.so_hoc_phan_qua_han || 0}\n` +
        (congNoData.danhSachCongNo.length > 0 
          ? `Danh sach chua nop:\n${congNoData.danhSachCongNo.map(cn => `- ${cn.ten_hoc_phan} (${cn.so_tin_chi}TC): ${cn.so_tien.toLocaleString('vi-VN')} VND - ${cn.trang_thai}${cn.han_nop ? ' (Han: ' + new Date(cn.han_nop).toLocaleDateString('vi-VN') + ')' : ''}`).join('\n')}`
          : '')
      : 'Chua co cong no'

    // Chuẩn bị thông tin môn đã đăng ký và chưa đăng ký cho TẤT CẢ các học kỳ
    const dkInfoList = Object.values(dkInfoByHocKy).map(info => {
      const monDaDangKyStr = info.monDaDangKy.length > 0
        ? `Mon da dang ky (${info.monDaDangKy.length} mon):\n${info.monDaDangKy.map(m => `  - ${m.ten_hoc_phan} (${m.ma_hoc_phan}) - ${m.ma_lop_hoc_phan} - ${m.so_tin_chi}TC - Trang thai: ${m.trang_thai_dk}`).join('\n')}`
        : 'Chua dang ky mon nao'
      
      const monChuaDangKyStr = info.monChuaDangKy.length > 0
        ? `Mon chua dang ky (${info.monChuaDangKy.length} mon):\n${info.monChuaDangKy.map(m => `  - ${m.ten_hoc_phan} (${m.ma_hoc_phan}) - ${m.so_tin_chi}TC - ${m.loai_mon || 'TU_CHON'}`).join('\n')}`
        : 'Da dang ky het mon trong chuong trinh khung'
      
      return `HK ${info.hocKy} ${info.namHoc}:\n${monDaDangKyStr}\n${monChuaDangKyStr}`
    }).join('\n\n')

    const monDaDangKyInfo = dkInfoList || 'Chua co thong tin dang ky hoc phan'
    const monChuaDangKyInfo = dkInfoList || 'Chua co thong tin dang ky hoc phan'

    // Lấy thời gian thực hiện tại
    const now = new Date()
    const ngayGioHienTai = now.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long'
    })

    const prompt = `THOI GIAN HIEN TAI: ${ngayGioHienTai} (múi giờ Việt Nam)

SV: ${sv.ho_ten}. 

CONG THUC TINH DIEM (QUAN TRONG):
- Diem tong ket = (QT*0.2) + (GK*0.3) + (CK*0.5)
- QT (Qua trinh) = TB(TXL_TB, TXH_TB)
  + TXL_TB = Trung binh cua 4 diem ly thuyet (diem_ly_thuyet_1, 2, 3, 4)
  + TXH_TB = Trung binh cua 3 diem thuc hanh (diem_thuc_hanh_1, 2, 3)
  + QT = (TXL_TB + TXH_TB) / 2
- Qua mon >= 4.0

XEP LOAI DIEM:
- A: >= 8.5
- B+: >= 8.0
- B: >= 7.0
- C+: >= 6.5
- C: >= 5.5
- D+: >= 5.0
- D: >= 4.0
- F: < 4.0

QUY TAC ROT BAT BUOC (QUAN TRONG):
- Neu diem giua ky (GK) < 1 → ROT (F, Khong dat)
- Neu diem cuoi ky (CK) < 3 → ROT (F, Khong dat)
- Quy tac nay ap dung TRUOC khi tinh diem tong ket, neu vi pham thi mac dinh la F

Cong thuc DTB hoc ky: SUM(Diem_tong_ket * Tin_chi) / SUM(Tin_chi)

Diem TB gan nhat (co CA he 10 VA he 4):
${dtbInfo}

Diem 15 mon gan nhat (co hoc ky + tin chi):
${diemShort}

LICH HOC (tat ca cac mon da dang ky):
${lichHocInfo}

LUU Y VE LICH HOC:
- Lich hoc co 2 loai: lich dinh ky (co thu, khong co ngay_hoc) va lich dac biet (co ngay_hoc cu the)
- Neu co ngay_hoc: mon hoc chi dien ra vao ngay do
- Neu khong co ngay_hoc: mon hoc dien ra dinh ky theo thu trong tuan
- Khi tra loi "hom nay hoc mon nao" hoac "lich hoc hom nay":
  + Xac dinh thu cua ngay hien tai (Thứ 2 = 2, Thứ 3 = 3, ..., Chủ nhật = 8)
  + Chi liet ke cac mon co thu = thu cua ngay hien tai HOAC co ngay_hoc = ngay hien tai
  + KHONG liet ke tat ca cac mon trong hoc ky
  + Neu khong co mon nao, tra loi "Hom nay ban khong co lich hoc"

THONG BAO/TIN TUC (10 tin gan nhat):
${thongBaoInfo}

DIEM REN LUYEN (5 hoc ky gan nhat):
${diemRenLuyenInfo}

HOC BONG (5 hoc ky gan nhat):
${hocBongInfo}

CONG NO HOC PHI:
${congNoInfo}

DANG KY HOC PHAN (TAT CA CAC HOC KY):
${monDaDangKyInfo}

LUU Y VE DANG KY HOC PHAN (QUAN TRONG):
- Thong tin dang ky co cho TAT CA cac hoc ky ma sinh vien co du lieu
- "Mon nao da dang ky?" → Neu khong chi dinh hoc ky, tra loi cho hoc ky gan nhat (${currentHocKy || 'N/A'} ${currentNamHoc || 'N/A'})
- "HK X YYYY-YYYY da dang ky mon nao?" → Tra loi chinh xac theo hoc ky duoc hoi
- "Mon nao chua dang ky?" → Neu khong chi dinh hoc ky, tra loi cho hoc ky gan nhat
- "HK X YYYY-YYYY chua dang ky mon nao?" → Tra loi chinh xac theo hoc ky duoc hoi
- "HK2 2025-2026 chua dang ky mon nao?" → Tim trong danh sach tren, neu co thong tin cho HK2 2025-2026 thi tra loi, neu khong thi bao "Khong co thong tin dang ky cho hoc ky nay"
- Chi liet ke cac mon co trang_thai_dk = 'THANH_CONG' hoac 'CHO_DUYET' khi hoi ve mon da dang ky
- Chi liet ke cac mon trong chuong trinh khung ma chua dang ky khi hoi ve mon chua dang ky
- Neu khong co mon nao → tra loi "Chua dang ky mon nao" hoac "Da dang ky het mon"

KHA NANG:
1. TINH CK CAN THIET: "Mon X can thi CK bao nhieu de dat diem Y?"
   Buoc 1: Tinh TXL_TB = TB(4 diem ly thuyet)
   Buoc 2: Tinh TXH_TB = TB(3 diem thuc hanh)
   Buoc 3: Tinh QT = (TXL_TB + TXH_TB) / 2
   Buoc 4: CK = (Y - QT*0.2 - GK*0.3) / 0.5
   LUU Y: 
   - CK phai >= 3, neu khong se rot bat buoc
   - Y la diem TOI THIEU de dat loai (vi du: de dat B thi Y = 7.0, khong phai 7.70)
   
2. TINH DIEM TONG KET: "Neu thi CK la X thi diem tong ket la bao nhieu?"
   Buoc 1: Tinh QT nhu tren
   Buoc 2: 
   - Neu GK < 1 HOAC CK < 3 → Rot (F, Khong dat)
   - Neu khong: Tong = QT*0.2 + GK*0.3 + X*0.5

3. TINH DTB HK GIA DINH: "Neu diem mon X la Y thi DTB HK la bao nhieu?"
   - Lay TAT CA mon trong HK do, thay diem mon X = Y
   - Tinh CA he 10 VA he 4: SUM(diem*TC) / SUM(TC)
   - Ap dung quy tac rot bat buoc cho tung mon

4. TU VAN HOC TAP:
   - "Cach hoc [mon] gioi?" → Goi y phuong phap hoc tap hieu qua
   - "Giai thich [khai niem]?" → Giai thich kien thuc (OOP, CSDL, Toan, v.v.)
   - "Nen hoc AI hay Web?" → Tu van lo trinh, nghe nghiep

5. THONG BAO/TIN TUC:
   - "Co thong bao nao moi khong?" → Liet ke cac thong bao chua doc
   - "Thong bao ve [chu de]?" → Tim thong bao lien quan
   - Co the doc thong bao va tom tat noi dung

6. DIEM REN LUYEN:
   - "Diem ren luyen cua toi la bao nhieu?" → Hien thi diem ren luyen cac hoc ky
   - "Xep loai ren luyen cua toi?" → Hien thi xep loai

7. HOC BONG:
   - "Toi co duoc hoc bong khong?" → Hien thi thong tin hoc bong
   - "Dieu kien de duoc hoc bong?" → Giai thich dieu kien xet hoc bong

8. CONG NO HOC PHI:
   - "Toi con no bao nhieu tien hoc phi?" → Hien thi tong cong no
   - "Mon nao chua nop hoc phi?" → Liet ke cac mon chua nop
   - "Mon nao qua han nop hoc phi?" → Liet ke cac mon qua han

9. DANG KY HOC PHAN (QUAN TRONG):
   - "Mon nao da dang ky?" / "HK X YYYY-YYYY da dang ky mon nao?" → Chi liet ke cac mon DA DANG KY (trang_thai_dk = 'THANH_CONG' hoac 'CHO_DUYET')
   - "Mon nao chua dang ky?" / "HK X YYYY-YYYY chua dang ky mon nao?" → Chi liet ke cac mon CHUA DANG KY (trong chuong trinh khung)
   - "Toi da dang ky mon nao trong HK X?" → Tra loi chinh xac theo hoc ky
   - "Toi chua dang ky mon nao trong HK X?" → Tra loi chinh xac theo hoc ky
   - LUU Y: Phan biet ro rang mon DA DANG KY va CHUA DANG KY, khong nham lan

10. LICH HOC (QUAN TRONG):
   - "Hom nay hoc mon nao?" / "Lich hoc hom nay?" → Chi liet ke cac mon hoc trong NGAY HIEN TAI
     + Neu co ngay_hoc = ngay hien tai → hien thi
     + Neu co thu = thu cua ngay hien tai (va khong co ngay_hoc) → hien thi
     + KHONG liet ke tat ca cac mon trong hoc ky
   - "Lich hoc thu X?" → Liet ke cac mon co thu = X
   - "Lich hoc tuan nay?" → Liet ke cac mon trong tuan (tinh tu thu 2 den chu nhat)
   - "Lich hoc mon [ten mon]?" → Hien thi lich hoc chi tiet cua mon do
   - Format tra loi: Ten mon - Ca - Tiết - Phòng - Giảng viên
   - Neu khong co lich → tra loi "Khong co lich hoc"

11. CAU HOI KHAC:
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
      console.warn('Response bị block vì safety:', candidate.safetyRatings)
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
